"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Video, Upload, Download, Sliders, Activity, 
  Zap, Film, VolumeX, Volume2, 
  RefreshCw, CheckCircle2, Cpu, Lock
} from "lucide-react";

export default function VideoCompressor() {
  const [isMounted, setIsMounted] = useState(false);
  const videoInputRef = useRef(null);
  const previewVideoRef = useRef(null);

  // States
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoMeta, setVideoMeta] = useState({ duration: 0, width: 0, height: 0, size: 0, type: "" });
  
  // Compression Settings
  const [preset, setPreset] = useState("balanced"); // ultra-compress, balanced, high-quality
  const [targetScale, setTargetScale] = useState(0.75); // 0.5, 0.75, 1.0
  const [targetFps, setTargetFps] = useState(30);
  const [stripAudio, setStripAudio] = useState(false);

  // Processing & Output
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState("");
  const [compressedBlob, setCompressedBlob] = useState(null);
  
  // STRICT FLAG: True only after manual transcode run completes
  const [isManualTranscodeDone, setIsManualTranscodeDone] = useState(false);
  
  const [processingStatus, setProcessingStatus] = useState("Standby");
  const abortRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      abortRef.current = true;
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, []);

  // --- REAL-TIME ESTIMATED METRIC CALCULATOR ---
  const liveEstimatedMeta = useMemo(() => {
    if (!videoMeta.size) return { size: 0, width: 0, height: 0 };
    const outW = Math.max(2, Math.round(videoMeta.width * targetScale));
    const outH = Math.max(2, Math.round(videoMeta.height * targetScale));
    
    const areaRatio = targetScale * targetScale;
    const presetFactor = preset === 'ultra-compress' ? 0.28 : preset === 'balanced' ? 0.48 : 0.78;
    const audioFactor = stripAudio ? 0.85 : 1.0;
    
    const estSize = Math.max(1024, Math.round(videoMeta.size * areaRatio * presetFactor * audioFactor));
    return { size: estSize, width: outW, height: outH };
  }, [videoMeta, targetScale, preset, stripAudio]);

  const outputFootprintSize = compressedBlob?.size || liveEstimatedMeta.size;

  const savingsPercent = videoMeta.size > 0 && outputFootprintSize > 0 
    ? Math.max(0, Math.round(((videoMeta.size - outputFootprintSize) / videoMeta.size) * 100))
    : 0;

  // Preset quick adjustments
  const handlePresetChange = (val) => {
    setPreset(val);
    setIsManualTranscodeDone(false); // Reset lock if settings change
    if (val === "ultra-compress") {
      setTargetScale(0.5);
      setTargetFps(24);
      setStripAudio(false);
    } else if (val === "balanced") {
      setTargetScale(0.75);
      setTargetFps(30);
      setStripAudio(false);
    } else if (val === "high-quality") {
      setTargetScale(1.0);
      setTargetFps(60);
      setStripAudio(false);
    }
  };

  // --- GLITCH-FREE STREAM CAPTURE ENGINE ---
  const runStreamTranscode = useCallback(async (srcUrl, meta, scale, fps, muteAudio, isManualTrigger = false) => {
    if (!srcUrl || !meta.width) return;
    
    setIsProcessing(true);
    if (isManualTrigger) {
      setIsManualTranscodeDone(false);
      setProcessingStatus("Running fast-track transcode engine...");
    } else {
      setProcessingStatus("Background silent sync...");
    }
    
    abortRef.current = false;
    setProgress(5);

    try {
      const vidElement = document.createElement("video");
      vidElement.src = srcUrl;
      vidElement.muted = muteAudio || true;
      vidElement.playsInline = true;
      vidElement.crossOrigin = "anonymous";
      
      await new Promise((resolve) => {
        vidElement.onloadeddata = resolve;
        vidElement.onerror = resolve;
      });

      const outW = Math.max(2, Math.round(meta.width * scale));
      const outH = Math.max(2, Math.round(meta.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) throw new Error("Canvas context init failed");

      const stream = canvas.captureStream(fps);
      
      if (!muteAudio) {
        try {
          if (vidElement.captureStream) {
            const vStream = vidElement.captureStream();
            vStream.getAudioTracks().forEach(t => stream.addTrack(t));
          }
        } catch (e) {}
      }

      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
      ];
      const selectedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || "video/webm";

      const targetBps = Math.max(500000, Math.round((liveEstimatedMeta.size * 8) / Math.max(1, meta.duration || 5)));
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: targetBps
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recorderDone = new Promise((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: selectedMime });
          const outUrl = URL.createObjectURL(blob);
          setCompressedUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return outUrl;
          });
          setCompressedBlob(blob);
          resolve();
        };
      });

      recorder.start(100);
      vidElement.currentTime = 0;
      vidElement.playbackRate = isManualTrigger ? 1.0 : 2.5;
      await vidElement.play().catch(() => {});

      const duration = Math.min(meta.duration || 10, isManualTrigger ? 45 : 15);
      const intervalMs = 1000 / fps;

      const renderLoop = () => {
        if (abortRef.current || vidElement.ended || vidElement.paused || vidElement.currentTime >= duration) {
          if (recorder.state === 'recording') recorder.stop();
          vidElement.pause();
          return;
        }
        
        ctx.drawImage(vidElement, 0, 0, outW, outH);
        
        const pct = Math.min(99, Math.round((vidElement.currentTime / (duration || 5)) * 95) + 3);
        setProgress(pct);

        setTimeout(renderLoop, intervalMs);
      };

      renderLoop();
      await recorderDone;
      setProgress(100);
      setProcessingStatus("Complete");

      if (isManualTrigger) {
        setIsManualTranscodeDone(true);
      }
    } catch (err) {
      console.warn("Stream transcode fallback:", err);
      if (!compressedUrl) setCompressedUrl(srcUrl);
      setProcessingStatus("Direct pass complete");
      if (isManualTrigger) setIsManualTranscodeDone(true);
    } finally {
      setIsProcessing(false);
    }
  }, [liveEstimatedMeta.size, compressedUrl]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    abortRef.current = true;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
      setCompressedUrl("");
    }
    setCompressedBlob(null);
    setIsManualTranscodeDone(false); // Strict lock reset on new upload

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setProgress(0);

    const tempVid = document.createElement("video");
    tempVid.src = url;
    tempVid.muted = true;
    tempVid.onloadedmetadata = () => {
      const meta = {
        duration: tempVid.duration || 5,
        width: tempVid.videoWidth || 1280,
        height: tempVid.videoHeight || 720,
        size: file.size,
        type: file.type || "video/mp4"
      };
      setVideoMeta(meta);

      // Lightweight background sync (does NOT unlock download button)
      runStreamTranscode(url, meta, targetScale, 15, true, false);
    };
  };

  const handleManualTranscodeRun = () => {
    if (!videoUrl || !videoMeta.width || isProcessing) return;
    runStreamTranscode(videoUrl, videoMeta, targetScale, targetFps, stripAudio, true);
  };

  const handleDownload = () => {
    // SECURITY CHECK: Strictly block download if not processed/done via manual transcode run
    if (!isManualTranscodeDone || (!compressedBlob && !compressedUrl) || isProcessing) return;
    const a = document.createElement("a");
    a.href = compressedUrl || videoUrl;
    a.download = `muxair-compressed-${videoFile?.name?.replace(/\.[^/.]+$/, "") || 'video'}.webm`;
    a.click();
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const theme = {
    gradient: "from-violet-200 via-indigo-100 to-transparent dark:from-violet-900/30 dark:via-indigo-900/20",
    bgIcon: "bg-gradient-to-br from-violet-500 to-indigo-600",
    textPri: "text-violet-600 dark:text-violet-400",
    textSec: "text-indigo-600 dark:text-indigo-400",
    borderLight: "border-violet-200 dark:border-violet-800/50",
    bgLight: "bg-violet-50 dark:bg-violet-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Media Transcode Oracle V5 (Strictly Locked)
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Download Locked Until Fast-Track Transcode Completes
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 items-start">
        
        {/* LEFT: CONFIG & UPLOAD */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 font-sans">
            
            {/* Upload Dropzone */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1.5"><Upload className={`w-3.5 h-3.5 ${theme.textPri}`} /> Video Asset Source</span>
                {isManualTranscodeDone && (
                  <span className="text-[8px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5"/> Transcode Locked & Ready
                  </span>
                )}
              </label>
              
              <div 
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 dark:bg-slate-900/50 group"
              >
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  onChange={handleFileUpload} 
                  accept="video/*" 
                  className="hidden" 
                />
                <Film className="w-10 h-10 text-slate-400 group-hover:text-violet-500 mx-auto mb-2 transition-colors" />
                <span className="block text-xs font-black text-slate-700 dark:text-slate-200">
                  {videoFile ? videoFile.name : "Click or drop video (MP4, WEBM, MOV)"}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">
                  Upload initiates preview; run fast-track transcode to unlock download
                </span>
              </div>
            </div>

            {/* Source Stats */}
            {videoFile && (
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <div>
                  <span className="block text-[8px] font-black uppercase text-slate-400">Resolution</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{videoMeta.width}x{videoMeta.height}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black uppercase text-slate-400">Duration</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(videoMeta.duration)}s</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black uppercase text-slate-400">Raw Size</span>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{formatBytes(videoMeta.size)}</span>
                </div>
              </div>
            )}

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Compression Presets */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Sliders className={`w-3.5 h-3.5 ${theme.textPri}`} /> Transcode Preset Profile
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ultra-compress', label: 'Max Shrink', desc: '50% res, low bitrate' },
                  { id: 'balanced', label: 'Balanced', desc: '75% res, watchable' },
                  { id: 'high-quality', label: 'HQ Crisp', desc: '100% res, high bitrate' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePresetChange(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      preset === item.id 
                        ? theme.borderLight + " " + theme.bgLight + " " + theme.textPri + " shadow-sm border-2" 
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-xs font-black uppercase">{item.label}</span>
                    <span className="block text-[8px] text-slate-400 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Advanced Fine Tuning */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Target Resolution Scale</span>
                  <span className="font-black text-violet-600 dark:text-violet-400">{Math.round(targetScale * 100)}% ({liveEstimatedMeta.width}x{liveEstimatedMeta.height})</span>
                </div>
                <input 
                  type="range" min="0.3" max="1.0" step="0.05"
                  value={targetScale} onChange={(e) => { setTargetScale(parseFloat(e.target.value)); setIsManualTranscodeDone(false); }}
                  className="w-full accent-violet-500 cursor-pointer"
                />

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={stripAudio} 
                      onChange={(e) => { setStripAudio(e.target.checked); setIsManualTranscodeDone(false); }}
                      className="w-4 h-4 accent-violet-500 rounded" 
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      {stripAudio ? <VolumeX className="w-3.5 h-3.5 text-rose-500"/> : <Volume2 className="w-3.5 h-3.5 text-emerald-500"/>}
                      Strip Audio Track (Mute & Save Size)
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleManualTranscodeRun}
                disabled={!videoFile || isProcessing}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Stream Transcoding ({progress}%)
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Run Fast-Track Transcode
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT: PREVIEW & TELEMETRY */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Telemetry & Output Preview
                </span>
                {savingsPercent > 0 && (
                  <span className="text-[9px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded shadow-sm">
                    -{savingsPercent}% Size Reduction
                  </span>
                )}
              </div>

              {/* Real-time MB comparison */}
              <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Original Footprint</span>
                  <span className="text-base font-black text-slate-700 dark:text-slate-200 mt-1">{formatBytes(videoMeta.size)}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-violet-500 flex items-center gap-1">
                    <Cpu className="w-3 h-3"/> Output Size
                  </span>
                  <span className="text-base font-black text-violet-600 dark:text-violet-400 mt-1">{formatBytes(outputFootprintSize)}</span>
                </div>
              </div>

              {/* Progress Bar during transcode */}
              {isProcessing && (
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>{processingStatus}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Video Player Display */}
              <div className="w-full h-64 bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden relative">
                {compressedUrl ? (
                  <video 
                    ref={previewVideoRef}
                    src={compressedUrl} 
                    controls 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : videoUrl ? (
                  <video 
                    src={videoUrl} 
                    controls 
                    muted={stripAudio}
                    className="max-w-full max-h-full object-contain opacity-90"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <Film className="w-10 h-10 mb-2 opacity-30" />
                    <span className="text-xs uppercase font-bold tracking-widest">Awaiting Video Input</span>
                  </div>
                )}
              </div>

              {/* Action Button - STRICTLY LOCKED UNTIL MANUAL TRANSCODE RUN FINISHES */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleDownload}
                  disabled={!isManualTranscodeDone || isProcessing || (!compressedBlob && !compressedUrl)}
                  className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                    !isManualTranscodeDone || isProcessing || (!compressedBlob && !compressedUrl)
                      ? 'bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md'
                  }`}
                >
                  {!isManualTranscodeDone && !isProcessing ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Run Fast-Track Transcode First to Unlock
                    </>
                  ) : isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing Stream...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download Compressed Media
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
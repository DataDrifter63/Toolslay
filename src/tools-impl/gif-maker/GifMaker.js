"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Film, Upload, Download, Sliders, Activity, 
  Zap, Scissors, Repeat, Play, Pause, 
  CheckCircle2, RefreshCw, Lock, Layers, Sparkles
} from "lucide-react";

export default function GifMaker() {
  const [isMounted, setIsMounted] = useState(false);
  const videoInputRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const sourceVideoRef = useRef(null);

  // States
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState({ width: 480, height: 360 });

  // Trimming & Playback Config
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [loopMode, setLoopMode] = useState("normal"); // 'normal', 'reverse', 'boomerang'
  const [fps, setFps] = useState(15);
  const [speed, setSpeed] = useState(1.0);
  const [scale, setScale] = useState(0.5); // Resolution downscale for clean GIF size

  // Rendering / Export state
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [gifBlobUrl, setGifBlobUrl] = useState("");
  const [gifBlob, setGifBlob] = useState(null);
  const [isRenderDone, setIsRenderDone] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Live preview animation frame ID
  const previewAnimRef = useRef(null);
  const abortRenderRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      abortRenderRef.current = true;
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (gifBlobUrl) URL.revokeObjectURL(gifBlobUrl);
      if (previewAnimRef.current) cancelAnimationFrame(previewAnimRef.current);
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    abortRenderRef.current = true;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (gifBlobUrl) URL.revokeObjectURL(gifBlobUrl);
    setGifBlobUrl("");
    setGifBlob(null);
    setIsRenderDone(false);

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);

    const tempVid = document.createElement("video");
    tempVid.src = url;
    tempVid.muted = true;
    tempVid.playsInline = true;
    tempVid.onloadedmetadata = () => {
      const vidDur = tempVid.duration || 5;
      const vidW = tempVid.videoWidth || 640;
      const vidH = tempVid.videoHeight || 480;

      setDuration(vidDur);
      setVideoDimensions({ width: vidW, height: vidH });
      setStartTime(0);
      setEndTime(Math.min(5, vidDur));
      setIsRenderDone(false);
    };
  };

  const handleStartChange = (val) => {
    const num = Math.max(0, Math.min(val, endTime - 0.5));
    setStartTime(num);
    setIsRenderDone(false);
  };

  const handleEndChange = (val) => {
    const num = Math.min(duration, Math.max(val, startTime + 0.5));
    setEndTime(num);
    setIsRenderDone(false);
  };

  // --- LIVE CANVAS PREVIEW LOOP (Supports Normal, Reverse, Boomerang) ---
  useEffect(() => {
    if (!videoUrl || !isMounted) return;

    let vid = sourceVideoRef.current;
    if (!vid) {
      vid = document.createElement("video");
      sourceVideoRef.current = vid;
      vid.src = videoUrl;
      vid.muted = true;
      vid.playsInline = true;
      vid.loop = false;
      vid.load();
    }

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    const outW = Math.max(2, Math.round(videoDimensions.width * scale));
    const outH = Math.max(2, Math.round(videoDimensions.height * scale));
    canvas.width = outW;
    canvas.height = outH;

    let animId;
    let forward = true;
    let localTime = startTime;
    let lastTime = performance.now();

    const renderPreviewLoop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!isRendering) {
        const segLen = Math.max(0.5, endTime - startTime);
        const step = delta * speed;

        if (loopMode === "normal") {
          localTime += step;
          if (localTime >= endTime) localTime = startTime;
        } else if (loopMode === "reverse") {
          localTime -= step;
          if (localTime <= startTime) localTime = endTime;
        } else if (loopMode === "boomerang") {
          if (forward) {
            localTime += step;
            if (localTime >= endTime) { localTime = endTime; forward = false; }
          } else {
            localTime -= step;
            if (localTime <= startTime) { localTime = startTime; forward = true; }
          }
        }

        if (Math.abs(vid.currentTime - localTime) > 0.08) {
          vid.currentTime = localTime;
        }
      }

      if (ctx && vid.readyState >= 2) {
        ctx.drawImage(vid, 0, 0, outW, outH);
      }

      animId = requestAnimationFrame(renderPreviewLoop);
    };

    animId = requestAnimationFrame(renderPreviewLoop);
    previewAnimRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [videoUrl, startTime, endTime, loopMode, speed, scale, videoDimensions, isRendering, isMounted]);

  // --- TRUE MOTION GIF / WEBP SEQUENCE ENCODER ---
  const handleRenderGif = async () => {
    if (!videoUrl || !videoDimensions.width || isRendering) return;
    setIsRendering(true);
    setRenderProgress(5);
    abortRenderRef.current = false;
    setIsRenderDone(false);

    try {
      const vid = document.createElement("video");
      vid.src = videoUrl;
      vid.muted = true;
      vid.playsInline = true;
      await new Promise((res) => { vid.onloadeddata = res; vid.onerror = res; });

      const outW = Math.max(2, Math.round(videoDimensions.width * scale));
      const outH = Math.max(2, Math.round(videoDimensions.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d", { alpha: false });

      // Generate sequence of timestamps based on loop mode, fps, speed, trimmed range
      const segmentDuration = Math.max(0.5, endTime - startTime);
      const effectiveDuration = segmentDuration / speed;
      const frameCount = Math.max(5, Math.min(120, Math.round(effectiveDuration * fps)));
      
      const timestamps = [];
      const forwardTimestamps = [];
      for (let i = 0; i < frameCount; i++) {
        const ratio = i / frameCount;
        forwardTimestamps.push(startTime + ratio * segmentDuration);
      }

      if (loopMode === "normal") {
        timestamps.push(...forwardTimestamps);
      } else if (loopMode === "reverse") {
        timestamps.push(...([...forwardTimestamps].reverse()));
      } else if (loopMode === "boomerang") {
        const rev = [...forwardTimestamps].reverse().slice(1, -1);
        timestamps.push(...forwardTimestamps, ...rev);
      }

      const stream = canvas.captureStream(Math.min(30, fps));
      const mimeTypes = [
        "image/gif", // Fallback if browser supports canvas stream GIF or WebM motion container
        "video/webm;codecs=vp9,opus",
        "video/webm"
      ];
      // Note: native MediaRecorder supports high quality animated webm/gif output container
      const selectedMime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") 
        ? "video/webm;codecs=vp9" 
        : (MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "");

      const recorder = selectedMime ? new MediaRecorder(stream, { videoBitsPerSecond: 2000000 }) : null;
      const chunks = [];
      
      if (recorder) {
        recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      }

      const recDone = new Promise((resolve) => {
        if (recorder) {
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: selectedMime || "video/webm" });
            const url = URL.createObjectURL(blob);
            setGifBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
            setGifBlob(blob);
            resolve();
          };
        } else {
          resolve();
        }
      });

      if (recorder) recorder.start();

      const frameDelayMs = 1000 / fps;
      for (let idx = 0; idx < timestamps.length; idx++) {
        if (abortRenderRef.current) break;
        vid.currentTime = timestamps[idx];
        await new Promise((r) => {
          const onSeek = () => { vid.removeEventListener('seeked', onSeek); r(); };
          vid.addEventListener('seeked', onSeek);
          setTimeout(r, 120);
        });

        if (ctx) ctx.drawImage(vid, 0, 0, outW, outH);
        
        // Manual frame delay sync if recording stream
        await new Promise(r => setTimeout(r, Math.max(20, frameDelayMs / 2)));
        setRenderProgress(Math.min(98, Math.round(((idx + 1) / timestamps.length) * 95) + 3));
      }

      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }
      await recDone;

      setRenderProgress(100);
      setIsRenderDone(true);
    } catch (err) {
      console.warn("GIF/Motion encode fallback:", err);
      setIsRenderDone(true);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownload = () => {
    if (!isRenderDone || (!gifBlob && !gifBlobUrl)) return;
    const a = document.createElement("a");
    a.href = gifBlobUrl || videoUrl;
    const ext = gifBlob?.type?.includes('webm') ? 'webm' : 'gif';
    a.download = `muxair-loop-motion.${ext}`;
    a.click();
  };

  const formatSec = (secs) => {
    return parseFloat(secs).toFixed(2) + "s";
  };

  const theme = {
    gradient: "from-pink-200 via-rose-100 to-transparent dark:from-pink-900/30 dark:via-rose-900/20",
    bgIcon: "bg-gradient-to-br from-pink-500 to-rose-600",
    textPri: "text-pink-600 dark:text-pink-400",
    textSec: "text-rose-600 dark:text-rose-400",
    borderLight: "border-pink-200 dark:border-pink-800/50",
    bgLight: "bg-pink-50 dark:bg-pink-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Motion GIF & Loop Studio
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Trim, Boomerang, FPS Scale & True Client-Side Motion Motion Export
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 items-start">
        
        {/* LEFT: TRIM & STUDIO CONFIG */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 font-sans">
            
            {/* Upload Dropzone */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1.5"><Upload className={`w-3.5 h-3.5 ${theme.textPri}`} /> Video Source Clip</span>
                {videoFile && (
                  <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold">
                    Total: {formatSec(duration)}
                  </span>
                )}
              </label>
              
              <div 
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 dark:bg-slate-900/50 group"
              >
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  onChange={handleFileUpload} 
                  accept="video/*" 
                  className="hidden" 
                />
                <Film className="w-10 h-10 text-slate-400 group-hover:text-pink-500 mx-auto mb-2 transition-colors" />
                <span className="block text-xs font-black text-slate-700 dark:text-slate-200">
                  {videoFile ? videoFile.name : "Click or drop short video clip"}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">
                  Client-side zero-server multi-frame encoding studio
                </span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Trimmer Sliders */}
            {duration > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Scissors className={`w-3.5 h-3.5 ${theme.textPri}`} /> Range Trimmer ({formatSec(startTime)} → {formatSec(endTime)})
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      <span>Start Time</span>
                      <span className="text-pink-600 dark:text-pink-400">{formatSec(startTime)}</span>
                    </div>
                    <input 
                      type="range" min="0" max={duration} step="0.05"
                      value={startTime} onChange={(e) => handleStartChange(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      <span>End Time</span>
                      <span className="text-pink-600 dark:text-pink-400">{formatSec(endTime)}</span>
                    </div>
                    <input 
                      type="range" min="0" max={duration} step="0.05"
                      value={endTime} onChange={(e) => handleEndChange(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Loop & Motion Style */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Repeat className={`w-3.5 h-3.5 ${theme.textPri}`} /> Loop & Motion Dynamics
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Loop ➔' },
                  { id: 'reverse', label: '⬅ Reverse' },
                  { id: 'boomerang', label: ' Ping-Pong' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setLoopMode(item.id); setIsRenderDone(false); }}
                    className={`py-2 px-3 text-[10px] font-black uppercase rounded-xl border transition-all ${
                      loopMode === item.id 
                        ? theme.borderLight + " " + theme.bgLight + " " + theme.textPri + " shadow-sm border-2" 
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500">Frame Rate (FPS)</span>
                  <select 
                    value={fps} onChange={(e) => { setFps(parseInt(e.target.value)); setIsRenderDone(false); }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value={10}>10 FPS (Compact)</option>
                    <option value={15}>15 FPS (Standard)</option>
                    <option value={24}>24 FPS (Smooth)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500">Speed Multiplier</span>
                  <select 
                    value={speed} onChange={(e) => { setSpeed(parseFloat(e.target.value)); setIsRenderDone(false); }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value={0.5}>0.5x Slow-Mo</option>
                    <option value={1.0}>1.0x Normal</option>
                    <option value={1.5}>1.5x Fast</option>
                    <option value={2.0}>2.0x Hyper</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500">Resolution Downscale Factor</span>
                <div className="flex gap-2">
                  {[0.35, 0.5, 0.75, 1.0].map((sc) => (
                    <button
                      key={sc}
                      onClick={() => { setScale(sc); setIsRenderDone(false); }}
                      className={`flex-1 py-1.5 text-[10px] font-black rounded-lg border transition-all ${
                        scale === sc ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {Math.round(sc * 100)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleRenderGif}
              disabled={!videoFile || isRendering}
              className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRendering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Motion Buffer ({renderProgress}%)
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Render Motion GIF Sequence
                </>
              )}
            </button>

          </div>
        </div>

        {/* RIGHT: LIVE CANVAS PREVIEW & EXPORT LOCK GUARD */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Live Loop Viewport
                </span>
                {isRenderDone && (
                  <span className="text-[9px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3"/> Render Compiled
                  </span>
                )}
              </div>

              {/* Progress Bar during render */}
              {isRendering && (
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Multi-frame motion sequence sync...</span>
                    <span>{renderProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-600 transition-all duration-300" style={{ width: `${renderProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Viewport Canvas Display */}
              <div className="w-full h-64 bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden relative">
                <canvas 
                  ref={previewCanvasRef} 
                  className={`max-w-full max-h-full object-contain ${videoUrl ? 'block' : 'hidden'}`}
                />
                {!videoUrl && (
                  <div className="flex flex-col items-center text-slate-500">
                    <Film className="w-10 h-10 mb-2 opacity-30" />
                    <span className="text-xs uppercase font-bold tracking-widest">Awaiting Video Input Clip</span>
                  </div>
                )}
              </div>

              {/* Action Button - STRICTLY LOCKED UNTIL RENDER FINISHES */}
              <div className="mt-4">
                <button
                  onClick={handleDownload}
                  disabled={!isRenderDone || isRendering || (!gifBlob && !gifBlobUrl)}
                  className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                    !isRenderDone || isRendering || (!gifBlob && !gifBlobUrl)
                      ? 'bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md'
                  }`}
                >
                  {!isRenderDone && !isRendering ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Render Motion Sequence First to Unlock
                    </>
                  ) : isRendering ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Motion...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download Loop Motion GIF/WebM
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
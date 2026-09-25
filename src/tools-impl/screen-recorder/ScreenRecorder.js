"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Monitor, Video, Mic, MicOff, Square, 
  Play, Download, ShieldCheck, Activity, 
  Clock, Zap, Lock
} from "lucide-react";

export default function ScreenRecorder() {
  const [isMounted, setIsMounted] = useState(false);
  const previewVideoRef = useRef(null);
  
  // Media Recorder Refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const micStreamRef = useRef(null);
  const chunksRef = useRef([]);

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [includeMic, setIncludeMic] = useState(false);
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true);
  const [targetFps, setTargetFps] = useState(30);

  // Telemetry & Output
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState("");
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedSize, setRecordedSize] = useState(0);
  const [statusText, setStatusText] = useState("Standby — Ready to capture screen");

  const timerRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      cleanupStreams();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
    };
  }, []);

  const cleanupStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
  };

  // --- START SCREEN RECORDING ---
  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert("Screen recording is not supported in this browser environment.");
      return;
    }

    try {
      setStatusText("Requesting display share permission...");
      
      // 1. Get Screen Stream
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: targetFps } },
        audio: includeSystemAudio ? { echoCancellation: true, noiseSuppression: true } : false
      });

      // 2. Optionally get Mic Audio
      let combinedAudioTracks = displayStream.getAudioTracks();
      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          micStreamRef.current = micStream;
          micStream.getAudioTracks().forEach(track => combinedAudioTracks.push(track));
        } catch (micErr) {
          console.warn("Microphone access denied or unavailable, proceeding with screen audio only.", micErr);
        }
      }

      // Combine tracks into single stream
      const tracks = [...displayStream.getVideoTracks(), ...combinedAudioTracks];
      const combinedStream = new MediaStream(tracks);
      streamRef.current = displayStream;

      // Listen for user stopping share via browser UI banner
      displayStream.getVideoTracks()[0].onended = () => {
        handleStopRecording();
      };

      // Set live preview
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = combinedStream;
        previewVideoRef.current.muted = true;
      }

      // 3. Init MediaRecorder
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
      ];
      const selectedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || "video/webm";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 5000000 // 5 Mbps HQ
      });

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          const totalSize = chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
          setRecordedSize(totalSize);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
        setRecordedBlob(blob);
        setRecordedSize(blob.size);
        setStatusText("Recording finalized & ready for export");

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = null;
          previewVideoRef.current.src = url;
          previewVideoRef.current.muted = false;
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      
      setIsRecording(true);
      setIsPaused(false);
      setSecondsElapsed(0);
      setStatusText("Recording active (Zero cloud upload)");

      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Screen recording start error:", err);
      setStatusText("Capture cancelled or permission denied");
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setStatusText("Recording resumed");
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setStatusText("Recording paused");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupStreams();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleDownload = () => {
    if (isRecording || !recordedBlob) return;
    const a = document.createElement("a");
    a.href = recordedBlobUrl;
    const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
    a.download = `muxair-screen-record-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${ext}`;
    a.click();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Enterprise Screen Capture Studio
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500"/> Local Browser API — Zero Cloud Upload
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 items-start">
        
        {/* LEFT: CONFIG & CONTROLS */}
        <div className="space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* 1. Audio & FPS Config */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Video className="w-3.5 h-3.5 text-brand" /> Capture Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-line cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeSystemAudio} 
                    onChange={(e) => setIncludeSystemAudio(e.target.checked)}
                    disabled={isRecording}
                    className="w-4 h-4 accent-brand rounded border-line cursor-pointer" 
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-black text-ink truncate">System Audio</span>
                    <span className="block text-[9px] text-muted truncate">Capture tab/desktop sound</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-line cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeMic} 
                    onChange={(e) => setIncludeMic(e.target.checked)}
                    disabled={isRecording}
                    className="w-4 h-4 accent-brand rounded border-line cursor-pointer" 
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-black text-ink flex items-center gap-1 truncate">
                      {includeMic ? <Mic className="w-3.5 h-3.5 text-brand shrink-0"/> : <MicOff className="w-3.5 h-3.5 text-muted shrink-0"/>}
                      Microphone
                    </span>
                    <span className="block text-[9px] text-muted truncate">Voiceover mix stream</span>
                  </div>
                </label>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted block">Target Frame Rate (FPS)</span>
                <div className="flex gap-2">
                  {[30, 60].map((fps) => (
                    <button
                      key={fps}
                      type="button"
                      onClick={() => setTargetFps(fps)}
                      disabled={isRecording}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        targetFps === fps ? 'bg-brand text-surface border-brand shadow-sm' : 'border-line text-muted bg-surface hover:text-ink'
                      }`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Action Controls */}
            <div className="space-y-3 pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Zap className="w-3.5 h-3.5 text-brand" /> Control Hub
              </h3>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="w-full py-4 bg-brand hover:opacity-95 text-surface font-black uppercase text-xs tracking-wider rounded-xl shadow-sm transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4 animate-pulse shrink-0" /> Start Screen Capture
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePauseResume}
                    className={`py-3.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      isPaused ? 'bg-amber-500 text-white border-amber-600' : 'bg-surface text-ink border-line'
                    }`}
                  >
                    {isPaused ? <Play className="w-4 h-4 fill-current shrink-0"/> : <Activity className="w-4 h-4 shrink-0"/>}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current shrink-0" /> Stop Capture
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-line text-[11px] font-bold text-ink">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isRecording ? (isPaused ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-ping') : 'bg-muted'}`}></span>
                <span className="truncate">{statusText}</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: VIEWPORT & EXPORT GUARD */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-sm relative flex flex-col">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Live Telemetry Viewport
              </span>
              {isRecording && (
                <span className="text-[10px] font-black bg-rose-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse shrink-0">
                  <Clock className="w-3 h-3"/> {formatTime(secondsElapsed)}
                </span>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
              <div className="flex flex-col items-center justify-center p-3 bg-paper border border-line rounded-xl shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted text-center">Duration</span>
                <span className="text-base font-black text-brand font-mono mt-1">{formatTime(secondsElapsed)}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-paper border border-line rounded-xl shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted text-center">Captured Size</span>
                <span className="text-base font-black text-ink font-mono mt-1">{formatBytes(recordedSize)}</span>
              </div>
            </div>

            {/* Video Preview Viewport */}
            <div className="w-full h-64 bg-slate-900 dark:bg-slate-950 rounded-xl border border-line shadow-inner flex items-center justify-center overflow-hidden relative shrink-0">
              <video 
                ref={previewVideoRef}
                autoPlay 
                playsInline 
                controls={!isRecording && !!recordedBlob}
                className={`max-w-full max-h-full object-contain ${isRecording || recordedBlob ? 'block' : 'hidden'}`}
              />
              {!isRecording && !recordedBlob && (
                <div className="flex flex-col items-center text-muted text-center px-4">
                  <Monitor className="w-12 h-12 mb-2 opacity-30 text-brand" />
                  <span className="text-xs uppercase font-bold tracking-widest">Awaiting Capture Session</span>
                  <span className="text-[10px] text-muted mt-1">Click start capture to share screen or tab</span>
                </div>
              )}
            </div>

            {/* Action Button - STRICTLY LOCKED UNTIL RECORDING STOPS */}
            <div className="mt-4 shrink-0">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isRecording || !recordedBlob}
                className={`w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isRecording || !recordedBlob
                    ? 'bg-paper text-muted cursor-not-allowed border border-line' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md'
                }`}
              >
                {isRecording ? (
                  <>
                    <Lock className="w-3.5 h-3.5 shrink-0" /> Stop Capture Session First to Unlock Export
                  </>
                ) : !recordedBlob ? (
                  <>
                    <Lock className="w-3.5 h-3.5 shrink-0" /> No Recording Buffer Ready
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 shrink-0" /> Download Local Recording ({formatBytes(recordedSize)})
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
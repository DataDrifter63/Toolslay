"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor, Video, Mic, MicOff, Square, 
  Play, Download, ShieldCheck, Activity, 
  Clock, Zap, CheckCircle2, AlertCircle, RefreshCw, Lock
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
          // Calculate approx live size
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

      recorder.start(250); // Timeslice 250ms
      mediaRecorderRef.current = recorder;
      
      setIsRecording(true);
      setIsPaused(false);
      setSecondsElapsed(0);
      setStatusText("Recording active (Zero cloud upload)");

      // Start elapsed timer
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

  const theme = {
    gradient: "from-blue-200 via-indigo-100 to-transparent dark:from-blue-900/30 dark:via-indigo-900/20",
    bgIcon: "bg-gradient-to-br from-blue-500 to-indigo-600",
    textPri: "text-blue-600 dark:text-blue-400",
    textSec: "text-indigo-600 dark:text-indigo-400",
    borderLight: "border-blue-200 dark:border-blue-800/50",
    bgLight: "bg-blue-50 dark:bg-blue-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Enterprise Screen Capture Studio
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500"/> Local Browser API — Zero Cloud Upload
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 items-start">
        
        {/* LEFT: CONFIG & CONTROLS */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 font-sans">
            
            {/* 1. Audio & FPS Config */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Video className={`w-3.5 h-3.5 ${theme.textPri}`} /> Capture Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeSystemAudio} 
                    onChange={(e) => setIncludeSystemAudio(e.target.checked)}
                    disabled={isRecording}
                    className="w-4 h-4 accent-blue-500 rounded" 
                  />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">System Audio</span>
                    <span className="block text-[9px] text-slate-500">Capture tab/desktop sound</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeMic} 
                    onChange={(e) => setIncludeMic(e.target.checked)}
                    disabled={isRecording}
                    className="w-4 h-4 accent-blue-500 rounded" 
                  />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      {includeMic ? <Mic className="w-3.5 h-3.5 text-blue-500"/> : <MicOff className="w-3.5 h-3.5 text-slate-400"/>}
                      Microphone
                    </span>
                    <span className="block text-[9px] text-slate-500">Voiceover mix stream</span>
                  </div>
                </label>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold text-slate-500">Target Frame Rate (FPS)</span>
                <div className="flex gap-2">
                  {[30, 60].map((fps) => (
                    <button
                      key={fps}
                      onClick={() => setTargetFps(fps)}
                      disabled={isRecording}
                      className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${
                        targetFps === fps ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Action Controls */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Zap className={`w-3.5 h-3.5 ${theme.textPri}`} /> Control Hub
              </h3>

              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4 animate-pulse text-rose-300" /> Start Screen Capture
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePauseResume}
                    className={`py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 border ${
                      isPaused ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isPaused ? <Play className="w-4 h-4 fill-current"/> : <Activity className="w-4 h-4"/>}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={handleStopRecording}
                    className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> Stop Capture
                  </button>
                </div>
              )}

              {/* Status readout */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? (isPaused ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-ping') : 'bg-slate-400'}`}></span>
                <span className="truncate">{statusText}</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: VIEWPORT & EXPORT GUARD */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Live Telemetry Viewport
                </span>
                {isRecording && (
                  <span className="text-[10px] font-black bg-rose-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3"/> {formatTime(secondsElapsed)}
                  </span>
                )}
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Duration</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400 mt-1">{formatTime(secondsElapsed)}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Captured Size</span>
                  <span className="text-base font-black text-slate-700 dark:text-slate-200 mt-1">{formatBytes(recordedSize)}</span>
                </div>
              </div>

              {/* Video Preview Viewport */}
              <div className="w-full h-64 bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden relative">
                <video 
                  ref={previewVideoRef}
                  autoPlay 
                  playsInline 
                  controls={!isRecording && !!recordedBlob}
                  className={`max-w-full max-h-full object-contain ${isRecording || recordedBlob ? 'block' : 'hidden'}`}
                />
                {!isRecording && !recordedBlob && (
                  <div className="flex flex-col items-center text-slate-500 text-center px-4">
                    <Monitor className="w-12 h-12 mb-2 opacity-30 text-blue-400" />
                    <span className="text-xs uppercase font-bold tracking-widest">Awaiting Capture Session</span>
                    <span className="text-[10px] text-slate-400 mt-1">Click start capture to share screen or tab</span>
                  </div>
                )}
              </div>

              {/* Action Button - STRICTLY LOCKED UNTIL RECORDING STOPS */}
              <div className="mt-4">
                <button
                  onClick={handleDownload}
                  disabled={isRecording || !recordedBlob}
                  className={`w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isRecording || !recordedBlob
                      ? 'bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Stop Capture Session First to Unlock Export
                    </>
                  ) : !recordedBlob ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> No Recording Buffer Ready
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download Local Recording ({formatBytes(recordedSize)})
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
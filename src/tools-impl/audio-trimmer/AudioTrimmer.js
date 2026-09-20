"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Music, Upload, Download, Sliders, Activity, 
  Zap, Scissors, Play, Square, Volume2, 
  CheckCircle2, RefreshCw, Lock, Sparkles, Layers, Flame
} from "lucide-react";

export default function AudioTrimmer() {
  const [isMounted, setIsMounted] = useState(false);
  const audioInputRef = useRef(null);
  const waveformCanvasRef = useRef(null);

  // Audio Context & Buffer Refs
  const audioCtxRef = useRef(null);
  const audioBufferRef = useRef(null);
  const activeSourceRef = useRef(null);

  // States
  const [audioFile, setAudioFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState(0);

  // Trimming & DSP Config
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [fadeInSec, setFadeInSec] = useState(0.2);
  const [fadeOutSec, setFadeOutSec] = useState(0.2);
  const [gainDb, setGainDb] = useState(0); // -10 to +10 dB

  // Playback & Export state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportBlobUrl, setExportBlobUrl] = useState("");
  const [exportBlob, setExportBlob] = useState(null);
  const [isProcessedReady, setIsProcessedReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      stopPlayback();
      if (exportBlobUrl) URL.revokeObjectURL(exportBlobUrl);
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch(e){}
      }
    };
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopPlayback();
    if (exportBlobUrl) URL.revokeObjectURL(exportBlobUrl);
    setExportBlobUrl("");
    setExportBlob(null);
    setIsProcessedReady(false);

    setAudioFile(file);
    setFileName(file.name);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = getAudioContext();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = decodedBuffer;

      const dur = decodedBuffer.duration;
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(10, dur));
      setIsProcessedReady(false);
    } catch (err) {
      console.error("Audio decode error:", err);
      alert("Failed to decode audio file. Try MP4, WAV, or MP3.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- WAVEFORM CANVAS RENDERER ---
  const renderWaveform = useCallback(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || !audioBufferRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const buffer = audioBufferRef.current;
    const rawData = buffer.getChannelData(0);
    const samples = width;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];

    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j] || 0);
      }
      filteredData.push(sum / blockSize);
    }

    // Normalize
    const maxVal = Math.max(...filteredData, 0.01);
    const normalizedData = filteredData.map(v => v / maxVal);

    // Draw background grid/waveform bars
    const barWidth = width / samples;
    for (let i = 0; i < samples; i++) {
      const barHeight = Math.max(4, normalizedData[i] * (height - 10));
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      // Colorize selected vs unselected range
      const timeAtBar = (i / samples) * duration;
      const isSelected = timeAtBar >= startTime && timeAtBar <= endTime;

      ctx.fillStyle = isSelected ? '#a855f7' : '#cbd5e1'; // purple-500 vs slate-300
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    }

    // Draw Start/End Trim Regions overlay markers
    const startX = (startTime / (duration || 1)) * width;
    const endX = (endTime / (duration || 1)) * width;

    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.fillRect(startX, 0, Math.max(0, endX - startX), height);

    // Start line
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();

    // End line
    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();
  }, [duration, startTime, endTime]);

  useEffect(() => {
    if (waveformCanvasRef.current && audioBufferRef.current) {
      renderWaveform();
    }
  }, [renderWaveform, startTime, endTime]);

  const handleStartChange = (val) => {
    const num = Math.max(0, Math.min(val, endTime - 0.2));
    setStartTime(num);
    setIsProcessedReady(false);
  };

  const handleEndChange = (val) => {
    const num = Math.min(duration, Math.max(val, startTime + 0.2));
    setEndTime(num);
    setIsProcessedReady(false);
  };

  // --- DSP PLAYBACK PREVIEW (SAMPLE ACCURATE TRIM + FADE) ---
  const stopPlayback = () => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
        activeSourceRef.current.disconnect();
      } catch (e) {}
      activeSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlayPreview = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    if (!audioBufferRef.current) return;

    const ctx = getAudioContext();
    stopPlayback();

    const buffer = audioBufferRef.current;
    const startOffset = Math.max(0, startTime);
    const playDuration = Math.max(0.1, endTime - startOffset);
    const startSample = Math.floor(startOffset * buffer.sampleRate);
    const frameCount = Math.floor(playDuration * buffer.sampleRate);

    // Slice buffer segment
    const trimmedBuffer = ctx.createBuffer(buffer.numberOfChannels, frameCount, buffer.sampleRate);
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const channelData = buffer.getChannelData(c);
      const segment = channelData.slice(startSample, startSample + frameCount);
      
      // Apply DSP Gain & Fades to preview segment if ready or live preview
      const gainLinear = Math.pow(10, gainDb / 20);
      const fadeSamplesIn = Math.min(frameCount, Math.floor(fadeInSec * buffer.sampleRate));
      const fadeSamplesOut = Math.min(frameCount, Math.floor(fadeOutSec * buffer.sampleRate));

      for (let i = 0; i < segment.length; i++) {
        let sample = segment[i] * gainLinear;
        if (fadeSamplesIn > 0 && i < fadeSamplesIn) {
          sample *= (i / fadeSamplesIn);
        }
        if (fadeSamplesOut > 0 && i >= frameCount - fadeSamplesOut) {
          const rem = frameCount - i;
          sample *= (rem / fadeSamplesOut);
        }
        segment[i] = sample;
      }
      trimmedBuffer.copyToChannel(segment, c);
    }

    const source = ctx.createBufferSource();
    source.buffer = trimmedBuffer;
    source.connect(ctx.destination);
    source.onended = () => setIsPlaying(false);

    source.start(0);
    activeSourceRef.current = source;
    setIsPlaying(true);
  };

  // --- PCM TO WAV ENCODER UTILITY ---
  const encodeWAV = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const result = [];
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = audioBuffer.getChannelData(c)[i];
        sample = Math.max(-1, Math.min(1, sample));
        result.push(sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
      }
    }

    const dataLength = result.length * 2;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < result.length; i++, offset += 2) {
      view.setInt16(offset, result[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  // --- PROCESS & LOCK EXPORT PIPELINE ---
  const handleProcessTrim = async () => {
    if (!audioBufferRef.current || isProcessing) return;
    setIsProcessing(true);
    stopPlayback();

    setTimeout(() => {
      try {
        const buffer = audioBufferRef.current;
        const ctx = getAudioContext();
        const startOffset = Math.max(0, startTime);
        const playDuration = Math.max(0.1, endTime - startOffset);
        const startSample = Math.floor(startOffset * buffer.sampleRate);
        const frameCount = Math.floor(playDuration * buffer.sampleRate);

        const trimmedBuffer = ctx.createBuffer(buffer.numberOfChannels, frameCount, buffer.sampleRate);
        const gainLinear = Math.pow(10, gainDb / 20);
        const fadeSamplesIn = Math.min(frameCount, Math.floor(fadeInSec * buffer.sampleRate));
        const fadeSamplesOut = Math.min(frameCount, Math.floor(fadeOutSec * buffer.sampleRate));

        for (let c = 0; c < buffer.numberOfChannels; c++) {
          const channelData = buffer.getChannelData(c);
          const segment = channelData.slice(startSample, startSample + frameCount);

          for (let i = 0; i < segment.length; i++) {
            let sample = segment[i] * gainLinear;
            if (fadeSamplesIn > 0 && i < fadeSamplesIn) {
              sample *= (i / fadeSamplesIn);
            }
            if (fadeSamplesOut > 0 && i >= frameCount - fadeSamplesOut) {
              const rem = frameCount - i;
              sample *= (rem / fadeSamplesOut);
            }
            segment[i] = sample;
          }
          trimmedBuffer.copyToChannel(segment, c);
        }

        const wavBlob = encodeWAV(trimmedBuffer);
        const url = URL.createObjectURL(wavBlob);
        setExportBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
        setExportBlob(wavBlob);
        setIsProcessedReady(true);
      } catch (err) {
        console.error("DSP processing error:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 200);
  };

  const handleDownload = () => {
    if (!isProcessedReady || (!exportBlob && !exportBlobUrl)) return;
    const a = document.createElement("a");
    a.href = exportBlobUrl;
    a.download = `muxair-trimmed-${fileName.replace(/\.[^/.]+$/, "") || 'audio'}.wav`;
    a.click();
  };

  const formatSec = (secs) => {
    return parseFloat(secs).toFixed(2) + "s";
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isMounted) return null;

  const theme = {
    gradient: "from-purple-200 via-indigo-100 to-transparent dark:from-purple-900/30 dark:via-indigo-900/20",
    bgIcon: "bg-gradient-to-br from-purple-500 to-indigo-600",
    textPri: "text-purple-600 dark:text-purple-400",
    textSec: "text-indigo-600 dark:text-indigo-400",
    borderLight: "border-purple-200 dark:border-purple-800/50",
    bgLight: "bg-purple-50 dark:bg-purple-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Audio DSP Trimmer Studio
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Sample-Accurate PCM Cutter + Fade Curve & Gain Processor
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 items-start">
        
        {/* LEFT: TRIM & DSP CONFIG */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 font-sans">
            
            {/* Upload Dropzone */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1.5"><Upload className={`w-3.5 h-3.5 ${theme.textPri}`} /> Audio Source Asset</span>
                {audioFile && (
                  <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold">
                    Duration: {formatSec(duration)}
                  </span>
                )}
              </label>
              
              <div 
                onClick={() => audioInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 dark:bg-slate-900/50 group"
              >
                <input 
                  type="file" 
                  ref={audioInputRef} 
                  onChange={handleFileUpload} 
                  accept="audio/*,video/mp4" 
                  className="hidden" 
                />
                <Music className="w-10 h-10 text-slate-400 group-hover:text-purple-500 mx-auto mb-2 transition-colors" />
                <span className="block text-xs font-black text-slate-700 dark:text-slate-200 truncate px-4">
                  {fileName ? fileName : "Click or drop audio file (MP3, WAV, AAC)"}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">
                  Client-side zero-server PCM buffer editing
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
                      <span>Trim Start</span>
                      <span className="text-purple-600 dark:text-purple-400">{formatSec(startTime)}</span>
                    </div>
                    <input 
                      type="range" min="0" max={duration} step="0.05"
                      value={startTime} onChange={(e) => handleStartChange(parseFloat(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      <span>Trim End</span>
                      <span className="text-purple-600 dark:text-purple-400">{formatSec(endTime)}</span>
                    </div>
                    <input 
                      type="range" min="0" max={duration} step="0.05"
                      value={endTime} onChange={(e) => handleEndChange(parseFloat(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* DSP Curves (Fade In/Out & Gain) */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Sliders className={`w-3.5 h-3.5 ${theme.textPri}`} /> DSP Envelope & Gain Booster
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Fade In</span>
                    <span>{fadeInSec}s</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="0.05"
                    value={fadeInSec} onChange={(e) => { setFadeInSec(parseFloat(e.target.value)); setIsProcessedReady(false); }}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Fade Out</span>
                    <span>{fadeOutSec}s</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="0.05"
                    value={fadeOutSec} onChange={(e) => { setFadeOutSec(parseFloat(e.target.value)); setIsProcessedReady(false); }}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Gain Boost / Cut</span>
                  <span className={gainDb > 0 ? 'text-emerald-500' : gainDb < 0 ? 'text-rose-500' : 'text-slate-400'}>{gainDb > 0 ? `+${gainDb}` : gainDb} dB</span>
                </div>
                <input 
                  type="range" min="-10" max="10" step="1"
                  value={gainDb} onChange={(e) => { setGainDb(parseInt(e.target.value)); setIsProcessedReady(false); }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleProcessTrim}
              disabled={!audioFile || isProcessing}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Rendering PCM Segment...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Process & Lock Audio Buffer
                </>
              )}
            </button>

          </div>
        </div>

        {/* RIGHT: WAVEFORM VIEWPORT & EXPORT GUARD */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Interactive Waveform Viewport
                </span>
                {isProcessedReady && (
                  <span className="text-[9px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3"/> Locked & Ready
                  </span>
                )}
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selected Segment Length</span>
                  <span className="text-base font-black text-purple-600 dark:text-purple-400 mt-1">{formatSec(Math.max(0, endTime - startTime))}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Output Footprint</span>
                  <span className="text-base font-black text-slate-700 dark:text-slate-200 mt-1">{exportBlob ? formatBytes(exportBlob.size) : 'Pending Process'}</span>
                </div>
              </div>

              {/* Preview Play/Stop Control */}
              <div className="flex items-center justify-between bg-white dark:bg-[#0d1117] p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Segment Audio Preview</span>
                </div>
                <button
                  onClick={handlePlayPreview}
                  disabled={!audioFile}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isPlaying ? <><Square className="w-3.5 h-3.5 fill-current"/> Stop Preview</> : <><Play className="w-3.5 h-3.5 fill-current"/> Play Trim Segment</>}
                </button>
              </div>

              {/* Waveform Canvas Viewport */}
              <div className="w-full h-48 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden relative p-2">
                <canvas 
                  ref={waveformCanvasRef} 
                  width={600} 
                  height={150} 
                  className={`w-full h-full object-cover ${audioFile ? 'block' : 'hidden'}`}
                />
                {!audioFile && (
                  <div className="flex flex-col items-center text-slate-500">
                    <Music className="w-10 h-10 mb-2 opacity-30" />
                    <span className="text-xs uppercase font-bold tracking-widest">Awaiting Audio Source</span>
                  </div>
                )}
              </div>

              {/* Action Button - STRICTLY LOCKED UNTIL PROCESS IS COMPLETED */}
              <div className="mt-4">
                <button
                  onClick={handleDownload}
                  disabled={!isProcessedReady || isProcessing || (!exportBlob && !exportBlobUrl)}
                  className={`w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                    !isProcessedReady || isProcessing || (!exportBlob && !exportBlobUrl)
                      ? 'bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md'
                  }`}
                >
                  {!isProcessedReady && !isProcessing ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Process & Lock Audio Buffer First to Unlock
                    </>
                  ) : isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Encoding WAV...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download Trimmed Audio (WAV)
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
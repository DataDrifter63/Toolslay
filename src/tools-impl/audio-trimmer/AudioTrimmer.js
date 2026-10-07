"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Music, Upload, Download, Sliders, Activity, 
  Zap, Scissors, Play, Square, 
  CheckCircle2, RefreshCw, Lock
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

    const maxVal = Math.max(...filteredData, 0.01);
    const normalizedData = filteredData.map(v => v / maxVal);

    const barWidth = width / samples;
    for (let i = 0; i < samples; i++) {
      const barHeight = Math.max(4, normalizedData[i] * (height - 10));
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      const timeAtBar = (i / samples) * duration;
      const isSelected = timeAtBar >= startTime && timeAtBar <= endTime;

      ctx.fillStyle = isSelected ? '#a855f7' : '#cbd5e1';
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    }

    const startX = (startTime / (duration || 1)) * width;
    const endX = (endTime / (duration || 1)) * width;

    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.fillRect(startX, 0, Math.max(0, endX - startX), height);

    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();

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

  // --- DSP PLAYBACK PREVIEW ---
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

    const trimmedBuffer = ctx.createBuffer(buffer.numberOfChannels, frameCount, buffer.sampleRate);
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const channelData = buffer.getChannelData(c);
      const segment = channelData.slice(startSample, startSample + frameCount);
      
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
    const format = 1;
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

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Audio DSP Trimmer Studio
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              Sample-Accurate PCM Cutter + Fade Curve & Gain Processor
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 items-start">
        
        {/* LEFT: TRIM & DSP CONFIG */}
        <div className="space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Upload Dropzone */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center justify-between border-b border-line pb-2">
                <span className="flex items-center gap-1.5"><Upload className="w-3.5 h-3.5 text-brand" /> Audio Source Asset</span>
                {audioFile && (
                  <span className="text-[9px] bg-surface text-muted px-2 py-0.5 rounded border border-line font-bold">
                    Duration: {formatSec(duration)}
                  </span>
                )}
              </label>
              
              <div 
                onClick={() => audioInputRef.current?.click()}
                className="border-2 border-dashed border-line hover:border-brand rounded-2xl p-6 text-center cursor-pointer transition-all bg-surface group"
              >
                <input 
                  type="file" 
                  ref={audioInputRef} 
                  onChange={handleFileUpload} 
                  accept="audio/*,video/mp4" 
                  className="hidden" 
                />
                <Music className="w-8 h-8 sm:w-10 sm:h-10 text-muted group-hover:text-brand mx-auto mb-2 transition-colors" />
                <span className="block text-xs font-black text-ink truncate px-4">
                  {fileName ? fileName : "Click or drop audio file (MP3, WAV, AAC)"}
                </span>
                <span className="block text-[10px] text-muted mt-1">
                  Client-side zero-server PCM buffer editing
                </span>
              </div>
            </div>

            {/* Trimmer Sliders */}
            {duration > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2">
                  <Scissors className="w-3.5 h-3.5 text-brand" /> Range Trimmer ({formatSec(startTime)} → {formatSec(endTime)})
                </h3>

                <div className="space-y-3 p-3.5 bg-surface rounded-xl border border-line">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-muted">
                      <span>Trim Start</span>
                      <span className="font-mono text-brand font-black">{formatSec(startTime)}</span>
                    </div>
                    <input 
                      type="range" min="0" max={duration} step="0.05"
                      value={startTime} onChange={(e) => handleStartChange(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-muted">
                      <span>Trim End</span>
                      <span className="font-mono text-brand font-black">{formatSec(endTime)}</span>
                    </div>
                    <input 
                      type="range" min="0" max={duration} step="0.05"
                      value={endTime} onChange={(e) => handleEndChange(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DSP Curves (Fade In/Out & Gain) */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Sliders className="w-3.5 h-3.5 text-brand" /> DSP Envelope & Gain Booster
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-surface rounded-xl border border-line">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-muted">
                    <span>Fade In</span>
                    <span className="font-mono text-brand font-black">{fadeInSec}s</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="0.05"
                    value={fadeInSec} onChange={(e) => { setFadeInSec(parseFloat(e.target.value)); setIsProcessedReady(false); }}
                    className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-muted">
                    <span>Fade Out</span>
                    <span className="font-mono text-brand font-black">{fadeOutSec}s</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="0.05"
                    value={fadeOutSec} onChange={(e) => { setFadeOutSec(parseFloat(e.target.value)); setIsProcessedReady(false); }}
                    className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-surface rounded-xl border border-line">
                <div className="flex justify-between items-center text-xs font-bold text-muted">
                  <span>Gain Boost / Cut</span>
                  <span className={`font-mono font-black ${gainDb > 0 ? 'text-emerald-500' : gainDb < 0 ? 'text-rose-500' : 'text-muted'}`}>{gainDb > 0 ? `+${gainDb}` : gainDb} dB</span>
                </div>
                <input 
                  type="range" min="-10" max="10" step="1"
                  value={gainDb} onChange={(e) => { setGainDb(parseInt(e.target.value)); setIsProcessedReady(false); }}
                  className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleProcessTrim}
              disabled={!audioFile || isProcessing}
              className="w-full py-3.5 bg-brand text-surface font-black uppercase text-xs tracking-wider rounded-xl shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" /> Rendering PCM Segment...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 shrink-0" /> Process & Lock Audio Buffer
                </>
              )}
            </button>

          </div>
        </div>

        {/* RIGHT: WAVEFORM VIEWPORT & EXPORT GUARD */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-sm relative flex flex-col">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Interactive Waveform Viewport
              </span>
              {isProcessedReady && (
                <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3"/> Locked & Ready
                </span>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
              <div className="flex flex-col items-center justify-center p-3 bg-paper border border-line rounded-xl shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted text-center">Selected Length</span>
                <span className="text-base font-black text-brand font-mono mt-1">{formatSec(Math.max(0, endTime - startTime))}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-paper border border-line rounded-xl shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted text-center">Output Footprint</span>
                <span className="text-base font-black text-ink font-mono mt-1">{exportBlob ? formatBytes(exportBlob.size) : 'Pending Process'}</span>
              </div>
            </div>

            {/* Preview Play/Stop Control */}
            <div className="flex items-center justify-between bg-paper p-3 rounded-xl border border-line mb-4 shrink-0">
              <span className="text-xs font-bold text-ink">Segment Audio Preview</span>
              <button
                type="button"
                onClick={handlePlayPreview}
                disabled={!audioFile}
                className="px-4 py-2 bg-ink text-surface rounded-lg text-[10px] font-black uppercase tracking-wider transition-transform hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                {isPlaying ? <><Square className="w-3.5 h-3.5 fill-current"/> Stop</> : <><Play className="w-3.5 h-3.5 fill-current"/> Play</>}
              </button>
            </div>

            {/* Waveform Canvas Viewport */}
            <div className="w-full h-48 bg-slate-900 dark:bg-slate-950 rounded-xl border border-line shadow-inner flex items-center justify-center overflow-hidden relative p-2 shrink-0">
              <canvas 
                ref={waveformCanvasRef} 
                width={600} 
                height={150} 
                className={`w-full h-full object-cover ${audioFile ? 'block' : 'hidden'}`}
              />
              {!audioFile && (
                <div className="flex flex-col items-center text-muted">
                  <Music className="w-10 h-10 mb-2 opacity-30" />
                  <span className="text-xs uppercase font-bold tracking-widest">Awaiting Audio Source</span>
                </div>
              )}
            </div>

            {/* Action Button - STRICTLY LOCKED UNTIL PROCESS IS COMPLETED */}
            <div className="mt-4 shrink-0">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!isProcessedReady || isProcessing || (!exportBlob && !exportBlobUrl)}
                className={`w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                  !isProcessedReady || isProcessing || (!exportBlob && !exportBlobUrl)
                    ? 'bg-paper text-muted cursor-not-allowed border border-line' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md'
                }`}
              >
                {!isProcessedReady && !isProcessing ? (
                  <>
                    <Lock className="w-3.5 h-3.5 shrink-0" /> Process & Lock Audio Buffer First to Unlock
                  </>
                ) : isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" /> Encoding WAV...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 shrink-0" /> Download Trimmed Audio (WAV)
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
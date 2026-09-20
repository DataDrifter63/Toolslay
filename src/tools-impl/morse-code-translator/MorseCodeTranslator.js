"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Type, Volume2, Square, Copy, CheckCircle2, 
  Settings2, Activity, Zap, Radio, FastForward, ActivitySquare
} from "lucide-react";

// Standard International Morse Code Dictionary
const MORSE_DICT = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.",
  "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
  "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
  "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
  "Y": "-.--", "Z": "--..", "0": "-----", "1": ".----", "2": "..---",
  "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.", ".": ".-.-.-", ",": "--..--", "?": "..--..",
  "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-",
  "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.",
  "-": "-....-", "_": "..--.-", "\"": ".-..-.", "$": "...-..-", "@": ".--.-."
};

const REVERSE_DICT = Object.fromEntries(Object.entries(MORSE_DICT).map(([k, v]) => [v, k]));

export default function MorseCodeTranslator() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [input, setInput] = useState("MUXAIR ENGINE");
  const [wpm, setWpm] = useState(15);
  const [frequency, setFrequency] = useState(600); // Hz
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Audio Refs
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      stopPlayback();
    };
  }, []);

  // --- CORE TRANSLATION ENGINE ---
  const results = useMemo(() => {
    if (!input.trim()) return { type: "empty", output: "", error: false };

    // Auto-detect Logic: If input consists only of ., -, /, and spaces, it's Morse
    const isMorseInput = /^[\.\-\s\/]+$/.test(input.trim());

    if (isMorseInput) {
      // Decode: Morse to Text
      const words = input.trim().split(/\s{2,}|\/|\s\/\s/); // Words separated by 2+ spaces or /
      const decodedText = words.map(word => {
        return word.split(' ').map(char => REVERSE_DICT[char] || '#').join('');
      }).join(' ');

      return { type: "morse", output: decodedText, rawMorse: input.trim(), error: false };
    } else {
      // Encode: Text to Morse
      const encodedMorse = input.toUpperCase().split(' ').map(word => {
        return word.split('').map(char => MORSE_DICT[char] || '').filter(Boolean).join(' ');
      }).join(' / ');

      return { type: "text", output: encodedMorse, rawMorse: encodedMorse, error: false };
    }
  }, [input]);

  // --- WEB AUDIO API SYNTHESIZER ---
  const playMorse = async () => {
    if (isPlaying || !results.rawMorse) return;
    
    stopPlayback(); // Clean up any existing audio context
    setIsPlaying(true);

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AudioContext();
    
    // Math for standard Morse timing
    const dotDuration = 1200 / wpm; // in ms
    const dashDuration = dotDuration * 3;
    const interElementSpace = dotDuration;
    const interLetterSpace = dotDuration * 3;
    const interWordSpace = dotDuration * 7;

    const morseChars = results.rawMorse.replace(/\s+/g, ' ').split('');
    let currentTime = audioCtxRef.current.currentTime;

    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    
    // Start with volume 0
    gainNode.gain.setValueAtTime(0, currentTime);
    oscillator.start(currentTime);
    oscillatorRef.current = oscillator;

    let totalDurationMs = 0;

    for (let i = 0; i < morseChars.length; i++) {
      const char = morseChars[i];
      let beepLength = 0;
      let pauseLength = 0;

      if (char === '.') {
        beepLength = dotDuration / 1000;
        pauseLength = interElementSpace / 1000;
      } else if (char === '-') {
        beepLength = dashDuration / 1000;
        pauseLength = interElementSpace / 1000;
      } else if (char === ' ') {
        pauseLength = (interLetterSpace - interElementSpace) / 1000;
      } else if (char === '/') {
        pauseLength = (interWordSpace - interElementSpace) / 1000;
      }

      if (beepLength > 0) {
        // Smooth attack and release to prevent audio clicking
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(1, currentTime + 0.01);
        gainNode.gain.setValueAtTime(1, currentTime + beepLength - 0.01);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + beepLength);
      }
      
      currentTime += beepLength + pauseLength;
      totalDurationMs += (beepLength + pauseLength) * 1000;
    }

    // Stop and cleanup when finished
    const finishTimeout = setTimeout(() => {
      stopPlayback();
    }, totalDurationMs);
    
    timeoutsRef.current.push(finishTimeout);
  };

  const stopPlayback = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsPlaying(false);
  };

  const handleCopy = () => {
    if (!results.output) return;
    navigator.clipboard.writeText(results.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  // Premium Emerald/Slate Theme
  const theme = {
    gradient: "from-emerald-200 via-teal-100 to-transparent dark:from-emerald-900/30 dark:via-teal-900/20",
    bgIcon: "bg-gradient-to-br from-emerald-500 to-teal-600",
    textPri: "text-emerald-600 dark:text-emerald-400",
    textSec: "text-teal-600 dark:text-teal-400",
    borderLight: "border-emerald-200 dark:border-emerald-800/50",
    bgLight: "bg-emerald-50 dark:bg-emerald-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Morse Audio Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Bi-directional Translator & Synthesizer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: INPUT & SETTINGS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. Input Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Type className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Input Signal
                </h3>
                
                {/* Auto-Detect Badge */}
                {results.type !== "empty" && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm flex items-center gap-1 border ${
                    results.type === "text" 
                      ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50"
                  }`}>
                    <Zap className="w-3 h-3"/> Auto: {results.type === "text" ? "Text to Morse" : "Morse to Text"}
                  </span>
                )}
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all overflow-hidden shadow-inner`}>
                <textarea
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type English text or Morse code (using . and -)..."
                  rows="7"
                  className="w-full bg-transparent px-5 py-5 text-sm font-mono text-slate-800 dark:text-slate-100 outline-none resize-none custom-scrollbar uppercase"
                  spellCheck="false"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Audio Settings */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Audio Calibration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                {/* WPM Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><FastForward className="w-3.5 h-3.5"/> Speed (WPM)</label>
                    <span className="text-xs font-black tabular-nums text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900">{wpm}</span>
                  </div>
                  <input type="range" min="5" max="40" value={wpm} onChange={(e) => setWpm(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>

                {/* Frequency Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><ActivitySquare className="w-3.5 h-3.5"/> Pitch (Hz)</label>
                    <span className="text-xs font-black tabular-nums text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-teal-100 dark:border-teal-900">{frequency}Hz</span>
                  </div>
                  <input type="range" min="300" max="1000" step="50" value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: OUTPUT & PLAYBACK ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col h-[600px] font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Translation Output
                </span>
                
                <button 
                  onClick={handleCopy} 
                  disabled={!results.output}
                  className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    copied ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Output</>}
                </button>
              </div>

              {/* Playback Controls & Visualizer */}
              <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-4 mb-4 shrink-0 shadow-sm ${isPlaying ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" : "bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-800"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isPlaying ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : "text-slate-500"}`}>
                    <Radio className="w-4 h-4" /> 
                    {isPlaying ? "Transmitting Audio..." : "Ready for Transmission"}
                  </span>
                  
                  {isPlaying ? (
                    <button onClick={stopPlayback} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 shadow-sm">
                      <Square className="w-3.5 h-3.5 fill-current" /> Stop
                    </button>
                  ) : (
                    <button onClick={playMorse} disabled={!results.rawMorse} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:hover:scale-100">
                      <Volume2 className="w-3.5 h-3.5" /> Play Audio
                    </button>
                  )}
                </div>

                {/* Animated Audio Waveform (CSS only) */}
                <div className="h-8 flex items-center gap-1 overflow-hidden opacity-80">
                  {[...Array(30)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all duration-100 ${isPlaying ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`}
                      style={{ 
                        height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                        transitionDelay: `${i * 10}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* The Actual Output Area */}
              <div className="flex-1 bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden flex flex-col group">
                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                  {results.type === "empty" ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                      <Activity className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center">
                        Awaiting Signal
                      </span>
                    </div>
                  ) : (
                    <div className={`text-lg font-bold break-words leading-relaxed text-slate-800 dark:text-slate-200 ${results.type === 'text' ? 'font-mono text-2xl tracking-[0.2em]' : 'font-sans uppercase'}`}>
                      {results.output}
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
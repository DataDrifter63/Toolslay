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

    const isMorseInput = /^[\.\-\s\/]+$/.test(input.trim());

    if (isMorseInput) {
      const words = input.trim().split(/\s{2,}|\/|\s\/\s/);
      const decodedText = words.map(word => {
        return word.split(' ').map(char => REVERSE_DICT[char] || '#').join('');
      }).join(' ');

      return { type: "morse", output: decodedText, rawMorse: input.trim(), error: false };
    } else {
      const encodedMorse = input.toUpperCase().split(' ').map(word => {
        return word.split('').map(char => MORSE_DICT[char] || '').filter(Boolean).join(' ');
      }).join(' / ');

      return { type: "text", output: encodedMorse, rawMorse: encodedMorse, error: false };
    }
  }, [input]);

  // --- WEB AUDIO API SYNTHESIZER ---
  const playMorse = async () => {
    if (isPlaying || !results.rawMorse) return;
    
    stopPlayback();
    setIsPlaying(true);

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AudioContext();
    
    const dotDuration = 1200 / wpm;
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
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(1, currentTime + 0.01);
        gainNode.gain.setValueAtTime(1, currentTime + beepLength - 0.01);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + beepLength);
      }
      
      currentTime += beepLength + pauseLength;
      totalDurationMs += (beepLength + pauseLength) * 1000;
    }

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

  const theme = {
    gradient: "from-emerald-200 via-teal-100 to-transparent dark:from-emerald-900/30 dark:via-teal-900/20",
    textPri: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-mono box-border overflow-x-hidden">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-row items-center justify-between gap-4 w-full box-border relative overflow-hidden font-sans">
        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Morse Audio Engine
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              Bi-directional Translator & Synthesizer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT & SETTINGS ================= */}
        <div className="space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 font-sans">
            
            {/* 1. Input Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Type className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Input Signal
                </h3>
                
                {results.type !== "empty" && (
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 border ${
                    results.type === "text" 
                      ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  }`}>
                    <Zap className="w-3 h-3"/> Auto: {results.type === "text" ? "Text to Morse" : "Morse to Text"}
                  </span>
                )}
              </div>
              
              <div className="relative flex flex-col bg-surface border border-line rounded-xl focus-within:border-brand overflow-hidden shadow-inner">
                <textarea
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type English text or Morse code (using . and -)..."
                  rows="5"
                  className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm font-mono text-ink outline-none resize-none custom-scrollbar uppercase"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* 2. Audio Settings */}
            <div className="space-y-3 pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Audio Calibration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl border border-line bg-surface">
                {/* WPM Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5"><FastForward className="w-3.5 h-3.5"/> Speed (WPM)</label>
                    <span className="text-xs font-black tabular-nums text-emerald-500 bg-paper px-2 py-0.5 rounded border border-line font-mono">{wpm}</span>
                  </div>
                  <input type="range" min="5" max="40" value={wpm} onChange={(e) => setWpm(parseInt(e.target.value))} className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-line" />
                </div>

                {/* Frequency Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5"><ActivitySquare className="w-3.5 h-3.5"/> Pitch (Hz)</label>
                    <span className="text-xs font-black tabular-nums text-teal-500 bg-paper px-2 py-0.5 rounded border border-line font-mono">{frequency}Hz</span>
                  </div>
                  <input type="range" min="300" max="1000" step="50" value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value))} className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-teal-500 border border-line" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: OUTPUT & PLAYBACK ================= */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-sm relative flex flex-col min-h-[500px] font-sans">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className={`w-4 h-4 ${theme.textPri}`} /> Translation Output
              </span>
              
              <button 
                type="button"
                onClick={handleCopy} 
                disabled={!results.output}
                className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  copied ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-paper text-muted border-line hover:border-brand disabled:opacity-50"
                }`}
              >
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Output</>}
              </button>
            </div>

            {/* Playback Controls & Visualizer */}
            <div className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-3 mb-4 shrink-0 shadow-sm ${isPlaying ? "bg-emerald-500/10 border-emerald-500/20" : "bg-paper border-line"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 truncate ${isPlaying ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : "text-muted"}`}>
                  <Radio className="w-4 h-4 shrink-0" /> 
                  <span className="truncate">{isPlaying ? "Transmitting Audio..." : "Ready for Transmission"}</span>
                </span>
                
                {isPlaying ? (
                  <button type="button" onClick={stopPlayback} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer">
                    <Square className="w-3.5 h-3.5 fill-current" /> Stop
                  </button>
                ) : (
                  <button type="button" onClick={playMorse} disabled={!results.rawMorse} className="px-3 py-2 bg-brand text-surface hover:opacity-90 rounded-lg text-[10px] font-black uppercase tracking-wider transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0 cursor-pointer">
                    <Volume2 className="w-3.5 h-3.5" /> Play Audio
                  </button>
                )}
              </div>

              {/* Animated Audio Waveform */}
              <div className="h-6 flex items-center gap-1 overflow-hidden opacity-80 px-1">
                {[...Array(25)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all duration-100 ${isPlaying ? "bg-emerald-500" : "bg-paper border border-line"}`}
                    style={{ 
                      height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '15%',
                      transitionDelay: `${i * 10}ms`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* The Actual Output Area */}
            <div className="flex-1 bg-paper rounded-xl border border-line shadow-inner overflow-hidden flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar max-h-[260px]">
                {results.type === "empty" ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted font-sans py-8">
                    <Activity className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-xs font-bold uppercase tracking-widest text-center">
                      Awaiting Signal
                    </span>
                  </div>
                ) : (
                  <div className={`text-base font-bold break-words leading-relaxed text-ink ${results.type === 'text' ? 'font-mono text-lg tracking-[0.15em]' : 'font-sans uppercase'}`}>
                    {results.output}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
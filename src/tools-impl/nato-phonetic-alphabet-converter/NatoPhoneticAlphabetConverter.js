"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Mic, Volume2, Square, Copy, CheckCircle2, 
  Settings2, Activity, Zap, Shield, Type,
  Headphones, ListOrdered
} from "lucide-react";

// Official ICAO / NATO Phonetic Alphabet
const NATO_DICT = {
  'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo',
  'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliett',
  'K': 'Kilo', 'L': 'Lima', 'M': 'Mike', 'N': 'November', 'O': 'Oscar',
  'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
  'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray', 'Y': 'Yankee',
  'Z': 'Zulu', '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three',
  '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
};

export default function NatoPhoneticAlphabetConverter() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [input, setInput] = useState("MUXAIR 2026");
  const [speed, setSpeed] = useState(1); // Speech rate (0.5 to 2)
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      // Cleanup speech synthesis on unmount
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --- CORE TRANSLATION ENGINE ---
  const results = useMemo(() => {
    if (!input.trim()) return { tokens: [], text: "", error: false };

    const tokens = [];
    let translatedText = [];

    // Parse string character by character
    const chars = input.toUpperCase().split('');
    
    chars.forEach((char) => {
      if (NATO_DICT[char]) {
        tokens.push({ char, word: NATO_DICT[char] });
        translatedText.push(NATO_DICT[char]);
      } else if (char === ' ' || char === '\n') {
        // Preserve spaces as empty visual separators
        tokens.push({ char: 'SPACE', word: '' });
        translatedText.push(' ');
      }
      // Ignore punctuation and special symbols automatically
    });

    // Clean up extra spaces in the final text output
    const finalText = translatedText.join(' ').replace(/\s+/g, ' ').trim();

    return { tokens, text: finalText, error: false };
  }, [input]);

  // --- WEB SPEECH API INTEGRATION ---
  const handlePlayAudio = () => {
    if (!window.speechSynthesis) return alert("Your browser does not support Speech Synthesis.");
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (results.tokens.length === 0) return;

    // Build pronounceable string (add small pauses between words)
    const pronounceableText = results.tokens
      .filter(t => t.char !== 'SPACE')
      .map(t => t.word)
      .join(', ');

    const utterance = new SpeechSynthesisUtterance(pronounceableText);
    utterance.rate = speed;
    utterance.pitch = 1;
    
    // Attempt to pick a clear English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleCopy = () => {
    if (!results.text) return;
    navigator.clipboard.writeText(results.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  // Premium Sky & Slate Theme (Aviation Vibe)
  const theme = {
    gradient: "from-sky-200 via-indigo-100 to-transparent dark:from-sky-900/30 dark:via-indigo-900/20",
    bgIcon: "bg-gradient-to-br from-sky-500 to-indigo-600",
    textPri: "text-sky-600 dark:text-sky-400",
    textSec: "text-indigo-600 dark:text-indigo-400",
    borderLight: "border-sky-200 dark:border-sky-800/50",
    bgLight: "bg-sky-50 dark:bg-sky-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Aviation Phonetic Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              NATO Standard Translator & Radio Voice Synthesizer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.3fr] gap-6 items-start">
        
        {/* ================= LEFT: INPUT & SETTINGS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. Input Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Type className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Text to Translate
                </h3>
                <span className="text-[9px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Shield className="w-3 h-3"/> Auto-Filter ON
                </span>
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10 transition-all overflow-hidden shadow-inner`}>
                <textarea
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type anything (e.g., your flight number or name)..."
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
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Radio Voice Settings
              </h3>
              
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5"/> Playback Speed</label>
                    <span className="text-xs font-black tabular-nums text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-sky-100 dark:border-sky-900">{speed}x</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="2" step="0.1" 
                    value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} 
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500" 
                  />
                  <div className="flex justify-between text-[8px] font-bold uppercase text-slate-400 mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: VISUALIZER & PLAYBACK ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[640px] font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <ListOrdered className={`w-4 h-4 ${theme.textPri}`} /> NATO Tokens Visualizer
                </span>
                
                <button 
                  onClick={handleCopy} 
                  disabled={!results.text}
                  className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    copied ? "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Text</>}
                </button>
              </div>

              {/* Playback Controls & Radio Waveform */}
              <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-4 mb-4 shrink-0 shadow-sm ${isPlaying ? "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800" : "bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-800"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isPlaying ? "text-sky-600 dark:text-sky-400 animate-pulse" : "text-slate-500"}`}>
                    <Activity className="w-4 h-4" /> 
                    {isPlaying ? "Transmitting Radio Signal..." : "Radio Comms Standby"}
                  </span>
                  
                  {isPlaying ? (
                    <button onClick={handleStopAudio} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 shadow-sm">
                      <Square className="w-3.5 h-3.5 fill-current" /> Stop Audio
                    </button>
                  ) : (
                    <button onClick={handlePlayAudio} disabled={results.tokens.length === 0} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:hover:scale-100">
                      <Volume2 className="w-3.5 h-3.5" /> Transmit Audio
                    </button>
                  )}
                </div>

                {/* Animated CSS Waveform representing speech */}
                <div className="h-8 flex items-center gap-1 overflow-hidden opacity-80">
                  {[...Array(35)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all duration-75 ${isPlaying ? "bg-sky-500 dark:bg-sky-400" : "bg-slate-200 dark:bg-slate-700"}`}
                      style={{ 
                        height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                        transitionDelay: `${i * 15}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* The Actual Visualizer Area */}
              <div className="flex-1 bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden flex flex-col group">
                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                  {results.tokens.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                      <Zap className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center">
                        Awaiting Alphanumeric Input
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 content-start">
                      {results.tokens.map((token, index) => {
                        if (token.char === 'SPACE') {
                          return <div key={index} className="w-4 h-4 shrink-0"></div>; // Visual spacing for word separation
                        }
                        return (
                          <div key={index} className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm shrink-0 min-w-[64px]">
                            <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 text-center py-1 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-sm font-black text-slate-800 dark:text-slate-100">{token.char}</span>
                            </div>
                            <div className="px-3 py-1.5 text-center bg-white dark:bg-[#0d1117]">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">{token.word}</span>
                            </div>
                          </div>
                        );
                      })}
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
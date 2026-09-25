"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
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

    const chars = input.toUpperCase().split('');
    
    chars.forEach((char) => {
      if (NATO_DICT[char]) {
        tokens.push({ char, word: NATO_DICT[char] });
        translatedText.push(NATO_DICT[char]);
      } else if (char === ' ' || char === '\n') {
        tokens.push({ char: 'SPACE', word: '' });
        translatedText.push(' ');
      }
    });

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

    const pronounceableText = results.tokens
      .filter(t => t.char !== 'SPACE')
      .map(t => t.word)
      .join(', ');

    const utterance = new SpeechSynthesisUtterance(pronounceableText);
    utterance.rate = speed;
    utterance.pitch = 1;
    
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

  const theme = {
    gradient: "from-sky-200 via-indigo-100 to-transparent dark:from-sky-900/30 dark:via-indigo-900/20",
    textPri: "text-sky-600 dark:text-sky-400",
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-mono box-border overflow-x-hidden">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-row items-center justify-between gap-4 w-full box-border relative overflow-hidden font-sans">
        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Aviation Phonetic Engine
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              NATO Standard Translator & Radio Voice Synthesizer
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
                  <Type className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Text to Translate
                </h3>
                <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                  <Shield className="w-3 h-3"/> Auto-Filter ON
                </span>
              </div>
              
              <div className="relative flex flex-col bg-surface border border-line rounded-xl focus-within:border-brand overflow-hidden shadow-inner">
                <textarea
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type anything (e.g., your flight number or name)..."
                  rows="5"
                  className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm font-mono text-ink outline-none resize-none custom-scrollbar uppercase"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* 2. Audio Settings */}
            <div className="space-y-3 pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Radio Voice Settings
              </h3>
              
              <div className="p-3.5 rounded-xl border border-line bg-surface">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5"/> Playback Speed</label>
                    <span className="text-xs font-black tabular-nums text-sky-500 bg-paper px-2 py-0.5 rounded border border-line font-mono">{speed}x</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="2" step="0.1" 
                    value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} 
                    className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-sky-500 border border-line" 
                  />
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-muted mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: VISUALIZER & PLAYBACK ================= */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-sm relative flex flex-col min-h-[500px] font-sans">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <ListOrdered className={`w-4 h-4 ${theme.textPri}`} /> NATO Tokens Visualizer
              </span>
              
              <button 
                type="button"
                onClick={handleCopy} 
                disabled={!results.text}
                className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  copied ? "bg-sky-500/10 text-sky-600 border-sky-500/20" : "bg-paper text-muted border-line hover:border-brand disabled:opacity-50"
                }`}
              >
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Text</>}
              </button>
            </div>

            {/* Playback Controls & Radio Waveform */}
            <div className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-3 mb-4 shrink-0 shadow-sm ${isPlaying ? "bg-sky-500/10 border-sky-500/20" : "bg-paper border-line"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 truncate ${isPlaying ? "text-sky-600 dark:text-sky-400 animate-pulse" : "text-muted"}`}>
                  <Activity className="w-4 h-4 shrink-0" /> 
                  <span className="truncate">{isPlaying ? "Transmitting Signal..." : "Radio Comms Standby"}</span>
                </span>
                
                {isPlaying ? (
                  <button type="button" onClick={handleStopAudio} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer">
                    <Square className="w-3.5 h-3.5 fill-current" /> Stop
                  </button>
                ) : (
                  <button type="button" onClick={handlePlayAudio} disabled={results.tokens.length === 0} className="px-3 py-2 bg-brand text-surface hover:opacity-90 rounded-lg text-[10px] font-black uppercase tracking-wider transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0 cursor-pointer">
                    <Volume2 className="w-3.5 h-3.5" /> Transmit
                  </button>
                )}
              </div>

              {/* Animated CSS Waveform representing speech */}
              <div className="h-6 flex items-center gap-1 overflow-hidden opacity-80 px-1">
                {[...Array(25)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all duration-75 ${isPlaying ? "bg-sky-500" : "bg-paper border border-line"}`}
                    style={{ 
                      height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '15%',
                      transitionDelay: `${i * 15}ms`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* The Actual Visualizer Area */}
            <div className="flex-1 bg-paper rounded-xl border border-line shadow-inner overflow-hidden flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar max-h-[260px]">
                {results.tokens.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted font-sans py-8">
                    <Zap className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-xs font-bold uppercase tracking-widest text-center">
                      Awaiting Alphanumeric Input
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 content-start">
                    {results.tokens.map((token, index) => {
                      if (token.char === 'SPACE') {
                        return <div key={index} className="w-3 h-3 shrink-0"></div>;
                      }
                      return (
                        <div key={index} className="flex flex-col items-center bg-surface border border-line rounded-lg overflow-hidden shadow-sm shrink-0 min-w-[56px]">
                          <div className="w-full bg-paper text-center py-0.5 border-b border-line">
                            <span className="text-xs font-black text-ink font-mono">{token.char}</span>
                          </div>
                          <div className="px-2 py-1 text-center bg-surface">
                            <span className="text-[9px] font-black uppercase tracking-wider text-sky-500">{token.word}</span>
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
  );
}
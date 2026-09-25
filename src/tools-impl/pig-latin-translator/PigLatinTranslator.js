"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Languages, Type, Volume2, Square, Copy, 
  CheckCircle2, Eraser, Settings2, Activity,
  Zap, FileText, BarChart3
} from "lucide-react";

export default function PigLatinTranslator() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [input, setInput] = useState("Hello, World! Welcome to the Muxair Enterprise Pig Latin Engine.");
  const [vowelSuffix, setVowelSuffix] = useState("yay"); // 'yay', 'way', 'ay'
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

  // --- CORE LINGUISTICS ENGINE ---
  const results = useMemo(() => {
    if (!input.trim()) return { text: "", englishCount: 0, pigCount: 0, bloat: 0 };

    const toPigLatin = (word) => {
      const isUpperCase = word === word.toUpperCase() && word.length > 1;
      const isTitleCase = word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 1 && word.substring(1) === word.substring(1).toLowerCase();
      
      const lowerWord = word.toLowerCase();
      let pigWord = '';

      if (/^[aeiou]/i.test(lowerWord)) {
        pigWord = lowerWord + vowelSuffix;
      } else {
        const match = lowerWord.match(/^([^aeiou]+)(.*)/);
        if (match) {
          if (match[1].endsWith('q') && match[2].startsWith('u')) {
             pigWord = match[2].substring(1) + match[1] + 'uay';
          } else {
             pigWord = match[2] + match[1] + 'ay';
          }
        } else {
          pigWord = lowerWord;
        }
      }

      if (isUpperCase) return pigWord.toUpperCase();
      if (isTitleCase) return pigWord.charAt(0).toUpperCase() + pigWord.slice(1);
      if (word === word.toUpperCase() && word.length === 1) return pigWord.charAt(0).toUpperCase() + pigWord.slice(1);

      return pigWord;
    };

    const translatedText = input.replace(/[a-zA-Z]+/g, (match) => toPigLatin(match));

    const englishCount = input.length;
    const pigCount = translatedText.length;
    const bloat = englishCount > 0 ? ((pigCount - englishCount) / englishCount) * 100 : 0;

    return { 
      text: translatedText, 
      englishCount, 
      pigCount, 
      bloat: bloat.toFixed(1) 
    };
  }, [input, vowelSuffix]);

  // --- WEB SPEECH API INTEGRATION ---
  const handlePlayAudio = () => {
    if (!window.speechSynthesis) return alert("Your browser does not support Speech Synthesis.");
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!results.text) return;

    const utterance = new SpeechSynthesisUtterance(results.text);
    utterance.rate = 0.9;
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
    gradient: "from-amber-200 via-orange-100 to-transparent dark:from-amber-900/30 dark:via-orange-900/20",
    bgIcon: "bg-gradient-to-br from-amber-500 to-orange-600",
    textPri: "text-amber-600 dark:text-amber-400",
    textSec: "text-orange-600 dark:text-orange-400",
    borderLight: "border-amber-200 dark:border-amber-800/50",
    bgLight: "bg-amber-50 dark:bg-amber-900/20"
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-mono box-border overflow-x-hidden">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-row items-center justify-between gap-4 w-full box-border relative overflow-hidden font-sans">
        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className={`${theme.bgIcon} p-2.5 sm:p-3.5 rounded-xl shadow-md shrink-0`}>
            <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Linguistics Translator
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              Enterprise Pig Latin Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: INPUT & DIALECT SETTINGS ================= */}
        <div className="space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 font-sans">
            
            {/* 1. English Input Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Type className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. English Source Text
                </h3>
                <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                  <Zap className="w-3 h-3"/> Auto-Formatting
                </span>
              </div>
              
              <div className="relative flex flex-col bg-surface border border-line rounded-xl focus-within:border-brand overflow-hidden shadow-inner">
                <div className="flex justify-end items-center px-3 py-2 bg-paper border-b border-line">
                  <button type="button" onClick={() => setInput('')} className="text-[10px] font-black uppercase tracking-wider text-muted hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer">
                    <Eraser className="w-3 h-3" /> Clear Base
                  </button>
                </div>
                <textarea
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type or paste standard English text here..."
                  rows="6"
                  className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm font-sans text-ink outline-none resize-none custom-scrollbar leading-relaxed"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* 2. Dialect Engine */}
            <div className="space-y-3 pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Pig Latin Dialect Setup
              </h3>
              
              <div className="flex flex-col p-3.5 rounded-xl border border-line bg-surface">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted mb-2.5">Vowel Suffix (A, E, I, O, U)</label>
                <div className="flex bg-paper rounded-lg p-1 border border-line">
                  {['yay', 'way', 'ay'].map((suffix) => (
                    <button 
                      type="button"
                      key={suffix} 
                      onClick={() => setVowelSuffix(suffix)}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${vowelSuffix === suffix ? "bg-surface text-amber-600 dark:text-amber-400 shadow-sm border border-line" : "text-muted hover:text-ink"}`}
                    >
                      ...{suffix}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-muted mt-2 italic">Example for "Apple": Appl{vowelSuffix}</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: TRANSLATION & PLAYBACK ================= */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-sm relative flex flex-col min-h-[500px] font-sans">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className={`w-4 h-4 ${theme.textPri}`} /> Compiled Pig Latin
              </span>
              
              <button 
                type="button"
                onClick={handleCopy} 
                disabled={!results.text}
                className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  copied ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-paper text-muted border-line hover:border-brand disabled:opacity-50"
                }`}
              >
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Text</>}
              </button>
            </div>

            {/* Data Analytics Dashboard */}
            <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
              <div className="flex flex-col items-center justify-center p-2.5 bg-paper border border-line rounded-xl shadow-sm">
                <FileText className="w-4 h-4 text-muted mb-1" />
                <span className="text-xs sm:text-sm font-black text-ink leading-none font-mono">{results.englishCount}</span>
                <span className="text-[8px] font-black uppercase tracking-wider text-muted mt-1">Chars (Base)</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 bg-paper border border-line rounded-xl shadow-sm">
                <Languages className="w-4 h-4 text-amber-500 mb-1" />
                <span className="text-xs sm:text-sm font-black text-ink leading-none font-mono">{results.pigCount}</span>
                <span className="text-[8px] font-black uppercase tracking-wider text-muted mt-1">Chars (Pig)</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 bg-paper border border-line rounded-xl shadow-sm">
                <BarChart3 className={`w-4 h-4 mb-1 ${results.bloat > 0 ? 'text-rose-500' : 'text-muted'}`} />
                <span className="text-xs sm:text-sm font-black text-ink leading-none font-mono">+{results.bloat}%</span>
                <span className="text-[8px] font-black uppercase tracking-wider text-muted mt-1">Text Bloat</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-3 mb-4 shrink-0 shadow-sm ${isPlaying ? "bg-amber-500/10 border-amber-500/20" : "bg-paper border-line"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 truncate ${isPlaying ? "text-amber-600 dark:text-amber-400 animate-pulse" : "text-muted"}`}>
                  <Volume2 className="w-4 h-4 shrink-0" /> 
                  <span className="truncate">{isPlaying ? "AI Speaking Engine Active..." : "Read Aloud Ready"}</span>
                </span>
                
                {isPlaying ? (
                  <button type="button" onClick={handleStopAudio} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer">
                    <Square className="w-3.5 h-3.5 fill-current" /> Stop
                  </button>
                ) : (
                  <button type="button" onClick={handlePlayAudio} disabled={!results.text} className="px-3 py-2 bg-brand text-surface hover:opacity-90 rounded-lg text-[10px] font-black uppercase tracking-wider transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0 cursor-pointer">
                    <Volume2 className="w-3.5 h-3.5" /> Play
                  </button>
                )}
              </div>
            </div>

            {/* The Actual Output Area */}
            <div className="flex-1 bg-paper rounded-xl border border-line shadow-inner overflow-hidden flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar max-h-[260px]">
                {!results.text ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted font-sans py-8">
                    <Languages className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-xs font-bold uppercase tracking-wider text-center">
                      Awaiting English Source
                    </span>
                  </div>
                ) : (
                  <div className="text-sm font-sans leading-relaxed break-words text-ink">
                    {results.text}
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
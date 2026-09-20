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
      // Remember case formatting
      const isUpperCase = word === word.toUpperCase() && word.length > 1;
      const isTitleCase = word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 1 && word.substring(1) === word.substring(1).toLowerCase();
      
      const lowerWord = word.toLowerCase();
      let pigWord = '';

      // Vowel Rule: Starts with a, e, i, o, u
      if (/^[aeiou]/i.test(lowerWord)) {
        pigWord = lowerWord + vowelSuffix;
      } else {
        // Consonant Rule: Move starting consonants to end, add 'ay'
        // Treat 'y' as a consonant at the start, but vowel otherwise
        const match = lowerWord.match(/^([^aeiou]+)(.*)/);
        if (match) {
          // If the word starts with 'qu', move 'qu' together
          if (match[1].endsWith('q') && match[2].startsWith('u')) {
             pigWord = match[2].substring(1) + match[1] + 'uay';
          } else {
             pigWord = match[2] + match[1] + 'ay';
          }
        } else {
          pigWord = lowerWord; // Fallback
        }
      }

      // Restore case formatting
      if (isUpperCase) return pigWord.toUpperCase();
      if (isTitleCase) return pigWord.charAt(0).toUpperCase() + pigWord.slice(1);
      
      // If it was just a single capital letter (e.g., 'I', 'A')
      if (word === word.toUpperCase() && word.length === 1) return pigWord.charAt(0).toUpperCase() + pigWord.slice(1);

      return pigWord;
    };

    // Smart Regex to parse ONLY letters and preserve punctuation/spaces
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
    utterance.rate = 0.9; // Slightly slower for Pig Latin comprehension
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

  // Premium Amber & Orange Theme
  const theme = {
    gradient: "from-amber-200 via-orange-100 to-transparent dark:from-amber-900/30 dark:via-orange-900/20",
    bgIcon: "bg-gradient-to-br from-amber-500 to-orange-600",
    textPri: "text-amber-600 dark:text-amber-400",
    textSec: "text-orange-600 dark:text-orange-400",
    borderLight: "border-amber-200 dark:border-amber-800/50",
    bgLight: "bg-amber-50 dark:bg-amber-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Languages className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Linguistics Translator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Enterprise Pig Latin Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: INPUT & DIALECT SETTINGS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. English Input Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Type className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. English Source Text
                </h3>
                <span className="text-[9px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Zap className="w-3 h-3"/> Auto-Formatting
                </span>
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all overflow-hidden shadow-inner`}>
                <div className="flex justify-end items-center px-4 py-2 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-700/50">
                  <button onClick={() => setInput('')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1">
                    <Eraser className="w-3 h-3" /> Clear Base
                  </button>
                </div>
                <textarea
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type or paste standard English text here..."
                  rows="7"
                  className="w-full bg-transparent px-5 py-5 text-sm font-sans text-slate-800 dark:text-slate-100 outline-none resize-none custom-scrollbar leading-relaxed"
                  spellCheck="false"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Dialect Engine */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Pig Latin Dialect Setup
              </h3>
              
              <div className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Vowel Suffix (Words starting with A, E, I, O, U)</label>
                <div className="flex bg-slate-200 dark:bg-[#0d1117] rounded-lg p-1 border border-slate-300 dark:border-slate-700">
                  {['yay', 'way', 'ay'].map((suffix) => (
                    <button 
                      key={suffix} 
                      onClick={() => setVowelSuffix(suffix)}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-md transition-all ${vowelSuffix === suffix ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      ...{suffix}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-2 italic">Example for "Apple": Appl{vowelSuffix}</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: TRANSLATION & PLAYBACK ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[640px] font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Compiled Pig Latin
                </span>
                
                <button 
                  onClick={handleCopy} 
                  disabled={!results.text}
                  className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    copied ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Text</>}
                </button>
              </div>

              {/* Data Analytics Dashboard */}
              <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <FileText className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{results.englishCount}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Chars (Base)</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <Languages className="w-4 h-4 text-amber-500 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{results.pigCount}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Chars (Pig)</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <BarChart3 className={`w-4 h-4 mb-1 ${results.bloat > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">+{results.bloat}%</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Text Bloat</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-4 mb-4 shrink-0 shadow-sm ${isPlaying ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : "bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-800"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isPlaying ? "text-amber-600 dark:text-amber-400 animate-pulse" : "text-slate-500"}`}>
                    <Volume2 className="w-4 h-4" /> 
                    {isPlaying ? "AI Speaking Engine Active..." : "Read Aloud Ready"}
                  </span>
                  
                  {isPlaying ? (
                    <button onClick={handleStopAudio} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 shadow-sm">
                      <Square className="w-3.5 h-3.5 fill-current" /> Stop Audio
                    </button>
                  ) : (
                    <button onClick={handlePlayAudio} disabled={!results.text} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:hover:scale-100">
                      <Volume2 className="w-3.5 h-3.5" /> Play Pronunciation
                    </button>
                  )}
                </div>
              </div>

              {/* The Actual Output Area */}
              <div className="flex-1 bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden flex flex-col group">
                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                  {!results.text ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                      <Languages className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center">
                        Awaiting English Source
                      </span>
                    </div>
                  ) : (
                    <div className="text-base font-sans leading-relaxed break-words text-slate-800 dark:text-slate-200">
                      {results.text}
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
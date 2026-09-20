"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen, Clock, Mic, AlignLeft, Type,
  BarChart2, Settings, Zap, Trash2, Info
} from "lucide-react";

const READING_PRESETS = [
  { label: "Slow", wpm: 150 },
  { label: "Average", wpm: 238 }, // Adult average silent reading
  { label: "Fast", wpm: 300 },
  { label: "Speed Reader", wpm: 450 }
];

const SPEAKING_PRESETS = [
  { label: "Slow/Audiobook", wpm: 110 },
  { label: "Conversational", wpm: 130 }, // Normal presentation speed
  { label: "Fast Speaker", wpm: 160 }
];

export default function ReadingTimeCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [text, setText] = useState("");
  const [readingWpm, setReadingWpm] = useState(238);
  const [speakingWpm, setSpeakingWpm] = useState(130);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scientific Text Metrics & Time Calculator
  const metrics = useMemo(() => {
    const rawText = text.trim();
    if (!rawText) {
      return {
        words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, syllables: 0,
        readTime: 0, speakTime: 0, readability: "None"
      };
    }

    const wordsArray = rawText.split(/\s+/).filter(w => w.length > 0);
    const words = wordsArray.length;
    const chars = text.length;
    const charsNoSpaces = rawText.replace(/\s+/g, '').length;
    
    // Sentence estimation (split by . ! ?)
    const sentences = rawText.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;

    // Rough syllable estimation (counting vowel groups)
    const syllables = rawText.toLowerCase().match(/[aeiouy]{1,2}/g)?.length || 0;

    // Time calculations (in decimal minutes)
    const readTime = words / readingWpm;
    const speakTime = words / speakingWpm;

    // Readability Heuristic (simplified Flesch-Kincaid indication)
    let readability = "Standard";
    if (words > 0) {
      const avgWordsPerSentence = words / sentences;
      const avgSyllablesPerWord = syllables / words;
      
      if (avgWordsPerSentence < 12 && avgSyllablesPerWord < 1.5) readability = "Easy / Conversational";
      else if (avgWordsPerSentence > 20 || avgSyllablesPerWord > 1.8) readability = "Hard / Academic";
    }

    return {
      words, chars, charsNoSpaces, sentences, syllables,
      readTime, speakTime, readability
    };
  }, [text, readingWpm, speakingWpm]);

  // Format decimal minutes into Minutes & Seconds
  const formatTime = (decimalMinutes) => {
    if (decimalMinutes === 0) return "0s";
    const mins = Math.floor(decimalMinutes);
    const secs = Math.round((decimalMinutes - mins) * 60);
    
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 dark:bg-sky-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-sky-100 dark:bg-sky-900/50 p-3 rounded-xl shadow-inner">
            <BookOpen className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Reading Time Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Silent Reading & Presentation Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6 items-start">
        
        {/* ================= LEFT: TEXT EDITOR ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-[#0d1117]">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <AlignLeft className="w-4 h-4 text-sky-500" /> Document Content
            </h3>
            {text && (
              <button 
                onClick={() => setText("")}
                className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded"
              >
                <Trash2 className="w-3 h-3" /> Clear Text
              </button>
            )}
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, script, or essay here to calculate reading and speaking times..."
            className="flex-1 w-full p-6 bg-transparent resize-none outline-none text-slate-700 dark:text-slate-300 font-medium leading-relaxed custom-scrollbar"
          />
          
          {/* Quick Metrics Bar */}
          <div className="p-4 bg-slate-50 dark:bg-[#0d1117] border-t border-slate-200 dark:border-slate-700 flex items-center gap-6 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <Type className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">{metrics.words.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Words</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AlignLeft className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">{metrics.chars.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chars</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: RESULTS & SETTINGS ================= */}
        <div className="space-y-6 sticky top-6">
          
          {/* Time Results Dashboard */}
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-500"></div>
            
            <div className="space-y-4">
              {/* Silent Reading Result */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                    <Clock className="w-4 h-4" /> Silent Reading
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                    @{readingWpm} wpm
                  </span>
                </div>
                <div className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                  {formatTime(metrics.readTime)}
                </div>
              </div>

              {/* Speaking/Presentation Result */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    <Mic className="w-4 h-4" /> Speech / Presentation
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                    @{speakingWpm} wpm
                  </span>
                </div>
                <div className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                  {formatTime(metrics.speakTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Speed Tuners */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Settings className="w-4 h-4 text-sky-500" /> Adjust Speed (WPM)
            </h3>

            {/* Reading Speed Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-sky-500" /> Reading Pace
                </label>
                <span className="text-xs font-black text-sky-600 dark:text-sky-400">{readingWpm} WPM</span>
              </div>
              <input 
                type="range" min="100" max="600" value={readingWpm} onChange={(e) => setReadingWpm(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex gap-1 mt-2">
                {READING_PRESETS.map(p => (
                  <button key={p.label} onClick={() => setReadingWpm(p.wpm)} className="flex-1 text-[8px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/30 text-slate-500 hover:text-sky-600 border border-slate-200 dark:border-slate-700 rounded py-1 transition-colors">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speaking Speed Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                  <Mic className="w-3 h-3 text-indigo-500" /> Speaking Pace
                </label>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{speakingWpm} WPM</span>
              </div>
              <input 
                type="range" min="80" max="250" value={speakingWpm} onChange={(e) => setSpeakingWpm(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex gap-1 mt-2">
                {SPEAKING_PRESETS.map(p => (
                  <button key={p.label} onClick={() => setSpeakingWpm(p.wpm)} className="flex-1 text-[8px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-500 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 rounded py-1 transition-colors">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deep Analytics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <BarChart2 className="w-4 h-4 text-sky-500" /> Text Deep Analysis
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Sentences</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{metrics.sentences.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Chars (no space)</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{metrics.charsNoSpaces.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500"/> Readability</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{metrics.readability}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
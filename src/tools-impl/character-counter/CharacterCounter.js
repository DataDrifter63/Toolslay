"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Type, BarChart2, Globe, MessageSquare, Twitter, 
  Linkedin, Search, AlertCircle, Copy, Eraser, 
  CheckCircle2, Clock, Zap, Target
} from "lucide-react";

export default function CharacterCounter() {
  const [isMounted, setIsMounted] = useState(false);
  const [text, setText] = useState("");
  const [ignoreSpaces, setIgnoreSpaces] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE PARSING & COUNTING ENGINE ---
  const stats = useMemo(() => {
    const rawLength = text.length;
    // Unicode-aware length (handles emojis properly)
    const unicodeChars = Array.from(text);
    let charCount = unicodeChars.length;
    
    const spacesCount = (text.match(/\s/g) || []).length;
    if (ignoreSpaces) {
      charCount -= spacesCount;
    }

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
    const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;

    // Averages: 200 words per min reading, 130 speaking
    const readTimeSecs = words ? Math.ceil((words / 200) * 60) : 0;
    const speakTimeSecs = words ? Math.ceil((words / 130) * 60) : 0;

    const formatTime = (secs) => {
      if (secs < 60) return `${secs} sec`;
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}m ${s}s`;
    };

    // Advanced SMS Encoding Math (GSM-7 equivalent logic)
    let smsSegments = 0;
    if (charCount > 0) {
      if (charCount <= 160) smsSegments = 1;
      else smsSegments = Math.ceil(charCount / 153);
    }

    return {
      chars: charCount,
      words,
      sentences,
      paragraphs,
      readTime: formatTime(readTimeSecs),
      speakTime: formatTime(speakTimeSecs),
      smsSegments
    };
  }, [text, ignoreSpaces]);

  // Platform Limits
  const platforms = [
    { name: "X (Twitter)", icon: <Twitter className="w-4 h-4"/>, limit: 280, current: stats.chars, color: "bg-sky-500", textCol: "text-sky-500" },
    { name: "LinkedIn Post", icon: <Linkedin className="w-4 h-4"/>, limit: 3000, current: stats.chars, color: "bg-blue-600", textCol: "text-blue-600" },
    { name: "SMS Message", icon: <MessageSquare className="w-4 h-4"/>, limit: 160, current: stats.chars, color: "bg-emerald-500", textCol: "text-emerald-500" },
    { name: "SEO Meta Desc", icon: <Search className="w-4 h-4"/>, limit: 155, current: stats.chars, color: "bg-rose-500", textCol: "text-rose-500" }
  ];

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
  };

  // Premium Indigo & Violet Theme
  const theme = {
    gradient: "from-indigo-200 via-violet-100 to-transparent dark:from-indigo-900/30 dark:via-violet-900/20",
    bgIcon: "bg-gradient-to-br from-indigo-500 to-violet-600",
    textPri: "text-indigo-600 dark:text-indigo-400",
    textSec: "text-violet-600 dark:text-violet-400",
    borderLight: "border-indigo-200 dark:border-indigo-800/50",
    bgLight: "bg-indigo-50 dark:bg-indigo-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Type className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Content Metrics Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Unicode-Aware Character & Limit Analyzer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: TEXT EDITOR & CORE STATS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 font-sans">
            
            {/* Core KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.chars}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Characters</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <span className="text-3xl font-black text-violet-600 dark:text-violet-400">{stats.words}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Words</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.sentences}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Sentences</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{stats.paragraphs}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Paragraphs</span>
              </div>
            </div>

            {/* Input Area */}
            <div className={`relative flex flex-col bg-white dark:bg-[#161b22] border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all overflow-hidden shadow-inner`}>
              <div className="flex justify-between items-center px-4 py-3 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={ignoreSpaces} onChange={(e) => setIgnoreSpaces(e.target.checked)} className="w-3.5 h-3.5 accent-indigo-500 rounded" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-500 transition-colors">Exclude Spaces</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleClear} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1">
                    <Eraser className="w-3.5 h-3.5" /> Clear
                  </button>
                  <span className="w-px h-4 bg-slate-300 dark:bg-slate-700"></span>
                  <button onClick={handleCopy} className={`text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 ${copied ? "text-emerald-500" : "text-slate-400 hover:text-indigo-500"}`}>
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <textarea
                value={text} 
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your content here..."
                rows="14"
                className="w-full bg-transparent px-5 py-5 text-base font-sans text-slate-800 dark:text-slate-200 outline-none resize-none custom-scrollbar leading-relaxed"
                spellCheck="false"
              />
            </div>

            {/* Time Estimations */}
            <div className="flex flex-wrap items-center gap-4 px-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Read: <span className="text-indigo-600 dark:text-indigo-400">{stats.readTime}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Speak: <span className="text-violet-600 dark:text-violet-400">{stats.speakTime}</span></span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: PLATFORM LIMITS & SEO ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Target className={`w-4 h-4 ${theme.textPri}`} /> Live Platform Limits
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-[#0d1117] px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  Real-Time
                </span>
              </div>

              {/* Limits Dashboard */}
              <div className="space-y-5">
                {platforms.map((platform, idx) => {
                  const percent = Math.min(100, (platform.current / platform.limit) * 100);
                  const isOver = platform.current > platform.limit;
                  const remaining = platform.limit - platform.current;
                  
                  return (
                    <div key={idx} className="space-y-2 group">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className={`flex items-center gap-1.5 text-slate-600 dark:text-slate-300`}>
                          {platform.icon} {platform.name}
                        </span>
                        <span className={`${isOver ? 'text-rose-500' : 'text-slate-500'}`}>
                          {platform.current} / {platform.limit}
                          {isOver && <span className="ml-1 text-rose-500">({remaining})</span>}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${isOver ? 'bg-rose-500' : platform.color}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr className="border-slate-200 dark:border-slate-700 my-6" />

              {/* Pro Feature: SMS Segment Analyzer */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl shadow-sm mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5"/> SMS Cost Analyzer
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3 font-medium">Standard SMS splits into multiple segments (153 chars) if over 160. You will be billed for:</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{stats.smsSegments}</span>
                  <span className="text-xs font-bold text-slate-500 mb-1">Message Segment(s)</span>
                </div>
              </div>

              {/* Pro Feature: Google SEO Visualizer */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Globe className={`w-3.5 h-3.5 text-slate-400`} /> Google SEO Preview
                </span>
                
                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm font-sans">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Globe className="w-3 h-3 text-slate-400"/>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-800 dark:text-slate-200 leading-tight">Your Website Name</div>
                      <div className="text-[10px] text-slate-500 leading-tight">https://yoursite.com/page</div>
                    </div>
                  </div>
                  {/* Title (Truncates around 60 chars roughly in visual) */}
                  <h3 className="text-[15px] font-medium text-[#1a0dab] dark:text-[#8ab4f8] leading-snug mb-1 truncate">
                    {text ? text.substring(0, 60) + (text.length > 60 ? '...' : '') : "Your SEO Title Will Appear Here"}
                  </h3>
                  {/* Meta (Truncates around 155 chars) */}
                  <p className="text-[12px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2 break-words">
                    {text ? text.substring(0, 155) + (text.length > 155 ? '...' : '') : "This is how your meta description will look in Google search results. Keep it under 155 characters for optimal display."}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
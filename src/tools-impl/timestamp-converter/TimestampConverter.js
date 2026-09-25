"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings, Clock, Trash2, Copy, AlertTriangle, Check, Globe, Code, Zap } from "lucide-react";

const TimestampConverter = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState("");
  const [parsedDate, setParsedDate] = useState(null);
  const [detectedFormat, setDetectedFormat] = useState("");
  const [error, setError] = useState(null);
  
  const [copiedStates, setCopiedStates] = useState({});
  const [showSettings, setShowSettings] = useState(false); // Default hidden on mobile for clean start

  useEffect(() => {
    setIsMounted(true);
    setInput(Math.floor(Date.now() / 1000).toString());
  }, []);

  const parseInput = useCallback(() => {
    if (!input || !input.trim()) {
      setParsedDate(null);
      setDetectedFormat("");
      setError(null);
      return;
    }

    const val = input.trim();
    const num = Number(val);

    try {
      let d = null;
      let format = "";

      if (!isNaN(num)) {
        if (val.length <= 10) {
          d = new Date(num * 1000);
          format = "Unix Seconds";
        } else if (val.length <= 13) {
          d = new Date(num);
          format = "Unix Milliseconds";
        } else if (val.length <= 16) {
          d = new Date(Math.floor(num / 1000));
          format = "Unix Microseconds";
        } else {
          d = new Date(Math.floor(num / 1000000));
          format = "Unix Nanoseconds";
        }
      } else {
        d = new Date(val);
        format = "ISO / Date String";
      }

      if (isNaN(d.getTime())) {
        throw new Error("Invalid format");
      }

      setParsedDate(d);
      setDetectedFormat(format);
      setError(null);
    } catch (err) {
      setParsedDate(null);
      setDetectedFormat("");
      setError("Unrecognized timestamp or date format.");
    }
  }, [input]);

  useEffect(() => {
    parseInput();
  }, [parseInput]);

  const handleCopy = async (text, id) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
    } catch (err) {}
  };

  const setFormatToCurrent = (type) => {
    const d = new Date();
    if (type === 'sec') setInput(Math.floor(d.getTime() / 1000).toString());
    if (type === 'ms') setInput(d.getTime().toString());
    if (type === 'iso') setInput(d.toISOString());
  };

  const getRelativeTime = (targetDate) => {
    if (!targetDate) return "";
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diffMs = targetDate.getTime() - new Date().getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (Math.abs(diffDays) > 365) return rtf.format(Math.round(diffDays / 365), 'year');
    if (Math.abs(diffDays) > 30) return rtf.format(Math.round(diffDays / 30), 'month');
    if (Math.abs(diffDays) > 0) return rtf.format(diffDays, 'day');
    
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (Math.abs(diffHours) > 0) return rtf.format(diffHours, 'hour');
    
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    return rtf.format(diffMinutes, 'minute');
  };

  const formatTimezone = (date, tz) => {
    if (!isMounted || !date) return "...";
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        dateStyle: 'medium',
        timeStyle: 'long'
      }).format(date);
    } catch (e) {
      return date.toString();
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4 sm:pb-5 w-full">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
                WEB DEVELOPMENT UTILITY
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
                Timestamp Converter
              </h2>
              <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
                Convert Unix timestamps to readable dates and global timezones instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-line bg-paper text-ink hover:border-brand text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all shrink-0"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" /> {showSettings ? "Hide Tools" : "Tools"}
            </button>
          </div>
        </div>

        {/* WORK AREA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-6 items-start w-full">
          
          <div className="flex flex-col gap-4 sm:gap-6 flex-grow min-w-0">
            
            {/* Main Input Panel */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col shadow-sm w-full">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between w-full">
                <label className="text-[11px] sm:text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2">
                   <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand"/> Smart Input
                </label>
                <div>
                   <button type="button" onClick={() => setInput("")} className="p-1.5 text-muted hover:text-[#fb7185] hover:bg-surface rounded-xl transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste Unix time or Date string..."
                    className={`w-full text-center text-2xl sm:text-3xl md:text-4xl font-mono tracking-wider font-black p-4 sm:p-6 rounded-xl border-2 outline-none transition-colors tabular-nums ${error ? 'bg-[#fb7185]/10 border-[#fb7185]/30 text-[#fb7185]' : 'bg-surface border-line text-ink focus:border-brand'}`}
                    spellCheck="false"
                />
                
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[10px] font-black text-muted uppercase tracking-wider mr-1">Quick Insert:</span>
                  <button type="button" onClick={() => setFormatToCurrent('sec')} className="px-3 py-1.5 bg-surface border border-line text-ink text-[10px] font-black uppercase tracking-wider rounded-xl hover:border-brand transition-all">Current (Sec)</button>
                  <button type="button" onClick={() => setFormatToCurrent('ms')} className="px-3 py-1.5 bg-surface border border-line text-ink text-[10px] font-black uppercase tracking-wider rounded-xl hover:border-brand transition-all">Current (MS)</button>
                  <button type="button" onClick={() => setFormatToCurrent('iso')} className="px-3 py-1.5 bg-surface border border-line text-ink text-[10px] font-black uppercase tracking-wider rounded-xl hover:border-brand transition-all">Current ISO</button>
                </div>
                
                {detectedFormat && !error && (
                  <div className="mt-6 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      <Check className="w-3.5 h-3.5"/> Auto-Detected: {detectedFormat}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Conversions Output */}
            {!error && parsedDate && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 w-full">
                
                <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm w-full box-border">
                  <div className="flex justify-between items-center mb-3 border-b border-line pb-2">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider">Local Time</span>
                    <button type="button" onClick={() => handleCopy(parsedDate.toString(), 'local')} className="text-muted hover:text-ink p-1 rounded-lg transition-colors">
                      {copiedStates['local'] ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="font-mono text-sm sm:text-base text-ink font-bold break-words tabular-nums">
                    {isMounted ? parsedDate.toString() : "..."}
                  </div>
                  <div className="mt-2 text-[11px] font-bold text-brand">
                    {isMounted ? getRelativeTime(parsedDate) : ""}
                  </div>
                </div>

                <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm w-full box-border">
                  <div className="flex justify-between items-center mb-3 border-b border-line pb-2">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider">UTC / GMT</span>
                    <button type="button" onClick={() => handleCopy(parsedDate.toUTCString(), 'utc')} className="text-muted hover:text-ink p-1 rounded-lg transition-colors">
                      {copiedStates['utc'] ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="font-mono text-sm sm:text-base text-ink font-bold break-words tabular-nums">
                    {isMounted ? parsedDate.toUTCString() : "..."}
                  </div>
                  <div className="mt-2 text-[11px] font-medium text-muted truncate">
                    ISO: {isMounted ? parsedDate.toISOString() : "..."}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* SIDEBAR TOOLS */}
          <div className={`space-y-4 sm:space-y-6 w-full ${showSettings ? "block" : "hidden lg:block"}`}>
            
            {/* Global Timezones */}
            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4 w-full box-border">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">Global Timezones</h3>
              </div>
              
              <div className="space-y-2.5">
                {[
                  { label: "Pacific (PT)", tz: "America/Los_Angeles" },
                  { label: "Eastern (ET)", tz: "America/New_York" },
                  { label: "London (GMT/BST)", tz: "Europe/London" },
                  { label: "Tokyo (JST)", tz: "Asia/Tokyo" }
                ].map((item) => (
                  <div key={item.tz} className="p-3 bg-surface rounded-xl border border-line">
                    <span className="block text-[9px] font-black text-muted uppercase tracking-wider mb-1">{item.label}</span>
                    <span className="block text-xs font-mono text-ink tabular-nums">
                      {parsedDate ? formatTimezone(parsedDate, item.tz) : "..."}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Snippets */}
            {parsedDate && !error && (
              <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4 w-full box-border">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Dev Snippets</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { lang: "JavaScript", code: `new Date(${parsedDate.getTime()})` },
                    { lang: "Python", code: `datetime.fromtimestamp(${Math.floor(parsedDate.getTime()/1000)})` },
                    { lang: "PHP", code: `date('Y-m-d H:i:s', ${Math.floor(parsedDate.getTime()/1000)})` },
                  ].map((snip, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="block text-[9px] font-black text-muted uppercase tracking-wider">{snip.lang}</span>
                      <div className="flex items-center bg-surface border border-line rounded-xl p-2.5">
                         <code className="text-[11px] text-brand font-mono flex-grow overflow-x-auto whitespace-nowrap scrollbar-none tabular-nums">{snip.code}</code>
                         <button type="button" onClick={() => handleCopy(snip.code, `code-${idx}`)} className="ml-2 text-muted hover:text-ink shrink-0">
                           {copiedStates[`code-${idx}`] ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default TimestampConverter;
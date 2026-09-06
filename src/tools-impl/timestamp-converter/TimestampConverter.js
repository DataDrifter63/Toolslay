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
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    // Set initial input to current Unix timestamp (seconds) safely
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
        // Numeric parsing with Smart Magnitude Detection
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
        // String Date Parsing
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Timestamp Converter</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:text-orange-600 transition-all">
            <Settings className="w-4 h-4" /> {showSettings ? "Hide Tools" : "Show Tools"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        
        <div className="flex flex-col gap-6 flex-grow">
          
          {/* Main Input Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                 <Zap className="w-4 h-4 text-orange-500"/> Smart Input
              </label>
              <div className="flex gap-2">
                 <button onClick={() => setInput("")} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
            
            <div className="p-6">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste Unix time or Date string..."
                    className={`w-full text-center text-3xl md:text-4xl font-mono tracking-wider font-black p-6 rounded-xl border-2 focus:outline-none transition-colors ${error ? 'bg-red-50/50 border-red-200 text-red-600 focus:border-red-500 dark:bg-red-900/10 dark:border-red-900/50 dark:text-red-400' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'}`}
                    spellCheck="false"
                />
                
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase mr-2">Quick Insert:</span>
                  <button onClick={() => setFormatToCurrent('sec')} className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold rounded hover:bg-orange-200 transition-colors">Current (Sec)</button>
                  <button onClick={() => setFormatToCurrent('ms')} className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold rounded hover:bg-orange-200 transition-colors">Current (MS)</button>
                  <button onClick={() => setFormatToCurrent('iso')} className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold rounded hover:bg-slate-200 transition-colors">Current ISO</button>
                </div>
                
                {detectedFormat && !error && (
                  <div className="mt-6 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold">
                      <Check className="w-3.5 h-3.5"/> Auto-Detected: {detectedFormat}
                    </span>
                  </div>
                )}
            </div>
          </div>
          
          {/* Conversions Output */}
          {!error && parsedDate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local Time</span>
                  <button onClick={() => handleCopy(parsedDate.toString(), 'local')} className="text-slate-400 hover:text-orange-500">
                    {copiedStates['local'] ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="font-mono text-base md:text-lg text-slate-800 dark:text-slate-200 font-bold break-words">
                  {isMounted ? parsedDate.toString() : "..."}
                </div>
                <div className="mt-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  {isMounted ? getRelativeTime(parsedDate) : ""}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">UTC / GMT</span>
                  <button onClick={() => handleCopy(parsedDate.toUTCString(), 'utc')} className="text-slate-400 hover:text-orange-500">
                    {copiedStates['utc'] ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="font-mono text-base md:text-lg text-slate-800 dark:text-slate-200 font-bold break-words">
                  {isMounted ? parsedDate.toUTCString() : "..."}
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-500">
                  ISO: {isMounted ? parsedDate.toISOString() : "..."}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Sidebar Pro Features */}
        {showSettings && (
          <div className="space-y-6 lg:w-80 lg:max-w-80 flex flex-col h-full">
            
            {/* Global Timezones */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Globe className="w-5 h-5 text-sky-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Global Timezones</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "Pacific (PT)", tz: "America/Los_Angeles" },
                  { label: "Eastern (ET)", tz: "America/New_York" },
                  { label: "London (GMT/BST)", tz: "Europe/London" },
                  { label: "Tokyo (JST)", tz: "Asia/Tokyo" }
                ].map((item) => (
                  <div key={item.tz} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{item.label}</span>
                    <span className="block text-xs font-mono text-slate-800 dark:text-slate-200">
                      {parsedDate ? formatTimezone(parsedDate, item.tz) : "..."}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Snippets */}
            {parsedDate && !error && (
              <div className="bg-slate-900 dark:bg-black border border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Code className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-white">Dev Snippets</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { lang: "JavaScript", code: `new Date(${parsedDate.getTime()})` },
                    { lang: "Python", code: `datetime.fromtimestamp(${Math.floor(parsedDate.getTime()/1000)})` },
                    { lang: "PHP", code: `date('Y-m-d H:i:s', ${Math.floor(parsedDate.getTime()/1000)})` },
                  ].map((snip, idx) => (
                    <div key={idx} className="group relative">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{snip.lang}</span>
                      <div className="flex items-center bg-slate-800 rounded p-2">
                         <code className="text-xs text-emerald-300 font-mono flex-grow overflow-x-auto whitespace-nowrap scrollbar-hide">{snip.code}</code>
                         <button onClick={() => handleCopy(snip.code, `code-${idx}`)} className="ml-2 text-slate-400 hover:text-white">
                           {copiedStates[`code-${idx}`] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default TimestampConverter;
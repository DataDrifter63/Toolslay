"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings2, Clock, Trash2, Copy, RotateCcw, AlertTriangle, Check, CalendarDays, Terminal, ListOrdered, Calendar } from "lucide-react";

const cronstrueModule = require("cronstrue");
const { CronExpressionParser } = require("cron-parser");

const PRESETS = [
  { label: "Every Minute", value: "* * * * *" },
  { label: "Every 5 Minutes", value: "*/5 * * * *" },
  { label: "Every 30 Minutes", value: "*/30 * * * *" },
  { label: "Every Hour", value: "0 * * * *" },
  { label: "Every Day at Midnight", value: "0 0 * * *" },
  { label: "Every Day at 8 AM", value: "0 8 * * *" },
  { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  { label: "1st Day of Every Month", value: "0 0 1 * *" },
  { label: "Every Weekday (Mon-Fri)", value: "0 0 * * 1-5" },
];

const CHEAT_SHEET = [
  { char: "*", desc: "Any value" },
  { char: ",", desc: "Value list separator" },
  { char: "-", desc: "Range of values" },
  { char: "/", desc: "Step values" },
];

export default function CronExpressionGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const [cron, setCron] = useState("*/15 * * * *");
  const [humanReadable, setHumanReadable] = useState("");
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedState, setCopiedState] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const processCron = useCallback(() => {
    if (!cron || !cron.trim()) {
      setHumanReadable("");
      setUpcomingDates([]);
      setErrorMsg(null);
      return;
    }

    try {
      const cronstrue = cronstrueModule.default || cronstrueModule;

      const readable = cronstrue.toString(cron, { throwExceptionOnParseError: true });
      setHumanReadable(readable);

      if (typeof CronExpressionParser?.parse !== "function") {
        throw new Error("Parser library failed to load correctly.");
      }

      const interval = CronExpressionParser.parse(cron);
      const nextDates = [];
      for (let i = 0; i < 5; i++) {
        nextDates.push(interval.next().toDate().toLocaleString());
      }

      setUpcomingDates(nextDates);
      setErrorMsg(null);
    } catch (err) {
      setHumanReadable("");
      setUpcomingDates([]);
      setErrorMsg(err.message || "Invalid Cron Expression");
    }
  }, [cron]);

  useEffect(() => {
    processCron();
  }, [processCron]);

  const handleClear = () => {
    setCron("");
    setHumanReadable("");
    setUpcomingDates([]);
    setErrorMsg(null);
  };

  const handleCopy = async () => {
    if (!cron || errorMsg) return;
    try {
      await navigator.clipboard.writeText(cron);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-xl font-black shrink-0">
              <Clock className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-widest text-brand uppercase mb-1">
                WEB DEVELOPMENT UTILITY
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                Cron Expression Studio
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Generate, analyze, and translate cron schedules into plain English.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-paper text-ink hover:border-brand text-xs font-black uppercase tracking-wider transition-all"
            >
              <Settings2 className="w-4 h-4 text-brand" /> {showSettings ? "Hide Panel" : "Show Panel"}
            </button>
            <button 
              type="button"
              onClick={handleCopy} 
              disabled={!!errorMsg || !cron}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand disabled:opacity-50 text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity shadow-sm"
            >
              {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedState ? "Copied!" : "Copy Cron"}
            </button>
          </div>
        </div>

        {/* WORK AREA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start min-w-0">
          
          <div className="flex flex-col gap-6 flex-grow min-h-[500px] min-w-0">
            
            {/* Editor Panel */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col shadow-sm min-w-0">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between min-w-0">
                <label className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2">
                   <Terminal className="w-4 h-4 text-brand"/> Raw Expression Editor
                </label>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={handleClear} className="p-1.5 text-muted hover:text-[#fb7185] hover:bg-paper rounded-xl transition-colors" title="Clear Code"><Trash2 className="w-4 h-4"/></button>
                  <button type="button" onClick={processCron} className="p-1.5 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors" title="Process Again"><RotateCcw className="w-4 h-4"/></button>
                  <span className="ml-2">
                     {errorMsg ? (
                       <span className="text-[10px] text-[#fb7185] font-black uppercase tracking-wider flex items-center gap-1 bg-[#fb7185]/10 px-2.5 py-1 rounded-xl border border-[#fb7185]/30"><AlertTriangle className="w-3.5 h-3.5" /> Syntax Error</span>
                     ) : cron.trim() ? (
                       <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30"><Check className="w-3.5 h-3.5" /> Valid</span>
                     ) : null}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <input
                    type="text"
                    value={cron}
                    onChange={(e) => setCron(e.target.value)}
                    placeholder="* * * * *"
                    className={`w-full text-center text-3xl sm:text-4xl md:text-5xl font-mono tracking-[0.2em] font-black p-6 rounded-xl border-2 outline-none transition-colors tabular-nums ${errorMsg ? 'bg-[#fb7185]/10 border-[#fb7185]/30 text-[#fb7185]' : 'bg-surface border-line text-ink focus:border-brand'}`}
                    spellCheck="false"
                />
                
                <div className="mt-8">
                    <h3 className="text-[10px] font-black text-muted uppercase tracking-wider mb-3">Translation</h3>
                    <div className="p-4 bg-surface border border-line rounded-xl min-h-[60px] flex items-center justify-center text-center">
                        {errorMsg ? (
                            <span className="text-[#fb7185] font-bold text-xs sm:text-sm break-all">{errorMsg}</span>
                        ) : (
                            <span className="text-base sm:text-lg md:text-xl font-bold text-brand capitalize">
                                “ {humanReadable || "Enter expression..."} ”
                            </span>
                        )}
                    </div>
                </div>
              </div>
            </div>
            
            {/* Upcoming Runs Panel */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col shadow-sm min-w-0">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center gap-2 min-w-0">
                <CalendarDays className="w-4 h-4 text-emerald-500" />
                <label className="text-xs font-black text-ink uppercase tracking-wider">
                  Next 5 Scheduled Runs
                </label>
              </div>
              <div className="p-4">
                {!isMounted ? (
                  <div className="text-center text-muted py-6 text-xs font-bold">Loading schedule...</div>
                ) : errorMsg ? (
                  <div className="text-center text-[#fb7185] py-6 text-xs font-bold italic">Fix expression to view schedule</div>
                ) : (
                  <ul className="space-y-2">
                    {upcomingDates.map((date, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-line">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs sm:text-sm text-ink tabular-nums">
                          {date}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>

          {/* SIDEBAR PANEL */}
          {showSettings && (
            <div className="space-y-6 lg:w-80 lg:max-w-80 flex flex-col h-full min-w-0">
              
              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <ListOrdered className="w-5 h-5 text-brand" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Smart Presets</h3>
                </div>
                
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {PRESETS.map((preset, idx) => (
                    <button 
                        key={idx}
                        type="button"
                        onClick={() => setCron(preset.value)}
                        className="text-left p-3 text-xs font-medium rounded-xl transition-all bg-surface border border-line hover:border-brand text-ink"
                    >
                        <span className="block font-black text-ink uppercase tracking-wider mb-1 text-[11px]">{preset.label}</span>
                        <span className="font-mono text-brand font-bold text-xs">{preset.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3 min-w-0">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Format Guide</h3>
                </div>
                
                <div className="grid grid-cols-5 gap-1 text-center mb-4">
                  {['Min', 'Hour', 'Day', 'Mon', 'Week'].map((lbl, i) => (
                      <div key={i} className="bg-surface border border-line py-2 rounded-xl text-[9px] font-black text-muted uppercase tracking-wider">
                          {lbl}
                      </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {CHEAT_SHEET.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-surface rounded-xl border border-line">
                          <span className="font-mono font-black text-brand text-sm">{item.char}</span>
                          <span className="text-xs font-medium text-muted">{item.desc}</span>
                      </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings2, Clock, Trash2, Copy, RotateCcw, AlertTriangle, Check, CalendarDays, Terminal, ListOrdered, Calendar } from "lucide-react";

// ✅ FIX: cron-parser v5+ no longer exports a `parseExpression()` function.
// It now exports a `CronExpressionParser` class with a static `.parse()`
// method, so the old `parseExpression(cron)` call was invoking a class
// constructor without `new` — hence "cannot be invoked without 'new'".
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
      // Safe extraction — handles both CommonJS and ES6 interop wrappers.
      const cronstrue = cronstrueModule.default || cronstrueModule;

      // 1. Natural language translation
      const readable = cronstrue.toString(cron, { throwExceptionOnParseError: true });
      setHumanReadable(readable);

      // 2. Next executions predictor — cron-parser v5 API: static .parse()
      // returns a CronExpression instance, not a plain function call.
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

  const handleCopy = async () => {
    if (!cron || errorMsg) return;
    try {
      await navigator.clipboard.writeText(cron);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Cron Expression Studio</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all">
            <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Panel" : "Show Panel"}
          </button>
          <button onClick={handleCopy} disabled={!!errorMsg || !cron} className="flex items-center gap-2 text-sm font-semibold bg-indigo-600 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedState ? "Copied!" : "Copy Cron"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        
        <div className="flex flex-col gap-6 flex-grow min-h-[600px]">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                 <Terminal className="w-4 h-4 text-slate-500"/> Raw Expression Editor
              </label>
              <div className="flex gap-1 pr-1">
                 {errorMsg ? (
                   <span className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-200"><AlertTriangle className="w-3.5 h-3.5" /> Syntax Error</span>
                 ) : cron.trim() ? (
                   <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200"><Check className="w-3.5 h-3.5" /> Valid</span>
                 ) : null}
              </div>
            </div>
            
            <div className="p-6">
                <input
                    type="text"
                    value={cron}
                    onChange={(e) => setCron(e.target.value)}
                    placeholder="* * * * *"
                    className={`w-full text-center text-4xl md:text-5xl font-mono tracking-[0.2em] font-black p-6 rounded-xl border-2 focus:outline-none transition-colors ${errorMsg ? 'bg-red-50/50 border-red-200 text-red-600 focus:border-red-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                    spellCheck="false"
                />
                
                <div className="mt-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Translation</h3>
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg min-h-[60px] flex items-center justify-center text-center">
                        {errorMsg ? (
                            <span className="text-red-500 font-medium break-all">{errorMsg}</span>
                        ) : (
                            <span className="text-lg md:text-xl font-bold text-indigo-700 capitalize">
                                “ {humanReadable || "Enter expression..."} ”
                            </span>
                        )}
                    </div>
                </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Next 5 Scheduled Runs
              </label>
            </div>
            <div className="p-4">
              {!isMounted ? (
                <div className="text-center text-slate-400 py-6 text-sm">Loading schedule...</div>
              ) : errorMsg ? (
                <div className="text-center text-red-400 py-6 text-sm italic">Fix expression to view schedule</div>
              ) : (
                <ul className="space-y-2">
                  {upcomingDates.map((date, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-sm text-slate-700">
                        {date}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-80 lg:max-w-80 flex flex-col h-full">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ListOrdered className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800">Smart Presets</h3>
              </div>
              
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {PRESETS.map((preset, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCron(preset.value)}
                        className="text-left px-3 py-2.5 text-xs font-medium rounded-lg transition-colors bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-600"
                    >
                        <span className="block font-bold text-slate-800 mb-1">{preset.label}</span>
                        <span className="font-mono text-indigo-500">{preset.value}</span>
                    </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-800">Format Guide</h3>
              </div>
              
              <div className="grid grid-cols-5 gap-1 text-center mb-4">
                {['Min', 'Hour', 'Day', 'Mon', 'Week'].map((lbl, i) => (
                    <div key={i} className="bg-slate-100 py-1.5 rounded text-[10px] font-bold text-slate-500 uppercase">
                        {lbl}
                    </div>
                ))}
              </div>

              <div className="space-y-2 text-xs">
                {CHEAT_SHEET.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-md border border-slate-100">
                        <span className="font-mono font-bold text-indigo-500 text-base">{item.char}</span>
                        <span className="text-slate-600">{item.desc}</span>
                    </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Moon, Sun, Clock, Bed, Coffee, 
  AlertCircle, CheckCircle2, Zap, Settings, Info
} from "lucide-react";

const FALL_ASLEEP_OPTIONS = [
  { value: 5, label: "5 mins (Fast)" },
  { value: 15, label: "15 mins (Average)" },
  { value: 30, label: "30 mins (Slow)" }
];

export default function SleepCycleCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Modes: 'wake' = I want to wake up at X, 'sleep' = I am going to bed at X
  const [mode, setMode] = useState("wake");
  const [timeStr, setTimeStr] = useState("07:00");
  const [fallAsleepTime, setFallAsleepTime] = useState(15);

  useEffect(() => {
    setIsMounted(true);
    // Set current time as default if going to sleep
    const now = new Date();
    const currentHH = String(now.getHours()).padStart(2, '0');
    const currentMM = String(now.getMinutes()).padStart(2, '0');
    
    // If it's daytime, default wake time to next morning 7 AM. 
    // If it's night, just let it be 07:00 default.
    if (now.getHours() > 18) {
      setMode("sleep");
      setTimeStr(`${currentHH}:${currentMM}`);
    }
  }, []);

  const setTimeNow = () => {
    const now = new Date();
    const currentHH = String(now.getHours()).padStart(2, '0');
    const currentMM = String(now.getMinutes()).padStart(2, '0');
    setTimeStr(`${currentHH}:${currentMM}`);
    setMode("sleep");
  };

  // Core Scientific Sleep Cycle Calculation
  const cyclesData = useMemo(() => {
    if (!timeStr) return [];

    const [hours, minutes] = timeStr.split(':').map(Number);
    const baseDate = new Date();
    baseDate.setHours(hours, minutes, 0, 0);

    const cyclesList = [6, 5, 4, 3, 2, 1]; // 9h to 1.5h
    const msPerCycle = 90 * 60 * 1000; // 90 minutes in ms
    const msFallAsleep = fallAsleepTime * 60 * 1000;

    return cyclesList.map(c => {
      let targetDate;
      
      if (mode === "wake") {
        // Bedtime = Wake Time - (Cycles * 90) - Fall Asleep Time
        targetDate = new Date(baseDate.getTime() - (c * msPerCycle) - msFallAsleep);
      } else {
        // Wake Time = Bedtime + Fall Asleep Time + (Cycles * 90)
        targetDate = new Date(baseDate.getTime() + msFallAsleep + (c * msPerCycle));
      }

      // Formatting Time (e.g., 10:30 PM)
      const formattedTime = targetDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Status Configuration based on Cycles
      let statusConfig = {};
      if (c >= 5) {
        statusConfig = { label: "Optimal", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-500", icon: CheckCircle2 };
      } else if (c === 4) {
        statusConfig = { label: "Moderate", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-400", icon: Zap };
      } else {
        statusConfig = { label: "Warning", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-400", icon: AlertCircle };
      }

      return {
        cycles: c,
        time: formattedTime,
        durationHr: (c * 90) / 60,
        config: statusConfig,
        isTomorrow: mode === "sleep" ? (targetDate.getDate() !== baseDate.getDate()) : (targetDate.getDate() !== baseDate.getDate())
      };
    });
  }, [timeStr, mode, fallAsleepTime]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl shadow-inner">
            <Moon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Sleep Cycle Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              90-Minute REM Phase Optimization
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8 sticky top-6">
          
          {/* Mode Selector */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Clock className="w-4 h-4 text-indigo-500" /> Scheduling Mode
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("wake")}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  mode === "wake"
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-500"
                }`}
              >
                <Sun className={`w-5 h-5 ${mode === "wake" ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                <span className={`text-xs font-bold ${mode === "wake" ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>I want to wake at</span>
              </button>

              <button
                onClick={() => setMode("sleep")}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  mode === "sleep"
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-500"
                }`}
              >
                <Bed className={`w-5 h-5 ${mode === "sleep" ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                <span className={`text-xs font-bold ${mode === "sleep" ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>I plan to sleep at</span>
              </button>
            </div>
          </div>

          {/* Time Input */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /> Set Time</span>
              {mode === "sleep" && (
                <button onClick={setTimeNow} className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold hover:bg-indigo-200 transition-colors">
                  Sleep Now
                </button>
              )}
            </h3>
            
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-2xl font-black text-center text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Fall Asleep Delay */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Settings className="w-4 h-4 text-indigo-500" /> Time to Fall Asleep
            </h3>
            
            <div className="space-y-2">
              {FALL_ASLEEP_OPTIONS.map((opt) => (
                <label 
                  key={opt.value}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    fallAsleepTime === opt.value
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300"
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <input 
                    type="radio" 
                    name="fallAsleep"
                    value={opt.value}
                    checked={fallAsleepTime === opt.value}
                    onChange={() => setFallAsleepTime(opt.value)}
                    className="accent-indigo-600 w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Science Tip */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex gap-3 items-start">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
              <strong>Why 90 minutes?</strong> A standard sleep cycle lasts about 90 mins. Waking up in the middle of a cycle (Deep Sleep) leaves you groggy. Waking up at the end of a cycle leaves you refreshed.
            </p>
          </div>

        </div>

        {/* ================= RIGHT: RESULTS DASHBOARD ================= */}
        <div className="space-y-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden min-h-[500px]">
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                {mode === "wake" ? <Bed className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                {mode === "wake" ? "Suggested Bedtimes" : "Suggested Wake Times"}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                Factoring in {fallAsleepTime} mins to fall asleep
              </p>
            </div>

            <div className="space-y-3">
              {cyclesData.map((data, index) => {
                const Icon = data.config.icon;
                return (
                  <div 
                    key={index} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 transition-all hover:scale-[1.01] ${data.config.bg} ${data.config.border}`}
                  >
                    
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                      <div className={`p-3 rounded-full bg-white dark:bg-slate-900 shadow-sm ${data.config.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-black tracking-tight ${data.config.color}`}>
                            {data.time}
                          </span>
                          {data.isTomorrow && mode === "sleep" && (
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">Next Day</span>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest opacity-80`}>
                          {data.config.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-black/10 dark:border-white/10 pt-2 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{data.durationHr} Hours</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{data.cycles} Cycles</span>
                    </div>

                  </div>
                )
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
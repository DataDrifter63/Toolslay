"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock, Plus, Minus, ArrowRight, Briefcase, 
  Moon, Sun, Calculator, ArrowRightLeft, 
  Timer, RotateCcw, CheckCircle2
} from "lucide-react";

export default function TimeDurationCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("span"); // 'span' or 'math'

  // Mode 1: Time Span (Difference)
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  // Mode 2: Time Math (Add/Sub)
  const [baseTime, setBaseTime] = useState("12:00");
  const [mathAction, setMathAction] = useState("add"); // 'add' or 'sub'
  const [mathHours, setMathHours] = useState("");
  const [mathMins, setMathMins] = useState("");
  const [mathSecs, setMathSecs] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMathInput = (setter, value) => {
    if (value === "" || /^\d+$/.test(value)) {
      setter(value);
    }
  };

  const formatAMPM = (dateObj) => {
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  // --- ENGINE 1: TIME SPAN ---
  const spanCalc = useMemo(() => {
    if (!startTime || !endTime) return null;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let startMs = (startH * 60 + startM) * 60000;
    let endMs = (endH * 60 + endM) * 60000;

    let isOvernight = false;
    
    // If end time is earlier than start time, assume it crosses midnight
    if (endMs < startMs) {
      endMs += 24 * 60 * 60 * 1000;
      isOvernight = true;
    }

    const diffMs = endMs - startMs;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    
    // Payroll Decimal (e.g. 8 hrs 30 mins = 8.5)
    const decimalHours = (diffMs / 3600000).toFixed(2);

    return { diffHours, diffMins, isOvernight, decimalHours };
  }, [startTime, endTime]);


  // --- ENGINE 2: TIME MATH ---
  const mathCalc = useMemo(() => {
    if (!baseTime) return null;

    const [baseH, baseM] = baseTime.split(':').map(Number);
    
    const h = parseInt(mathHours) || 0;
    const m = parseInt(mathMins) || 0;
    const s = parseInt(mathSecs) || 0;

    // Convert everything to a base date today
    const dateObj = new Date();
    dateObj.setHours(baseH, baseM, 0, 0);
    
    const originalDate = dateObj.getDate();

    const addMs = (h * 3600000) + (m * 60000) + (s * 1000);

    if (mathAction === "add") {
      dateObj.setTime(dateObj.getTime() + addMs);
    } else {
      dateObj.setTime(dateObj.getTime() - addMs);
    }

    const newDate = dateObj.getDate();
    let dayShift = 0; // 0 = same day, 1 = next day, -1 = prev day
    
    if (dateObj.getTime() > new Date().setHours(23,59,59,999)) {
      dayShift = Math.floor((dateObj.getTime() - new Date().setHours(0,0,0,0)) / 86400000);
    } else if (dateObj.getTime() < new Date().setHours(0,0,0,0)) {
      dayShift = Math.floor((dateObj.getTime() - new Date().setHours(23,59,59,999)) / 86400000);
    } else if (newDate > originalDate) {
      dayShift = 1;
    } else if (newDate < originalDate) {
      dayShift = -1;
    }

    return {
      resultTime: formatAMPM(dateObj),
      dayShift
    };
  }, [baseTime, mathAction, mathHours, mathMins, mathSecs]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-100 via-violet-50 to-transparent dark:from-cyan-900/30 dark:via-violet-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-500 to-violet-600 p-3.5 rounded-2xl shadow-md">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Chrono Math Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Time Span & Payroll Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: CONTROLS & INPUTS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
              <button 
                onClick={() => setActiveTab("span")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "span" ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <ArrowRightLeft className="w-4 h-4" /> Time Difference
              </button>
              <button 
                onClick={() => setActiveTab("math")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "math" ? "bg-white dark:bg-slate-700 text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <RotateCcw className="w-4 h-4" /> Time Math (+/-)
              </button>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* --- TAB 1: TIME SPAN (DIFFERENCE) --- */}
            {activeTab === "span" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Sun className="w-3.5 h-3.5 text-cyan-500" /> Start Time
                    </label>
                    <input
                      type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Moon className="w-3.5 h-3.5 text-violet-500" /> End Time
                    </label>
                    <input
                      type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 2: TIME MATH (ADD/SUBTRACT) --- */}
            {activeTab === "math" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                
                {/* Base Time */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-violet-500" /> Base Clock Time
                  </label>
                  <input
                    type="time" value={baseTime} onChange={(e) => setBaseTime(e.target.value)}
                    className="w-full max-w-[200px] bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-4 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setMathAction("add")}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${mathAction === "add" ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <Plus className="w-4 h-4" /> Add Time
                  </button>
                  <button
                    onClick={() => setMathAction("sub")}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${mathAction === "sub" ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 border border-rose-200 dark:border-rose-800' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <Minus className="w-4 h-4" /> Subtract Time
                  </button>
                </div>

                {/* Duration Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hours</label>
                    <input type="text" value={mathHours} onChange={(e) => handleMathInput(setMathHours, e.target.value)} placeholder="0" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black outline-none focus:border-violet-500 text-center" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Minutes</label>
                    <input type="text" value={mathMins} onChange={(e) => handleMathInput(setMathMins, e.target.value)} placeholder="0" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black outline-none focus:border-violet-500 text-center" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Seconds</label>
                    <input type="text" value={mathSecs} onChange={(e) => handleMathInput(setMathSecs, e.target.value)} placeholder="0" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black outline-none focus:border-violet-500 text-center" />
                  </div>
                </div>

              </div>
            )}
            
          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD RECEIPT ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[500px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Calculator className="w-4 h-4 text-cyan-500" /> Result Engine
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
                  {activeTab === "span" ? "Difference Mode" : "Math Mode"}
                </span>
              </div>

              {/* --- RESULTS: SPAN MODE --- */}
              {activeTab === "span" && spanCalc && (
                <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95">
                  
                  {/* Visual Wrap Alert */}
                  {spanCalc.isOvernight && (
                    <div className="mb-4 bg-violet-100 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                      <Moon className="w-4 h-4" /> Cross-Midnight Shift Detected (+1 Day)
                    </div>
                  )}

                  <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-3xl shadow-sm mb-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute -left-6 -bottom-6 opacity-5">
                      <Clock className="w-40 h-40 text-cyan-500" />
                    </div>
                    
                    <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4 z-10">Total Duration</span>
                    
                    <div className="flex items-center justify-center gap-4 z-10">
                      <div className="text-center">
                        <span className="text-6xl sm:text-7xl font-black text-cyan-600 dark:text-cyan-400 tracking-tighter tabular-nums leading-none">
                          {spanCalc.diffHours}
                        </span>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hours</span>
                      </div>
                      <span className="text-4xl font-black text-slate-300 pb-4">:</span>
                      <div className="text-center">
                        <span className="text-6xl sm:text-7xl font-black text-cyan-600 dark:text-cyan-400 tracking-tighter tabular-nums leading-none">
                          {spanCalc.diffMins.toString().padStart(2, '0')}
                        </span>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Minutes</span>
                      </div>
                    </div>
                  </div>

                  {/* Payroll Decimal Breakdown */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> Payroll / Billing
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Decimal Hours Conversion</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black tabular-nums text-slate-800 dark:text-slate-100">{spanCalc.decimalHours}</span>
                      <span className="text-xs font-bold text-slate-400 ml-1">hrs</span>
                    </div>
                  </div>

                </div>
              )}

              {/* --- RESULTS: MATH MODE --- */}
              {activeTab === "math" && mathCalc && (
                <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95">
                  
                  {/* Visual Wrap Alert */}
                  {mathCalc.dayShift !== 0 && (
                    <div className={`mb-4 border p-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${mathCalc.dayShift > 0 ? 'bg-violet-100 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400' : 'bg-rose-100 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'}`}>
                      {mathCalc.dayShift > 0 ? <ArrowRight className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                      Shifted {mathCalc.dayShift > 0 ? `+${mathCalc.dayShift} Day(s) Ahead` : `${mathCalc.dayShift} Day(s) Back`}
                    </div>
                  )}

                  <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-10 px-4 rounded-3xl shadow-sm mb-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-5">
                      <Timer className="w-40 h-40 text-violet-500" />
                    </div>
                    
                    <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4 z-10">Calculated Clock Time</span>
                    
                    <div className="z-10">
                      <span className="text-6xl sm:text-7xl font-black text-violet-600 dark:text-violet-400 tracking-tighter leading-none">
                        {mathCalc.resultTime.split(' ')[0]}
                      </span>
                      <span className="text-3xl font-black text-slate-400 ml-2">
                        {mathCalc.resultTime.split(' ')[1]}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-800 dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between text-white shadow-md">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Math Applied
                     </span>
                     <span className="text-sm font-black tabular-nums tracking-widest">
                       {mathAction === 'add' ? '+' : '-'} {mathHours || 0}H : {mathMins || 0}M : {mathSecs || 0}S
                     </span>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
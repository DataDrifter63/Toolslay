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

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

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

  const spanCalc = useMemo(() => {
    if (!startTime || !endTime) return null;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let startMs = (startH * 60 + startM) * 60000;
    let endMs = (endH * 60 + endM) * 60000;

    let isOvernight = false;
    if (endMs < startMs) {
      endMs += 24 * 60 * 60 * 1000;
      isOvernight = true;
    }

    const diffMs = endMs - startMs;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const decimalHours = (diffMs / 3600000).toFixed(2);

    return { diffHours, diffMins, isOvernight, decimalHours };
  }, [startTime, endTime]);

  const mathCalc = useMemo(() => {
    if (!baseTime) return null;

    const [baseH, baseM] = baseTime.split(':').map(Number);
    const h = parseInt(mathHours) || 0;
    const m = parseInt(mathMins) || 0;
    const s = parseInt(mathSecs) || 0;

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
    let dayShift = 0;
    
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

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-4 py-3 sm:py-3.5 text-base font-bold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Timer className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Chrono Math Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Time Span & Payroll Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start min-w-0">
        
        {/* CONTROLS & INPUTS */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* FIXED Mode Switcher */}
            <div className="flex bg-paper rounded-xl p-1 border border-line min-w-0 gap-1">
              <button 
                type="button"
                onClick={() => setActiveTab("span")}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 sm:py-3 text-[9px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest rounded-lg transition-all min-w-0 ${activeTab === "span" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" /> 
                <span className="truncate">Time Difference</span>
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("math")}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 sm:py-3 text-[9px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest rounded-lg transition-all min-w-0 ${activeTab === "math" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" /> 
                <span className="truncate">Time Math (+/-)</span>
              </button>
            </div>

            <hr className="border-line" />

            {/* TAB 1: TIME SPAN */}
            {activeTab === "span" && (
              <div className="space-y-5 animate-in fade-in min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                  <div className="min-w-0">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                      <Sun className="w-3.5 h-3.5 text-brand shrink-0" /> Start Time
                    </label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={baseInputStyle} />
                  </div>
                  <div className="min-w-0">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                      <Moon className="w-3.5 h-3.5 text-brand shrink-0" /> End Time
                    </label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={baseInputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TIME MATH */}
            {activeTab === "math" && (
              <div className="space-y-5 animate-in fade-in min-w-0">
                <div className="min-w-0">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                    <Clock className="w-3.5 h-3.5 text-brand shrink-0" /> Base Clock Time
                  </label>
                  <input type="time" value={baseTime} onChange={(e) => setBaseTime(e.target.value)} className={`${baseInputStyle} sm:max-w-[200px]`} />
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-paper rounded-xl border border-line min-w-0">
                  <button
                    type="button"
                    onClick={() => setMathAction("add")}
                    className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-widest transition-colors ${mathAction === "add" ? 'bg-teal/10 text-teal border border-teal/30' : 'text-muted hover:text-ink'}`}
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" /> Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setMathAction("sub")}
                    className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-widest transition-colors ${mathAction === "sub" ? 'bg-[#fb7185]/10 text-[#e11d48] border border-[#fb7185]/30' : 'text-muted hover:text-ink'}`}
                  >
                    <Minus className="w-3.5 h-3.5 shrink-0" /> Subtract
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-[9px] font-black text-muted uppercase tracking-widest mb-1.5 truncate text-center">Hours</label>
                    <input type="text" value={mathHours} onChange={(e) => handleMathInput(setMathHours, e.target.value)} placeholder="0" className={`${baseInputStyle} text-center`} />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-[9px] font-black text-muted uppercase tracking-widest mb-1.5 truncate text-center">Minutes</label>
                    <input type="text" value={mathMins} onChange={(e) => handleMathInput(setMathMins, e.target.value)} placeholder="0" className={`${baseInputStyle} text-center`} />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-[9px] font-black text-muted uppercase tracking-widest mb-1.5 truncate text-center">Seconds</label>
                    <input type="text" value={mathSecs} onChange={(e) => handleMathInput(setMathSecs, e.target.value)} placeholder="0" className={`${baseInputStyle} text-center`} />
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* DASHBOARD RECEIPT */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[440px] min-w-0">
            
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Calculator className="w-4 h-4 text-brand shrink-0" /> Result Engine
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                {activeTab === "span" ? "Difference" : "Math"}
              </span>
            </div>

            {/* SPAN MODE RESULTS */}
            {activeTab === "span" && spanCalc && (
              <div className="flex-1 flex flex-col animate-in fade-in min-w-0">
                {spanCalc.isOvernight && (
                  <div className="mb-4 bg-brand/10 border border-brand/30 p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-brand shrink-0">
                    <Moon className="w-3.5 h-3.5 shrink-0" /> Cross-Midnight Shift (+1 Day)
                  </div>
                )}

                <div className="text-center bg-paper border border-line py-7 px-4 rounded-xl shadow-sm mb-4 relative overflow-hidden min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-3 truncate">Total Duration</span>
                  <div className="flex items-baseline justify-center gap-2 sm:gap-3 min-w-0">
                    <div className="text-center min-w-0">
                      <span className="text-5xl sm:text-6xl font-black text-brand tracking-tight tabular-nums leading-none">
                        {spanCalc.diffHours}
                      </span>
                      <span className="block text-[9px] font-bold text-muted uppercase tracking-wider mt-1">Hours</span>
                    </div>
                    <span className="text-2xl font-black text-muted pb-4">:</span>
                    <div className="text-center min-w-0">
                      <span className="text-5xl sm:text-6xl font-black text-brand tracking-tight tabular-nums leading-none">
                        {spanCalc.diffMins.toString().padStart(2, '0')}
                      </span>
                      <span className="block text-[9px] font-bold text-muted uppercase tracking-wider mt-1">Minutes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-paper p-4 rounded-xl border border-line shadow-sm flex items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1 truncate">
                      <Briefcase className="w-3 h-3 text-brand shrink-0" /> Payroll / Billing
                    </span>
                    <span className="text-[10px] font-semibold text-muted block truncate">Decimal Hours</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl sm:text-2xl font-black tabular-nums text-ink">{spanCalc.decimalHours}</span>
                    <span className="text-xs font-bold text-muted ml-1">hrs</span>
                  </div>
                </div>
              </div>
            )}

            {/* MATH MODE RESULTS */}
            {activeTab === "math" && mathCalc && (
              <div className="flex-1 flex flex-col animate-in fade-in min-w-0">
                {mathCalc.dayShift !== 0 && (
                  <div className={`mb-4 border p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider shrink-0 ${mathCalc.dayShift > 0 ? 'bg-brand/10 border-brand/30 text-brand' : 'bg-[#fb7185]/10 border-[#fb7185]/30 text-[#e11d48]'}`}>
                    {mathCalc.dayShift > 0 ? <ArrowRight className="w-3.5 h-3.5 shrink-0" /> : <RotateCcw className="w-3.5 h-3.5 shrink-0" />}
                    Shifted {mathCalc.dayShift > 0 ? `+${mathCalc.dayShift} Day(s) Ahead` : `${mathCalc.dayShift} Day(s) Back`}
                  </div>
                )}

                <div className="text-center bg-paper border border-line py-8 px-4 rounded-xl shadow-sm mb-4 relative overflow-hidden min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 truncate">Calculated Clock Time</span>
                  <div className="min-w-0">
                    <span className="text-5xl sm:text-6xl font-black text-brand tracking-tight tabular-nums leading-none">
                      {mathCalc.resultTime.split(' ')[0]}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-muted ml-2">
                      {mathCalc.resultTime.split(' ')}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-xl flex items-center justify-between shadow-sm min-w-0">
                   <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0" /> Math Applied
                   </span>
                   <span className="text-xs sm:text-sm font-black tabular-nums tracking-wider shrink-0">
                     {mathAction === 'add' ? '+' : '-'} {mathHours || 0}H : {mathMins || 0}M : {mathSecs || 0}S
                   </span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
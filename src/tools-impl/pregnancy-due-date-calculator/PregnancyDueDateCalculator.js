"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CalendarHeart, Baby, Activity, Heart, 
  Stethoscope, Sparkles, Clock, AlertCircle,
  Info, CalendarDays
} from "lucide-react";

// Calculation Methods
const METHODS = [
  { id: "lmp", label: "First Day of Last Period", short: "LMP" },
  { id: "conception", label: "Exact Conception Date", short: "Conception" },
  { id: "ivf5", label: "IVF 5-Day Transfer", short: "IVF (5-Day)" },
  { id: "ivf3", label: "IVF 3-Day Transfer", short: "IVF (3-Day)" }
];

export default function PregnancyDueDateCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Inputs
  const [method, setMethod] = useState(METHODS[0]);
  const [baseDate, setBaseDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);

  useEffect(() => {
    setIsMounted(true);
    // Set default date to today minus 4 weeks to show a good demo state
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 28);
    setBaseDate(defaultDate.toISOString().split('T')[0]);
  }, []);

  // Helper: Safely add days to a date string
  const addDays = (dateStr, days) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date;
  };

  // Helper: Format Date nicely
  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-US", { 
      weekday: 'short', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Core Obstetrical Math Engine
  const calculations = useMemo(() => {
    if (!baseDate) return { isEmpty: true };

    let lmpDate = new Date(baseDate);
    
    // 1. Normalize to LMP based on selected method
    if (method.id === "conception") {
      lmpDate = addDays(baseDate, -14); // Conception is generally 2 weeks after LMP
    } else if (method.id === "ivf5") {
      lmpDate = addDays(baseDate, -19); // 5-day embryo + 14 days standard ovulation
    } else if (method.id === "ivf3") {
      lmpDate = addDays(baseDate, -17); // 3-day embryo + 14 days standard ovulation
    } else if (method.id === "lmp") {
      // Adjust for non-28-day cycles (Ovulation happens 14 days BEFORE next period)
      // Cycle difference shifts the ovulation date, and therefore the due date
      const cycleDiff = cycleLength - 28;
      lmpDate = addDays(baseDate, cycleDiff);
    }

    // 2. Calculate Key Milestones (Based on LMP)
    const dueDate = addDays(lmpDate, 280); // 40 Weeks
    
    const milestones = [
      { 
        id: "tri1", title: "First Trimester Ends", week: 13, 
        date: addDays(lmpDate, 91), icon: Heart, color: "text-rose-500", bg: "bg-rose-100" 
      },
      { 
        id: "tri2", title: "Second Trimester Starts", week: 14, 
        date: addDays(lmpDate, 98), icon: Baby, color: "text-purple-500", bg: "bg-purple-100" 
      },
      { 
        id: "anatomy", title: "Anatomy Ultrasound Window", week: 20, 
        date: addDays(lmpDate, 140), icon: Stethoscope, color: "text-cyan-500", bg: "bg-cyan-100" 
      },
      { 
        id: "tri3", title: "Third Trimester Starts", week: 28, 
        date: addDays(lmpDate, 196), icon: Activity, color: "text-amber-500", bg: "bg-amber-100" 
      },
      { 
        id: "term", title: "Early Term (Safe to deliver)", week: 37, 
        date: addDays(lmpDate, 259), icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-100" 
      }
    ];

    // 3. Current Progress Tracker
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate day counts
    const lmpNorm = new Date(lmpDate);
    lmpNorm.setHours(0, 0, 0, 0);
    
    const diffTime = today - lmpNorm;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let currentWeeks = 0;
    let currentDays = 0;
    let isPregnant = false;
    let progressPercent = 0;

    if (diffDays >= 0 && diffDays <= 300) { // 300 to allow going slightly overdue
      currentWeeks = Math.floor(diffDays / 7);
      currentDays = diffDays % 7;
      isPregnant = true;
      progressPercent = Math.min(100, (diffDays / 280) * 100);
    }

    return {
      dueDate,
      dueDateFormatted: formatDate(dueDate),
      milestones,
      currentWeeks,
      currentDays,
      isPregnant,
      progressPercent,
      isEmpty: false
    };
  }, [baseDate, method, cycleLength]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-100 to-transparent dark:from-rose-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-rose-50 dark:bg-rose-900/30 p-3.5 rounded-2xl">
            <CalendarHeart className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Pregnancy Due Date Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Trimester Timeline & Clinical Milestones
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Calculation Method Selection */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-slate-400" /> Calculation Method
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {METHODS.map((m) => {
                  const isActive = method.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                        isActive
                          ? "bg-rose-50 dark:bg-rose-900/20 border-rose-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-rose-200"
                      }`}
                    >
                      <span className={`block text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {m.short}
                      </span>
                      <span className="block text-xs font-medium text-slate-500">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-slate-400" /> 
                {method.id === "lmp" ? "First Day of Last Period" : 
                 method.id === "conception" ? "Date of Conception" : "Transfer Date"}
              </label>
              <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-50 dark:focus-within:ring-rose-900/20 transition-all overflow-hidden px-4 py-1">
                <input
                  type="date" 
                  value={baseDate} 
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full bg-transparent py-4 text-lg font-black text-slate-800 dark:text-slate-100 outline-none date-picker-premium"
                />
              </div>
            </div>

            {/* Cycle Length (Only for LMP) */}
            {method.id === "lmp" && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> Average Cycle Length
                  </label>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/50">
                    {cycleLength} Days
                  </span>
                </div>
                
                <div className="px-1">
                  <input
                    type="range" min="20" max="45" step="1"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(parseInt(e.target.value))}
                    className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-900/20"
                  />
                  <div className="flex justify-between text-[10px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                    <span>20</span>
                    <span className="text-rose-400">28 (Average)</span>
                    <span>45</span>
                  </div>
                </div>
              </div>
            )}

            {/* Educational Disclaimer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start gap-3 border border-slate-100 dark:border-slate-700">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                This tool provides estimates based on standard clinical formulas (Naegele's rule). Only about 5% of babies are born on their exact due date. Always consult your healthcare provider for medical advice and official dating ultrasounds.
              </p>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULTS DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              {!calculations.isEmpty ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                      <Baby className="w-3.5 h-3.5 text-rose-500" /> Estimated Due Date
                    </span>
                  </div>
                  
                  {/* Big Due Date Display */}
                  <div className="text-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight block text-rose-600 dark:text-rose-400">
                      {calculations.dueDateFormatted}
                    </span>
                  </div>

                  {/* Current Progress (Only if currently pregnant) */}
                  {calculations.isPregnant && (
                    <div className="mb-8 animate-in zoom-in-95">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Progress</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                          {calculations.currentWeeks}w {calculations.currentDays}d
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden">
                        <div 
                          style={{ width: `${calculations.progressPercent}%` }} 
                          className="h-full bg-rose-500 transition-all duration-1000"
                        ></div>
                      </div>
                      <div className="flex justify-between text-[9px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                        <span>Week 0</span>
                        <span>Week 40</span>
                      </div>
                    </div>
                  )}

                  {/* Milestone Timeline */}
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-slate-400" /> Maternity Timeline
                    </h4>
                    
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-6 pb-4">
                      {calculations.milestones.map((ms) => {
                        const Icon = ms.icon;
                        const isPast = calculations.isPregnant && ms.date < new Date();
                        
                        return (
                          <div key={ms.id} className="relative pl-6">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center ${isPast ? 'bg-slate-200 dark:bg-slate-700' : ms.bg}`}>
                              <Icon className={`w-3.5 h-3.5 ${isPast ? 'text-slate-400' : ms.color}`} />
                            </div>
                            
                            {/* Content */}
                            <div className={`transition-opacity ${isPast ? 'opacity-60' : 'opacity-100'}`}>
                              <span className="block text-sm font-black text-slate-800 dark:text-slate-100">
                                {formatDate(ms.date)}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${ms.color}`}>
                                  Week {ms.week}
                                </span>
                                <span className="text-[10px] font-medium text-slate-500">
                                  • {ms.title}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                  <CalendarHeart className="w-12 h-12 text-slate-400" />
                  <p className="text-sm font-bold text-slate-500">Enter a date to calculate your timeline</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
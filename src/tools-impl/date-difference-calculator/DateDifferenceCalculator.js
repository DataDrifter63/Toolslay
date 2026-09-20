"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays, CalendarRange, Clock, 
  Briefcase, Coffee, ArrowRight, History, 
  FastForward, ToggleLeft, ToggleRight
} from "lucide-react";

export default function DateDifferenceCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeEndDate, setIncludeEndDate] = useState(false);

  // Initialize with today and tomorrow
  useEffect(() => {
    setIsMounted(true);
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  // --- CORE DATE MATH ENGINE ---
  const calculations = useMemo(() => {
    if (!startDate || !endDate) return null;

    let start = new Date(startDate);
    let end = new Date(endDate);

    // Direction check
    const isFuture = end >= start;
    if (!isFuture) {
      // Swap dates for calculation if end is before start, but track direction
      const temp = start;
      start = end;
      end = temp;
    }

    // Add 1 day if includeEndDate is true
    const adjustedEnd = new Date(end);
    if (includeEndDate) {
      adjustedEnd.setDate(adjustedEnd.getDate() + 1);
    }

    // 1. Total Days (Absolute)
    const timeDiff = adjustedEnd.getTime() - start.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));

    // 2. Working Days vs Weekends
    let workingDays = 0;
    let weekendDays = 0;
    let current = new Date(start);
    
    while (current < adjustedEnd) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
      } else {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    // 3. Years, Months, Days (Precise Breakdown)
    let y = adjustedEnd.getFullYear() - start.getFullYear();
    let m = adjustedEnd.getMonth() - start.getMonth();
    let d = adjustedEnd.getDate() - start.getDate();

    if (d < 0) {
      m -= 1;
      // Get days in previous month
      const prevMonth = new Date(adjustedEnd.getFullYear(), adjustedEnd.getMonth(), 0);
      d += prevMonth.getDate();
    }
    if (m < 0) {
      y -= 1;
      m += 12;
    }

    return {
      isFuture,
      totalDays,
      workingDays,
      weekendDays,
      breakdown: { years: y, months: m, days: d },
      totalWeeks: (totalDays / 7).toFixed(1),
      totalMonths: (totalDays / 30.436875).toFixed(1),
      totalHours: (totalDays * 24).toLocaleString(),
      totalMinutes: (totalDays * 24 * 60).toLocaleString(),
    };
  }, [startDate, endDate, includeEndDate]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-100 via-emerald-50 to-transparent dark:from-teal-900/30 dark:via-emerald-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3.5 rounded-2xl shadow-md">
            <CalendarRange className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Date Analytics Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Precision Date & Working Days Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT CONFIGURATION ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Start Date */}
              <div className="w-full flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <CalendarDays className="w-3.5 h-3.5 text-teal-500" /> Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-sm font-black text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 transition-colors uppercase tracking-wider"
                  />
                </div>
              </div>

              <div className="shrink-0 mt-6 hidden sm:block">
                <ArrowRight className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              </div>

              {/* End Date */}
              <div className="w-full flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <CalendarRange className="w-3.5 h-3.5 text-emerald-500" /> End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-sm font-black text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-colors uppercase tracking-wider"
                  />
                </div>
              </div>
            </div>

            {/* Config Toggles */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="block text-sm font-black text-slate-800 dark:text-slate-100">Include End Date</span>
                <span className="text-[10px] font-bold text-slate-500 leading-tight block mt-0.5 max-w-[200px]">
                  Add 1 day to include the final date in the total count (e.g., for event durations).
                </span>
              </div>
              <button 
                onClick={() => setIncludeEndDate(!includeEndDate)}
                className={`p-1 rounded-full transition-colors ${includeEndDate ? 'text-teal-500' : 'text-slate-400'}`}
              >
                {includeEndDate ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
              </button>
            </div>

            {/* Time Direction Alert */}
            {calculations && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${calculations.isFuture ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'}`}>
                {calculations.isFuture ? (
                  <FastForward className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                ) : (
                  <History className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`block text-xs font-black uppercase tracking-widest ${calculations.isFuture ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {calculations.isFuture ? 'Future Timeline' : 'Past Timeline'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {calculations.isFuture 
                      ? 'The end date occurs after the start date.' 
                      : 'The end date occurs before the start date. Calculation represents time elapsed.'}
                  </span>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD ORACLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[550px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-y-auto custom-scrollbar">
              
              {!calculations ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 p-6 text-center">
                  <CalendarDays className="w-16 h-16 text-slate-400 mb-4" />
                  <span className="text-sm font-black uppercase tracking-widest text-slate-500">Select Both Dates</span>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col">
                  
                  {/* Exact Breakdown Hero */}
                  <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm mb-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-500 mb-4 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> Exact Difference
                    </span>
                    
                    <div className="flex items-baseline justify-center gap-2 sm:gap-4 flex-wrap">
                      {calculations.breakdown.years > 0 && (
                        <div className="flex flex-col items-center">
                          <span className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">{calculations.breakdown.years}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Years</span>
                        </div>
                      )}
                      {(calculations.breakdown.months > 0 || calculations.breakdown.years > 0) && (
                        <div className="flex flex-col items-center">
                          <span className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">{calculations.breakdown.months}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Months</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center">
                        <span className="text-4xl sm:text-5xl font-black text-teal-600 dark:text-teal-400 tracking-tighter tabular-nums">{calculations.breakdown.days}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Absolute Total Bar */}
                  <div className="bg-slate-800 dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between text-white shadow-md mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total Absolute Days</span>
                    <span className="text-2xl font-black tabular-nums tracking-tighter">
                      {calculations.totalDays.toLocaleString()} <span className="text-xs font-bold text-slate-400 uppercase">Days</span>
                    </span>
                  </div>

                  {/* Business Data Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Working Days</span>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
                        {calculations.workingDays.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1 flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5" /> Weekend Days</span>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
                        {calculations.weekendDays.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Deep Analytics Data */}
                  <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                      Alternative Equivalents
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">In Months</span>
                        <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.totalMonths}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">In Weeks</span>
                        <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.totalWeeks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">In Hours</span>
                        <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.totalHours}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">In Minutes</span>
                        <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.totalMinutes}</span>
                      </div>
                    </div>
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
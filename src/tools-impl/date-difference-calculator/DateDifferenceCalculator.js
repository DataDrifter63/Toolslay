"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays, CalendarRange, Clock, 
  Briefcase, Coffee, ArrowRight, History, 
  FastForward, ToggleLeft, ToggleRight
} from "lucide-react";

export default function DateDifferenceCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeEndDate, setIncludeEndDate] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  const calculations = useMemo(() => {
    if (!startDate || !endDate) return null;
    let start = new Date(startDate);
    let end = new Date(endDate);
    const isFuture = end >= start;
    if (!isFuture) {
      const temp = start;
      start = end;
      end = temp;
    }
    const adjustedEnd = new Date(end);
    if (includeEndDate) {
      adjustedEnd.setDate(adjustedEnd.getDate() + 1);
    }
    const timeDiff = adjustedEnd.getTime() - start.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));

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

    let y = adjustedEnd.getFullYear() - start.getFullYear();
    let m = adjustedEnd.getMonth() - start.getMonth();
    let d = adjustedEnd.getDate() - start.getDate();

    if (d < 0) {
      m -= 1;
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

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-4 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all uppercase tracking-wider";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Date Analytics Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Precision Date & Working Days Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start min-w-0">
        
        {/* INPUT CONFIGURATION */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            <div className="flex flex-col sm:flex-row items-center gap-4 min-w-0">
              <div className="w-full flex-1 min-w-0">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                  <CalendarDays className="w-3.5 h-3.5 text-brand shrink-0" /> Start Date
                </label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={baseInputStyle} />
              </div>
              <div className="shrink-0 hidden sm:block text-muted">
                <ArrowRight className="w-5 h-5 mt-6" />
              </div>
              <div className="w-full flex-1 min-w-0">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                  <CalendarRange className="w-3.5 h-3.5 text-brand shrink-0" /> End Date
                </label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={baseInputStyle} />
              </div>
            </div>

            {/* Config Toggles */}
            <div className="p-4 sm:p-5 rounded-xl bg-paper border border-line flex items-center justify-between gap-4 min-w-0">
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-ink truncate">Include End Date</span>
                <span className="text-[10px] font-semibold text-muted leading-tight block mt-0.5">
                  Add 1 day to include final date in total count.
                </span>
              </div>
              <button type="button" onClick={() => setIncludeEndDate(!includeEndDate)} className="text-brand shrink-0">
                {includeEndDate ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-muted" />}
              </button>
            </div>

            {/* Time Direction Alert */}
            {calculations && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 min-w-0 ${calculations.isFuture ? 'bg-brand/5 border-brand/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                {calculations.isFuture ? <FastForward className="w-5 h-5 text-brand shrink-0 mt-0.5" /> : <History className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <span className={`block text-xs font-black uppercase tracking-wider truncate ${calculations.isFuture ? 'text-brand' : 'text-amber-500'}`}>
                    {calculations.isFuture ? 'Future Timeline' : 'Past Timeline'}
                  </span>
                  <span className="text-[11px] font-medium text-muted block truncate">
                    {calculations.isFuture ? 'End date occurs after start date.' : 'End date occurs before start date.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DASHBOARD ORACLE */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[480px] min-w-0">
            {!calculations ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-50 p-6 text-center">
                <CalendarDays className="w-12 h-12 text-muted mb-3" />
                <span className="text-xs font-black uppercase tracking-widest text-muted">Select Both Dates</span>
              </div>
            ) : (
              <div className="space-y-5 min-w-0">
                {/* Exact Breakdown Hero */}
                <div className="text-center bg-paper border border-line p-5 rounded-xl shadow-sm min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand mb-3 bg-brand/10 px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> Exact Difference
                  </span>
                  <div className="flex items-baseline justify-center gap-3 sm:gap-5 flex-wrap min-w-0">
                    {calculations.breakdown.years > 0 && (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl sm:text-4xl font-black text-ink tracking-tight tabular-nums">{calculations.breakdown.years}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Years</span>
                      </div>
                    )}
                    {(calculations.breakdown.months > 0 || calculations.breakdown.years > 0) && (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl sm:text-4xl font-black text-ink tracking-tight tabular-nums">{calculations.breakdown.months}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Months</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl font-black text-brand tracking-tight tabular-nums">{calculations.breakdown.days}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Days</span>
                    </div>
                  </div>
                </div>

                {/* Absolute Total Bar */}
                <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-xl flex items-center justify-between shadow-sm min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Total Absolute Days</span>
                  <span className="text-xl sm:text-2xl font-black tabular-nums tracking-tight">
                    {calculations.totalDays.toLocaleString()} <span className="text-[10px] font-bold uppercase text-slate-400">Days</span>
                  </span>
                </div>

                {/* Business Data Grid */}
                <div className="grid grid-cols-2 gap-3 min-w-0">
                  <div className="bg-paper p-3.5 rounded-xl border border-line flex flex-col justify-center min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand mb-1 flex items-center gap-1 truncate"><Briefcase className="w-3 h-3 shrink-0" /> Working Days</span>
                    <span className="text-lg font-black text-ink tabular-nums">{calculations.workingDays.toLocaleString()}</span>
                  </div>
                  <div className="bg-paper p-3.5 rounded-xl border border-line flex flex-col justify-center min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 mb-1 flex items-center gap-1 truncate"><Coffee className="w-3 h-3 shrink-0" /> Weekend Days</span>
                    <span className="text-lg font-black text-ink tabular-nums">{calculations.weekendDays.toLocaleString()}</span>
                  </div>
                </div>

                {/* Deep Analytics Data */}
                <div className="bg-paper border border-line rounded-xl p-4 shadow-sm min-w-0">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-muted mb-3 border-b border-line pb-2">Alternative Equivalents</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center"><span className="text-muted font-semibold">In Months</span><span className="font-black text-ink tabular-nums">{calculations.totalMonths}</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted font-semibold">In Weeks</span><span className="font-black text-ink tabular-nums">{calculations.totalWeeks}</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted font-semibold">In Hours</span><span className="font-black text-ink tabular-nums">{calculations.totalHours}</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted font-semibold">In Minutes</span><span className="font-black text-ink tabular-nums">{calculations.totalMinutes}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
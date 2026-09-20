"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase, Calendar, CalendarOff, Settings, 
  Plus, X, Calculator, AlertCircle, 
  ToggleLeft, ToggleRight, CheckCircle2,
  CalendarCheck2, PieChart
} from "lucide-react";

// Helper for local date string YYYY-MM-DD to prevent timezone shifts
const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const WEEKDAYS = [
  { id: 1, label: "Mon", full: "Monday" },
  { id: 2, label: "Tue", full: "Tuesday" },
  { id: 3, label: "Wed", full: "Wednesday" },
  { id: 4, label: "Thu", full: "Thursday" },
  { id: 5, label: "Fri", full: "Friday" },
  { id: 6, label: "Sat", full: "Saturday" },
  { id: 0, label: "Sun", full: "Sunday" }
];

export default function WorkDaysCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeEndDate, setIncludeEndDate] = useState(true);
  
  // Array of day IDs that are considered weekends (default Sat:6, Sun:0)
  const [weekendDays, setWeekendDays] = useState([6, 0]); 
  
  // Custom Holidays
  const [holidays, setHolidays] = useState([]);
  const [holidayInput, setHolidayInput] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    setStartDate(getLocalDateString(today));
    setEndDate(getLocalDateString(nextMonth));
  }, []);

  const toggleWeekend = (id) => {
    setWeekendDays(prev => 
      prev.includes(id) ? prev.filter(day => day !== id) : [...prev, id]
    );
  };

  const addHoliday = () => {
    if (!holidayInput) return;
    if (!holidays.includes(holidayInput)) {
      // Sort holidays chronologically
      const newHolidays = [...holidays, holidayInput].sort((a, b) => new Date(a) - new Date(b));
      setHolidays(newHolidays);
    }
    setHolidayInput("");
  };

  const removeHoliday = (dateStr) => {
    setHolidays(prev => prev.filter(h => h !== dateStr));
  };

  // --- CORE ENGINE ---
  const calculations = useMemo(() => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset times to midnight for accurate counting
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const isInvalid = start > end;
    
    let totalDays = 0;
    let weekendCount = 0;
    let holidayCount = 0;
    let businessDays = 0;

    if (!isInvalid) {
      let current = new Date(start);
      let limit = new Date(end);
      
      if (includeEndDate) {
        limit.setDate(limit.getDate() + 1);
      }

      while (current < limit) {
        totalDays++;
        const dayOfWeek = current.getDay();
        const dateString = getLocalDateString(current);
        
        const isWeekend = weekendDays.includes(dayOfWeek);
        const isHoliday = holidays.includes(dateString);

        if (isWeekend) {
          weekendCount++;
        } else if (isHoliday) {
          holidayCount++; // Only count holiday if it's NOT already a weekend
        } else {
          businessDays++;
        }
        
        current.setDate(current.getDate() + 1);
      }
    }

    // For Progress Bar Visuals
    const pctBusiness = totalDays > 0 ? (businessDays / totalDays) * 100 : 0;
    const pctWeekend = totalDays > 0 ? (weekendCount / totalDays) * 100 : 0;
    const pctHoliday = totalDays > 0 ? (holidayCount / totalDays) * 100 : 0;

    return {
      isInvalid,
      totalDays,
      weekendCount,
      holidayCount,
      businessDays,
      pctBusiness,
      pctWeekend,
      pctHoliday
    };
  }, [startDate, endDate, includeEndDate, weekendDays, holidays]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100 via-violet-50 to-transparent dark:from-indigo-900/30 dark:via-violet-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-3.5 rounded-2xl shadow-md">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Business Days Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Enterprise-Grade SLA & Payroll Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Start Date
                </label>
                <input
                  type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-black text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-colors uppercase tracking-wider"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <CalendarCheck2 className="w-3.5 h-3.5 text-violet-500" /> End Date
                </label>
                <input
                  type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-black text-slate-800 dark:text-slate-100 outline-none focus:border-violet-500 transition-colors uppercase tracking-wider"
                />
              </div>
            </div>

            {/* End Date Inclusion Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">Include End Date</span>
                <span className="text-[10px] font-medium text-slate-500 block mt-0.5">Count the final day as a working day.</span>
              </div>
              <button 
                onClick={() => setIncludeEndDate(!includeEndDate)}
                className={`transition-colors ${includeEndDate ? 'text-indigo-500' : 'text-slate-400'}`}
              >
                {includeEndDate ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Global Weekend Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" /> Define Weekends
                </label>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Global Support</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map(day => {
                  const isWeekend = weekendDays.includes(day.id);
                  return (
                    <button
                      key={day.id} onClick={() => toggleWeekend(day.id)}
                      className={`flex-1 min-w-[50px] py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg border transition-all ${
                        isWeekend 
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-200 dark:border-rose-800/50 shadow-sm' 
                        : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 3. Custom Holidays Manager */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <CalendarOff className="w-3.5 h-3.5 text-rose-500" /> Exclude Public Holidays
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="date" value={holidayInput} onChange={(e) => setHolidayInput(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-rose-400 uppercase tracking-wider"
                />
                <button
                  onClick={addHoliday} disabled={!holidayInput}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Holiday Tags */}
              <div className="flex flex-wrap gap-2">
                {holidays.length === 0 ? (
                  <span className="text-xs font-medium text-slate-400 italic">No custom holidays added.</span>
                ) : (
                  holidays.map(h => (
                    <div key={h} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest shadow-sm">
                      {new Date(h).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      <button onClick={() => removeHoliday(h)} className="hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD RECEIPT ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[550px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Calculator className="w-4 h-4 text-indigo-500" /> Calculation Results
                </span>
              </div>

              {calculations?.isInvalid ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-6">
                  <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
                  <span className="text-sm font-black uppercase tracking-widest text-rose-600">Invalid Date Range</span>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">End date must be on or after start date.</p>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col">
                  
                  {/* Hero Number */}
                  <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-8 px-4 rounded-2xl shadow-sm mb-6 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                      <Briefcase className="w-32 h-32 text-indigo-500" />
                    </div>
                    
                    <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Net Business Days</span>
                    <div className="flex items-end justify-center gap-2">
                      <span className="text-7xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter tabular-nums leading-none">
                        {calculations.businessDays.toLocaleString()}
                      </span>
                      <span className="text-xl font-bold text-slate-400 mb-1">Days</span>
                    </div>

                    {/* Progress Breakdown Bar */}
                    {calculations.totalDays > 0 && (
                      <div className="w-4/5 mx-auto mt-8">
                        <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          {calculations.pctBusiness > 0 && <div style={{ width: `${calculations.pctBusiness}%` }} className="bg-indigo-500"></div>}
                          {calculations.pctWeekend > 0 && <div style={{ width: `${calculations.pctWeekend}%` }} className="bg-slate-300 dark:bg-slate-600"></div>}
                          {calculations.pctHoliday > 0 && <div style={{ width: `${calculations.pctHoliday}%` }} className="bg-rose-400"></div>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detailed Receipt Breakdown */}
                  <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5" /> Span Breakdown
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Total Span */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-200"></span> Total Span
                        </span>
                        <span className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{calculations.totalDays}</span>
                      </div>
                      
                      {/* Weekends Minus */}
                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="text-xs font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> Excluded Weekends
                        </span>
                        <span className="text-sm font-black tabular-nums">− {calculations.weekendCount}</span>
                      </div>
                      
                      {/* Holidays Minus */}
                      <div className="flex justify-between items-center text-rose-500">
                        <span className="text-xs font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-400"></span> Public Holidays
                        </span>
                        <span className="text-sm font-black tabular-nums">− {calculations.holidayCount}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Working Days
                       </span>
                       <span className="text-lg font-black tabular-nums text-indigo-600 dark:text-indigo-400">{calculations.businessDays}</span>
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
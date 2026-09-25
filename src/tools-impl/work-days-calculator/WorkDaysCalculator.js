"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase, Calendar, CalendarOff, Settings, 
  Plus, X, Calculator, AlertCircle, 
  ToggleLeft, ToggleRight, CheckCircle2,
  CalendarCheck2, PieChart
} from "lucide-react";

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
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeEndDate, setIncludeEndDate] = useState(true);
  const [weekendDays, setWeekendDays] = useState([6, 0]); 
  
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
      const newHolidays = [...holidays, holidayInput].sort((a, b) => new Date(a) - new Date(b));
      setHolidays(newHolidays);
    }
    setHolidayInput("");
  };

  const removeHoliday = (dateStr) => {
    setHolidays(prev => prev.filter(h => h !== dateStr));
  };

  const calculations = useMemo(() => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
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
          holidayCount++;
        } else {
          businessDays++;
        }
        
        current.setDate(current.getDate() + 1);
      }
    }

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

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all uppercase tracking-wider";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Business Days Calculator
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Enterprise-Grade SLA & Payroll Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start min-w-0">
        
        {/* INPUT CONFIGURATION */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="min-w-0">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                  <Calendar className="w-3.5 h-3.5 text-brand shrink-0" /> Start Date
                </label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={baseInputStyle} />
              </div>
              <div className="min-w-0">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 truncate">
                  <CalendarCheck2 className="w-3.5 h-3.5 text-brand shrink-0" /> End Date
                </label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={baseInputStyle} />
              </div>
            </div>

            {/* End Date Inclusion Toggle */}
            <div className="p-4 rounded-xl bg-paper border border-line flex items-center justify-between gap-4 min-w-0">
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-ink truncate">Include End Date</span>
                <span className="text-[10px] font-semibold text-muted block mt-0.5 truncate">Count final day as working day.</span>
              </div>
              <button type="button" onClick={() => setIncludeEndDate(!includeEndDate)} className="text-brand shrink-0">
                {includeEndDate ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-muted" />}
              </button>
            </div>

            <hr className="border-line" />

            {/* Global Weekend Selector */}
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-3 min-w-0">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                  <Settings className="w-3.5 h-3.5 shrink-0" /> Define Weekends
                </label>
                <span className="text-[9px] font-bold text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0">Global Support</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 min-w-0">
                {WEEKDAYS.map(day => {
                  const isWeekend = weekendDays.includes(day.id);
                  return (
                    <button
                      key={day.id} type="button" onClick={() => toggleWeekend(day.id)}
                      className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all truncate ${
                        isWeekend 
                          ? 'bg-[#fb7185]/10 text-[#e11d48] border-[#fb7185]/30 shadow-sm' 
                          : 'bg-paper text-muted border-line hover:border-brand/40'
                      }`}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <hr className="border-line" />

            {/* Custom Holidays Manager */}
            <div className="min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 mb-3 truncate">
                <CalendarOff className="w-3.5 h-3.5 text-[#fb7185] shrink-0" /> Exclude Public Holidays
              </label>
              <div className="flex gap-2 mb-3 min-w-0">
                <input
                  type="date" value={holidayInput} onChange={(e) => setHolidayInput(e.target.value)}
                  className="flex-1 min-w-0 bg-paper border border-line rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-ink outline-none focus:border-brand uppercase tracking-wider"
                />
                <button
                  type="button" onClick={addHoliday} disabled={!holidayInput}
                  className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Holiday Tags */}
              <div className="flex flex-wrap gap-2 min-w-0">
                {holidays.length === 0 ? (
                  <span className="text-xs font-medium text-muted italic">No custom holidays added.</span>
                ) : (
                  holidays.map(h => (
                    <div key={h} className="flex items-center gap-1.5 bg-paper border border-[#fb7185]/30 text-[#e11d48] px-2.5 py-1 rounded-lg text-xs font-black tracking-wider shadow-sm">
                      {new Date(h).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      <button type="button" onClick={() => removeHoliday(h)} className="hover:bg-brand/10 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD RECEIPT */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[480px] min-w-0">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Calculator className="w-4 h-4 text-brand shrink-0" /> Calculation Results
              </span>
            </div>

            {calculations?.isInvalid ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 p-6">
                <AlertCircle className="w-12 h-12 text-[#e11d48] mb-3" />
                <span className="text-xs font-black uppercase tracking-widest text-[#e11d48]">Invalid Date Range</span>
                <p className="text-[10px] font-bold text-muted mt-1">End date must be on or after start date.</p>
              </div>
            ) : (
              <div className="space-y-5 min-w-0">
                
                {/* Hero Number */}
                <div className="text-center bg-paper border border-line py-6 px-4 rounded-xl shadow-sm relative overflow-hidden min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 truncate">Net Business Days</span>
                  <div className="flex items-baseline justify-center gap-1.5 min-w-0">
                    <span className="text-5xl sm:text-6xl font-black text-brand tracking-tight tabular-nums leading-none">
                      {calculations.businessDays.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-muted uppercase">Days</span>
                  </div>

                  {calculations.totalDays > 0 && (
                    <div className="w-full px-2 mt-6">
                      <div className="flex h-2.5 rounded-full overflow-hidden bg-line">
                        {calculations.pctBusiness > 0 && <div style={{ width: `${calculations.pctBusiness}%` }} className="bg-brand"></div>}
                        {calculations.pctWeekend > 0 && <div style={{ width: `${calculations.pctWeekend}%` }} className="bg-muted/40"></div>}
                        {calculations.pctHoliday > 0 && <div style={{ width: `${calculations.pctHoliday}%` }} className="bg-[#fb7185]"></div>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Receipt Breakdown */}
                <div className="bg-paper border border-line rounded-xl p-4 shadow-sm min-w-0">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-muted mb-3 border-b border-line pb-2 flex items-center gap-1.5 truncate">
                    <PieChart className="w-3.5 h-3.5 shrink-0" /> Span Breakdown
                  </h4>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center min-w-0">
                      <span className="font-bold text-muted flex items-center gap-2 truncate"><span className="w-2 h-2 rounded-full bg-muted/60 shrink-0"></span> Total Span</span>
                      <span className="font-black tabular-nums text-ink shrink-0">{calculations.totalDays}</span>
                    </div>
                    
                    <div className="flex justify-between items-center min-w-0">
                      <span className="font-bold text-muted flex items-center gap-2 truncate"><span className="w-2 h-2 rounded-full bg-muted/30 shrink-0"></span> Excluded Weekends</span>
                      <span className="font-black tabular-nums text-muted shrink-0">− {calculations.weekendCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center min-w-0">
                      <span className="font-bold text-[#e11d48] flex items-center gap-2 truncate"><span className="w-2 h-2 rounded-full bg-[#fb7185] shrink-0"></span> Public Holidays</span>
                      <span className="font-black tabular-nums text-[#e11d48] shrink-0">− {calculations.holidayCount}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t-2 border-line flex justify-between items-center min-w-0">
                     <span className="text-[10px] font-black uppercase tracking-wider text-brand flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Final Working Days
                     </span>
                     <span className="text-base font-black tabular-nums text-brand shrink-0">{calculations.businessDays}</span>
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
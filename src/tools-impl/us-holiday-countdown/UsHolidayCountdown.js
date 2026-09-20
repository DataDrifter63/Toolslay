"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays, Clock, PartyPopper, 
  Briefcase, CalendarHeart, History, 
  Palmtree, Sparkles, MapPin, CheckCircle2,
  ChevronRight, Star
} from "lucide-react";

// --- DATE MATH HELPERS ---
const getNthDayOfMonth = (year, month, dayOfWeek, n) => {
  const date = new Date(year, month, 1);
  const add = (dayOfWeek - date.getDay() + 7) % 7;
  date.setDate(1 + add + (n - 1) * 7);
  return date;
};

const getLastDayOfMonth = (year, month, dayOfWeek) => {
  const date = new Date(year, month + 1, 0); 
  const sub = (date.getDay() - dayOfWeek + 7) % 7;
  date.setDate(date.getDate() - sub);
  return date;
};

// --- PREMIUM HOLIDAY DATABASE ---
const generateHolidays = (year) => [
  { 
    id: "new-year", name: "New Year's Day", 
    date: new Date(year, 0, 1), 
    theme: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", darkBg: "dark:bg-indigo-900/20" },
    icon: Sparkles, 
    lore: "Marks the start of the Gregorian calendar year. Time for resolutions and fresh starts!"
  },
  { 
    id: "mlk", name: "Martin Luther King Jr. Day", 
    date: getNthDayOfMonth(year, 0, 1, 3), // 3rd Monday in Jan
    theme: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-300", darkBg: "dark:bg-slate-800" },
    icon: History, 
    lore: "Honors the civil rights leader's legacy of nonviolent activism and equal rights."
  },
  { 
    id: "presidents", name: "Presidents' Day", 
    date: getNthDayOfMonth(year, 1, 1, 3), // 3rd Monday in Feb
    theme: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", darkBg: "dark:bg-blue-900/20" },
    icon: Star, 
    lore: "Originally established to honor George Washington, now celebrates all US presidents."
  },
  { 
    id: "memorial", name: "Memorial Day", 
    date: getLastDayOfMonth(year, 4, 1), // Last Monday in May
    theme: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", darkBg: "dark:bg-red-900/20" },
    icon: MapPin, 
    lore: "A day of remembrance for those who have died serving in the United States Armed Forces."
  },
  { 
    id: "juneteenth", name: "Juneteenth National Independence Day", 
    date: new Date(year, 5, 19), 
    theme: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", darkBg: "dark:bg-emerald-900/20" },
    icon: CalendarHeart, 
    lore: "Commemorates the emancipation of enslaved African Americans in the US."
  },
  { 
    id: "independence", name: "Independence Day", 
    date: new Date(year, 6, 4), 
    theme: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", darkBg: "dark:bg-blue-900/20" },
    icon: PartyPopper, 
    lore: "Celebrates the Declaration of Independence adopted on July 4, 1776. Fireworks time!"
  },
  { 
    id: "labor", name: "Labor Day", 
    date: getNthDayOfMonth(year, 8, 1, 1), // 1st Monday in Sep
    theme: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", darkBg: "dark:bg-amber-900/20" },
    icon: Briefcase, 
    lore: "Honors the American labor movement and the contributions of workers to the country."
  },
  { 
    id: "columbus", name: "Columbus Day / Indigenous Peoples' Day", 
    date: getNthDayOfMonth(year, 9, 1, 2), // 2nd Monday in Oct
    theme: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200", darkBg: "dark:bg-teal-900/20" },
    icon: Palmtree, 
    lore: "A day recognizing both Christopher Columbus's arrival and Native American history."
  },
  { 
    id: "veterans", name: "Veterans Day", 
    date: new Date(year, 10, 11), 
    theme: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-300", darkBg: "dark:bg-slate-800" },
    icon: Star, 
    lore: "Honors military veterans who have served in the United States Armed Forces."
  },
  { 
    id: "thanksgiving", name: "Thanksgiving Day", 
    date: getNthDayOfMonth(year, 10, 4, 4), // 4th Thursday in Nov
    theme: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", darkBg: "dark:bg-orange-900/20" },
    icon: CalendarDays, 
    lore: "A day of giving thanks for the blessing of the harvest and the preceding year."
  },
  { 
    id: "christmas", name: "Christmas Day", 
    date: new Date(year, 11, 25), 
    theme: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", darkBg: "dark:bg-emerald-900/20" },
    icon: Sparkles, 
    lore: "An annual festival commemorating the birth of Jesus Christ, marked by gifts and family."
  }
];

export default function UsHolidayCountdown() {
  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [selectedHolidayId, setSelectedHolidayId] = useState(null);

  // Core Data Engine
  const allHolidays = useMemo(() => {
    const currentYear = now.getFullYear();
    const holidaysThisYear = generateHolidays(currentYear);
    const holidaysNextYear = generateHolidays(currentYear + 1);
    
    // Sort and combine to always have a continuous timeline
    return [...holidaysThisYear, ...holidaysNextYear].sort((a, b) => a.date - b.date);
  }, [now.getFullYear()]);

  // Find the exact NEXT upcoming holiday automatically
  const nextHoliday = useMemo(() => {
    // Set current time to midnight to accurately compare dates
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return allHolidays.find(h => h.date >= today) || allHolidays[0];
  }, [allHolidays, now]);

  // The Active Holiday to Display (Either auto-next or user-selected)
  const activeHoliday = useMemo(() => {
    if (selectedHolidayId) {
      return allHolidays.find(h => h.id === selectedHolidayId && h.date >= now) || nextHoliday;
    }
    return nextHoliday;
  }, [selectedHolidayId, nextHoliday, allHolidays, now]);

  // Real-time Tick
  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- CALCULATORS ---
  const countdown = useMemo(() => {
    const difference = activeHoliday.date.getTime() - now.getTime();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true };
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isToday: false
    };
  }, [activeHoliday, now]);

  const workingDaysLeft = useMemo(() => {
    let count = 0;
    const current = new Date(now);
    const end = new Date(activeHoliday.date);
    
    while (current < end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++; // Not Sun (0) or Sat (6)
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, [activeHoliday, now]);

  const isLongWeekend = useMemo(() => {
    const day = activeHoliday.date.getDay();
    return day === 1 || day === 5; // Monday or Friday
  }, [activeHoliday]);

  if (!isMounted) return null;

  const ActiveIcon = activeHoliday.icon;
  const theme = activeHoliday.theme;

  // Timeline for current year
  const timelineHolidays = allHolidays.filter(h => h.date.getFullYear() === now.getFullYear() || (h.date.getFullYear() === now.getFullYear() + 1 && now.getMonth() > 9));

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-100 via-blue-50 to-transparent dark:from-rose-900/30 dark:via-blue-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-rose-500 to-blue-500 p-3.5 rounded-2xl shadow-md">
            <PartyPopper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              US Public Holiday Tracker
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Live Countdown & Long-Weekend Detector
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 items-start">
        
        {/* ================= LEFT: THE COUNTDOWN ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col items-center text-center transition-all duration-500">
            
            {/* Dynamic Background Glow */}
            <div className={`absolute top-0 inset-x-0 h-48 opacity-20 bg-gradient-to-b from-current to-transparent ${theme.text}`}></div>

            <div className="relative z-10 w-full">
              {activeHoliday.id !== nextHoliday.id && (
                <button 
                  onClick={() => setSelectedHolidayId(null)}
                  className="mb-6 mx-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full transition-colors"
                >
                  <Clock className="w-3 h-3" /> Jump back to Next Holiday
                </button>
              )}

              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.bg} ${theme.darkBg} ${theme.text} text-xs font-black uppercase tracking-widest border ${theme.border} shadow-sm mb-6`}>
                <ActiveIcon className="w-4 h-4" /> 
                {activeHoliday.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              
              <h3 className="text-4xl sm:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none mb-4">
                {activeHoliday.name}
              </h3>
              
              <p className="text-sm font-medium text-slate-500 max-w-lg mx-auto mb-10">
                {activeHoliday.lore}
              </p>

              {/* The Live Clock */}
              {countdown.isToday ? (
                <div className={`py-12 px-6 rounded-3xl ${theme.bg} ${theme.darkBg} border-2 ${theme.border} animate-in zoom-in-95`}>
                  <PartyPopper className={`w-16 h-16 mx-auto mb-4 animate-bounce ${theme.text}`} />
                  <h4 className={`text-4xl font-black uppercase tracking-widest ${theme.text}`}>It's Today!</h4>
                  <p className="text-sm font-bold text-slate-600 mt-2">Enjoy your public holiday!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner flex flex-col items-center">
                    <span className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter ${theme.text}`}>{countdown.days}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Days</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner flex flex-col items-center">
                    <span className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter ${theme.text}`}>{countdown.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Hours</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner flex flex-col items-center">
                    <span className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter ${theme.text}`}>{countdown.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Minutes</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner flex flex-col items-center">
                    <span className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter ${theme.text}`}>{countdown.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Seconds</span>
                  </div>
                </div>
              )}

              {/* Advanced Pro Metrics */}
              {!countdown.isToday && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left shadow-sm">
                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-xl shrink-0">
                      <Briefcase className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Working Days Left</span>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">
                        {workingDaysLeft} <span className="text-sm font-bold text-slate-400">Days</span>
                      </span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-4 p-4 rounded-2xl border text-left shadow-sm transition-colors ${isLongWeekend ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                    <div className={`p-3 rounded-xl shrink-0 ${isLongWeekend ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      {isLongWeekend ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <CalendarDays className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                    </div>
                    <div>
                      <span className={`block text-[10px] font-black uppercase tracking-widest mb-0.5 ${isLongWeekend ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>Weekend Extension</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
                        {isLongWeekend ? "It's a Long Weekend! 🎉" : "Standard Mid-Week Holiday"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ================= RIGHT: THE YEARLY TIMELINE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col h-[650px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-5 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <CalendarDays className="w-4 h-4 text-blue-500" /> Holiday Timeline
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {now.getFullYear()} Calendar
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 relative">
                {/* Timeline line */}
                <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>

                {timelineHolidays.map((holiday, idx) => {
                  const isPast = holiday.date < (new Date(now).setHours(0,0,0,0));
                  const isNext = holiday.id === nextHoliday.id;
                  const isSelected = holiday.id === activeHoliday.id;
                  
                  return (
                    <div 
                      key={`${holiday.id}-${holiday.date.getFullYear()}`}
                      onClick={() => !isPast && setSelectedHolidayId(holiday.id)}
                      className={`relative z-10 flex items-center gap-4 p-3 rounded-xl transition-all ${
                        isPast 
                        ? 'opacity-40 grayscale cursor-default' 
                        : isSelected 
                          ? `bg-white dark:bg-slate-800 shadow-md border ${holiday.theme.border} cursor-pointer scale-[1.02]`
                          : 'hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent cursor-pointer'
                      }`}
                    >
                      {/* Timeline Dot/Icon */}
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 ${
                        isPast ? 'bg-slate-100 border-slate-200 text-slate-400' 
                        : isNext ? `${holiday.theme.bg} ${holiday.theme.border} ${holiday.theme.text} shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse`
                        : isSelected ? `${holiday.theme.bg} ${holiday.theme.border} ${holiday.theme.text}`
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}>
                        <holiday.icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`block text-sm font-black truncate ${isPast ? 'text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                            {holiday.name}
                          </span>
                          {isNext && (
                            <span className="text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0">Up Next</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          {holiday.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {!isPast && (
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? `${holiday.theme.text} translate-x-1` : 'text-slate-300'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Bottom Fade for Scroll */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 dark:from-slate-900/50 to-transparent pointer-events-none rounded-b-[22px]"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
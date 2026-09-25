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
    icon: Sparkles, 
    lore: "Marks the start of the Gregorian calendar year. Time for resolutions and fresh starts!"
  },
  { 
    id: "mlk", name: "Martin Luther King Jr. Day", 
    date: getNthDayOfMonth(year, 0, 1, 3), 
    icon: History, 
    lore: "Honors the civil rights leader's legacy of nonviolent activism and equal rights."
  },
  { 
    id: "presidents", name: "Presidents' Day", 
    date: getNthDayOfMonth(year, 1, 1, 3), 
    icon: Star, 
    lore: "Originally established to honor George Washington, now celebrates all US presidents."
  },
  { 
    id: "memorial", name: "Memorial Day", 
    date: getLastDayOfMonth(year, 4, 1), 
    icon: MapPin, 
    lore: "A day of remembrance for those who have died serving in the United States Armed Forces."
  },
  { 
    id: "juneteenth", name: "Juneteenth National Independence Day", 
    date: new Date(year, 5, 19), 
    icon: CalendarHeart, 
    lore: "Commemorates the emancipation of enslaved African Americans in the US."
  },
  { 
    id: "independence", name: "Independence Day", 
    date: new Date(year, 6, 4), 
    icon: PartyPopper, 
    lore: "Celebrates the Declaration of Independence adopted on July 4, 1776. Fireworks time!"
  },
  { 
    id: "labor", name: "Labor Day", 
    date: getNthDayOfMonth(year, 8, 1, 1), 
    icon: Briefcase, 
    lore: "Honors the American labor movement and the contributions of workers to the country."
  },
  { 
    id: "columbus", name: "Columbus Day / Indigenous Peoples' Day", 
    date: getNthDayOfMonth(year, 9, 1, 2), 
    icon: Palmtree, 
    lore: "A day recognizing both Christopher Columbus's arrival and Native American history."
  },
  { 
    id: "veterans", name: "Veterans Day", 
    date: new Date(year, 10, 11), 
    icon: Star, 
    lore: "Honors military veterans who have served in the United States Armed Forces."
  },
  { 
    id: "thanksgiving", name: "Thanksgiving Day", 
    date: getNthDayOfMonth(year, 10, 4, 4), 
    icon: CalendarDays, 
    lore: "A day of giving thanks for the blessing of the harvest and the preceding year."
  },
  { 
    id: "christmas", name: "Christmas Day", 
    date: new Date(year, 11, 25), 
    icon: Sparkles, 
    lore: "An annual festival commemorating the birth of Jesus Christ, marked by gifts and family."
  }
];

export default function UsHolidayCountdown() {
  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [selectedHolidayId, setSelectedHolidayId] = useState(null);

  const allHolidays = useMemo(() => {
    const currentYear = now.getFullYear();
    const holidaysThisYear = generateHolidays(currentYear);
    const holidaysNextYear = generateHolidays(currentYear + 1);
    return [...holidaysThisYear, ...holidaysNextYear].sort((a, b) => a.date - b.date);
  }, [now.getFullYear()]);

  const nextHoliday = useMemo(() => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return allHolidays.find(h => h.date >= today) || allHolidays[0];
  }, [allHolidays, now]);

  const activeHoliday = useMemo(() => {
    if (selectedHolidayId) {
      return allHolidays.find(h => h.id === selectedHolidayId && h.date >= now) || nextHoliday;
    }
    return nextHoliday;
  }, [selectedHolidayId, nextHoliday, allHolidays, now]);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, [activeHoliday, now]);

  const isLongWeekend = useMemo(() => {
    const day = activeHoliday.date.getDay();
    return day === 1 || day === 5;
  }, [activeHoliday]);

  if (!isMounted) return null;

  const ActiveIcon = activeHoliday.icon;
  const timelineHolidays = allHolidays.filter(h => h.date.getFullYear() === now.getFullYear() || (h.date.getFullYear() === now.getFullYear() + 1 && now.getMonth() > 9));

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <PartyPopper className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              US Public Holiday Tracker
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Live countdown and long-weekend detector.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: THE COUNTDOWN ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-6 sm:p-10 rounded-2xl shadow-sm relative overflow-hidden flex flex-col items-center text-center font-sans">
            
            <div className="relative z-10 w-full">
              {activeHoliday.id !== nextHoliday.id && (
                <button 
                  type="button"
                  onClick={() => setSelectedHolidayId(null)}
                  className="mb-5 mx-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted hover:text-ink bg-surface border border-line px-3.5 py-1.5 rounded-xl transition-colors"
                >
                  <Clock className="w-3 h-3 text-brand" /> Jump to Next Holiday
                </button>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest shadow-sm mb-5">
                <ActiveIcon className="w-3.5 h-3.5" /> 
                {activeHoliday.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              
              <h3 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-none mb-3 font-mono">
                {activeHoliday.name}
              </h3>
              
              <p className="text-xs sm:text-sm font-medium text-muted max-w-md mx-auto mb-8">
                {activeHoliday.lore}
              </p>

              {countdown.isToday ? (
                <div className="py-10 px-4 rounded-2xl bg-brand/10 border border-brand/30 animate-in fade-in">
                  <PartyPopper className="w-12 h-12 mx-auto mb-3 animate-bounce text-brand" />
                  <h4 className="text-2xl font-black uppercase tracking-wider text-brand font-mono">It's Today!</h4>
                  <p className="text-xs font-bold text-muted mt-1">Enjoy your public holiday!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mb-8">
                  <div className="bg-surface p-4 rounded-xl border border-line shadow-sm flex flex-col items-center">
                    <span className="text-3xl sm:text-5xl font-black tabular-nums tracking-tighter text-brand font-mono">{countdown.days}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted mt-1.5">Days</span>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-line shadow-sm flex flex-col items-center">
                    <span className="text-3xl sm:text-5xl font-black tabular-nums tracking-tighter text-brand font-mono">{countdown.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted mt-1.5">Hours</span>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-line shadow-sm flex flex-col items-center">
                    <span className="text-3xl sm:text-5xl font-black tabular-nums tracking-tighter text-brand font-mono">{countdown.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted mt-1.5">Minutes</span>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-line shadow-sm flex flex-col items-center">
                    <span className="text-3xl sm:text-5xl font-black tabular-nums tracking-tighter text-brand font-mono">{countdown.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted mt-1.5">Seconds</span>
                  </div>
                </div>
              )}

              {!countdown.isToday && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                  <div className="flex items-center gap-3 bg-surface p-3.5 rounded-xl border border-line text-left shadow-sm">
                    <div className="bg-paper p-2.5 rounded-xl border border-line shrink-0 text-brand">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-0.5">Working Days Left</span>
                      <span className="text-base font-black text-ink leading-none font-mono">
                        {workingDaysLeft} <span className="text-xs font-bold text-muted">Days</span>
                      </span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3.5 rounded-xl border text-left shadow-sm ${isLongWeekend ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-surface border-line'}`}>
                    <div className={`p-2.5 rounded-xl border border-line shrink-0 ${isLongWeekend ? 'bg-emerald-500/20 text-emerald-500' : 'bg-paper text-muted'}`}>
                      {isLongWeekend ? <CheckCircle2 className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className={`block text-[9px] font-black uppercase tracking-widest mb-0.5 ${isLongWeekend ? 'text-emerald-500' : 'text-muted'}`}>Weekend Extension</span>
                      <span className="text-xs font-black text-ink leading-tight">
                        {isLongWeekend ? "Long Weekend! 🎉" : "Standard Mid-Week"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT: THE YEARLY TIMELINE */}
        <div className="space-y-4 sm:space-y-6 w-full font-sans">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col h-[600px]">
             
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <CalendarDays className="w-4 h-4 text-brand" /> Holiday Timeline
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted bg-surface border border-line px-2.5 py-1 rounded-xl">
                {now.getFullYear()} Calendar
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 relative">
              <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-line z-0"></div>

              {timelineHolidays.map((holiday, idx) => {
                const isPast = holiday.date < (new Date(now).setHours(0,0,0,0));
                const isNext = holiday.id === nextHoliday.id;
                const isSelected = holiday.id === activeHoliday.id;
                
                return (
                  <div 
                    key={`${holiday.id}-${holiday.date.getFullYear()}`}
                    onClick={() => !isPast && setSelectedHolidayId(holiday.id)}
                    className={`relative z-10 flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isPast 
                        ? 'opacity-40 grayscale cursor-default' 
                        : isSelected 
                          ? "bg-surface border border-brand shadow-sm scale-[1.01] cursor-pointer"
                          : 'bg-surface border border-line hover:border-brand/50 cursor-pointer'
                    }`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center border ${
                      isPast ? 'bg-surface border-line text-muted' 
                      : isNext ? 'bg-brand/10 border-brand text-brand animate-pulse'
                      : isSelected ? 'bg-brand text-surface border-brand'
                      : 'bg-paper border-line text-muted'
                    }`}>
                      <holiday.icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between">
                        <span className={`block text-xs font-black truncate ${isPast ? 'text-muted' : 'text-ink'}`}>
                          {holiday.name}
                        </span>
                        {isNext && (
                          <span className="text-[8px] bg-brand text-surface px-1.5 py-0.5 rounded font-black uppercase tracking-widest shrink-0">Up Next</span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">
                        {holiday.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {!isPast && (
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'text-brand translate-x-0.5' : 'text-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
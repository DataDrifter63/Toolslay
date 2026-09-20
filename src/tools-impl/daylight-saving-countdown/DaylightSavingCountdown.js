"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock, Sun, Moon, ArrowUpRight, 
  ArrowDownRight, Globe, HeartPulse, 
  Info, AlertTriangle, Sparkles, CheckCircle2
} from "lucide-react";

// --- EVERGREEN DST MATH HELPERS ---
// 0 = January, 1 = February, 2 = March, 9 = October, 10 = November
const getNthSunday = (year, month, n) => {
  const firstDay = new Date(year, month, 1);
  const day = firstDay.getDay(); // 0 is Sunday
  const offset = day === 0 ? 0 : 7 - day;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
};

const getLastSunday = (year, month) => {
  const lastDay = new Date(year, month + 1, 0);
  const day = lastDay.getDay();
  return new Date(year, month, lastDay.getDate() - day);
};

// --- GLOBAL DST REGIONS & RULES ---
const REGIONS = [
  {
    id: "usa",
    name: "USA & Canada",
    desc: "Starts 2nd Sunday in March, Ends 1st Sunday in Nov.",
    getEvents: (year) => [
      {
        type: "spring", name: "Spring Forward",
        date: new Date(getNthSunday(year, 2, 2).setHours(2, 0, 0, 0)),
        action: "Lose 1 Hour of Sleep", effect: "Gain Evening Daylight"
      },
      {
        type: "fall", name: "Fall Back",
        date: new Date(getNthSunday(year, 10, 1).setHours(2, 0, 0, 0)),
        action: "Gain 1 Hour of Sleep", effect: "Lose Evening Daylight"
      }
    ]
  },
  {
    id: "eu",
    name: "Europe (EU)",
    desc: "Starts Last Sunday in March, Ends Last Sunday in Oct.",
    getEvents: (year) => [
      {
        type: "spring", name: "Spring Forward",
        date: new Date(getLastSunday(year, 2).setUTCHours(1, 0, 0, 0)),
        action: "Lose 1 Hour of Sleep", effect: "Gain Evening Daylight"
      },
      {
        type: "fall", name: "Fall Back",
        date: new Date(getLastSunday(year, 9).setUTCHours(1, 0, 0, 0)),
        action: "Gain 1 Hour of Sleep", effect: "Lose Evening Daylight"
      }
    ]
  },
  {
    id: "aus",
    name: "Australia (AEST/AEDT)",
    desc: "Starts 1st Sunday in Oct, Ends 1st Sunday in April.",
    getEvents: (year) => [
      {
        type: "fall", name: "Fall Back", // April in Southern Hemisphere is Fall
        date: new Date(getNthSunday(year, 3, 1).setHours(3, 0, 0, 0)),
        action: "Gain 1 Hour of Sleep", effect: "Lose Evening Daylight"
      },
      {
        type: "spring", name: "Spring Forward", // October is Spring
        date: new Date(getNthSunday(year, 9, 1).setHours(2, 0, 0, 0)),
        action: "Lose 1 Hour of Sleep", effect: "Gain Evening Daylight"
      }
    ]
  }
];

export default function DaylightSavingCountdown() {
  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [activeRegion, setActiveRegion] = useState(REGIONS[0]);

  // Find the exact NEXT DST event for the selected region
  const nextEvent = useMemo(() => {
    const currentYear = now.getFullYear();
    // Get events for this year and next year to be safe
    const events = [
      ...activeRegion.getEvents(currentYear),
      ...activeRegion.getEvents(currentYear + 1)
    ];
    
    // Sort chronologically and find the first one in the future
    events.sort((a, b) => a.date - b.date);
    return events.find(e => e.date > now) || events[0];
  }, [activeRegion, now]);

  // Real-time Tick
  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown Math
  const countdown = useMemo(() => {
    const diff = nextEvent.date.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true };
    
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isToday: diff < (1000 * 60 * 60 * 24) && now.getDate() === nextEvent.date.getDate()
    };
  }, [nextEvent, now]);

  if (!isMounted) return null;

  // Dynamic Theming based on Spring vs Fall
  const isSpring = nextEvent.type === "spring";
  const theme = {
    gradient: isSpring ? "from-amber-100 via-orange-50 to-transparent dark:from-amber-900/30 dark:via-orange-900/10" : "from-indigo-100 via-blue-50 to-transparent dark:from-indigo-900/30 dark:via-blue-900/10",
    iconBg: isSpring ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-indigo-500 to-blue-500",
    textPrimary: isSpring ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400",
    bgLight: isSpring ? "bg-amber-50 dark:bg-amber-900/20" : "bg-indigo-50 dark:bg-indigo-900/20",
    borderLight: isSpring ? "border-amber-200 dark:border-amber-800" : "border-indigo-200 dark:border-indigo-800",
    MainIcon: isSpring ? Sun : Moon,
    DirIcon: isSpring ? ArrowUpRight : ArrowDownRight
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-1000">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.iconBg} p-3.5 rounded-2xl shadow-md transition-colors duration-500`}>
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Daylight Saving Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Global Time-Shift Tracker
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 items-start">
        
        {/* ================= LEFT: THE COUNTDOWN ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col items-center text-center transition-all duration-500">
            
            <div className={`absolute top-0 inset-x-0 h-48 opacity-20 bg-gradient-to-b from-current to-transparent ${theme.textPrimary}`}></div>

            <div className="relative z-10 w-full">
              
              {/* Event Badge */}
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.bgLight} ${theme.textPrimary} text-xs font-black uppercase tracking-widest border ${theme.borderLight} shadow-sm mb-6 transition-colors duration-500`}>
                <theme.DirIcon className="w-4 h-4" /> 
                {nextEvent.name}
              </span>
              
              <h3 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none mb-4 flex items-center justify-center gap-4">
                {nextEvent.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              
              <p className="text-sm font-medium text-slate-500 max-w-lg mx-auto mb-10 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" /> Clocks change at exactly {nextEvent.date.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit', timeZoneName: 'short' })}
              </p>

              {/* The Live Clock */}
              {countdown.isToday ? (
                <div className={`py-12 px-6 rounded-3xl ${theme.bgLight} border-2 ${theme.borderLight} animate-in zoom-in-95`}>
                  <theme.MainIcon className={`w-16 h-16 mx-auto mb-4 animate-bounce ${theme.textPrimary}`} />
                  <h4 className={`text-4xl font-black uppercase tracking-widest ${theme.textPrimary}`}>It's Today!</h4>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-2">Adjust your clocks and prepare for the shift.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner flex flex-col items-center">
                    <span className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter ${theme.textPrimary} transition-colors duration-500`}>{countdown.days}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Days</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner flex flex-col items-center">
                    <span className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter ${theme.textPrimary} transition-colors duration-500`}>{countdown.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Hours</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner flex flex-col items-center">
                    <span className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter ${theme.textPrimary} transition-colors duration-500`}>{countdown.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Minutes</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner flex flex-col items-center">
                    <span className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter ${theme.textPrimary} transition-colors duration-500`}>{countdown.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Seconds</span>
                  </div>
                </div>
              )}

              {/* The "Impact" Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className={`flex items-center gap-4 p-4 rounded-2xl border text-left shadow-sm ${theme.bgLight} ${theme.borderLight}`}>
                  <div className={`bg-white dark:bg-slate-900 p-3 rounded-xl shrink-0 shadow-sm ${theme.textPrimary}`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`block text-[10px] font-black uppercase tracking-widest ${theme.textPrimary} mb-0.5`}>Sleep Impact</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
                      {nextEvent.action}
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-4 p-4 rounded-2xl border text-left shadow-sm ${theme.bgLight} ${theme.borderLight}`}>
                  <div className={`bg-white dark:bg-slate-900 p-3 rounded-xl shrink-0 shadow-sm ${theme.textPrimary}`}>
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`block text-[10px] font-black uppercase tracking-widest ${theme.textPrimary} mb-0.5`}>Daylight Impact</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
                      {nextEvent.effect}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ================= RIGHT: SETTINGS & HEALTH TIPS ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col h-[550px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              {/* Region Selector */}
              <div className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-6 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 mb-3">
                  <Globe className="w-4 h-4 text-slate-400" /> Select Region
                </span>
                <div className="space-y-2">
                  {REGIONS.map(region => (
                    <button
                      key={region.id}
                      onClick={() => setActiveRegion(region)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        activeRegion.id === region.id 
                        ? `${theme.bgLight} ${theme.borderLight} shadow-sm` 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-left">
                        <span className={`block text-sm font-black ${activeRegion.id === region.id ? theme.textPrimary : 'text-slate-700 dark:text-slate-200'}`}>
                          {region.name}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{region.desc}</span>
                      </div>
                      {activeRegion.id === region.id && <CheckCircle2 className={`w-4 h-4 ${theme.textPrimary}`} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Health & Circadian Rhythm Tips */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 mb-3">
                  <HeartPulse className="w-4 h-4 text-rose-500" /> Bio-Hack Tips
                </span>
                
                {isSpring ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">Gradual Shift</span>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Start going to bed 15 minutes earlier each night for a few days before the change to ease the "jet lag" feeling.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">Morning Light</span>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Get natural sunlight immediately upon waking up on Sunday to reset your circadian rhythm.</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-200 dark:border-rose-800/30 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-relaxed">
                        Studies show a spike in heart attacks and car accidents on the Monday following Spring Forward. Take it easy!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">Don't Stay Up Late</span>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">It’s tempting to stay up an extra hour since you "gain" it back, but maintaining your regular bedtime improves sleep quality.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">Evening Gloom</span>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">It will get dark much earlier. Prepare your home with warm lighting to counter seasonal affective disorder (SAD).</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/30 flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 leading-relaxed">
                        Enjoy the extra hour of rest! This is the perfect weekend to catch up on your sleep debt.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 dark:from-slate-900/50 to-transparent pointer-events-none rounded-b-[22px]"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
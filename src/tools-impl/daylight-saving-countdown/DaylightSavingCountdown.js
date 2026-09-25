"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock, Sun, Moon, ArrowUpRight, 
  ArrowDownRight, Globe, HeartPulse, 
  Info, AlertTriangle, Sparkles, CheckCircle2
} from "lucide-react";

const getNthSunday = (year, month, n) => {
  const firstDay = new Date(year, month, 1);
  const day = firstDay.getDay();
  const offset = day === 0 ? 0 : 7 - day;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
};

const getLastSunday = (year, month) => {
  const lastDay = new Date(year, month + 1, 0);
  const day = lastDay.getDay();
  return new Date(year, month, lastDay.getDate() - day);
};

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
        type: "fall", name: "Fall Back",
        date: new Date(getNthSunday(year, 3, 1).setHours(3, 0, 0, 0)),
        action: "Gain 1 Hour of Sleep", effect: "Lose Evening Daylight"
      },
      {
        type: "spring", name: "Spring Forward",
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

  const nextEvent = useMemo(() => {
    const currentYear = now.getFullYear();
    const events = [
      ...activeRegion.getEvents(currentYear),
      ...activeRegion.getEvents(currentYear + 1)
    ];
    events.sort((a, b) => a.date - b.date);
    return events.find(e => e.date > now) || events[0];
  }, [activeRegion, now]);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const isSpring = nextEvent.type === "spring";
  const theme = {
    MainIcon: isSpring ? Sun : Moon,
    DirIcon: isSpring ? ArrowUpRight : ArrowDownRight
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Daylight Saving Oracle
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Global time-shift tracker and circadian health guide.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: THE COUNTDOWN ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-6 sm:p-10 rounded-2xl shadow-sm relative overflow-hidden flex flex-col items-center text-center font-sans">
            
            <div className="relative z-10 w-full">
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest shadow-sm mb-5">
                <theme.DirIcon className="w-3.5 h-3.5" /> 
                {nextEvent.name}
              </span>
              
              <h3 className="text-2xl sm:text-4xl font-black text-ink tracking-tight leading-none mb-2">
                {nextEvent.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              
              <p className="text-xs sm:text-sm font-medium text-muted max-w-md mx-auto mb-8 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Clocks change at {nextEvent.date.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit', timeZoneName: 'short' })}
              </p>

              {countdown.isToday ? (
                <div className="py-10 px-4 rounded-2xl bg-brand/10 border border-brand/30 animate-in fade-in">
                  <theme.MainIcon className="w-12 h-12 mx-auto mb-3 animate-bounce text-brand" />
                  <h4 className="text-2xl font-black uppercase tracking-wider text-brand font-mono">It's Today!</h4>
                  <p className="text-xs font-bold text-muted mt-1">Adjust your clocks and prepare for the shift.</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <div className="flex items-center gap-3 bg-surface p-3.5 rounded-xl border border-line text-left shadow-sm">
                  <div className="bg-paper p-2.5 rounded-xl border border-line shrink-0 text-brand">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-0.5">Sleep Impact</span>
                    <span className="text-xs font-black text-ink leading-tight">
                      {nextEvent.action}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-surface p-3.5 rounded-xl border border-line text-left shadow-sm">
                  <div className="bg-paper p-2.5 rounded-xl border border-line shrink-0 text-brand">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-0.5">Daylight Impact</span>
                    <span className="text-xs font-black text-ink leading-tight">
                      {nextEvent.effect}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT: SETTINGS & HEALTH TIPS */}
        <div className="space-y-4 sm:space-y-6 w-full font-sans">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col h-[550px]">
             
            <div className="mb-4 border-b border-line pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink mb-2">
                <Globe className="w-4 h-4 text-brand" /> Select Region
              </span>
              <div className="space-y-2">
                {REGIONS.map(region => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setActiveRegion(region)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      activeRegion.id === region.id 
                        ? "bg-brand/10 border-brand shadow-sm" 
                        : 'bg-surface border-line hover:border-brand/50'
                    }`}
                  >
                    <div className="text-left pr-2 min-w-0">
                      <span className={`block text-xs font-black truncate ${activeRegion.id === region.id ? 'text-brand' : 'text-ink'}`}>
                        {region.name}
                      </span>
                      <span className="text-[9px] font-bold text-muted truncate block">{region.desc}</span>
                    </div>
                    {activeRegion.id === region.id && <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink mb-1">
                <HeartPulse className="w-4 h-4 text-rose-500" /> Bio-Hack Tips
              </span>
              
              {isSpring ? (
                <div className="space-y-2.5">
                  <div className="bg-surface p-3 rounded-xl border border-line">
                    <span className="block text-xs font-bold text-ink mb-0.5">Gradual Shift</span>
                    <p className="text-[10px] font-medium text-muted leading-relaxed">Start going to bed 15 minutes earlier each night for a few days before the change.</p>
                  </div>
                  <div className="bg-surface p-3 rounded-xl border border-line">
                    <span className="block text-xs font-bold text-ink mb-0.5">Morning Light</span>
                    <p className="text-[10px] font-medium text-muted leading-relaxed">Get natural sunlight immediately upon waking up on Sunday to reset your rhythm.</p>
                  </div>
                  <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-rose-500 leading-relaxed">
                      Studies show a spike in accidents on the Monday following Spring Forward. Take it easy!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="bg-surface p-3 rounded-xl border border-line">
                    <span className="block text-xs font-bold text-ink mb-0.5">Don't Stay Up Late</span>
                    <p className="text-[10px] font-medium text-muted leading-relaxed">Maintain your regular bedtime even though you gain an extra hour.</p>
                  </div>
                  <div className="bg-surface p-3 rounded-xl border border-line">
                    <span className="block text-xs font-bold text-ink mb-0.5">Evening Gloom</span>
                    <p className="text-[10px] font-medium text-muted leading-relaxed">It will get dark earlier. Prepare your home with warm lighting to counter SAD.</p>
                  </div>
                  <div className="bg-brand/10 p-3 rounded-xl border border-brand/20 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-brand leading-relaxed">
                      Enjoy the extra hour of rest! Perfect weekend to catch up on sleep debt.
                    </p>
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
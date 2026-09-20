"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Baby, Clock, Droplet, Moon, Sun, 
  Milk, Utensils, CalendarDays, Info, 
  CheckCircle2, AlertCircle, Coffee
} from "lucide-react";

// American Academy of Pediatrics (AAP) based feeding guidelines
const AGE_GROUPS = [
  { 
    id: "newborn", label: "Newborn (0 - 1 Month)", 
    intervalHrs: 2.5, dayFeeds: 7, nightFeeds: 2, 
    volOz: "2 - 3", wakeWindow: "45 - 60 mins", hasSolids: false,
    desc: "Frequent feeding to establish supply & weight."
  },
  { 
    id: "infant1", label: "Infant (1 - 3 Months)", 
    intervalHrs: 3, dayFeeds: 6, nightFeeds: 1, 
    volOz: "4 - 5", wakeWindow: "1.5 - 2 hours", hasSolids: false,
    desc: "Developing a predictable daytime pattern."
  },
  { 
    id: "infant2", label: "Baby (4 - 6 Months)", 
    intervalHrs: 3.5, dayFeeds: 5, nightFeeds: 0, 
    volOz: "5 - 7", wakeWindow: "2 - 2.5 hours", hasSolids: "Intro / Tasting",
    desc: "Longer gaps, introduction to purees."
  },
  { 
    id: "older", label: "Older Baby (6 - 12 Months)", 
    intervalHrs: 4, dayFeeds: 4, nightFeeds: 0, 
    volOz: "6 - 8", wakeWindow: "3 - 4 hours", hasSolids: "3 Meals / Day",
    desc: "Solid food becomes a primary energy source."
  }
];

const FEED_TYPES = [
  { id: "breast", label: "Breastmilk", icon: Droplet },
  { id: "formula", label: "Formula / Pumped", icon: Milk }
];

export default function BabyFeedingSchedule() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [age, setAge] = useState(AGE_GROUPS[1]); // Default 1-3m
  const [feedType, setFeedType] = useState(FEED_TYPES[0]);
  const [wakeTime, setWakeTime] = useState("07:00"); // 7:00 AM standard

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper: Format minutes to 12h AM/PM string
  const minsToTimeStr = (totalMins) => {
    const hours24 = Math.floor(totalMins / 60) % 24;
    const mins = totalMins % 60;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  // Smart Engine to generate timeline
  const schedule = useMemo(() => {
    if (!wakeTime) return [];

    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    let startMins = (wakeH * 60) + wakeM;
    
    const timeline = [];
    const intervalMins = age.intervalHrs * 60;

    // First feed right at wake up
    timeline.push({
      time: minsToTimeStr(startMins),
      type: "feed",
      label: "Morning Wake & Feed",
      icon: Sun,
      color: "text-sky-500",
      bg: "bg-sky-50"
    });

    let currentMins = startMins;

    // Generate Daytime Feeds
    for (let i = 1; i < age.dayFeeds; i++) {
      currentMins += intervalMins;
      
      // If 6-12 months, insert solid meals between milk feeds
      if (age.id === "older" && i === 1) {
        timeline.push({
          time: minsToTimeStr(currentMins - (intervalMins / 2)),
          type: "solid",
          label: "Solid Meal (Breakfast)",
          icon: Utensils,
          color: "text-emerald-500",
          bg: "bg-emerald-50"
        });
      }
      if (age.id === "older" && i === 2) {
        timeline.push({
          time: minsToTimeStr(currentMins - (intervalMins / 2)),
          type: "solid",
          label: "Solid Meal (Lunch)",
          icon: Utensils,
          color: "text-emerald-500",
          bg: "bg-emerald-50"
        });
      }
      if (age.id === "older" && i === 3) {
        timeline.push({
          time: minsToTimeStr(currentMins - (intervalMins / 2)),
          type: "solid",
          label: "Solid Meal (Dinner)",
          icon: Utensils,
          color: "text-emerald-500",
          bg: "bg-emerald-50"
        });
      }

      timeline.push({
        time: minsToTimeStr(currentMins),
        type: "feed",
        label: i === age.dayFeeds - 1 ? "Bedtime Feed" : `Daytime Feed ${i + 1}`,
        icon: i === age.dayFeeds - 1 ? Moon : Milk,
        color: i === age.dayFeeds - 1 ? "text-indigo-500" : "text-sky-500",
        bg: i === age.dayFeeds - 1 ? "bg-indigo-50" : "bg-sky-50"
      });
    }

    return timeline;
  }, [age, wakeTime]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-sky-100 to-transparent dark:from-sky-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-sky-50 dark:bg-sky-900/30 p-3.5 rounded-2xl">
            <Baby className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Baby Feeding Schedule Generator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Smart Routine Planner & Volume Guidelines
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Age Selection */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-slate-400" /> Baby's Age Group
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AGE_GROUPS.map((a) => {
                  const isActive = age.id === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setAge(a)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                        isActive
                          ? "bg-sky-50 dark:bg-sky-900/20 border-sky-500 shadow-sm scale-[1.02]"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-sky-200"
                      }`}
                    >
                      <span className={`block text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-sky-700 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {a.label}
                      </span>
                      <span className="block text-xs font-medium text-slate-500 leading-snug mt-0.5">
                        {a.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Feeding Method */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-slate-400" /> Primary Method
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  {FEED_TYPES.map(type => {
                    const Icon = type.icon;
                    return (
                      <button 
                        key={type.id}
                        onClick={() => setFeedType(type)} 
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors ${feedType.id === type.id ? "bg-white dark:bg-slate-700 text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      >
                        <Icon className="w-3.5 h-3.5" /> {type.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Wake Time */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-slate-400" /> Typical Wake Time
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-50 dark:focus-within:ring-sky-900/20 transition-all overflow-hidden px-4 py-2">
                  <Clock className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="time" 
                    value={wakeTime} 
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-transparent py-2 text-lg font-black text-slate-800 dark:text-slate-100 outline-none time-picker-premium"
                  />
                </div>
              </div>
            </div>

            {/* Medical Disclaimer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start gap-3 border border-slate-100 dark:border-slate-700 mt-4">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Guidelines are based on general pediatric averages. Breastfed babies often feed on demand and may not follow strict intervals. Always follow your pediatrician's advice regarding your baby's unique weight and growth needs.
              </p>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: SCHEDULE DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-sky-500" /> Daily Routine Blueprint
                </span>
              </div>
              
              {/* Top Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                  <span className="block text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                    {age.dayFeeds}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Daytime Feeds</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                  <span className="block text-xl font-black text-indigo-500 tabular-nums leading-none mb-1">
                    {age.nightFeeds === 0 ? "None" : `${age.nightFeeds} - ${age.nightFeeds + 1}`}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Night Wakes</span>
                </div>

                <div className="col-span-2 flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Milk className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Target Vol. per Feed</span>
                  </div>
                  <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                    {feedType.id === "breast" ? "On Demand" : `${age.volOz} oz`}
                  </span>
                </div>
              </div>

              {/* Dynamic Timeline */}
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-slate-400" /> Suggested Schedule
                </h4>
                
                <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-6 pb-2">
                  {schedule.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="relative pl-6 animate-in slide-in-from-left-2 fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center ${item.bg}`}>
                          <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        </div>
                        <div>
                          <span className="block text-sm font-black text-slate-800 dark:text-slate-100">
                            {item.time}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${item.color} mt-0.5 block`}>
                            {item.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pro Tip: Wake Windows */}
              <div className="mt-4 p-3.5 rounded-xl border bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50 flex items-start gap-3">
                <Moon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                    Sleep Tip: Wake Windows
                  </span>
                  <p className="text-[10px] font-medium text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    At this age, baby should only be awake for <strong>{age.wakeWindow}</strong> between naps. Watch for sleepy cues (yawning, rubbing eyes) to avoid overtiredness!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
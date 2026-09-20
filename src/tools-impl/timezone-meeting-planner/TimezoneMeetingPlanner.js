"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Globe, Clock, CalendarCheck, Copy, CheckCircle2,
  AlertCircle, Moon, Sun, Briefcase, ChevronRight
} from "lucide-react";

// Tier-1 & Global Business Hubs
const TIMEZONES = [
  { id: "pdt", name: "Los Angeles (PDT)", offset: -7 },
  { id: "est", name: "New York (EST)", offset: -4 }, // EDT/EST approximation for tool
  { id: "gmt", name: "London (GMT/BST)", offset: 1 },
  { id: "cet", name: "Paris / Berlin (CET)", offset: 2 },
  { id: "gst", name: "Dubai (GST)", offset: 4 },
  { id: "ist", name: "India (IST)", offset: 5.5 },
  { id: "sgt", name: "Singapore (SGT)", offset: 8 },
  { id: "jst", name: "Tokyo (JST)", offset: 9 },
  { id: "aest", name: "Sydney (AEST)", offset: 10 }
];

export default function TimezoneMeetingPlanner() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States (Defaulting to the classic Tier-1 Triad)
  const [zone1, setZone1] = useState(TIMEZONES.find(t => t.id === "est"));
  const [zone2, setZone2] = useState(TIMEZONES.find(t => t.id === "gmt"));
  const [zone3, setZone3] = useState(TIMEZONES.find(t => t.id === "aest"));
  
  // Base Time (in minutes from midnight) - Default 10:00 AM
  const [baseTimeMins, setBaseTimeMins] = useState(10 * 60);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Time formatting & Status Logic
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.round(minutes % 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${ampm}`;
  };

  const getStatus = (minutes) => {
    const h = Math.floor(minutes / 60) % 24;
    // Working hours: 9 AM to 5 PM (17:00)
    if (h >= 9 && h < 17) return { label: "Work Hours", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", icon: Briefcase };
    // Acceptable/Evening: 7 AM - 9 AM or 5 PM - 8 PM
    if ((h >= 7 && h < 9) || (h >= 17 && h < 20)) return { label: "Outside Hours", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", icon: Sun };
    // Sleeping/Night: 8 PM to 7 AM
    return { label: "Sleeping", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800", icon: Moon };
  };

  // Core Global Math Engine
  const calculations = useMemo(() => {
    // Convert Zone 1 time to Absolute UTC Minutes
    const utcMins = baseTimeMins - (zone1.offset * 60);

    const getZoneData = (zone) => {
      if (!zone) return null;
      // Calculate local minutes, ensuring positive modulo wrapping
      let localMins = (utcMins + (zone.offset * 60)) % (24 * 60);
      if (localMins < 0) localMins += (24 * 60);
      
      let dayOffset = "";
      const baseRaw = baseTimeMins;
      const targetRaw = utcMins + (zone.offset * 60);
      
      if (Math.floor(targetRaw / (24*60)) > Math.floor(baseRaw / (24*60))) dayOffset = "(Next Day)";
      if (Math.floor(targetRaw / (24*60)) < Math.floor(baseRaw / (24*60))) dayOffset = "(Prev Day)";

      return {
        zone,
        timeStr: formatTime(localMins),
        status: getStatus(localMins),
        dayOffset
      };
    };

    const results = [getZoneData(zone1), getZoneData(zone2), getZoneData(zone3)].filter(Boolean);
    
    // Overall Meeting Score
    const allGreen = results.every(r => r.status.label === "Work Hours");
    const anyRed = results.some(r => r.status.label === "Sleeping");
    
    let summaryMsg = "Perfect Time!";
    let summaryStatus = "optimal";
    if (anyRed) {
      summaryMsg = "Someone is sleeping! Very hard to schedule.";
      summaryStatus = "danger";
    } else if (!allGreen) {
      summaryMsg = "Requires compromise from at least one person.";
      summaryStatus = "warning";
    }

    return { results, summaryMsg, summaryStatus };
  }, [baseTimeMins, zone1, zone2, zone3]);

  // Handlers
  const copyToClipboard = () => {
    const text = `Let's meet at:\n` + calculations.results.map(r => 
      `- ${r.timeStr} ${r.zone.name.split(' ')[0]} ${r.dayOffset}`
    ).join('\n');
    
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const findBestTime = () => {
    // Scan all 24 hours (in 30 min increments) to find the slot with least 'Sleeping'
    let bestScore = -999;
    let bestTime = baseTimeMins;

    for(let m = 0; m < 24 * 60; m += 30) {
      const utcMins = m - (zone1.offset * 60);
      let score = 0;
      
      [zone1, zone2, zone3].filter(Boolean).forEach(z => {
        let local = (utcMins + (z.offset * 60)) % (24 * 60);
        if (local < 0) local += (24 * 60);
        const h = Math.floor(local / 60) % 24;
        
        if (h >= 9 && h < 17) score += 5; // Green
        else if ((h >= 7 && h < 9) || (h >= 17 && h < 20)) score += 1; // Yellow
        else score -= 10; // Red
      });

      if (score > bestScore) {
        bestScore = score;
        bestTime = m;
      }
    }
    setBaseTimeMins(bestTime);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-xl shadow-inner">
            <Globe className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Timezone Meeting Planner
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Global Overlap & Golden Hours Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* Zone Selectors */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Globe className="w-4 h-4 text-indigo-500" /> Select Global Teams
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: "Host Zone (Base Time)", val: zone1, set: setZone1 },
                  { label: "Participant Zone 2", val: zone2, set: setZone2 },
                  { label: "Participant Zone 3", val: zone3, set: setZone3 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 focus-within:border-indigo-300 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-xs font-black shrink-0">{idx + 1}</span>
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{item.label}</label>
                      <select 
                        value={item.val?.id || ""}
                        onChange={(e) => item.set(TIMEZONES.find(t => t.id === e.target.value))}
                        className="w-full bg-transparent text-sm font-black text-slate-800 dark:text-slate-200 outline-none"
                      >
                        {TIMEZONES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Adjuster */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /> Adjust Meeting Time</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  {formatTime(baseTimeMins)} ({zone1.name.split(' ')[0]})
                </span>
              </h3>
              
              <div className="px-1 mb-6">
                <input
                  type="range" min="0" max="1410" step="30" // 30 min intervals
                  value={baseTimeMins}
                  onChange={(e) => setBaseTimeMins(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 border border-black/5 dark:border-white/5"
                />
                <div className="flex justify-between text-[9px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                  <span>12:00 AM</span>
                  <span>12:00 PM</span>
                  <span>11:30 PM</span>
                </div>
              </div>

              <button
                onClick={findBestTime}
                className="w-full py-3.5 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" /> Auto-Find Best Golden Hour
              </button>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[500px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500`}></div>
            
            <div className="flex items-center justify-between mb-6 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Overlap Dashboard
              </span>
            </div>

            {/* Smart Summary Banner */}
            <div className={`p-4 rounded-xl border flex items-center gap-3 mb-6 shadow-sm ${
              calculations.summaryStatus === 'danger' ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/50' :
              calculations.summaryStatus === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50' :
              'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/50'
            }`}>
              {calculations.summaryStatus === 'danger' ? <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              <span className={`text-xs font-black uppercase tracking-widest ${
                calculations.summaryStatus === 'danger' ? 'text-rose-700 dark:text-rose-400' :
                calculations.summaryStatus === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                'text-emerald-700 dark:text-emerald-400'
              }`}>
                {calculations.summaryMsg}
              </span>
            </div>
            
            {/* The Results List */}
            <div className="space-y-3 mb-8">
              {calculations.results.map((res, i) => {
                const StatusIcon = res.status.icon;
                return (
                  <div key={i} className={`p-4 rounded-xl border shadow-sm transition-colors flex items-center justify-between bg-white dark:bg-slate-900 ${res.status.border}`}>
                    <div>
                      <span className="block text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                        {res.timeStr}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{res.zone.name}</span>
                        {res.dayOffset && <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">{res.dayOffset}</span>}
                      </div>
                    </div>
                    
                    <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border ${res.status.bg} ${res.status.border} shrink-0 w-28`}>
                      <StatusIcon className={`w-4 h-4 mb-1 ${res.status.color}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest text-center ${res.status.color}`}>
                        {res.status.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Export Action */}
            <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-6">
              <button
                onClick={copyToClipboard}
                className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Invite Copied!' : 'Copy Meeting Times'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
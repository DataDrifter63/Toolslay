"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Globe, Clock, CalendarCheck, Copy, CheckCircle2,
  AlertCircle, Moon, Sun, Briefcase
} from "lucide-react";

// Tier-1 & Global Business Hubs
const TIMEZONES = [
  { id: "pdt", name: "Los Angeles (PDT)", offset: -7 },
  { id: "est", name: "New York (EST)", offset: -4 },
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
    if (h >= 9 && h < 17) return { label: "Work Hours", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Briefcase };
    // Acceptable/Evening: 7 AM - 9 AM or 5 PM - 8 PM
    if ((h >= 7 && h < 9) || (h >= 17 && h < 20)) return { label: "Outside Hours", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Sun };
    // Sleeping/Night: 8 PM to 7 AM
    return { label: "Sleeping", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: Moon };
  };

  // Core Global Math Engine
  const calculations = useMemo(() => {
    const utcMins = baseTimeMins - (zone1.offset * 60);

    const getZoneData = (zone) => {
      if (!zone) return null;
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
    let bestScore = -999;
    let bestTime = baseTimeMins;

    for(let m = 0; m < 24 * 60; m += 30) {
      const utcMins = m - (zone1.offset * 60);
      let score = 0;
      
      [zone1, zone2, zone3].filter(Boolean).forEach(z => {
        let local = (utcMins + (z.offset * 60)) % (24 * 60);
        if (local < 0) local += (24 * 60);
        const h = Math.floor(local / 60) % 24;
        
        if (h >= 9 && h < 17) score += 5;
        else if ((h >= 7 && h < 9) || (h >= 17 && h < 20)) score += 1;
        else score -= 10;
      });

      if (score > bestScore) {
        bestScore = score;
        bestTime = m;
      }
    }
    setBaseTimeMins(bestTime);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-paper p-3 rounded-xl border border-line shrink-0">
            <Globe className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Timezone Meeting Planner
            </h2>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">
              Global Overlap & Golden Hours Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Zone Selectors */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-3 mb-4">
                <Globe className="w-4 h-4 text-indigo-500" /> Select Global Teams
              </h3>
              
              <div className="space-y-3">
                {[
                  { label: "Host Zone (Base Time)", val: zone1, set: setZone1 },
                  { label: "Participant Zone 2", val: zone2, set: setZone2 },
                  { label: "Participant Zone 3", val: zone3, set: setZone3 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-line focus-within:border-brand transition-colors">
                    <span className="w-6 h-6 rounded-full bg-paper border border-line text-muted flex items-center justify-center text-xs font-black shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <label className="text-[9px] font-black text-muted uppercase tracking-wider block mb-1">{item.label}</label>
                      <select 
                        value={item.val?.id || ""}
                        onChange={(e) => item.set(TIMEZONES.find(t => t.id === e.target.value))}
                        className="w-full bg-transparent text-xs sm:text-sm font-black text-ink outline-none cursor-pointer"
                      >
                        {TIMEZONES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Adjuster */}
            <div className="pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center justify-between border-b border-line pb-3 mb-4">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /> Adjust Meeting Time</span>
                <span className="text-xs font-black text-indigo-500 bg-surface px-2.5 py-1 rounded-lg border border-line font-mono">
                  {formatTime(baseTimeMins)} ({zone1.name.split(' ')[0]})
                </span>
              </h3>
              
              <div className="px-1 mb-5">
                <input
                  type="range" min="0" max="1410" step="30"
                  value={baseTimeMins}
                  onChange={(e) => setBaseTimeMins(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-line"
                />
                <div className="flex justify-between text-[9px] font-black mt-2 uppercase tracking-wider text-muted">
                  <span>12:00 AM</span>
                  <span>12:00 PM</span>
                  <span>11:30 PM</span>
                </div>
              </div>

              <button
                type="button"
                onClick={findBestTime}
                className="w-full py-3.5 rounded-xl border border-dashed border-line hover:border-brand bg-surface text-brand text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" /> Auto-Find Best Golden Hour
              </button>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col min-h-[480px]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
            
            <div className="flex items-center justify-between mb-5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper border border-line text-[10px] font-black uppercase tracking-wider text-muted shadow-sm">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Overlap Dashboard
              </span>
            </div>

            {/* Smart Summary Banner */}
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 mb-5 shadow-sm ${
              calculations.summaryStatus === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' :
              calculations.summaryStatus === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              {calculations.summaryStatus === 'danger' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span className="text-xs font-black uppercase tracking-wider">
                {calculations.summaryMsg}
              </span>
            </div>
            
            {/* The Results List */}
            <div className="space-y-3 mb-6">
              {calculations.results.map((res, i) => {
                const StatusIcon = res.status.icon;
                return (
                  <div key={i} className="p-3.5 sm:p-4 rounded-xl border border-line shadow-sm transition-colors flex items-center justify-between bg-paper">
                    <div className="min-w-0 pr-2">
                      <span className="block text-xl sm:text-2xl font-black text-ink tabular-nums leading-none mb-1 font-mono">
                        {res.timeStr}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted truncate">{res.zone.name}</span>
                        {res.dayOffset && <span className="text-[9px] font-black text-indigo-500 bg-surface border border-line px-1.5 py-0.5 rounded font-mono">{res.dayOffset}</span>}
                      </div>
                    </div>
                    
                    <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border ${res.status.bg} ${res.status.border} shrink-0 w-28`}>
                      <StatusIcon className={`w-4 h-4 mb-1 ${res.status.color}`} />
                      <span className={`text-[9px] font-black uppercase tracking-wider text-center ${res.status.color}`}>
                        {res.status.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Export Action */}
            <div className="mt-auto pt-4 border-t border-line">
              <button
                type="button"
                onClick={copyToClipboard}
                className="w-full py-3.5 rounded-xl bg-brand text-surface hover:opacity-90 text-xs font-black uppercase tracking-wider transition-opacity flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Invite Copied!' : 'Copy Meeting Times'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
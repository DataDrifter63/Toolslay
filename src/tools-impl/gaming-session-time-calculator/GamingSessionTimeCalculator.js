"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Gamepad2, Clock, CalendarDays, Trophy, 
  Target, Skull, Droplets, Coffee, 
  Zap, Save, MonitorPlay, Activity,
  Swords, ShieldAlert
} from "lucide-react";

// --- PLAYSTYLE MULTIPLIERS ---
const PLAYSTYLES = [
  { id: "speedrun", label: "Speedrun", mult: 0.7, icon: Zap, desc: "Rushing main objectives only", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  { id: "casual", label: "Casual Play", mult: 1.0, icon: Gamepad2, desc: "Normal pace, enjoying the game", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "border-indigo-200 dark:border-indigo-800" },
  { id: "completionist", label: "100% Run", mult: 1.4, icon: Trophy, desc: "Getting every achievement/item", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" }
];

export default function GamingSessionCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Game Info States
  const [gameTitle, setGameTitle] = useState("");
  const [playstyle, setPlaystyle] = useState(PLAYSTYLES[1]); // Default Casual
  
  // Gameplay Metrics
  const [mainQuests, setMainQuests] = useState({ count: "", avgMins: "" });
  const [sideQuests, setSideQuests] = useState({ count: "", avgMins: "" });
  
  // Real-life Scheduling
  const [dailyPlayHours, setDailyPlayHours] = useState("2");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInput = (setter, field, value) => {
    if (value === "" || /^\d+$/.test(value)) {
      setter(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDailyInput = (value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDailyPlayHours(value);
    }
  };

  // --- CORE ENGINE CALCULATIONS ---
  const calculations = useMemo(() => {
    // Parse Inputs
    const mCount = parseInt(mainQuests.count) || 0;
    const mMins = parseInt(mainQuests.avgMins) || 0;
    const sCount = parseInt(sideQuests.count) || 0;
    const sMins = parseInt(sideQuests.avgMins) || 0;
    const dailyHrs = parseFloat(dailyPlayHours) || 1; // Default to 1 to prevent infinity

    // Base Math
    const baseMainMins = mCount * mMins;
    const baseSideMins = sCount * sMins;
    const totalBaseMins = baseMainMins + baseSideMins;

    // Apply Playstyle Multiplier
    const totalMins = Math.round(totalBaseMins * playstyle.mult);
    
    // Time Breakdowns
    const totalHours = Math.floor(totalMins / 60);
    const remainingMins = totalMins % 60;
    
    // Distribution for visual bars
    const mainMinsAdjusted = Math.round(baseMainMins * playstyle.mult);
    const sideMinsAdjusted = Math.round(baseSideMins * playstyle.mult);
    const pctMain = totalMins > 0 ? (mainMinsAdjusted / totalMins) * 100 : 0;
    const pctSide = totalMins > 0 ? (sideMinsAdjusted / totalMins) * 100 : 0;

    // Real-Life Dates
    const daysToBeat = Math.ceil((totalMins / 60) / dailyHrs);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToBeat);

    // Gamer Health Metrics
    // 1 break recommended every 90 mins (1.5 hours)
    const recommendedBreaks = Math.floor(totalMins / 90); 
    // Roughly 0.25 Liters of water per hour of gaming
    const hydrationLiters = ((totalMins / 60) * 0.25).toFixed(1);

    return {
      totalMins, totalHours, remainingMins,
      mainMinsAdjusted, sideMinsAdjusted, pctMain, pctSide,
      daysToBeat, completionDate,
      recommendedBreaks, hydrationLiters
    };
  }, [mainQuests, sideQuests, playstyle, dailyPlayHours]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100 via-fuchsia-50 to-transparent dark:from-purple-900/30 dark:via-fuchsia-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-fuchsia-500 p-3.5 rounded-2xl shadow-md">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Session Time Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Game Completion & Schedule Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: GAMING INPUT ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Title & Playstyle */}
            <div className="space-y-6 border-b border-slate-100 dark:border-slate-800 pb-8">
              <div className="relative">
                <input
                  type="text" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="Enter Game Title (Optional)"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-xl font-black text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5" /> Select Your Playstyle
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLAYSTYLES.map((style) => (
                    <button 
                      key={style.id} onClick={() => setPlaystyle(style)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${playstyle.id === style.id ? `${style.bg} ${style.border} ${style.color} shadow-sm` : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300"}`}
                    >
                      <style.icon className="w-5 h-5 mb-2" />
                      <span className="text-xs font-black uppercase tracking-widest">{style.label}</span>
                      <span className="text-[9px] font-bold mt-1 opacity-70 text-center leading-tight">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Multipliers */}
            <div className="space-y-6">
              
              {/* Main Quests */}
              <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/50">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Swords className="w-4 h-4" /> Main Story / Campaign
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Total Missions/Levels</label>
                    <input type="text" value={mainQuests.count} onChange={(e) => handleInput(setMainQuests, "count", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. 25" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Avg. Mins per Mission</label>
                    <input type="text" value={mainQuests.avgMins} onChange={(e) => handleInput(setMainQuests, "avgMins", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. 45" />
                  </div>
                </div>
              </div>

              {/* Side Quests */}
              <div className="p-5 rounded-2xl bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border border-fuchsia-200 dark:border-fuchsia-800/50">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-1.5 text-fuchsia-600 dark:text-fuchsia-400">
                  <Target className="w-4 h-4" /> Side Quests / Extras
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Total Side Missions</label>
                    <input type="text" value={sideQuests.count} onChange={(e) => handleInput(setSideQuests, "count", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-fuchsia-200 dark:border-fuchsia-800 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-fuchsia-500" placeholder="e.g. 15" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Avg. Mins per Side Quest</label>
                    <input type="text" value={sideQuests.avgMins} onChange={(e) => handleInput(setSideQuests, "avgMins", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-fuchsia-200 dark:border-fuchsia-800 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-fuchsia-500" placeholder="e.g. 20" />
                  </div>
                </div>
              </div>

              {/* Real Life Scheduler */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-slate-800 dark:text-slate-200 mb-1">
                    <CalendarDays className="w-4 h-4 text-blue-500" /> Daily Playtime
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400">How many hours a day can you play?</p>
                </div>
                <div className="w-24 shrink-0">
                  <div className="relative flex items-center">
                    <input type="text" value={dailyPlayHours} onChange={(e) => handleDailyInput(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-base font-black text-center outline-none focus:border-blue-500" />
                    <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">hrs</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD ORACLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className="w-4 h-4 text-purple-500" /> Mission Briefing
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-sm border ${playstyle.border} ${playstyle.bg} ${playstyle.color}`}>
                  {playstyle.label} Mode
                </span>
              </div>

              {/* TOTAL PLAYTIME HERO */}
              <div className="text-center mb-6 bg-white dark:bg-slate-900 py-8 px-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5">
                  <Clock className="w-40 h-40 text-purple-500" />
                </div>
                
                <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Estimated Total Playtime</span>
                <div className="flex items-end justify-center gap-2 mb-2">
                  {calculations.totalHours > 0 && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl sm:text-7xl font-black tabular-nums tracking-tighter leading-none text-purple-600 dark:text-purple-400">{calculations.totalHours}</span>
                      <span className="text-xl font-bold text-slate-400 uppercase">h</span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className={`font-black tabular-nums tracking-tighter leading-none ${calculations.totalHours > 0 ? 'text-4xl text-fuchsia-500' : 'text-6xl sm:text-7xl text-purple-600 dark:text-purple-400'}`}>
                      {calculations.remainingMins}
                    </span>
                    <span className="text-xl font-bold text-slate-400 uppercase">m</span>
                  </div>
                </div>

                {/* Progress Bar Distribution */}
                {calculations.totalMins > 0 && (
                  <div className="w-full mt-8">
                    <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {calculations.pctMain > 0 && <div style={{ width: `${calculations.pctMain}%` }} className="bg-purple-500" title={`Main Story: ${Math.floor(calculations.mainMinsAdjusted/60)}h ${calculations.mainMinsAdjusted%60}m`}></div>}
                      {calculations.pctSide > 0 && <div style={{ width: `${calculations.pctSide}%` }} className="bg-fuchsia-500" title={`Side Quests: ${Math.floor(calculations.sideMinsAdjusted/60)}h ${calculations.sideMinsAdjusted%60}m`}></div>}
                    </div>
                    <div className="flex justify-between mt-2 px-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {calculations.pctMain > 0 && <span className="text-purple-500 flex items-center gap-1"><Swords className="w-3 h-3"/> Main</span>}
                      {calculations.pctSide > 0 && <span className="text-fuchsia-500 flex items-center gap-1"><Target className="w-3 h-3"/> Side</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* REAL-LIFE SCHEDULE */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/50 flex flex-col justify-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> Days to Beat</span>
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none">
                    {calculations.totalMins > 0 ? calculations.daysToBeat : 0} <span className="text-sm font-bold text-slate-500 uppercase">Days</span>
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex flex-col justify-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1 flex items-center gap-1"><Trophy className="w-3 h-3"/> Finished By</span>
                  <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                    {calculations.totalMins > 0 ? calculations.completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                  </span>
                </div>
              </div>

              {/* GAMER HEALTH / BIO-STATS */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5 shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Gamer Bio-Health Advisor
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-lg shrink-0">
                      <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Screen Breaks</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {calculations.recommendedBreaks} Breaks <span className="text-[10px] font-medium text-slate-400 normal-case">(Every 90 mins)</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="bg-cyan-100 dark:bg-cyan-900/40 p-2.5 rounded-lg shrink-0">
                      <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Hydration Required</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {calculations.hydrationLiters} Liters <span className="text-[10px] font-medium text-slate-400 normal-case">of water</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
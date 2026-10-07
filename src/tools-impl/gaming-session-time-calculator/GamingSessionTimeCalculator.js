"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Gamepad2, Clock, CalendarDays, Trophy, 
  Target, Skull, Droplets, Coffee, 
  Zap, Save, MonitorPlay, Activity,
  Swords, ShieldAlert
} from "lucide-react";

const PLAYSTYLES = [
  { id: "speedrun", label: "Speedrun", mult: 0.7, icon: Zap, desc: "Rushing main objectives only" },
  { id: "casual", label: "Casual Play", mult: 1.0, icon: Gamepad2, desc: "Normal pace, enjoying the game" },
  { id: "completionist", label: "100% Run", mult: 1.4, icon: Trophy, desc: "Getting every achievement/item" }
];

export default function GamingSessionCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [gameTitle, setGameTitle] = useState("");
  const [playstyle, setPlaystyle] = useState(PLAYSTYLES[1]);
  
  const [mainQuests, setMainQuests] = useState({ count: "", avgMins: "" });
  const [sideQuests, setSideQuests] = useState({ count: "", avgMins: "" });
  
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

  const calculations = useMemo(() => {
    const mCount = parseInt(mainQuests.count) || 0;
    const mMins = parseInt(mainQuests.avgMins) || 0;
    const sCount = parseInt(sideQuests.count) || 0;
    const sMins = parseInt(sideQuests.avgMins) || 0;
    const dailyHrs = parseFloat(dailyPlayHours) || 1;

    const baseMainMins = mCount * mMins;
    const baseSideMins = sCount * sMins;
    const totalBaseMins = baseMainMins + baseSideMins;

    const totalMins = Math.round(totalBaseMins * playstyle.mult);
    
    const totalHours = Math.floor(totalMins / 60);
    const remainingMins = totalMins % 60;
    
    const mainMinsAdjusted = Math.round(baseMainMins * playstyle.mult);
    const sideMinsAdjusted = Math.round(baseSideMins * playstyle.mult);
    const pctMain = totalMins > 0 ? (mainMinsAdjusted / totalMins) * 100 : 0;
    const pctSide = totalMins > 0 ? (sideMinsAdjusted / totalMins) * 100 : 0;

    const daysToBeat = Math.ceil((totalMins / 60) / dailyHrs);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToBeat);

    const recommendedBreaks = Math.floor(totalMins / 90); 
    const hydrationLiters = ((totalMins / 60) * 0.25).toFixed(1);

    return {
      totalMins, totalHours, remainingMins,
      mainMinsAdjusted, sideMinsAdjusted, pctMain, pctSide,
      daysToBeat, completionDate,
      recommendedBreaks, hydrationLiters
    };
  }, [mainQuests, sideQuests, playstyle, dailyPlayHours]);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <MonitorPlay className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Session Time Oracle
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Game completion time calculator and gamer health advisor.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: GAMING INPUT ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-5 font-sans">
            
            <div className="space-y-4 border-b border-line pb-5">
              <div>
                <input
                  type="text" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="Enter Game Title (Optional)"
                  className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm font-bold text-ink outline-none focus:border-brand placeholder:text-muted"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-brand" /> Playstyle Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PLAYSTYLES.map((style) => (
                    <button 
                      key={style.id} type="button" onClick={() => setPlaystyle(style)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${playstyle.id === style.id ? "bg-brand/10 border-brand shadow-sm text-brand" : "bg-surface border-line text-muted hover:border-brand/50"}`}
                    >
                      <style.icon className="w-4 h-4 mb-1.5" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{style.label}</span>
                      <span className="text-[8px] font-bold mt-0.5 opacity-70 text-center leading-tight truncate w-full">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              
              <div className="p-3.5 rounded-xl bg-surface border border-line">
                <h4 className="text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-1.5 text-ink">
                  <Swords className="w-3.5 h-3.5 text-brand" /> Main Story / Campaign
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-bold text-muted mb-1">Missions/Levels</label>
                    <input type="text" value={mainQuests.count} onChange={(e) => handleInput(setMainQuests, "count", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-black text-ink outline-none focus:border-brand" placeholder="e.g. 25" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted mb-1">Avg. Mins/Mission</label>
                    <input type="text" value={mainQuests.avgMins} onChange={(e) => handleInput(setMainQuests, "avgMins", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-black text-ink outline-none focus:border-brand" placeholder="e.g. 45" />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-line">
                <h4 className="text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-1.5 text-ink">
                  <Target className="w-3.5 h-3.5 text-brand" /> Side Quests / Extras
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-bold text-muted mb-1">Side Missions</label>
                    <input type="text" value={sideQuests.count} onChange={(e) => handleInput(setSideQuests, "count", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-black text-ink outline-none focus:border-brand" placeholder="e.g. 15" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted mb-1">Avg. Mins/Quest</label>
                    <input type="text" value={sideQuests.avgMins} onChange={(e) => handleInput(setSideQuests, "avgMins", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-black text-ink outline-none focus:border-brand" placeholder="e.g. 20" />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-ink mb-0.5">
                    <CalendarDays className="w-3.5 h-3.5 text-brand" /> Daily Playtime
                  </h4>
                  <p className="text-[9px] font-bold text-muted">Hours you can play per day</p>
                </div>
                <div className="w-20 shrink-0">
                  <div className="relative flex items-center">
                    <input type="text" value={dailyPlayHours} onChange={(e) => handleDailyInput(e.target.value)} className="w-full bg-paper border border-line rounded-xl px-2.5 py-2 text-xs font-black text-center text-ink outline-none focus:border-brand" />
                    <span className="absolute right-2.5 text-[9px] font-bold text-muted pointer-events-none">hrs</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* RIGHT: THE DASHBOARD ORACLE */}
        <div className="space-y-4 sm:space-y-6 w-full font-sans">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col min-h-[550px]">
             
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Mission Briefing
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-xl">
                {playstyle.label}
              </span>
            </div>

            {/* TOTAL PLAYTIME HERO */}
            <div className="text-center mb-4 bg-surface py-6 px-4 rounded-2xl border border-line shadow-sm relative overflow-hidden">
              <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-1">Estimated Total Playtime</span>
              <div className="flex items-end justify-center gap-1.5 mb-2 font-mono">
                {calculations.totalHours > 0 && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl sm:text-6xl font-black tabular-nums tracking-tighter leading-none text-ink">{calculations.totalHours}</span>
                    <span className="text-base font-bold text-muted uppercase">h</span>
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className={`font-black tabular-nums tracking-tighter leading-none ${calculations.totalHours > 0 ? 'text-3xl text-brand' : 'text-5xl sm:text-6xl text-ink'}`}>
                    {calculations.remainingMins}
                  </span>
                  <span className="text-base font-bold text-muted uppercase">m</span>
                </div>
              </div>

              {calculations.totalMins > 0 && (
                <div className="w-3/4 mx-auto mt-4">
                  <div className="flex h-2 rounded-full overflow-hidden bg-paper border border-line">
                    {calculations.pctMain > 0 && <div style={{ width: `${calculations.pctMain}%` }} className="bg-brand" title="Main Story"></div>}
                    {calculations.pctSide > 0 && <div style={{ width: `${calculations.pctSide}%` }} className="bg-amber-500" title="Side Quests"></div>}
                  </div>
                </div>
              )}
            </div>

            {/* REAL-LIFE SCHEDULE */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-surface p-3 rounded-xl border border-line flex flex-col justify-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted block mb-0.5 flex items-center gap-1"><CalendarDays className="w-3 h-3 text-brand"/> Days to Beat</span>
                <span className="text-xl font-black text-ink tabular-nums leading-none font-mono">
                  {calculations.totalMins > 0 ? calculations.daysToBeat : 0} <span className="text-xs font-bold text-muted uppercase">Days</span>
                </span>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-line flex flex-col justify-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted block mb-0.5 flex items-center gap-1"><Trophy className="w-3 h-3 text-brand"/> Finished By</span>
                <span className="text-xs sm:text-sm font-black text-ink leading-tight">
                  {calculations.totalMins > 0 ? calculations.completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                </span>
              </div>
            </div>

            {/* GAMER HEALTH / BIO-STATS */}
            <div className="flex-1 flex flex-col min-h-0 bg-surface rounded-xl border border-line p-3.5 shadow-sm">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted mb-2.5 flex items-center gap-1.5 shrink-0">
                <ShieldAlert className="w-3 h-3 text-rose-500" /> Gamer Bio-Health Advisor
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-paper p-2.5 rounded-xl border border-line">
                  <div className="bg-amber-500/10 p-2 rounded-lg shrink-0 text-amber-500">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase tracking-widest text-muted">Screen Breaks</span>
                    <span className="text-xs font-black text-ink">
                      {calculations.recommendedBreaks} Breaks <span className="text-[9px] font-medium text-muted">(Every 90m)</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-paper p-2.5 rounded-xl border border-line">
                  <div className="bg-cyan-500/10 p-2 rounded-lg shrink-0 text-cyan-500">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase tracking-widest text-muted">Hydration Required</span>
                    <span className="text-xs font-black text-ink">
                      {calculations.hydrationLiters} Liters <span className="text-[9px] font-medium text-muted">of water</span>
                    </span>
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
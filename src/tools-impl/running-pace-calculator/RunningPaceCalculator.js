"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Timer, Activity, Map, Footprints, 
  Gauge, Target, Zap, ChevronRight,
  TrendingUp, Trophy
} from "lucide-react";

// Standard Race Distances for Presets & Predictions
const RACES = [
  { id: "5k", name: "5K", km: 5, mi: 3.10686 },
  { id: "10k", name: "10K", km: 10, mi: 6.21371 },
  { id: "half", name: "Half Marathon", km: 21.0975, mi: 13.1094 },
  { id: "full", name: "Full Marathon", km: 42.195, mi: 26.2188 }
];

export default function RunningPaceCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [system, setSystem] = useState("imperial"); // imperial (miles) or metric (km)
  const [distance, setDistance] = useState(3.11); // Default to 5K in miles roughly
  
  // Time Inputs
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  
  const [activePreset, setActivePreset] = useState("5k");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // System Toggle
  const handleSystemChange = (newSystem) => {
    if (newSystem === system) return;
    
    // Convert current distance roughly to maintain user intent
    if (newSystem === "metric") {
      setDistance(parseFloat((distance * 1.60934).toFixed(2)));
    } else {
      setDistance(parseFloat((distance / 1.60934).toFixed(2)));
    }
    setSystem(newSystem);
    setActivePreset("custom");
  };

  // Apply Race Preset
  const applyPreset = (raceId) => {
    const race = RACES.find(r => r.id === raceId);
    if (!race) return;
    setActivePreset(raceId);
    setDistance(system === "imperial" ? parseFloat(race.mi.toFixed(2)) : parseFloat(race.km.toFixed(2)));
  };

  // Distance change handler
  const handleDistanceChange = (val) => {
    setDistance(val);
    setActivePreset("custom");
  };

  // Time formatting helper (Seconds -> HH:MM:SS or MM:SS)
  const formatTime = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds) || !isFinite(totalSeconds)) return "00:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.round(totalSeconds % 60);
    
    const pad = (num) => num.toString().padStart(2, '0');
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  // Core Math Engine & Riegel Predictor
  const calculations = useMemo(() => {
    const d = parseFloat(distance) || 0;
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    
    const totalSeconds = (h * 3600) + (m * 60) + s;
    const isEmpty = d <= 0 || totalSeconds <= 0;

    // Distances in both units
    const distMi = system === "imperial" ? d : d / 1.60934;
    const distKm = system === "metric" ? d : d * 1.60934;

    // Pace (Seconds per unit)
    const secPerMi = distMi > 0 ? totalSeconds / distMi : 0;
    const secPerKm = distKm > 0 ? totalSeconds / distKm : 0;

    // Treadmill Speed
    const mph = distMi > 0 ? distMi / (totalSeconds / 3600) : 0;
    const kph = distKm > 0 ? distKm / (totalSeconds / 3600) : 0;

    // Track Splitting (400m is 0.25 miles approx, or exactly 0.4 km)
    const track400mSecs = secPerKm * 0.4;

    // Peter Riegel's Race Predictor Formula: T2 = T1 * (D2 / D1)^1.06
    // Widely used in the running industry (Strava/Garmin)
    const predictRace = (targetKm) => {
      if (isEmpty || distKm === 0) return 0;
      return totalSeconds * Math.pow((targetKm / distKm), 1.06);
    };

    const predictions = RACES.map(race => ({
      ...race,
      predictedSecs: predictRace(race.km)
    }));

    return {
      totalSeconds,
      secPerMi,
      secPerKm,
      mph: parseFloat(mph.toFixed(1)),
      kph: parseFloat(kph.toFixed(1)),
      track400mSecs,
      predictions,
      isEmpty
    };
  }, [distance, hours, minutes, seconds, system]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-100 to-transparent dark:from-orange-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/30 p-3.5 rounded-2xl">
            <Footprints className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Running Pace Calculator
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              Pace, Treadmill Speed & Race Finish Predictor
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: CLEAN INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* System Toggle */}
            <div className="flex justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => handleSystemChange("imperial")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "imperial" ? "bg-white dark:bg-slate-700 text-orange-600 shadow-sm" : "text-slate-500"}`}>Imperial (Miles)</button>
                <button onClick={() => handleSystemChange("metric")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "metric" ? "bg-white dark:bg-slate-700 text-orange-600 shadow-sm" : "text-slate-500"}`}>Metric (KM)</button>
              </div>
            </div>

            {/* Quick Race Presets */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Target className="w-4 h-4 text-slate-400" /> Quick Select Distance
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {RACES.map((race) => (
                  <button
                    key={race.id}
                    onClick={() => applyPreset(race.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      activePreset === race.id
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-orange-200"
                    }`}
                  >
                    <span className={`block text-xs font-black uppercase tracking-wider ${activePreset === race.id ? 'text-orange-700 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {race.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Map className="w-4 h-4 text-slate-400" /> Run Distance
              </label>
              <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-50 dark:focus-within:ring-orange-900/20 transition-all overflow-hidden">
                <input
                  type="number" min="0.1" step="0.01" value={distance} onChange={(e) => handleDistanceChange(e.target.value)}
                  className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                />
                <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 border-l border-slate-200 dark:border-slate-700 px-6 py-4 h-full">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">{system === "imperial" ? "Miles" : "Kilometers"}</span>
                </div>
              </div>
            </div>

            {/* Time Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-slate-400" /> Run Time
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative flex flex-col bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-50 dark:focus-within:ring-orange-900/20 transition-all px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Hours</span>
                  <input
                    type="number" min="0" max="99" value={hours} onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-transparent text-xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="relative flex flex-col bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-50 dark:focus-within:ring-orange-900/20 transition-all px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Minutes</span>
                  <input
                    type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)}
                    className="w-full bg-transparent text-xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="relative flex flex-col bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-50 dark:focus-within:ring-orange-900/20 transition-all px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Seconds</span>
                  <input
                    type="number" min="0" max="59" value={seconds} onChange={(e) => setSeconds(e.target.value)}
                    className="w-full bg-transparent text-xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RUNNER DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <Activity className="w-3.5 h-3.5 text-orange-500" /> Pace Analysis
                </span>
              </div>
              
              {/* Core Metric: Pace */}
              <div className="text-center mb-8">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Your Running Pace</span>
                <div className="flex justify-center items-end gap-2">
                  <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                    {formatTime(system === "imperial" ? calculations.secPerMi : calculations.secPerKm)}
                  </span>
                  <span className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    / {system === "imperial" ? "Mi" : "Km"}
                  </span>
                </div>
                
                {/* Secondary Pace Toggle Display */}
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                  Equivalent to {formatTime(system === "imperial" ? calculations.secPerKm : calculations.secPerMi)} / {system === "imperial" ? "Km" : "Mi"}
                </div>
              </div>

              {/* Treadmill & Track Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                  <Gauge className="w-5 h-5 text-sky-500 mb-2" />
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
                    {system === "imperial" ? calculations.mph : calculations.kph} <span className="text-xs font-bold text-slate-400 uppercase">{system === "imperial" ? "MPH" : "KPH"}</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Treadmill Speed</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                  <Zap className="w-5 h-5 text-amber-500 mb-2" />
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
                    {formatTime(calculations.track400mSecs)}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">400m Track Lap</span>
                </div>
              </div>

              {/* Race Finish Predictor (Riegel Formula) */}
              <div className="flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-slate-400" /> Riegel's Race Predictor
                </h4>
                
                <div className="space-y-2">
                  {calculations.predictions.map((race, i) => (
                    <div key={race.id} className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:border-orange-200 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30 transition-colors">
                          <Trophy className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{race.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">
                        {calculations.isEmpty ? "--:--" : formatTime(race.predictedSecs)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Educational Note */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-medium text-slate-500 leading-relaxed text-center">
                  Race predictions use Peter Riegel's formula ($T_2 = T_1 \times (D_2 / D_1)^{1.06}$). It assumes you have done the appropriate aerobic training for the target distance.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
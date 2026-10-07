"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Bike, Timer, Map, Zap, Wind, 
  Activity, Target, Flame, ChevronRight,
  TrendingUp, Settings2
} from "lucide-react";

// Aerodynamic profiles for different bike types (Used for the Pro Watts Engine)
// CdA = Coefficient of Drag x Area, Weight = Rider(75kg) + Bike(kg)
const BIKE_PROFILES = [
  { id: "road_aero", name: "Aero Road Bike (Drops)", cda: 0.32, totalKg: 83, crr: 0.004, icon: Bike },
  { id: "gravel", name: "Gravel / CX Bike", cda: 0.40, totalKg: 85, crr: 0.006, icon: Bike },
  { id: "mtb", name: "Mountain Bike (MTB)", cda: 0.50, totalKg: 90, crr: 0.010, icon: Bike },
  { id: "commuter", name: "Upright Commuter", cda: 0.60, totalKg: 92, crr: 0.008, icon: Bike }
];

export default function CyclingSpeedCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [system, setSystem] = useState("imperial"); // imperial (mph/mi) or metric (kmh/km)
  const [solveFor, setSolveFor] = useState("speed"); // speed, distance, time
  
  // Inputs
  const [distance, setDistance] = useState(20); 
  const [speed, setSpeed] = useState(15);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(20);

  const [bikeProfile, setBikeProfile] = useState(BIKE_PROFILES[0]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // System Toggle
  const handleSystemChange = (newSystem) => {
    if (newSystem === system) return;
    
    // Rough conversions to maintain user intent
    if (newSystem === "metric") {
      setDistance(parseFloat((distance * 1.60934).toFixed(1)));
      setSpeed(parseFloat((speed * 1.60934).toFixed(1)));
    } else {
      setDistance(parseFloat((distance / 1.60934).toFixed(1)));
      setSpeed(parseFloat((speed / 1.60934).toFixed(1)));
    }
    setSystem(newSystem);
  };

  // Helper: Get decimal hours from inputs
  const getDecimalHours = () => {
    return (parseFloat(hours) || 0) + ((parseFloat(minutes) || 0) / 60);
  };

  // Time Formatting Helper (Decimals to HH:MM:SS)
  const formatTime = (decimalHours) => {
    if (!decimalHours || isNaN(decimalHours) || !isFinite(decimalHours)) return "00:00:00";
    const totalSeconds = Math.round(decimalHours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // Core Math Engine & Pro Aerodynamics Predictor
  const calculations = useMemo(() => {
    let calcSpeed = parseFloat(speed) || 0;
    let calcDistance = parseFloat(distance) || 0;
    let calcHours = getDecimalHours();

    // 1. Primary Solver Logic
    if (solveFor === "speed") {
      calcSpeed = calcHours > 0 ? calcDistance / calcHours : 0;
    } else if (solveFor === "distance") {
      calcDistance = calcSpeed * calcHours;
    } else if (solveFor === "time") {
      calcHours = calcSpeed > 0 ? calcDistance / calcSpeed : 0;
    }

    // Convert Speed to km/h for Physics Engine regardless of system
    const speedKmh = system === "metric" ? calcSpeed : calcSpeed * 1.60934;
    
    // 2. Physics Engine: Calculate required Watts on a flat road (Zero wind)
    // Formula: P_total = P_rolling + P_aero
    // P_rolling = Crr * mass(kg) * gravity(9.81) * Velocity(m/s)
    // P_aero = 0.5 * AirDensity(1.225) * CdA * Velocity^3
    const vMs = speedKmh / 3.6; // Velocity in meters per second
    
    let watts = 0;
    let calories = 0;

    if (vMs > 0) {
      const pRolling = bikeProfile.crr * bikeProfile.totalKg * 9.81 * vMs;
      const pAero = 0.5 * 1.225 * bikeProfile.cda * Math.pow(vMs, 3);
      
      // Add 3% drivetrain mechanical loss
      watts = (pRolling + pAero) / 0.97;
      
      // Calculate Kcal burned: (Watts * Hours * 3.6) / Efficiency(approx 0.24 for humans)
      // Simplifies roughly to: Watts * Hours * 3.6
      calories = watts * calcHours * 3.6;
    }

    // 3. Pacing Metrics
    // 10 unit split (10 miles or 10 km)
    const splitTimeHours = calcSpeed > 0 ? 10 / calcSpeed : 0;

    return {
      finalSpeed: parseFloat(calcSpeed.toFixed(2)),
      finalDistance: parseFloat(calcDistance.toFixed(2)),
      finalTimeRaw: calcHours,
      finalTimeFormatted: formatTime(calcHours),
      watts: Math.round(watts),
      calories: Math.round(calories),
      splitTimeFormatted: formatTime(splitTimeHours),
      isEmpty: (calcSpeed === 0 && calcDistance === 0)
    };
  }, [solveFor, distance, speed, hours, minutes, system, bikeProfile]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-100 to-transparent dark:from-cyan-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-cyan-50 dark:bg-cyan-900/30 p-3.5 rounded-2xl">
            <Bike className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Cycling Speed & Distance Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              3-Way Solver & Aerodynamic Watts Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: SOLVER PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Top Toolbar: System & Solver Selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              
              <div className="space-y-2 w-full sm:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">What do you want to find?</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-full sm:w-auto">
                  {[
                    { id: "speed", label: "Speed" },
                    { id: "distance", label: "Distance" },
                    { id: "time", label: "Time" }
                  ].map(mode => (
                    <button 
                      key={mode.id}
                      onClick={() => setSolveFor(mode.id)} 
                      className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${solveFor === mode.id ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
                <button onClick={() => handleSystemChange("imperial")} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "imperial" ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500"}`}>MPH</button>
                <button onClick={() => handleSystemChange("metric")} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "metric" ? "bg-white dark:bg-slate-700 text-cyan-600 shadow-sm" : "text-slate-500"}`}>KM/H</button>
              </div>

            </div>

            {/* Dynamic Inputs */}
            <div className="space-y-5">
              
              {/* Distance Input (Hidden if solving for Distance) */}
              {solveFor !== "distance" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-slate-400" /> Total Distance
                  </label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-50 dark:focus-within:ring-cyan-900/20 transition-all overflow-hidden">
                    <input
                      type="number" min="0" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)}
                      className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 border-l border-slate-200 dark:border-slate-700 px-6 py-4 h-full">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">{system === "imperial" ? "Miles" : "KM"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Speed Input (Hidden if solving for Speed) */}
              {solveFor !== "speed" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-slate-400" /> Average Speed
                  </label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-50 dark:focus-within:ring-cyan-900/20 transition-all overflow-hidden">
                    <input
                      type="number" min="0" step="0.1" value={speed} onChange={(e) => setSpeed(e.target.value)}
                      className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 border-l border-slate-200 dark:border-slate-700 px-6 py-4 h-full">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">{system === "imperial" ? "MPH" : "KM/H"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Input (Hidden if solving for Time) */}
              {solveFor !== "time" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-slate-400" /> Ride Duration
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative flex flex-col bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-50 dark:focus-within:ring-cyan-900/20 transition-all px-4 py-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Hours</span>
                      <input
                        type="number" min="0" max="99" value={hours} onChange={(e) => setHours(e.target.value)}
                        className="w-full bg-transparent text-xl font-black text-slate-800 dark:text-slate-100 outline-none"
                      />
                    </div>
                    <div className="relative flex flex-col bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-50 dark:focus-within:ring-cyan-900/20 transition-all px-4 py-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Minutes</span>
                      <input
                        type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)}
                        className="w-full bg-transparent text-xl font-black text-slate-800 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Aerodynamics Selector (Pro Feature) */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Settings2 className="w-4 h-4 text-slate-400" /> Bike & Aerodynamic Profile
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {BIKE_PROFILES.map((profile) => {
                  const isActive = bikeProfile.id === profile.id;
                  return (
                    <button
                      key={profile.id}
                      onClick={() => setBikeProfile(profile)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        isActive
                          ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-cyan-200"
                      }`}
                    >
                      <span className={`block text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {profile.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RIDER DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <Target className="w-3.5 h-3.5 text-cyan-500" /> Calculated Result
                </span>
              </div>
              
              {/* Grand Output based on Solver Mode */}
              <div className="text-center mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  {solveFor === "speed" ? "Average Speed Required" : solveFor === "distance" ? "Total Distance Covered" : "Total Time Required"}
                </span>
                
                <div className="flex justify-center items-end gap-2">
                  <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                    {solveFor === "speed" ? calculations.finalSpeed : 
                     solveFor === "distance" ? calculations.finalDistance : 
                     calculations.finalTimeFormatted}
                  </span>
                  {solveFor !== "time" && (
                    <span className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      {solveFor === "speed" ? (system === "imperial" ? "MPH" : "KM/H") : (system === "imperial" ? "Miles" : "KM")}
                    </span>
                  )}
                </div>
              </div>

              {/* The "Pro" Watts Engine Box */}
              <div className="flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-slate-400" /> Pro Performance Metrics
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] rounded-xl shadow-md">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl h-full flex flex-col items-center justify-center text-center">
                      <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 mb-2" />
                      <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                        {calculations.watts} <span className="text-[10px] font-bold uppercase text-slate-400">W</span>
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Est. Average Power</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <Flame className="w-5 h-5 text-orange-500 mb-2" />
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                      {calculations.calories.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">KCal Burned</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">10 {system === "imperial" ? "Mile" : "Km"} Split Pace</span>
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">
                    {calculations.splitTimeFormatted}
                  </span>
                </div>
              </div>

              {/* Educational Note with FIXED JSX String interpolation */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-medium text-slate-500 leading-relaxed text-center">
                  Power (Watts) is estimated using a physics model {"($P = P_{rolling} + P_{aero}$)"} assuming a flat road, zero wind, standard atmospheric density, and a typical 75kg rider. Aerodynamic drag {"($C_d A$)"} changes significantly based on bike type.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
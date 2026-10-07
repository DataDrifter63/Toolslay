"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChefHat, Scale, Thermometer, Clock, Flame, 
  Snowflake, Info, AlertCircle, CheckCircle2,
  Utensils, Timer
} from "lucide-react";

const MEAT_DB = [
  {
    id: "beef_roast", name: "Beef Roast / Prime Rib", icon: "🥩",
    ovenTemp: "350°F (175°C)", restMins: 15,
    doneness: [
      { level: "Medium Rare", minsPerLb: 20, tempF: 135, tempC: 57, desc: "Warm red center" },
      { level: "Medium", minsPerLb: 25, tempF: 145, tempC: 63, desc: "Warm pink center" },
      { level: "Well Done", minsPerLb: 30, tempF: 160, tempC: 71, desc: "Little to no pink" }
    ]
  },
  {
    id: "chicken_whole", name: "Whole Chicken", icon: "🍗",
    ovenTemp: "350°F (175°C)", restMins: 15,
    doneness: [
      { level: "Fully Cooked (USDA Safe)", minsPerLb: 20, tempF: 165, tempC: 74, desc: "Juices run clear" }
    ]
  },
  {
    id: "turkey_whole", name: "Whole Turkey", icon: "🦃",
    ovenTemp: "325°F (165°C)", restMins: 30,
    doneness: [
      { level: "Fully Cooked (USDA Safe)", minsPerLb: 15, tempF: 165, tempC: 74, desc: "Measure at thickest thigh" }
    ]
  },
  {
    id: "pork_roast", name: "Pork Roast / Loin", icon: "🍖",
    ovenTemp: "350°F (175°C)", restMins: 15,
    doneness: [
      { level: "Medium (USDA Safe)", minsPerLb: 20, tempF: 145, tempC: 63, desc: "Slightly pink center" },
      { level: "Well Done", minsPerLb: 25, tempF: 160, tempC: 71, desc: "No pink remaining" }
    ]
  },
  {
    id: "lamb_leg", name: "Leg of Lamb", icon: "🥩",
    ovenTemp: "325°F (165°C)", restMins: 15,
    doneness: [
      { level: "Medium Rare", minsPerLb: 20, tempF: 135, tempC: 57, desc: "Pink and warm" },
      { level: "Medium", minsPerLb: 25, tempF: 145, tempC: 63, desc: "Light pink center" },
      { level: "Well Done", minsPerLb: 30, tempF: 160, tempC: 71, desc: "Fully browned" }
    ]
  }
];

export default function CookingTimeCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // State
  const [selectedMeat, setSelectedMeat] = useState(MEAT_DB[0]);
  const [donenessIdx, setDonenessIdx] = useState(0);
  const [weight, setWeight] = useState(3);
  const [unit, setUnit] = useState("lbs");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset doneness index when meat changes to prevent out-of-bounds
  const handleMeatChange = (meatId) => {
    const meat = MEAT_DB.find(m => m.id === meatId);
    setSelectedMeat(meat);
    setDonenessIdx(0);
  };

  // Time Formatting Helper
  const formatTime = (totalMins) => {
    if (totalMins === 0) return "0 mins";
    const hrs = Math.floor(totalMins / 60);
    const mins = Math.round(totalMins % 60);
    if (hrs === 0) return `${mins} mins`;
    if (mins === 0) return `${hrs} hrs`;
    return `${hrs}h ${mins}m`;
  };

  // Core Math Engine
  const calculations = useMemo(() => {
    const weightNum = parseFloat(weight) || 0;
    if (weightNum <= 0) {
      return { cookMins: 0, restMins: 0, totalMins: 0, fridgeDefrostHrs: 0, waterDefrostMins: 0, activeDoneness: null };
    }

    // Always convert to lbs for internal math (Recipes generally use minutes per lb)
    const weightLbs = unit === "kg" ? weightNum * 2.20462 : weightNum;
    
    const activeDoneness = selectedMeat.doneness[donenessIdx];
    
    // Cooking Time
    const cookMins = weightLbs * activeDoneness.minsPerLb;
    const restMins = selectedMeat.restMins;
    const totalMins = cookMins + restMins;

    // Defrost Physics
    // Fridge: ~24 hours per 5 lbs => 4.8 hours per lb
    const fridgeDefrostHrs = weightLbs * 4.8;
    // Cold Water: ~30 mins per lb
    const waterDefrostMins = weightLbs * 30;

    return {
      cookMins,
      restMins,
      totalMins,
      fridgeDefrostHrs: fridgeDefrostHrs.toFixed(1),
      waterDefrostMins: Math.round(waterDefrostMins),
      activeDoneness
    };
  }, [weight, unit, selectedMeat, donenessIdx]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-xl shadow-inner">
            <Flame className="w-7 h-7 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Cooking Time Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Smart Roasting, Resting & Defrost Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* Meat Selection */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Utensils className="w-4 h-4 text-orange-500" /> Select Cut / Meat Type
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MEAT_DB.map((meat) => (
                  <button
                    key={meat.id}
                    onClick={() => handleMeatChange(meat.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                      selectedMeat.id === meat.id
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-orange-300"
                    }`}
                  >
                    <span className="text-2xl">{meat.icon}</span>
                    <span className={`block text-xs font-black ${selectedMeat.id === meat.id ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                      {meat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Scale className="w-4 h-4 text-orange-500" /> Meat Raw Weight
              </h3>
              
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0.5" step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-2xl font-black text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 transition-colors"
                />
                <div className="flex flex-col bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0 w-24">
                  <button onClick={() => setUnit("lbs")} className={`px-2 py-2 text-xs font-bold uppercase rounded-md transition-colors ${unit === "lbs" ? "bg-white dark:bg-slate-700 text-orange-600 shadow-sm" : "text-slate-500"}`}>LBS</button>
                  <button onClick={() => setUnit("kg")} className={`px-2 py-2 text-xs font-bold uppercase rounded-md transition-colors ${unit === "kg" ? "bg-white dark:bg-slate-700 text-orange-600 shadow-sm" : "text-slate-500"}`}>KG</button>
                </div>
              </div>
            </div>

            {/* Doneness Selector */}
            {selectedMeat.doneness.length > 1 && (
              <div className="animate-in fade-in">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <Thermometer className="w-4 h-4 text-orange-500" /> Target Doneness
                </h3>
                
                <div className="space-y-3">
                  {selectedMeat.doneness.map((done, idx) => (
                    <label 
                      key={idx}
                      className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        donenessIdx === idx
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          name="doneness"
                          checked={donenessIdx === idx}
                          onChange={() => setDonenessIdx(idx)}
                          className="mt-1 accent-orange-600 w-4 h-4"
                        />
                        <div>
                          <span className={`block text-sm font-black mb-0.5 ${donenessIdx === idx ? 'text-orange-700 dark:text-orange-400' : 'text-slate-700 dark:text-slate-200'}`}>{done.level}</span>
                          <span className="block text-[10px] font-medium text-slate-500">{done.desc}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                        <span className="block text-xs font-black text-rose-500">{done.tempF}°F</span>
                        <span className="block text-[9px] font-bold text-slate-400">{done.tempC}°C</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          {/* Main Cooking Timeline */}
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-rose-500`}></div>
            
            <div className="flex items-center justify-between mb-6 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> Total Prep Time
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-8">
              <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                {formatTime(calculations.totalMins)}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                Cook + Rest Phase
              </span>
            </div>

            {/* Split Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-orange-200 dark:border-orange-900/50 shadow-sm text-center">
                <Flame className="w-5 h-5 mx-auto text-orange-500 mb-2" />
                <span className="block text-2xl font-black text-slate-800 dark:text-slate-100">{formatTime(calculations.cookMins)}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Cooking</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 shadow-sm text-center">
                <Timer className="w-5 h-5 mx-auto text-sky-500 mb-2" />
                <span className="block text-2xl font-black text-slate-800 dark:text-slate-100">{formatTime(calculations.restMins)}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Resting Time</span>
              </div>
            </div>

            {/* Oven Target Data */}
            <div className="mt-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Oven Temp</span>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedMeat.ovenTemp}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Target Internal</span>
                <span className="text-sm font-black text-rose-500">{calculations.activeDoneness?.tempF}°F ({calculations.activeDoneness?.tempC}°C)</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-start gap-2 text-[10px] font-medium text-slate-500 leading-relaxed">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <p>Take the meat out 5°F before your target temp. The residual heat (carryover cooking) will finish the job during the resting phase.</p>
            </div>
          </div>

          {/* Defrost Estimator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Snowflake className="w-4 h-4 text-sky-500" /> Safe Defrost Estimator
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30">
                <div>
                  <span className="block text-xs font-bold text-sky-800 dark:text-sky-300">Fridge Method</span>
                  <span className="block text-[9px] font-medium text-sky-600 dark:text-sky-500">Safest (Requires planning)</span>
                </div>
                <span className="text-sm font-black text-sky-700 dark:text-sky-400">{calculations.fridgeDefrostHrs} hrs</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Cold Water Method</span>
                  <span className="block text-[9px] font-medium text-slate-500">Change water every 30m</span>
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-300">{formatTime(calculations.waterDefrostMins)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
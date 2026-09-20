"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Leaf, Car, Plane, Home, 
  Utensils, Globe, TreePine, AlertTriangle, 
  Zap, Info, CheckCircle2, Factory
} from "lucide-react";

// Lifestyle Data Mappings (Approximate CO2 in Tons)
const DIET_TYPES = [
  { id: "vegan", label: "Vegan", co2: 1.5, desc: "Plant-based only" },
  { id: "vegetarian", label: "Vegetarian", co2: 1.7, desc: "Dairy/Eggs, no meat" },
  { id: "average", label: "Average Meat", co2: 2.5, desc: "Meat 3-4 times/week" },
  { id: "heavy", label: "Heavy Meat", co2: 3.3, desc: "Meat almost daily" }
];

const ENERGY_TYPES = [
  { id: "eco", label: "Eco-Friendly", co2: 1.0, desc: "Solar / Low usage" },
  { id: "avg", label: "Average Home", co2: 2.0, desc: "Standard grid usage" },
  { id: "high", label: "Energy Guzzler", co2: 3.5, desc: "High AC/Heating" }
];

// Benchmarks (Tons per year)
const BENCHMARKS = {
  target: 2.0,    // Paris Agreement sustainable goal
  global: 4.5,    // Global Average
  tier1: 15.0     // US/UK Average
};

export default function CarbonFootprintCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Inputs
  const [carMiles, setCarMiles] = useState(8000); // Annual miles
  const [flights, setFlights] = useState(2); // Short/Medium round trips per year
  const [diet, setDiet] = useState(DIET_TYPES[2]); // Default: Average
  const [energy, setEnergy] = useState(ENERGY_TYPES[1]); // Default: Average

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Core Emissions Engine
  const calculations = useMemo(() => {
    // 1. Transport Emissions
    // Avg car emits ~400g CO2 per mile -> 0.0004 tons per mile
    const transportCO2 = carMiles * 0.0004;
    
    // Avg short/medium round-trip flight -> ~0.8 tons
    const flightCO2 = flights * 0.8;

    // 2. Lifestyle & Home
    const dietCO2 = diet.co2;
    const homeCO2 = energy.co2;

    // 3. The "Hidden" Baseline (Public infrastructure, internet, buying clothes, etc.)
    const baselineCO2 = 2.0;

    const totalCO2 = transportCO2 + flightCO2 + dietCO2 + homeCO2 + baselineCO2;

    // 4. The "Tree Offset" Predictor
    // 1 mature tree absorbs ~22kg (0.022 tons) of CO2 per year.
    const treesNeeded = Math.ceil(totalCO2 / 0.022);

    // 5. Benchmark Status
    let status = { msg: "Eco-Champion", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (totalCO2 > BENCHMARKS.tier1) {
      status = { msg: "High Emitter", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" };
    } else if (totalCO2 > BENCHMARKS.global) {
      status = { msg: "Above Global Average", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" };
    } else if (totalCO2 > BENCHMARKS.target) {
      status = { msg: "Sustainable Range", color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-200" };
    }

    // Bar width logic (cap at 20 tons for UI scale)
    const uiScaleMax = 20;
    const progressPercent = Math.min(100, (totalCO2 / uiScaleMax) * 100);

    return {
      breakdown: {
        transport: parseFloat(transportCO2.toFixed(1)),
        flights: parseFloat(flightCO2.toFixed(1)),
        diet: dietCO2,
        home: homeCO2,
        baseline: baselineCO2
      },
      total: parseFloat(totalCO2.toFixed(1)),
      treesNeeded,
      status,
      progressPercent
    };
  }, [carMiles, flights, diet, energy]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-100 to-transparent dark:from-emerald-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3.5 rounded-2xl">
            <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Carbon Footprint Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Personal Emissions & Tree Offset Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: LIFESTYLE INPUTS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Travel Inputs */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Car className="w-4 h-4 text-emerald-500" /> Travel & Transport
              </label>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Car Driving (Annual Miles)</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                      {carMiles.toLocaleString()} Miles
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="30000" step="500"
                    value={carMiles}
                    onChange={(e) => setCarMiles(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-50"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Flights (Round-Trips / Year)</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                      {flights} Flights
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="15" step="1"
                    value={flights}
                    onChange={(e) => setFlights(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-50"
                  />
                </div>
              </div>
            </div>

            {/* Diet Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Utensils className="w-4 h-4 text-emerald-500" /> Diet & Food Habits
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {DIET_TYPES.map((type) => {
                  const isActive = diet.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setDiet(type)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-200"
                      }`}
                    >
                      <span className={`block text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {type.label}
                      </span>
                      <span className="block text-[9px] font-medium text-slate-500 mt-0.5">
                        {type.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Home Energy */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Home className="w-4 h-4 text-emerald-500" /> Home Energy Usage
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ENERGY_TYPES.map((type) => {
                  const isActive = energy.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setEnergy(type)}
                      className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm scale-[1.02]"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-200"
                      }`}
                    >
                      <span className={`block text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: EMISSIONS DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border ${calculations.status.border} text-[10px] font-black uppercase tracking-widest ${calculations.status.color} shadow-sm`}>
                  <Globe className="w-3.5 h-3.5" /> {calculations.status.msg}
                </span>
              </div>
              
              {/* Grand Total */}
              <div className="text-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Your Total Estimated Footprint</span>
                <div className="flex justify-center items-end gap-1">
                  <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                    {calculations.total}
                  </span>
                  <span className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    Tons CO₂ / Year
                  </span>
                </div>
              </div>

              {/* Visual Benchmark Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Eco Target (2T)</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">US Avg (15T)</span>
                </div>
                
                <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  {/* Target Marker */}
                  <div className="absolute top-0 left-[10%] h-full w-0.5 bg-emerald-500 z-10"></div>
                  {/* Global Marker */}
                  <div className="absolute top-0 left-[22.5%] h-full w-0.5 bg-amber-400 z-10"></div>
                  {/* US Marker */}
                  <div className="absolute top-0 left-[75%] h-full w-0.5 bg-rose-500 z-10"></div>
                  
                  {/* User Progress */}
                  <div 
                    style={{ width: `${calculations.progressPercent}%` }} 
                    className="h-full bg-slate-800 dark:bg-slate-300 transition-all duration-700"
                  ></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[9px] font-medium text-slate-500">Global Average is ~4.5 Tons</span>
                </div>
              </div>

              {/* The "Tree Offset" Engine Box */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 p-5 rounded-2xl relative overflow-hidden group mb-6 animate-in zoom-in-95">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TreePine className="w-32 h-32 text-emerald-500" />
                </div>
                
                <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
                  Nature's Receipt
                </span>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800">
                    <TreePine className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none">
                      {calculations.treesNeeded.toLocaleString()} Trees
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                      required to offset your emissions each year.
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="flex-1 space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Emissions Breakdown</h4>
                
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-slate-400" /> Car Driving
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.breakdown.transport} T</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5 text-slate-400" /> Flights
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.breakdown.flights} T</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Utensils className="w-3.5 h-3.5 text-slate-400" /> Diet
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.breakdown.diet} T</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-slate-400" /> Home Energy
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.breakdown.home} T</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <Factory className="w-3.5 h-3.5" /> Shared Infrastructure (Base)
                  </span>
                  <span className="text-xs font-black text-slate-500 tabular-nums">{calculations.breakdown.baseline} T</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
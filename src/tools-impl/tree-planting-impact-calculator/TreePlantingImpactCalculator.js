"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TreePine, Leaf, Car, Plane, 
  Sprout, Globe, ShieldAlert, 
  CalendarDays, TrendingUp, Info, Waves
} from "lucide-react";

// Tree Species & their MAX annual CO2 absorption (kg/year when fully mature)
const TREE_SPECIES = [
  { id: "mixed", label: "Mixed Forest", rate: 22, desc: "Standard global average.", icon: TreePine },
  { id: "mangrove", label: "Mangroves", rate: 30, desc: "Coastal, stores carbon in soil.", icon: Waves },
  { id: "hardwood", label: "Hardwoods (Oak)", rate: 26, desc: "Slow growth, high capacity.", icon: Leaf },
  { id: "conifer", label: "Conifers (Pine)", rate: 16, desc: "Fast early growth, lower max.", icon: Sprout }
];

export default function TreePlantingImpactCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Inputs
  const [trees, setTrees] = useState(100);
  const [species, setSpecies] = useState(TREE_SPECIES[0]);
  const [years, setYears] = useState(10);
  const [survivalRate, setSurvivalRate] = useState(80); // 80% industry standard

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Core Forestry & Math Engine
  const calculations = useMemo(() => {
    const treeCount = parseInt(trees) || 0;
    const projectYears = parseInt(years) || 1;
    const sRate = parseInt(survivalRate) || 0;
    
    // 1. Survival Calculation
    const effectiveTrees = Math.floor(treeCount * (sRate / 100));

    // 2. Biological Growth Curve Engine (Cumulative CO2)
    // A tree takes ~10 years to reach its maximum annual absorption rate.
    // We calculate the absorption year-by-year.
    let cumulativeKgCO2 = 0;
    let currentAnnualKgCO2 = 0;

    for (let currentYear = 1; currentYear <= projectYears; currentYear++) {
      // Growth factor: scales from 0.1 to 1.0 over the first 10 years
      const growthFactor = Math.min(1.0, currentYear / 10);
      const absorptionThisYear = effectiveTrees * (species.rate * growthFactor);
      
      cumulativeKgCO2 += absorptionThisYear;
      
      // Store the final year's annual rate for the dashboard
      if (currentYear === projectYears) {
        currentAnnualKgCO2 = absorptionThisYear;
      }
    }

    // Convert to Metric Tons (1 Ton = 1000 kg)
    const totalTons = cumulativeKgCO2 / 1000;
    const annualTons = currentAnnualKgCO2 / 1000;

    // 3. Real-World Equivalents
    // Avg passenger car emits ~4.6 tons CO2 per year
    const carsOffset = totalTons / 4.6;
    // Avg transatlantic flight emits ~1.0 tons CO2
    const flightsOffset = totalTons / 1.0;

    return {
      effectiveTrees,
      totalTons: parseFloat(totalTons.toFixed(2)),
      annualTons: parseFloat(annualTons.toFixed(2)),
      carsOffset: Math.floor(carsOffset),
      flightsOffset: Math.floor(flightsOffset),
      deadTrees: treeCount - effectiveTrees,
      isEmpty: treeCount === 0 || projectYears === 0
    };
  }, [trees, species, years, survivalRate]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-green-100 to-transparent dark:from-green-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-900/30 p-3.5 rounded-2xl">
            <TreePine className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Tree Planting Impact Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Biological Growth Curve & CO₂ Offset Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: PROJECT INPUTS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Tree Count */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-green-500" /> Trees Planted
              </label>
              <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-green-400 focus-within:ring-4 focus-within:ring-green-50 dark:focus-within:ring-green-900/20 transition-all overflow-hidden">
                <input
                  type="number" min="0" step="1" value={trees} onChange={(e) => setTrees(e.target.value)}
                  className="w-full bg-transparent px-5 py-4 text-3xl font-black text-slate-800 dark:text-slate-100 outline-none"
                />
                <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 border-l border-slate-200 dark:border-slate-700 px-6 py-4 h-full shrink-0">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Trees</span>
                </div>
              </div>
            </div>

            {/* Species Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Leaf className="w-4 h-4 text-green-500" /> Species & Biome
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TREE_SPECIES.map((type) => {
                  const Icon = type.icon;
                  const isActive = species.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSpecies(type)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1.5 ${
                        isActive
                          ? "bg-green-50 dark:bg-green-900/20 border-green-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-green-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`block text-xs font-black uppercase tracking-widest ${isActive ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {type.label}
                        </span>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-green-500' : 'text-slate-400'}`} />
                      </div>
                      <span className="block text-[10px] font-medium text-slate-500">
                        {type.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Horizon Slider */}
            <div className="pt-2">
              <div className="flex justify-between items-end mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-green-500" /> Growth Time Horizon
                </label>
                <span className="text-sm font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-lg border border-green-200 dark:border-green-800/50">
                  {years} Years
                </span>
              </div>
              
              <div className="px-1">
                <input
                  type="range" min="1" max="50" step="1"
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-green-500 focus:outline-none focus:ring-4 focus:ring-green-50 dark:focus:ring-green-900/20"
                />
                <div className="flex justify-between text-[10px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                  <span>1 Yr (Sapling)</span>
                  <span className="text-green-500">10 Yrs (Mature)</span>
                  <span>50 Yrs</span>
                </div>
              </div>
            </div>

            {/* Pro Feature: Survival Rate */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-end mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Est. Survival Rate
                </label>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
                  {survivalRate}%
                </span>
              </div>
              
              <div className="px-1">
                <input
                  type="range" min="10" max="100" step="5"
                  value={survivalRate}
                  onChange={(e) => setSurvivalRate(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-50 dark:focus:ring-amber-900/20"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: IMPACT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <Globe className="w-3.5 h-3.5 text-green-500" /> Environmental Impact
                </span>
                
                {calculations.deadTrees > 0 && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                    {calculations.effectiveTrees.toLocaleString()} Effective Trees
                  </span>
                )}
              </div>
              
              {/* Grand Total CO2 */}
              <div className="text-center mb-8 pb-8 border-b border-slate-200 dark:border-slate-800 relative">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Total CO₂ Sequestered over {years} Years
                </span>
                <div className="flex justify-center items-end gap-1">
                  <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                    {calculations.totalTons.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    Tons
                  </span>
                </div>
                
                {/* Current Annual Rate Indicator */}
                <div className="mt-4 inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Currently absorbing <span className="text-slate-800 dark:text-slate-200 font-black">{calculations.annualTons} Tons</span> / yr
                  </span>
                </div>
              </div>

              {/* Real World Equivalents */}
              <div className="flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400" /> Real-World Equivalents
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-green-50 transition-colors">
                        <Car className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Cars Taken Off Road</span>
                        <span className="block text-[10px] font-medium text-slate-500">For one entire year</span>
                      </div>
                    </div>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
                      {calculations.carsOffset.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-green-50 transition-colors">
                        <Plane className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Transatlantic Flights</span>
                        <span className="block text-[10px] font-medium text-slate-500">NY to London equivalent</span>
                      </div>
                    </div>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
                      {calculations.flightsOffset.toLocaleString()}
                    </span>
                  </div>

                </div>
              </div>

              {/* Educational Note */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-2 opacity-90">
                  <Info className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-medium text-slate-500 leading-relaxed">
                    <strong>Forestry Math:</strong> Trees don't absorb their maximum capacity immediately. Our engine applies a 10-year biological growth curve. We also factor in a {100 - survivalRate}% mortality rate, removing {calculations.deadTrees.toLocaleString()} trees from the final calculation to maintain real-world accuracy.
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
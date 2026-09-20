"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Waves, ShoppingBag, Coffee, Package, 
  Trash2, Recycle, AlertCircle, Droplets,
  Leaf, Info, CheckCircle2, ChevronRight
} from "lucide-react";

// Standard approximate plastic weights in grams
const PLASTIC_WEIGHTS = {
  bottle: 15,     // 500ml PET bottle
  bag: 6,         // Grocery bag
  takeout: 35,    // Food container + cutlery
  wrapper: 4,     // Snack wrapper
  hygiene: 50,    // Shampoo/Lotion bottle
  delivery: 20    // Amazon bubble mailer/polybag
};

export default function PlasticUsageEstimator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States (Household Habits)
  const [members, setMembers] = useState(2);
  const [bottlesPerWeek, setBottlesPerWeek] = useState(10);
  const [bagsPerWeek, setBagsPerWeek] = useState(15);
  const [takeoutPerWeek, setTakeoutPerWeek] = useState(3);
  const [wrappersPerDay, setWrappersPerDay] = useState(4);
  const [hygienePerMonth, setHygienePerMonth] = useState(3);
  const [deliveriesPerMonth, setDeliveriesPerMonth] = useState(5);

  // Eco-Switch (Simulates switching to reusables)
  const [ecoMode, setEcoMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Core Math Engine
  const calculations = useMemo(() => {
    // Apply Eco-Mode reductions (Assume 90% drop in bottles/bags if they switch to reusables)
    const effectiveBottles = ecoMode ? Math.round(bottlesPerWeek * 0.1) : bottlesPerWeek;
    const effectiveBags = ecoMode ? Math.round(bagsPerWeek * 0.1) : bagsPerWeek;
    const effectiveTakeout = ecoMode ? Math.round(takeoutPerWeek * 0.3) : takeoutPerWeek;

    // Annual Grams
    const annualBottles = effectiveBottles * 52 * PLASTIC_WEIGHTS.bottle;
    const annualBags = effectiveBags * 52 * PLASTIC_WEIGHTS.bag;
    const annualTakeout = effectiveTakeout * 52 * PLASTIC_WEIGHTS.takeout;
    const annualWrappers = wrappersPerDay * 365 * PLASTIC_WEIGHTS.wrapper;
    const annualHygiene = hygienePerMonth * 12 * PLASTIC_WEIGHTS.hygiene;
    const annualDeliveries = deliveriesPerMonth * 12 * PLASTIC_WEIGHTS.delivery;

    // Total Kg per Household
    const totalGrams = annualBottles + annualBags + annualTakeout + annualWrappers + annualHygiene + annualDeliveries;
    const totalKg = totalGrams / 1000;
    const totalLbs = totalKg * 2.20462;
    
    // Per Person
    const perPersonKg = totalKg / members;

    // The "Ocean Destiny" Engine (Global averages: 9% recycled, 19% incinerated, 72% landfilled/ocean)
    const recycledKg = totalKg * 0.09;
    const incineratedKg = totalKg * 0.19;
    const dumpedKg = totalKg * 0.72;

    // Visual Equivalents
    // 1 standard large trash bag holds ~5kg of loose, uncompressed household plastic
    const trashBags = Math.ceil(totalKg / 5);
    // 1 standard bathtub volume holds ~20kg of loose plastic
    const bathtubs = (totalKg / 20).toFixed(1);

    return {
      totalKg: parseFloat(totalKg.toFixed(1)),
      totalLbs: parseFloat(totalLbs.toFixed(1)),
      perPersonKg: parseFloat(perPersonKg.toFixed(1)),
      recycledKg: parseFloat(recycledKg.toFixed(1)),
      incineratedKg: parseFloat(incineratedKg.toFixed(1)),
      dumpedKg: parseFloat(dumpedKg.toFixed(1)),
      trashBags,
      bathtubs,
      breakdown: {
        bottles: parseFloat((annualBottles / 1000).toFixed(1)),
        bags: parseFloat((annualBags / 1000).toFixed(1)),
        takeout: parseFloat((annualTakeout / 1000).toFixed(1)),
        wrappers: parseFloat((annualWrappers / 1000).toFixed(1)),
        hygiene: parseFloat((annualHygiene / 1000).toFixed(1)),
        delivery: parseFloat((annualDeliveries / 1000).toFixed(1)),
      }
    };
  }, [members, bottlesPerWeek, bagsPerWeek, takeoutPerWeek, wrappersPerDay, hygienePerMonth, deliveriesPerMonth, ecoMode]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-100 to-transparent dark:from-cyan-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-cyan-50 dark:bg-cyan-900/30 p-3.5 rounded-2xl">
            <Waves className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Plastic Usage Estimator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Household Audit & Ocean Impact Simulator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: LIFESTYLE INPUTS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 relative overflow-hidden">
            
            {/* Household Size */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Household Size</span>
                <span className="text-[10px] font-medium text-slate-500">People living in your home</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setMembers(Math.max(1, members - 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow flex items-center justify-center font-black text-cyan-600">-</button>
                <span className="text-xl font-black text-slate-800 dark:text-slate-100 w-4 text-center">{members}</span>
                <button onClick={() => setMembers(Math.min(10, members + 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow flex items-center justify-center font-black text-cyan-600">+</button>
              </div>
            </div>

            {/* Daily & Weekly Habits */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Coffee className="w-4 h-4 text-cyan-500" /> Kitchen & Food
              </label>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plastic Bottles / Week</span>
                    <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded">
                      {bottlesPerWeek} Bottles
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="50" step="1"
                    value={bottlesPerWeek} onChange={(e) => setBottlesPerWeek(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Snack Wrappers / Day</span>
                    <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded">
                      {wrappersPerDay} Wrappers
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="1"
                    value={wrappersPerDay} onChange={(e) => setWrappersPerDay(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Takeout Containers / Week</span>
                    <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded">
                      {takeoutPerWeek} Meals
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="15" step="1"
                    value={takeoutPerWeek} onChange={(e) => setTakeoutPerWeek(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Shopping & Hygiene */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShoppingBag className="w-4 h-4 text-cyan-500" /> Shopping & Bath
              </label>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grocery Bags / Week</span>
                    <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded">
                      {bagsPerWeek} Bags
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="50" step="1"
                    value={bagsPerWeek} onChange={(e) => setBagsPerWeek(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shampoo/Lotion Bottles / Month</span>
                    <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded">
                      {hygienePerMonth} Bottles
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="15" step="1"
                    value={hygienePerMonth} onChange={(e) => setHygienePerMonth(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">E-commerce Mailers / Month</span>
                    <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded">
                      {deliveriesPerMonth} Packages
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="30" step="1"
                    value={deliveriesPerMonth} onChange={(e) => setDeliveriesPerMonth(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: IMPACT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px] transition-colors">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              {/* Premium Eco-Simulator Toggle */}
              <div className={`mb-8 p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${ecoMode ? 'bg-emerald-500 border-emerald-500 shadow-emerald-500/20 shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                   onClick={() => setEcoMode(!ecoMode)}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${ecoMode ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Leaf className={`w-5 h-5 ${ecoMode ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <span className={`block text-xs font-black uppercase tracking-widest transition-colors ${ecoMode ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      Eco-Switch Simulator
                    </span>
                    <span className={`block text-[10px] font-medium mt-0.5 transition-colors ${ecoMode ? 'text-emerald-100' : 'text-slate-500'}`}>
                      Tap to apply reusable habits
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${ecoMode ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${ecoMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
              
              {/* Grand Total */}
              <div className="text-center mb-8">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Your Household's Annual Plastic Footprint</span>
                <div className="flex justify-center items-end gap-1">
                  <span className={`text-6xl font-black tracking-tighter tabular-nums transition-colors ${ecoMode ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {calculations.totalKg}
                  </span>
                  <span className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    Kg / Year
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                  (~{calculations.totalLbs} Lbs) • {calculations.perPersonKg} Kg per person
                </span>
              </div>

              {/* Visual Equivalents Box */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                  <Trash2 className="w-5 h-5 text-amber-500 mb-2" />
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                    {calculations.trashBags}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Full Trash Bags</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                  <Droplets className="w-5 h-5 text-sky-500 mb-2" />
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                    {calculations.bathtubs}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Bathtubs Volume</span>
                </div>
              </div>

              {/* The "Ocean Destiny" Engine */}
              <div className="flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-cyan-500" /> Where does it actually go?
                </h4>
                
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div> Landfills & Ocean (72%)
                    </span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.dumpedKg} Kg</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div> Incinerated / Burned (19%)
                    </span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.incineratedKg} Kg</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <Recycle className="w-3.5 h-3.5" /> Actually Recycled (~9%)
                    </span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{calculations.recycledKg} Kg</span>
                  </div>
                </div>

                {/* Educational Note */}
                <div className="mt-4 flex items-start gap-2 opacity-80">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-medium text-slate-500 leading-relaxed">
                    Based on UN Environment Programme global statistics. Even if you put all plastic in the recycling bin, globally only ~9% is successfully repurposed.
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
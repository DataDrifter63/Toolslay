"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users, Clock, Utensils, GlassWater, 
  ChefHat, ShoppingCart, Info, Flame,
  Wine, Pizza, Cake, Baby
} from "lucide-react";

// Professional Catering Event Types
const EVENT_TYPES = [
  { 
    id: "dinner", 
    label: "Formal Dinner", 
    icon: Utensils,
    desc: "Sit-down meal. Focus on heavy mains and sides." 
  },
  { 
    id: "buffet", 
    label: "Buffet / Game Day", 
    icon: Flame,
    desc: "Casual grazing. Balanced apps, mains, and drinks." 
  },
  { 
    id: "cocktail", 
    label: "Cocktail Party", 
    icon: Wine,
    desc: "No main course. Heavy on appetizers and drinks." 
  }
];

export default function PartyFoodCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [adults, setAdults] = useState(20);
  const [kids, setKids] = useState(5);
  const [duration, setDuration] = useState(3); // Hours
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Core Catering Math Engine
  const calculations = useMemo(() => {
    const aCount = Math.max(0, parseInt(adults) || 0);
    const kCount = Math.max(0, parseInt(kids) || 0);
    const hrs = Math.max(1, parseInt(duration) || 1);

    // 1. Calculate Adult Equivalents (AE) - Kids eat approx 50% of an adult
    const ae = aCount + (kCount * 0.5);

    // If no guests, return zeros
    if (ae === 0) {
      return { apps: 0, mainsLbs: 0, sidesLbs: 0, desserts: 0, drinksGals: 0, iceLbs: 0, totalGuests: 0, ae: 0 };
    }

    let apps = 0;
    let mainsOz = 0;
    let sidesOz = 0;
    let desserts = 0;
    let drinksCount = 0;

    // 2. Dynamic Formulas based on Event Type & Duration
    // Rule: First hour is heavy consumption, subsequent hours drop by ~50%
    const extraHrs = Math.max(0, hrs - 1);

    if (eventType.id === "cocktail") {
      // 6 pieces first hour, 3 pieces every extra hour
      apps = ae * (6 + (extraHrs * 3));
      mainsOz = 0;
      sidesOz = 0;
      desserts = ae * 1.5;
      // 2 drinks first hour, 1 every extra hour
      drinksCount = ae * (2 + (extraHrs * 1));
    } 
    else if (eventType.id === "dinner") {
      // 3 pieces total before dinner
      apps = ae * 3;
      // 8 oz raw meat/main per person
      mainsOz = ae * 8;
      // 6 oz sides total per person
      sidesOz = ae * 6;
      desserts = ae * 1.5;
      // 2 drinks first hour, 0.5 every extra hour (less drinking during heavy meals)
      drinksCount = ae * (2 + (extraHrs * 0.5));
    } 
    else if (eventType.id === "buffet") {
      // 4 pieces first hour, 1.5 every extra hour
      apps = ae * (4 + (extraHrs * 1.5));
      // 6 oz mains (people eat smaller portions of multiple things)
      mainsOz = ae * 6;
      // 8 oz sides (heavy on pasta salads, chips, etc.)
      sidesOz = ae * 8;
      desserts = ae * 2;
      // 2 drinks first hour, 1 every extra hour
      drinksCount = ae * (2 + (extraHrs * 1));
    }

    // 3. Convert to Supermarket Buying Units
    // Mains & Sides: Oz to Lbs (16 oz = 1 lb)
    const mainsLbs = mainsOz / 16;
    const sidesLbs = sidesOz / 16;
    
    // Drinks: Assuming 1 drink = 12 oz. 1 Gallon = 128 oz.
    const totalDrinkOz = drinksCount * 12;
    const drinksGals = totalDrinkOz / 128;

    // Ice: 1 lb of ice per person (regardless of kids/adults)
    const iceLbs = (aCount + kCount) * 1;

    return {
      apps: Math.ceil(apps),
      mainsLbs: parseFloat(mainsLbs.toFixed(1)),
      sidesLbs: parseFloat(sidesLbs.toFixed(1)),
      desserts: Math.ceil(desserts),
      drinksGals: parseFloat(drinksGals.toFixed(1)),
      drinksCount: Math.ceil(drinksCount),
      iceLbs: Math.ceil(iceLbs),
      totalGuests: aCount + kCount,
      ae: ae
    };
  }, [adults, kids, duration, eventType]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-100 to-transparent dark:from-orange-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/30 p-3.5 rounded-2xl">
            <ChefHat className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Party Food Calculator
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              Pro Catering Estimator & Shopping List
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: CLEAN INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Guest Count Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" /> Adults
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-50 dark:focus-within:ring-orange-900/20 transition-all">
                  <input
                    type="number" min="0" value={adults} onChange={(e) => setAdults(e.target.value)}
                    className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-slate-400" /> Kids (Under 12)
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-50 dark:focus-within:ring-orange-900/20 transition-all">
                  <input
                    type="number" min="0" value={kids} onChange={(e) => setKids(e.target.value)}
                    className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Visual Style Cards */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Flame className="w-4 h-4 text-slate-400" /> Event Style
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EVENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = eventType.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setEventType(type)}
                      className={`relative p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                        isActive
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500 shadow-sm scale-[1.02]"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-orange-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className={`p-2 rounded-full ${isActive ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`block text-sm font-black ${isActive ? 'text-orange-700 dark:text-orange-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {type.label}
                        </span>
                        <span className="block text-[10px] font-medium text-slate-500 mt-0.5">
                          {type.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Duration Slider */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-end mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" /> Event Duration
                </label>
                <span className="text-sm font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800/50">
                  {duration} Hours
                </span>
              </div>
              
              <div className="px-1">
                <input
                  type="range" min="1" max="8" step="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20"
                />
                <div className="flex justify-between text-[10px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                  <span>1 Hr (Quick)</span>
                  <span className="text-orange-400">3-4 Hrs (Standard)</span>
                  <span>8 Hrs (Marathon)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: ELEGANT BREAKDOWN ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <ShoppingCart className="w-3.5 h-3.5 text-orange-500" /> Master Grocery List
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                  {calculations.totalGuests} Total Guests
                </span>
              </div>
              
              {/* Clean Category List */}
              <div className="space-y-3 flex-1">
                
                {/* Appetizers */}
                <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm transition-colors hover:border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                      <Pizza className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Appetizers & Bites</span>
                      <span className="block text-[10px] font-medium text-slate-500">Chips, dips, sliders, finger food</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.apps}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pieces</span>
                  </div>
                </div>

                {/* Main Course */}
                {calculations.mainsLbs > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm transition-colors hover:border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <Utensils className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Main Protein</span>
                        <span className="block text-[10px] font-medium text-slate-500">Raw weight (Beef, Chicken, etc.)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.mainsLbs}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lbs</span>
                    </div>
                  </div>
                )}

                {/* Sides */}
                {calculations.sidesLbs > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm transition-colors hover:border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <ChefHat className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Side Dishes</span>
                        <span className="block text-[10px] font-medium text-slate-500">Salads, pasta, veggies (total)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.sidesLbs}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lbs</span>
                    </div>
                  </div>
                )}

                {/* Drinks */}
                <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm transition-colors hover:border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <GlassWater className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Beverages</span>
                      <span className="block text-[10px] font-medium text-slate-500">Total volume (~{calculations.drinksCount} cups)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.drinksGals}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gallons</span>
                  </div>
                </div>

                {/* Desserts & Ice */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Cake className="w-4 h-4 text-purple-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Desserts</span>
                    </div>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.desserts}</span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Servings</span>
                  </div>
                  <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <GlassWater className="w-4 h-4 text-sky-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Extra Ice</span>
                    </div>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.iceLbs}</span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Lbs</span>
                  </div>
                </div>

              </div>

              {/* Pro Tip */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                    <strong className="text-slate-700 dark:text-slate-300">Caterer's Secret:</strong> Kids under 12 generally eat exactly 50% of an adult portion. Also, round up on ice—you will always need more ice than you think for chilling drinks in tubs!
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
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Heart, Users, Camera, Music, 
  Sparkles, Shirt, DollarSign, 
  PieChart, Info, GlassWater, ShieldAlert,
  Utensils
} from "lucide-react";

// Simplified Wedding Styles
const WEDDING_STYLES = [
  { 
    id: "balanced", 
    label: "Balanced", 
    icon: Heart,
    desc: "Standard traditional split",
    allocations: { venueFood: 0.50, photo: 0.15, decor: 0.15, attire: 0.10, music: 0.10 } 
  },
  { 
    id: "party", 
    label: "The Party", 
    icon: Utensils,
    desc: "Focus on Food & Bar",
    allocations: { venueFood: 0.65, photo: 0.10, decor: 0.08, attire: 0.08, music: 0.09 } 
  },
  { 
    id: "glam", 
    label: "Glamorous", 
    icon: Sparkles,
    desc: "Focus on Photos & Decor",
    allocations: { venueFood: 0.40, photo: 0.22, decor: 0.20, attire: 0.10, music: 0.08 } 
  }
];

export default function WeddingBudgetCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Clean States
  const [currency, setCurrency] = useState("$");
  const [totalBudget, setTotalBudget] = useState(30000);
  const [guestCount, setGuestCount] = useState(100);
  const [activeStyle, setActiveStyle] = useState(WEDDING_STYLES[0]);
  const [bufferPercent, setBufferPercent] = useState(10); // User-controlled contingency

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simplified Math Engine
  const calculations = useMemo(() => {
    const budget = parseFloat(totalBudget) || 0;
    const guests = Math.max(1, parseInt(guestCount) || 1);

    // 1. Buffer / Safety Net
    const contingency = budget * (bufferPercent / 100);
    const spendingBudget = budget - contingency;

    // 2. Allocations
    const allocations = activeStyle.allocations;
    const breakdown = [
      { id: 'venue', label: 'Venue, Food & Bar', amount: spendingBudget * allocations.venueFood, icon: GlassWater, color: 'bg-rose-500', bg: 'bg-rose-50' },
      { id: 'photo', label: 'Photography & Video', amount: spendingBudget * allocations.photo, icon: Camera, color: 'bg-indigo-500', bg: 'bg-indigo-50' },
      { id: 'decor', label: 'Florals & Decor', amount: spendingBudget * allocations.decor, icon: Sparkles, color: 'bg-amber-500', bg: 'bg-amber-50' },
      { id: 'attire', label: 'Attire & Beauty', amount: spendingBudget * allocations.attire, icon: Shirt, color: 'bg-teal-500', bg: 'bg-teal-50' },
      { id: 'music', label: 'Music & Entertainment', amount: spendingBudget * allocations.music, icon: Music, color: 'bg-purple-500', bg: 'bg-purple-50' },
    ];

    // 3. Per Guest Reality
    const foodBudget = (spendingBudget * allocations.venueFood) * 0.65; // Est. 65% of Venue/Food goes to actual catering
    const costPerGuest = foodBudget / guests;
    
    let guestStatus = { 
      msg: "Comfortable budget per guest.", 
      color: "text-emerald-700 bg-emerald-50 border-emerald-200", 
      iconColor: "text-emerald-500" 
    };
    
    if (budget > 0 && costPerGuest < 50) {
      guestStatus = { 
        msg: "Tight catering budget. Consider a smaller guest list.", 
        color: "text-amber-700 bg-amber-50 border-amber-200",
        iconColor: "text-amber-500"
      };
    } else if (budget > 0 && costPerGuest > 150) {
      guestStatus = { 
        msg: "Luxury catering budget! You have plenty of room.", 
        color: "text-purple-700 bg-purple-50 border-purple-200",
        iconColor: "text-purple-500"
      };
    }

    return {
      budget,
      contingency,
      breakdown,
      costPerGuest,
      guestStatus,
      isEmpty: budget <= 0
    };
  }, [totalBudget, guestCount, activeStyle, bufferPercent]);

  const formatMoney = (amount) => amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Soft & Elegant Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-100 to-transparent dark:from-rose-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-rose-50 dark:bg-rose-900/30 p-3.5 rounded-2xl">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Wedding Budget Planner
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              Smart & Stress-Free Allocation
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: CLEAN INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* The Big Two Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-slate-400" /> Total Budget
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-50 dark:focus-within:ring-rose-900/20 transition-all overflow-hidden">
                  <input
                    type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-12 bg-slate-100/50 dark:bg-slate-800 px-0 py-4 text-sm font-black text-center text-slate-400 outline-none border-r border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="number" min="0" step="500" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full bg-transparent px-4 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" /> Guest Count
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-50 dark:focus-within:ring-rose-900/20 transition-all">
                  <input
                    type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Visual Style Cards (Replaces text-heavy vibes) */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-slate-400" /> What's most important?
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {WEDDING_STYLES.map((style) => {
                  const Icon = style.icon;
                  const isActive = activeStyle.id === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setActiveStyle(style)}
                      className={`relative p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                        isActive
                          ? "bg-rose-50 dark:bg-rose-900/20 border-rose-500 shadow-sm scale-[1.02]"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-rose-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className={`p-2 rounded-full ${isActive ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`block text-sm font-black ${isActive ? 'text-rose-700 dark:text-rose-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {style.label}
                        </span>
                        <span className="block text-[10px] font-medium text-slate-500 mt-0.5">
                          {style.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Contingency Slider */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-end mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-slate-400" /> Safety Buffer (Hidden Fees/Tips)
                </label>
                <span className="text-sm font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-lg">
                  {bufferPercent}%
                </span>
              </div>
              
              <div className="px-1">
                <input
                  type="range" min="0" max="20" step="5"
                  value={bufferPercent}
                  onChange={(e) => setBufferPercent(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-900/20"
                />
                <div className="flex justify-between text-[10px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                  <span>0% (Risky)</span>
                  <span className="text-rose-400">10% (Ideal)</span>
                  <span>20% (Safe)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: ELEGANT BREAKDOWN ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            {/* Inner Wrapper for that "Envelope" look */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              {/* Status Banner */}
              {!calculations.isEmpty && (
                <div className={`mb-6 p-3.5 rounded-xl border flex items-center gap-3 ${calculations.guestStatus.color}`}>
                  <Info className={`w-5 h-5 shrink-0 ${calculations.guestStatus.iconColor}`} />
                  <div>
                    <p className="text-xs font-bold">
                      {calculations.guestStatus.msg} <span className="opacity-75 font-medium block sm:inline mt-0.5 sm:mt-0">(Est. {currency}{formatMoney(calculations.costPerGuest)}/head for food)</span>
                    </p>
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Available Budget</span>
                <div className="flex justify-center items-start gap-1">
                  <span className="text-2xl font-bold text-slate-400 mt-2">{currency}</span>
                  <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                    {formatMoney(calculations.budget)}
                  </span>
                </div>
              </div>

              {/* Visual Overall Progress Bar */}
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden mb-8">
                {calculations.breakdown.map((item, i) => (
                  <div key={i} style={{ width: `${(item.amount / calculations.budget) * 100}%` }} className={`h-full ${item.color} opacity-90`}></div>
                ))}
                {bufferPercent > 0 && <div style={{ width: `${bufferPercent}%` }} className="h-full bg-slate-400 dark:bg-slate-600 pattern-diagonal-lines-sm"></div>}
              </div>
              
              {/* Clean Category List */}
              <div className="space-y-4 flex-1">
                {calculations.breakdown.map((item, i) => (
                  <div key={i} className="group flex items-center justify-between">
                    <div className="flex items-center gap-3 w-1/2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color} bg-opacity-10 dark:bg-opacity-20`}>
                        <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                    </div>
                    
                    <div className="w-1/2 flex items-center justify-end gap-3">
                      {/* Mini Bar */}
                      <div className="hidden sm:block w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${(item.amount / calculations.budget) * 100}%` }} className={`h-full ${item.color}`}></div>
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums w-20 text-right">
                        {currency}{formatMoney(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Contingency Line Item */}
                {bufferPercent > 0 && (
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 border-dashed">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-500">Safety Buffer ({bufferPercent}%)</span>
                    </div>
                    <span className="text-sm font-black text-slate-500 tabular-nums">
                      {currency}{formatMoney(calculations.contingency)}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
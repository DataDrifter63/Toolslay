"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Package, Home, Scissors, PenTool, Truck,
  Info, Plus, Minus, Layers, CheckCircle2, 
  AlertCircle, DollarSign, Archive
} from "lucide-react";

// Standard moving industry baseline (Boxes per room type)
// S: Small (Heavy items/Books), M: Medium (Toys/Clothes), L: Large (Linens/Pillows), 
// W: Wardrobe (Hanging clothes), D: Dish/Glass (Fragile)
const ROOM_BASELINES = {
  masterBed: { label: "Master Bedroom", s: 5, m: 10, l: 6, w: 4, d: 0, icon: Home },
  guestBed: { label: "Guest/Kids Bedroom", s: 4, m: 8, l: 4, w: 2, d: 0, icon: Home },
  kitchen: { label: "Kitchen", s: 10, m: 10, l: 4, w: 0, d: 4, icon: Archive },
  living: { label: "Living / Family Room", s: 6, m: 6, l: 5, w: 0, d: 1, icon: Home },
  dining: { label: "Dining Room", s: 4, m: 4, l: 2, w: 0, d: 3, icon: Archive },
  office: { label: "Home Office", s: 12, m: 4, l: 2, w: 0, d: 0, icon: Archive }, // Heavy on small boxes for books
  garage: { label: "Garage / Storage", s: 10, m: 10, l: 10, w: 0, d: 0, icon: Truck }
};

// Modifiers based on packing lifestyle
const LIFESTYLES = [
  { id: "minimalist", label: "Minimalist", multiplier: 0.7, desc: "Decluttered, very few extra items." },
  { id: "standard", label: "Standard", multiplier: 1.0, desc: "Average amount of belongings." },
  { id: "heavy", label: "Heavy Packer", multiplier: 1.4, desc: "Lots of books, decor, or clothes." }
];

export default function MovingBoxCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // State
  const [lifestyle, setLifestyle] = useState(LIFESTYLES[1]); // Default to Standard
  const [rooms, setRooms] = useState({
    masterBed: 1,
    guestBed: 1,
    kitchen: 1,
    living: 1,
    dining: 0,
    office: 0,
    garage: 0
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateRoomCount = (key, delta) => {
    setRooms(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  // Core Math Engine
  const calculations = useMemo(() => {
    let totals = { s: 0, m: 0, l: 0, w: 0, d: 0 };

    // Sum all boxes based on room counts
    Object.keys(rooms).forEach(roomKey => {
      const count = rooms[roomKey];
      const baseline = ROOM_BASELINES[roomKey];
      if (count > 0) {
        totals.s += baseline.s * count;
        totals.m += baseline.m * count;
        totals.l += baseline.l * count;
        totals.w += baseline.w * count;
        totals.d += baseline.d * count;
      }
    });

    // Apply Lifestyle Multiplier and Round Up
    const mod = lifestyle.multiplier;
    const finalBoxes = {
      small: Math.ceil(totals.s * mod),
      medium: Math.ceil(totals.m * mod),
      large: Math.ceil(totals.l * mod),
      wardrobe: Math.ceil(totals.w * mod),
      dish: Math.ceil(totals.d * mod)
    };

    const totalBoxesCount = finalBoxes.small + finalBoxes.medium + finalBoxes.large + finalBoxes.wardrobe + finalBoxes.dish;

    // Supplies Estimation
    // Tape: 1 roll (55 yards) covers approx 15 boxes
    const tapeRolls = Math.ceil(totalBoxesCount / 15);
    // Markers: 1 marker per 30 boxes
    const markers = Math.ceil(totalBoxesCount / 30);
    // Packing Paper/Bubble Wrap: ~1.5 lbs per 10 boxes (heavily weighted by kitchen/dish boxes)
    const paperLbs = Math.ceil((totalBoxesCount * 0.15) + (finalBoxes.dish * 2)); 

    // Tier-1 US Pricing Estimates ($)
    const costs = {
      small: finalBoxes.small * 1.75,
      medium: finalBoxes.medium * 2.75,
      large: finalBoxes.large * 3.75,
      wardrobe: finalBoxes.wardrobe * 14.00,
      dish: finalBoxes.dish * 7.50,
      supplies: (tapeRolls * 3.50) + (markers * 1.50) + (paperLbs * 1.50)
    };
    
    const totalEstCost = Object.values(costs).reduce((a, b) => a + b, 0);

    return {
      finalBoxes,
      totalBoxesCount,
      supplies: { tapeRolls, markers, paperLbs },
      totalEstCost,
      isEmpty: totalBoxesCount === 0
    };
  }, [rooms, lifestyle]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-xl shadow-inner">
            <Package className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Moving Box Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Room-by-Room Supply & Cost Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* Lifestyle Selector */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Layers className="w-4 h-4 text-amber-500" /> Packing Lifestyle
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LIFESTYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setLifestyle(style)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col items-start gap-1 ${
                      lifestyle.id === style.id
                        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                    }`}
                  >
                    <span className={`block text-sm font-black ${lifestyle.id === style.id ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {style.label}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-500 line-clamp-2 leading-relaxed">
                      {style.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Inventory */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-1.5"><Home className="w-4 h-4 text-amber-500" /> Property Inventory</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {Object.keys(ROOM_BASELINES).map((roomKey) => {
                  const room = ROOM_BASELINES[roomKey];
                  const count = rooms[roomKey];
                  return (
                    <div key={roomKey} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate pr-2">
                        {room.label}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <button 
                          onClick={() => updateRoomCount(roomKey, -1)}
                          disabled={count === 0}
                          className="w-7 h-7 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:text-amber-600 hover:border-amber-400 disabled:opacity-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 w-4 text-center tabular-nums">
                          {count}
                        </span>
                        <button 
                          onClick={() => updateRoomCount(roomKey, 1)}
                          className="w-7 h-7 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:text-amber-600 hover:border-amber-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Info Tip */}
            <div className="p-4 bg-blue-50 border border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/50 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">Pro Moving Tip</span>
                <p className="text-[10px] font-medium text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                  Never put books in Large boxes! They become too heavy to lift. Always use Small boxes for books, canned goods, and heavy tools. Use Large boxes for light, bulky items like pillows and linens.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[600px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${calculations.isEmpty ? 'from-slate-400 to-slate-500' : 'from-amber-400 to-orange-500'}`}></div>
            
            <div className="flex items-center justify-between mb-6 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Truck className="w-3.5 h-3.5 text-amber-500" /> Relocation Plan
              </span>
            </div>
            
            {/* Total Boxes Hero */}
            <div className="text-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Total Boxes Required</span>
              <div className="flex justify-center items-end gap-2">
                <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                  {calculations.totalBoxesCount}
                </span>
                <span className="text-lg font-bold text-slate-400 mb-2 uppercase">Boxes</span>
              </div>
            </div>

            {/* Box Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Small (Heavy items)", count: calculations.finalBoxes.small, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
                { label: "Medium (Standard)", count: calculations.finalBoxes.medium, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/10" },
                { label: "Large (Light/Bulky)", count: calculations.finalBoxes.large, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/10" },
                { label: "Specialty (Wardrobe/Dish)", count: calculations.finalBoxes.wardrobe + calculations.finalBoxes.dish, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10" },
              ].map((box, i) => (
                <div key={i} className={`p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center text-center`}>
                  <span className={`text-2xl font-black tabular-nums ${box.color}`}>{box.count}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">{box.label}</span>
                </div>
              ))}
            </div>

            {/* Supply Estimator Checklist */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-slate-400" /> Recommended Supplies
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Packing Tape (Rolls)</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 tabular-nums">{calculations.supplies.tapeRolls}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Packing Paper (lbs)</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 tabular-nums">{calculations.supplies.paperLbs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Marker Pens</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 tabular-nums">{calculations.supplies.markers}</span>
              </div>
            </div>

            {/* Cost Estimate */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-1">
                    Est. New Material Cost: ${calculations.totalEstCost.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </h4>
                  <p className="text-[9px] font-medium text-slate-500 leading-relaxed pr-2">
                    Approximate US retail cost for buying these boxes and supplies brand new. Save money by sourcing free boxes from local grocery stores or recycling centers!
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
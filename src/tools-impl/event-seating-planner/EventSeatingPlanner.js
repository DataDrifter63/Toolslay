"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users, LayoutTemplate, Maximize, Music, 
  UtensilsCrossed, AlertTriangle, CheckCircle2,
  Info, Circle, Square, Map, Armchair
} from "lucide-react";

// Standard Event Industry Table Specs
const TABLE_TYPES = [
  { 
    id: "round-60", 
    label: "60\" Round Table", 
    desc: "Standard for weddings.", 
    seats: 8, 
    sqftNeeded: 100, // Includes space for pulled-out chairs and serving aisle
    icon: Circle 
  },
  { 
    id: "round-72", 
    label: "72\" Large Round", 
    desc: "Spacious, formal galas.", 
    seats: 10, 
    sqftNeeded: 120, 
    icon: Circle 
  },
  { 
    id: "banquet-8", 
    label: "8ft Rectangular", 
    desc: "Rustic or family-style.", 
    seats: 8, 
    sqftNeeded: 80, 
    icon: Square 
  }
];

export default function EventSeatingPlanner() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Inputs
  const [guestCount, setGuestCount] = useState(120);
  const [activeTable, setActiveTable] = useState(TABLE_TYPES[0]);
  
  // Floor Plan Modifiers
  const [hasDanceFloor, setHasDanceFloor] = useState(true);
  const [hasBuffet, setHasBuffet] = useState(true);
  
  // Venue Constraint
  const [venueSqFt, setVenueSqFt] = useState(2000);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Professional Architect Math Engine
  const calculations = useMemo(() => {
    const guests = Math.max(1, parseInt(guestCount) || 1);
    const capacity = parseFloat(venueSqFt) || 0;

    // 1. Hardware Requirements
    const tableCount = Math.ceil(guests / activeTable.seats);
    const chairCount = guests; // One chair per guest (excluding vendors for this basic calc)

    // 2. Space Requirements (Square Footage)
    const seatingSpace = tableCount * activeTable.sqftNeeded;
    
    // Dance Floor: Industry rule ~3-4 sqft per dancing guest. Assume 40% dance at once.
    const danceFloorSpace = hasDanceFloor ? Math.max(150, guests * 1.5) : 0;
    
    // Buffet/Bar: ~100 sqft per 50 guests for staging and lines
    const buffetSpace = hasBuffet ? Math.max(100, Math.ceil(guests / 50) * 100) : 0;

    const totalSpaceRequired = seatingSpace + danceFloorSpace + buffetSpace;

    // 3. Venue Reality Check
    let status = { state: "comfortable", msg: "Spacious & Comfortable", color: "text-emerald-600 bg-emerald-50 border-emerald-200", bar: "bg-emerald-500", icon: CheckCircle2 };
    
    if (capacity > 0) {
      const usagePercent = (totalSpaceRequired / capacity) * 100;
      if (usagePercent > 100) {
        status = { state: "danger", msg: "Over Capacity! Major Fire Hazard", color: "text-rose-600 bg-rose-50 border-rose-200", bar: "bg-rose-500", icon: AlertTriangle };
      } else if (usagePercent > 85) {
        status = { state: "tight", msg: "Tight Fit. Guests may feel cramped.", color: "text-amber-600 bg-amber-50 border-amber-200", bar: "bg-amber-500", icon: AlertTriangle };
      }
    }

    return {
      tableCount,
      chairCount,
      seatingSpace,
      danceFloorSpace: parseFloat(danceFloorSpace.toFixed(0)),
      buffetSpace,
      totalSpaceRequired,
      status,
      usagePercent: capacity > 0 ? Math.min(100, (totalSpaceRequired / capacity) * 100) : 0,
      isEmpty: guests <= 0
    };
  }, [guestCount, activeTable, hasDanceFloor, hasBuffet, venueSqFt]);

  const formatNum = (num) => num.toLocaleString("en-US");

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-violet-100 to-transparent dark:from-violet-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-violet-50 dark:bg-violet-900/30 p-3.5 rounded-2xl">
            <LayoutTemplate className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Event Seating & Space Planner
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              Table Layouts & Venue Capacity Check
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
                  <Users className="w-4 h-4 text-slate-400" /> Total Guests
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-50 dark:focus-within:ring-violet-900/20 transition-all">
                  <input
                    type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Maximize className="w-4 h-4 text-slate-400" /> Venue Size (Sq. Ft)
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-50 dark:focus-within:ring-violet-900/20 transition-all">
                  <input
                    type="number" min="0" step="100" value={venueSqFt} onChange={(e) => setVenueSqFt(e.target.value)}
                    className="w-full bg-transparent px-5 py-4 text-2xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Table Type Selector */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <LayoutTemplate className="w-4 h-4 text-slate-400" /> Table Setup Style
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TABLE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = activeTable.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveTable(type)}
                      className={`relative p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                        isActive
                          ? "bg-violet-50 dark:bg-violet-900/20 border-violet-500 shadow-sm scale-[1.02]"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-violet-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className={`p-2 rounded-full ${isActive ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`block text-sm font-black ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {type.label}
                        </span>
                        <span className="block text-[10px] font-medium text-slate-500 mt-0.5">
                          Seats {type.seats} Pax
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Floor Plan Modifiers */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Map className="w-4 h-4 text-slate-400" /> Event Zones Needed
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  hasDanceFloor ? "bg-fuchsia-50 dark:bg-fuchsia-900/20 border-fuchsia-400" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                }`}>
                  <input type="checkbox" checked={hasDanceFloor} onChange={(e) => setHasDanceFloor(e.target.checked)} className="mt-1 accent-fuchsia-600 w-4 h-4" />
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Music className={`w-4 h-4 ${hasDanceFloor ? "text-fuchsia-500" : "text-slate-400"}`} /> Dance Floor
                    </span>
                    <span className="block text-[10px] font-medium text-slate-500 mt-0.5">Reserves space for dancing</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  hasBuffet ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                }`}>
                  <input type="checkbox" checked={hasBuffet} onChange={(e) => setHasBuffet(e.target.checked)} className="mt-1 accent-blue-600 w-4 h-4" />
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <UtensilsCrossed className={`w-4 h-4 ${hasBuffet ? "text-blue-500" : "text-slate-400"}`} /> Buffet / Bar
                    </span>
                    <span className="block text-[10px] font-medium text-slate-500 mt-0.5">Space for food stations & lines</span>
                  </div>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: ELEGANT BREAKDOWN ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <Map className="w-3.5 h-3.5 text-violet-500" /> Floor Plan Blueprint
                </span>
              </div>

              {/* Hardware / Rental Count */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                  <div className="flex justify-center mb-2">
                    <LayoutTemplate className="w-5 h-5 text-violet-500" />
                  </div>
                  <span className="block text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                    {calculations.tableCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tables Needed</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                  <div className="flex justify-center mb-2">
                    <Armchair className="w-5 h-5 text-violet-500" />
                  </div>
                  <span className="block text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">
                    {calculations.chairCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Chairs Needed</span>
                </div>
              </div>
              
              {/* Space Breakdown */}
              <div className="space-y-3 flex-1 mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Square Footage Breakdown</h4>
                
                <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500"></div> Guest Seating
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">{formatNum(calculations.seatingSpace)} sq.ft</span>
                </div>

                {hasDanceFloor && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-fuchsia-500"></div> Dance Floor
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">{formatNum(calculations.danceFloorSpace)} sq.ft</span>
                  </div>
                )}

                {hasBuffet && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div> Buffet & Bar Lines
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">{formatNum(calculations.buffetSpace)} sq.ft</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 mt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Total Space Req.</span>
                  <span className="text-sm font-black text-violet-600 dark:text-violet-400 tabular-nums">
                    {formatNum(calculations.totalSpaceRequired)} sq.ft
                  </span>
                </div>
              </div>

              {/* Smart Venue Reality Check */}
              {parseFloat(venueSqFt) > 0 && (
                <div className="mt-auto">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Venue Capacity Check</h4>
                  
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden mb-3">
                    <div style={{ width: `${calculations.usagePercent}%` }} className={`h-full ${calculations.status.bar} transition-all duration-500`}></div>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${calculations.status.color}`}>
                    {React.createElement(calculations.status.icon, { className: "w-5 h-5 shrink-0 mt-0.5" })}
                    <div>
                      <span className="block text-xs font-black uppercase tracking-widest mb-1">
                        {calculations.status.msg}
                      </span>
                      <p className="text-[10px] font-medium opacity-80 leading-relaxed">
                        Your layout requires {formatNum(calculations.totalSpaceRequired)} sq.ft. The venue has {formatNum(venueSqFt)} sq.ft. 
                        ({calculations.usagePercent.toFixed(0)}% utilized).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Tip if Venue is empty */}
              {(!venueSqFt || venueSqFt <= 0) && (
                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                      Enter your venue's total square footage in the left panel to run a safety and comfort capacity check.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
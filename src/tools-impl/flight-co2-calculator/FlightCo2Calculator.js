"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plane, Map, Users, ArrowRightLeft, 
  Info, TreePine, Smartphone, Factory,
  CloudLightning, Leaf
} from "lucide-react";

// Standard Aviation Multipliers
const CABIN_CLASSES = [
  { id: "economy", name: "Economy", multiplier: 1.0 },
  { id: "premium", name: "Premium Economy", multiplier: 1.5 },
  { id: "business", name: "Business Class", multiplier: 3.0 },
  { id: "first", name: "First Class", multiplier: 4.0 }
];

export default function FlightCo2Calculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [distance, setDistance] = useState(1500);
  const [unit, setUnit] = useState("km");
  const [cabinClass, setCabinClass] = useState(CABIN_CLASSES[0]);
  const [passengers, setPassengers] = useState(1);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [includeRFI, setIncludeRFI] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Core Emissions Engine
  const calculations = useMemo(() => {
    let distVal = parseFloat(distance) || 0;
    if (distVal <= 0) return { totalKg: 0, trees: 0, phones: 0, carKm: 0 };

    // Convert to km for standard math
    const distKm = unit === "miles" ? distVal * 1.60934 : distVal;
    const totalFlightKm = isRoundTrip ? distKm * 2 : distKm;

    // Haul-based baseline efficiency (kg CO2 per passenger km)
    // Short flights are less efficient due to take-off/landing fuel burn
    let baseKgPerKm = 0.115; // Short haul (< 1500km)
    if (distKm > 1500 && distKm <= 4000) baseKgPerKm = 0.095; // Medium haul
    else if (distKm > 4000) baseKgPerKm = 0.085; // Long haul

    let totalCO2 = totalFlightKm * baseKgPerKm * cabinClass.multiplier * passengers;

    // Radiative Forcing Index (Aviation emissions at high altitudes have ~1.9x greater climate impact)
    if (includeRFI) {
      totalCO2 *= 1.9;
    }

    // Impact Equivalents
    // 1 mature tree absorbs ~22kg of CO2 per year
    const treesRequired = Math.ceil(totalCO2 / 22);
    // 1 kg CO2 = ~121 smartphone charges (EPA standard)
    const phoneCharges = Math.round(totalCO2 * 121);
    // Average gasoline car emits ~0.192 kg CO2 per km
    const carKmEq = Math.round(totalCO2 / 0.192);

    return {
      totalKg: totalCO2.toFixed(1),
      totalTonnes: (totalCO2 / 1000).toFixed(2),
      trees: treesRequired,
      phones: phoneCharges.toLocaleString(),
      carKm: carKmEq.toLocaleString()
    };
  }, [distance, unit, cabinClass, passengers, isRoundTrip, includeRFI]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-xl shadow-inner">
            <Plane className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Flight CO₂ Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Aviation Carbon Footprint & Impact
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Map className="w-4 h-4 text-emerald-500" /> Flight Distance
              </h3>
              
              <div className="flex items-center gap-4">
                <input
                  type="number" min="1"
                  value={distance}
                  onChange={(e) => setDistance(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-2xl font-black text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                />
                <div className="flex flex-col bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0 w-24">
                  <button onClick={() => setUnit("km")} className={`px-2 py-2 text-xs font-bold uppercase rounded-md transition-colors ${unit === "km" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>KM</button>
                  <button onClick={() => setUnit("miles")} className={`px-2 py-2 text-xs font-bold uppercase rounded-md transition-colors ${unit === "miles" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>Miles</button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-300 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={isRoundTrip}
                    onChange={(e) => setIsRoundTrip(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">Round Trip Flight</span>
                    <span className="block text-[10px] font-medium text-slate-500">Doubles the calculated distance</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Plane className="w-3 h-3 text-emerald-500" /> Cabin Class
                </label>
                <select 
                  value={cabinClass.id}
                  onChange={(e) => setCabinClass(CABIN_CLASSES.find(c => c.id === e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                >
                  {CABIN_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <p className="text-[9px] font-medium text-slate-500 pl-1">Premium classes take up more space, increasing per-passenger footprint.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-500" /> Passengers
                </label>
                <input
                  type="number" min="1"
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeRFI}
                  onChange={(e) => setIncludeRFI(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-blue-600"
                />
                <div>
                  <span className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">Include Radiative Forcing (RFI)</span>
                  <p className="text-[10px] font-medium text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                    Aircraft emissions at high altitudes (contrails, NOx) have a significantly greater warming effect than surface emissions. The RFI multiplier (x1.9) accounts for this true climate impact.
                  </p>
                </div>
              </label>
            </div>

          </div>
        </div>

        <div className="space-y-6 sticky top-6">
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500`}></div>
            
            <div className="flex items-center justify-between mb-6 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <CloudLightning className="w-3.5 h-3.5 text-emerald-500" /> Carbon Footprint
              </span>
            </div>
            
            <div className="text-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-8">
              <span className="block text-5xl lg:text-6xl font-black tracking-tighter mb-2 text-slate-800 dark:text-slate-100">
                {calculations.totalKg}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex justify-center items-center gap-1">
                <Factory className="w-3 h-3 text-slate-400" /> kg of CO₂ Equivalent
              </span>
              <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {calculations.totalTonnes} Tonnes
              </span>
            </div>

            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 text-center">
              Real-World Equivalents
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Trees Needed (1 Year)</span>
                </div>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{calculations.trees}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Smartphones Charged</span>
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-300">{calculations.phones}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Avg. Car Driving</span>
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-300">{calculations.carKm} km</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
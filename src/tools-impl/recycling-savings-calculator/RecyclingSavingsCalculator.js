"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Recycle, DollarSign, Zap, Droplets, 
  Monitor, Package, Wine, Box, 
  Wallet, Leaf, Info, CalendarDays, BarChart4
} from "lucide-react";

// Scientific Averages (EPA / Standard Recycling Math)
const RECYCLING_DATA = {
  aluminum: { co2PerItem: 0.1, kwhPerItem: 0.4, desc: "Cans (Soda, Beer)" }, // Aluminum saves 95% energy
  plastic: { co2PerItem: 0.06, kwhPerItem: 0.15, desc: "PET Bottles (Water, Soda)" },
  glass: { co2PerItem: 0.15, kwhPerItem: 0.05, desc: "Bottles & Jars" },
  paper: { co2PerKg: 3.5, waterGalsPerKg: 7, desc: "Cardboard & Paper (Kg)" }
};

const DEPOSIT_RATES = [
  { id: "none", label: "No Cash Return", val: 0 },
  { id: "5c", label: "$0.05 (Standard US)", val: 0.05 },
  { id: "10c", label: "$0.10 (MI, OR, AU)", val: 0.10 },
  { id: "25c", label: "$0.25 (Pfand GER)", val: 0.25 }
];

export default function RecyclingSavingsCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [frequency, setFrequency] = useState("weekly"); // weekly | monthly
  const [deposit, setDeposit] = useState(DEPOSIT_RATES[1]);
  
  // Item Inputs
  const [aluminum, setAluminum] = useState(15);
  const [plastic, setPlastic] = useState(10);
  const [glass, setGlass] = useState(5);
  const [paper, setPaper] = useState(2); // kg

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Core Math & Financial Engine
  const calculations = useMemo(() => {
    const multiplier = frequency === "weekly" ? 52 : 12;

    // Annualize Inputs
    const annAlum = aluminum * multiplier;
    const annPlast = plastic * multiplier;
    const annGlass = glass * multiplier;
    const annPaper = paper * multiplier;

    // Financials (Only applies to containers, not paper)
    const eligibleContainers = annAlum + annPlast + annGlass;
    const totalCash = eligibleContainers * deposit.val;

    // CO2 Savings (kg)
    const co2Alum = annAlum * RECYCLING_DATA.aluminum.co2PerItem;
    const co2Plast = annPlast * RECYCLING_DATA.plastic.co2PerItem;
    const co2Glass = annGlass * RECYCLING_DATA.glass.co2PerItem;
    const co2Paper = annPaper * RECYCLING_DATA.paper.co2PerKg;
    const totalCO2 = co2Alum + co2Plast + co2Glass + co2Paper;

    // Energy Savings (kWh)
    const kwhAlum = annAlum * RECYCLING_DATA.aluminum.kwhPerItem;
    const kwhPlast = annPlast * RECYCLING_DATA.plastic.kwhPerItem;
    const kwhGlass = annGlass * RECYCLING_DATA.glass.kwhPerItem;
    const totalKwh = kwhAlum + kwhPlast + kwhGlass;

    // Equivalents
    // 1 kWh = ~15 hours of laptop usage (avg 65W laptop)
    const laptopHours = Math.round(totalKwh * 15);
    // Water saved from paper
    const waterSavedGals = Math.round(annPaper * RECYCLING_DATA.paper.waterGalsPerKg);

    return {
      totalCash,
      totalCO2: parseFloat(totalCO2.toFixed(1)),
      totalKwh: Math.round(totalKwh),
      laptopHours: laptopHours.toLocaleString(),
      waterSavedGals: waterSavedGals.toLocaleString(),
      eligibleContainers: eligibleContainers.toLocaleString(),
      annualPaper: annPaper,
      isEmpty: eligibleContainers === 0 && annPaper === 0
    };
  }, [frequency, deposit, aluminum, plastic, glass, paper]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-100 to-transparent dark:from-indigo-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3.5 rounded-2xl">
            <Recycle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Recycling Savings Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Financial Returns & Eco-Impact Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Top Config: Frequency & Deposit */}
            <div className="space-y-6 border-b border-slate-100 dark:border-slate-800 pb-6">
              
              <div className="flex flex-col sm:flex-row gap-6 justify-between">
                {/* Frequency Toggle */}
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Your Habit Frequency
                  </label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button 
                      onClick={() => setFrequency("weekly")} 
                      className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${frequency === "weekly" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Weekly
                    </button>
                    <button 
                      onClick={() => setFrequency("monthly")} 
                      className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${frequency === "monthly" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* CRV / Deposit Selector */}
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Bottle Return Rate
                  </label>
                  <div className="relative">
                    <select
                      value={deposit.id}
                      onChange={(e) => setDeposit(DEPOSIT_RATES.find(d => d.id === e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                      {DEPOSIT_RATES.map(d => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Recyclables Sliders */}
            <div className="space-y-8">
              
              {/* Aluminum */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-indigo-500" /> Aluminum Cans
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Soda, Beer, Sparkling Water</span>
                  </div>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-0.5 rounded">
                    {aluminum} / {frequency.slice(0, 2)}
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={aluminum} onChange={(e) => setAluminum(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Plastic */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Recycle className="w-4 h-4 text-sky-500" /> Plastic Bottles (PET)
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Water, Juice, Soda</span>
                  </div>
                  <span className="text-sm font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-2.5 py-0.5 rounded">
                    {plastic} / {frequency.slice(0, 2)}
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={plastic} onChange={(e) => setPlastic(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              {/* Glass */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Wine className="w-4 h-4 text-emerald-500" /> Glass Bottles
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Wine, Beer, Sauces</span>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 rounded">
                    {glass} / {frequency.slice(0, 2)}
                  </span>
                </div>
                <input
                  type="range" min="0" max="50" step="1"
                  value={glass} onChange={(e) => setGlass(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Paper/Cardboard */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-amber-500" /> Cardboard & Paper (Kg)
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Boxes, Mail, Newspapers</span>
                  </div>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-0.5 rounded">
                    {paper} kg / {frequency.slice(0, 2)}
                  </span>
                </div>
                <input
                  type="range" min="0" max="50" step="1"
                  value={paper} onChange={(e) => setPaper(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
              </div>

            </div>
          </div>
        </div>

        {/* ================= RIGHT: IMPACT & FINANCIAL DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <BarChart4 className="w-3.5 h-3.5 text-indigo-500" /> Your Annual Impact
                </span>
              </div>
              
              {/* Financial Highlight */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden mb-6 group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet className="w-32 h-32" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 block mb-1">
                  Potential Cash Return / Year
                </span>
                <div className="flex items-end gap-1 relative z-10">
                  <span className="text-5xl font-black tracking-tighter tabular-nums">
                    ${calculations.totalCash.toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-indigo-200 mt-2 block relative z-10">
                  From returning {calculations.eligibleContainers} eligible containers.
                </span>
              </div>

              {/* CO2 Highlight */}
              <div className="text-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Total CO₂ Emissions Prevented
                </span>
                <div className="flex justify-center items-end gap-1">
                  <span className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                    {calculations.totalCO2}
                  </span>
                  <span className="text-lg font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                    kg
                  </span>
                </div>
              </div>

              {/* Relatable Resource Equivalents */}
              <div className="flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-500" /> Real-World Equivalents
                </h4>
                
                <div className="space-y-3 relative z-10">
                  
                  {/* Energy / Laptop */}
                  <div className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Laptop Power</span>
                        <span className="block text-[9px] font-medium text-slate-500">Energy saved (kWh)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.laptopHours}</span>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">Hours</span>
                    </div>
                  </div>

                  {/* Water Saved */}
                  <div className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-sky-500" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Water Preserved</span>
                        <span className="block text-[9px] font-medium text-slate-500">From paper recycling</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">{calculations.waterSavedGals}</span>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">Gallons</span>
                    </div>
                  </div>

                </div>

                {/* Educational Note */}
                <div className="mt-6 flex items-start gap-2 opacity-80">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-medium text-slate-500 leading-relaxed">
                    <strong>Why Aluminum is King:</strong> Recycling just one aluminum can saves 95% of the energy needed to make a new one from raw bauxite ore—enough energy to run a TV for 3 hours!
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
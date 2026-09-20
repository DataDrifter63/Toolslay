"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Car, Zap, Fuel, BatteryCharging, 
  Home, MapPin, TrendingDown, PiggyBank, 
  Leaf, Info, BarChart3, Calculator
} from "lucide-react";

export default function EvVsPetrolCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States - General Driving
  const [currency, setCurrency] = useState("$");
  const [annualDistance, setAnnualDistance] = useState(12000); // miles/km
  
  // States - Petrol Vehicle
  const [petrolPrice, setPetrolPrice] = useState(3.50); // per gallon/liter
  const [petrolEfficiency, setPetrolEfficiency] = useState(25); // MPG or km/L
  
  // States - EV Vehicle
  const [evEfficiency, setEvEfficiency] = useState(3.5); // miles/kWh or km/kWh (3.5 is avg)
  const [homeRate, setHomeRate] = useState(0.15); // per kWh
  const [publicRate, setPublicRate] = useState(0.45); // per kWh
  const [homeChargePercent, setHomeChargePercent] = useState(80); // % charged at home
  
  // States - Financial Break-even
  const [evPricePremium, setEvPricePremium] = useState(5000); // How much more the EV costs upfront

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Core Math Engine
  const calculations = useMemo(() => {
    const distance = parseFloat(annualDistance) || 0;
    
    // 1. Petrol Calculations
    const pPrice = parseFloat(petrolPrice) || 0;
    const pEff = parseFloat(petrolEfficiency) || 1; // Prevent div by zero
    
    const petrolGallons = distance / pEff;
    const petrolAnnualCost = petrolGallons * pPrice;
    const petrolPerMile = distance > 0 ? petrolAnnualCost / distance : 0;

    // 2. EV Calculations
    const eEff = parseFloat(evEfficiency) || 1;
    const hRate = parseFloat(homeRate) || 0;
    const pubRate = parseFloat(publicRate) || 0;
    
    const totalKwhNeeded = distance / eEff;
    const homeKwh = totalKwhNeeded * (homeChargePercent / 100);
    const pubKwh = totalKwhNeeded * ((100 - homeChargePercent) / 100);
    
    const evAnnualCost = (homeKwh * hRate) + (pubKwh * pubRate);
    const evPerMile = distance > 0 ? evAnnualCost / distance : 0;
    
    // Blended Electricity Rate (just for display)
    const blendedRate = totalKwhNeeded > 0 ? evAnnualCost / totalKwhNeeded : 0;

    // 3. Savings & Break-even
    const annualSavings = petrolAnnualCost - evAnnualCost;
    const premium = parseFloat(evPricePremium) || 0;
    
    let breakEvenYears = 0;
    let breakEvenMonths = 0;
    
    if (annualSavings > 0 && premium > 0) {
      const totalYearsRaw = premium / annualSavings;
      breakEvenYears = Math.floor(totalYearsRaw);
      breakEvenMonths = Math.ceil((totalYearsRaw - breakEvenYears) * 12);
      if (breakEvenMonths === 12) {
        breakEvenYears += 1;
        breakEvenMonths = 0;
      }
    }

    // 4. 5-Year Projection
    const petrol5Yr = petrolAnnualCost * 5;
    const ev5Yr = evAnnualCost * 5;

    // 5. Eco Impact (Approx: 1 gal gas = ~19.6 lbs CO2. EV grid varies, we estimate 60% reduction)
    // We'll show a simplified "Tailpipe CO2 Eliminated"
    const tailpipeCO2Lbs = petrolGallons * 19.6;

    return {
      petrolAnnualCost,
      petrolPerMile,
      evAnnualCost,
      evPerMile,
      blendedRate,
      annualSavings,
      breakEvenYears,
      breakEvenMonths,
      hasPremium: premium > 0,
      isEvCheaper: annualSavings > 0,
      petrol5Yr,
      ev5Yr,
      tailpipeCO2Lbs: Math.round(tailpipeCO2Lbs),
      isEmpty: distance === 0
    };
  }, [annualDistance, petrolPrice, petrolEfficiency, evEfficiency, homeRate, publicRate, homeChargePercent, evPricePremium]);

  const formatMoney = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-100 via-transparent to-transparent dark:from-violet-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-100 via-transparent to-transparent dark:from-orange-900/10 rounded-tr-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <span className="text-slate-300 font-black text-xs">VS</span>
            <Fuel className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              EV vs Petrol Cost Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Running Costs, Charging Split & Break-Even Analysis
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Common Inputs */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> Annual Distance
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-50 dark:focus-within:ring-slate-900/20 transition-all overflow-hidden">
                  <input
                    type="number" min="0" step="500" value={annualDistance} onChange={(e) => setAnnualDistance(e.target.value)}
                    className="w-full bg-transparent px-5 py-3 text-xl font-black text-slate-800 dark:text-slate-100 outline-none"
                  />
                  <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 border-l border-slate-200 dark:border-slate-700 px-4 py-3 h-full shrink-0">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Miles/Km</span>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-1/3 space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  Currency
                </label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-50 dark:focus-within:ring-slate-900/20 transition-all overflow-hidden">
                  <input
                    type="text" maxLength="3" value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-transparent px-5 py-3 text-xl font-black text-center text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              
              {/* PETROL SECTION */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
                  <Fuel className="w-3.5 h-3.5" /> Petrol / ICE Car
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fuel Price (per gal/L)</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                    <span className="text-sm font-bold text-slate-400 mr-1">{currency}</span>
                    <input type="number" min="0" step="0.1" value={petrolPrice} onChange={(e) => setPetrolPrice(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-800 dark:text-slate-100 outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency (MPG or km/L)</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                    <input type="number" min="1" step="1" value={petrolEfficiency} onChange={(e) => setPetrolEfficiency(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-800 dark:text-slate-100 outline-none" />
                  </div>
                </div>
              </div>

              {/* EV SECTION */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/50 text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                  <Zap className="w-3.5 h-3.5" /> Electric Vehicle
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">EV Efficiency (mi/kWh)</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                    <input type="number" min="0.1" step="0.1" value={evEfficiency} onChange={(e) => setEvEfficiency(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-800 dark:text-slate-100 outline-none" />
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Avg: 3-4</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Home className="w-3 h-3"/> Home Rate</label>
                    <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                      <span className="text-xs font-bold text-slate-400 mr-1">{currency}</span>
                      <input type="number" min="0" step="0.01" value={homeRate} onChange={(e) => setHomeRate(e.target.value)} className="w-full bg-transparent text-xs font-black text-slate-800 dark:text-slate-100 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><BatteryCharging className="w-3 h-3"/> Public Fast Rate</label>
                    <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                      <span className="text-xs font-bold text-slate-400 mr-1">{currency}</span>
                      <input type="number" min="0" step="0.01" value={publicRate} onChange={(e) => setPublicRate(e.target.value)} className="w-full bg-transparent text-xs font-black text-slate-800 dark:text-slate-100 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Premium Charging Split Slider */}
                <div className="space-y-3 bg-violet-50/50 dark:bg-violet-900/10 p-4 rounded-xl border border-violet-100 dark:border-violet-800/30">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Charging Split</span>
                    <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                      {homeChargePercent}% Home
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={homeChargePercent} onChange={(e) => setHomeChargePercent(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                    <span>Public</span>
                    <span>Home</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Break-Even Config */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Calculator className="w-4 h-4 text-slate-400" /> Break-Even Analysis (Optional)
              </label>
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="block text-sm font-black text-slate-800 dark:text-slate-100">EV Upfront Price Premium</span>
                  <span className="text-[10px] font-medium text-slate-500">How much more does the EV cost vs the Petrol car?</span>
                </div>
                <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 w-full sm:w-48 shadow-sm">
                  <span className="text-sm font-bold text-slate-400 mr-1">{currency}</span>
                  <input type="number" min="0" step="500" value={evPricePremium} onChange={(e) => setEvPricePremium(e.target.value)} className="w-full bg-transparent text-lg font-black text-slate-800 dark:text-slate-100 outline-none" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: FINANCIAL DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <BarChart3 className="w-3.5 h-3.5 text-slate-400" /> Cost Comparison
                </span>
              </div>
              
              {/* Grand Total Savings */}
              <div className={`rounded-2xl p-6 text-white shadow-md relative overflow-hidden mb-6 ${calculations.isEvCheaper ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <PiggyBank className="w-32 h-32" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-1">
                  {calculations.isEvCheaper ? "EV Annual Fuel Savings" : "Petrol Annual Savings"}
                </span>
                <div className="flex items-end gap-1 relative z-10">
                  <span className="text-5xl font-black tracking-tighter tabular-nums">
                    {currency}{formatMoney(Math.abs(calculations.annualSavings))}
                  </span>
                  <span className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">/ yr</span>
                </div>
              </div>

              {/* Break Even Banner */}
              {calculations.hasPremium && calculations.isEvCheaper && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                      <TrendingDown className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Payback Period</span>
                      <span className="block text-[10px] font-medium text-slate-500">To recover EV premium</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                      {calculations.breakEvenYears}y {calculations.breakEvenMonths}m
                    </span>
                  </div>
                </div>
              )}

              {/* Per Mile Cost Reality Check */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                  <span className="block text-2xl font-black text-orange-500 tabular-nums leading-none mb-1">
                    {currency}{calculations.petrolPerMile.toFixed(2)}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Petrol Per Unit</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                  <span className="block text-2xl font-black text-violet-500 tabular-nums leading-none mb-1">
                    {currency}{calculations.evPerMile.toFixed(2)}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">EV Per Unit</span>
                </div>
              </div>

              {/* 5-Year Visual Projection */}
              <div className="flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">5-Year Fuel Cost Projection</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5"/> Petrol</span>
                      <span className="text-slate-700 dark:text-slate-300 tabular-nums">{currency}{formatMoney(calculations.petrol5Yr)}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-1000"
                        style={{ width: `${Math.min(100, (calculations.petrol5Yr / Math.max(calculations.petrol5Yr, calculations.ev5Yr)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-violet-600 dark:text-violet-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5"/> Electric</span>
                      <span className="text-slate-700 dark:text-slate-300 tabular-nums">{currency}{formatMoney(calculations.ev5Yr)}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 transition-all duration-1000"
                        style={{ width: `${Math.min(100, (calculations.ev5Yr / Math.max(calculations.petrol5Yr, calculations.ev5Yr)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Eco Bonus Note */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                  <Leaf className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-0.5">Eco Bonus</span>
                    <p className="text-[10px] font-medium text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                      By driving the EV, you eliminate approximately <strong>{calculations.tailpipeCO2Lbs.toLocaleString()} lbs</strong> of direct tailpipe CO₂ emissions annually.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
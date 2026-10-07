"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Car, Zap, Fuel, BatteryCharging, 
  Home, MapPin, TrendingDown, PiggyBank, 
  Leaf, BarChart3, Calculator
} from "lucide-react";

export default function EvVsPetrolCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States - General Driving
  const [currency, setCurrency] = useState("$");
  const [annualDistance, setAnnualDistance] = useState(12000);
  
  // States - Petrol Vehicle
  const [petrolPrice, setPetrolPrice] = useState(3.50);
  const [petrolEfficiency, setPetrolEfficiency] = useState(25);
  
  // States - EV Vehicle
  const [evEfficiency, setEvEfficiency] = useState(3.5);
  const [homeRate, setHomeRate] = useState(0.15);
  const [publicRate, setPublicRate] = useState(0.45);
  const [homeChargePercent, setHomeChargePercent] = useState(80);
  
  // States - Financial Break-even
  const [evPricePremium, setEvPricePremium] = useState(5000);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Core Math Engine
  const calculations = useMemo(() => {
    const distance = parseFloat(annualDistance) || 0;
    
    const pPrice = parseFloat(petrolPrice) || 0;
    const pEff = parseFloat(petrolEfficiency) || 1;
    
    const petrolGallons = distance / pEff;
    const petrolAnnualCost = petrolGallons * pPrice;
    const petrolPerMile = distance > 0 ? petrolAnnualCost / distance : 0;

    const eEff = parseFloat(evEfficiency) || 1;
    const hRate = parseFloat(homeRate) || 0;
    const pubRate = parseFloat(publicRate) || 0;
    
    const totalKwhNeeded = distance / eEff;
    const homeKwh = totalKwhNeeded * (homeChargePercent / 100);
    const pubKwh = totalKwhNeeded * ((100 - homeChargePercent) / 100);
    
    const evAnnualCost = (homeKwh * hRate) + (pubKwh * pubRate);
    const evPerMile = distance > 0 ? evAnnualCost / distance : 0;
    
    const blendedRate = totalKwhNeeded > 0 ? evAnnualCost / totalKwhNeeded : 0;

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

    const petrol5Yr = petrolAnnualCost * 5;
    const ev5Yr = evAnnualCost * 5;
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

  const formatMoney = (val) => val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Premium Header - Fixed alignment for mobile */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-row items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3 rounded-xl border border-line flex items-center gap-1.5 shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
            <span className="text-muted font-black text-[10px] sm:text-xs">VS</span>
            <Fuel className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              EV vs Petrol Cost Calculator
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              Running Costs, Charging Split & Break-Even Analysis
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Common Inputs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted" /> Annual Distance
                </label>
                <div className="relative flex items-center bg-surface border border-line rounded-xl overflow-hidden focus-within:border-brand">
                  <input
                    type="number" min="0" step="500" value={annualDistance} onChange={(e) => setAnnualDistance(e.target.value)}
                    className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-sm font-black text-ink outline-none font-mono"
                  />
                  <div className="flex items-center justify-center bg-paper border-l border-line px-3 py-2.5 h-full shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted">Miles/Km</span>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-28 space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider">Currency</label>
                <input
                  type="text" maxLength="3" value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-xs font-black text-center text-ink outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-line">
              
              {/* PETROL SECTION */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  <Fuel className="w-3.5 h-3.5" /> Petrol / ICE Car
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Fuel Price (per gal/L)</label>
                  <div className="relative flex items-center bg-surface border border-line rounded-xl px-3 py-2">
                    <span className="text-xs font-bold text-muted mr-1">{currency}</span>
                    <input type="number" min="0" step="0.1" value={petrolPrice} onChange={(e) => setPetrolPrice(e.target.value)} className="w-full bg-transparent text-xs font-black text-ink outline-none font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Efficiency (MPG / km/L)</label>
                  <input type="number" min="1" step="1" value={petrolEfficiency} onChange={(e) => setPetrolEfficiency(e.target.value)} className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-xs font-black text-ink outline-none font-mono" />
                </div>
              </div>

              {/* EV SECTION */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  <Zap className="w-3.5 h-3.5" /> Electric Vehicle
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">EV Efficiency (mi/kWh)</label>
                  <input type="number" min="0.1" step="0.1" value={evEfficiency} onChange={(e) => setEvEfficiency(e.target.value)} className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-xs font-black text-ink outline-none font-mono" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted uppercase tracking-wider flex items-center gap-1"><Home className="w-3 h-3"/> Home Rate</label>
                    <div className="relative flex items-center bg-surface border border-line rounded-xl px-2 py-2">
                      <span className="text-[10px] font-bold text-muted mr-0.5">{currency}</span>
                      <input type="number" min="0" step="0.01" value={homeRate} onChange={(e) => setHomeRate(e.target.value)} className="w-full bg-transparent text-xs font-black text-ink outline-none font-mono" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted uppercase tracking-wider flex items-center gap-1"><BatteryCharging className="w-3 h-3"/> Public Rate</label>
                    <div className="relative flex items-center bg-surface border border-line rounded-xl px-2 py-2">
                      <span className="text-[10px] font-bold text-muted mr-0.5">{currency}</span>
                      <input type="number" min="0" step="0.01" value={publicRate} onChange={(e) => setPublicRate(e.target.value)} className="w-full bg-transparent text-xs font-black text-ink outline-none font-mono" />
                    </div>
                  </div>
                </div>

                {/* Charging Split Slider */}
                <div className="space-y-2 bg-surface p-3 rounded-xl border border-line">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider">Charging Split</span>
                    <span className="text-xs font-black text-violet-500 font-mono">
                      {homeChargePercent}% Home
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={homeChargePercent} onChange={(e) => setHomeChargePercent(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-paper rounded-full appearance-none cursor-pointer accent-violet-500 border border-line"
                  />
                </div>

              </div>
            </div>

            {/* Break-Even Config */}
            <div className="pt-4 border-t border-line">
              <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Calculator className="w-3.5 h-3.5 text-muted" /> Break-Even Analysis (Optional)
              </label>
              <div className="bg-surface border border-line rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="block text-xs font-black text-ink">EV Upfront Price Premium</span>
                  <span className="text-[9px] font-bold text-muted">Extra cost of EV vs Petrol car</span>
                </div>
                <div className="relative flex items-center bg-paper border border-line rounded-xl px-3 py-2 w-full sm:w-40 shadow-sm">
                  <span className="text-xs font-bold text-muted mr-1">{currency}</span>
                  <input type="number" min="0" step="500" value={evPricePremium} onChange={(e) => setEvPricePremium(e.target.value)} className="w-full bg-transparent text-sm font-black text-ink outline-none font-mono" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: FINANCIAL DASHBOARD ================= */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col space-y-5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
            
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper border border-line text-[10px] font-black uppercase tracking-wider text-muted shadow-sm">
                <BarChart3 className="w-3.5 h-3.5 text-violet-500" /> Cost Comparison
              </span>
            </div>
            
            {/* Grand Total Savings */}
            <div className={`rounded-xl p-5 text-white shadow-sm relative overflow-hidden ${calculations.isEvCheaper ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <PiggyBank className="w-28 h-28" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider opacity-80 block mb-1">
                {calculations.isEvCheaper ? "EV Annual Fuel Savings" : "Petrol Annual Savings"}
              </span>
              <div className="flex items-baseline gap-1 relative z-10">
                <span className="text-3xl sm:text-4xl font-black tracking-tighter tabular-nums font-mono">
                  {currency}{formatMoney(Math.abs(calculations.annualSavings))}
                </span>
                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">/ yr</span>
              </div>
            </div>

            {/* Break Even Banner */}
            {calculations.hasPremium && calculations.isEvCheaper && (
              <div className="bg-paper border border-line rounded-xl p-3.5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-ink uppercase tracking-wider">Payback Period</span>
                    <span className="text-[9px] font-bold text-muted">To recover EV premium</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                    {calculations.breakEvenYears}y {calculations.breakEvenMonths}m
                  </span>
                </div>
              </div>
            )}

            {/* Per Mile Cost Reality Check */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper p-3 rounded-xl border border-line text-center shadow-sm">
                <span className="block text-xl font-black text-orange-500 tabular-nums leading-none mb-1 font-mono">
                  {currency}{calculations.petrolPerMile.toFixed(2)}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Petrol / Unit</span>
              </div>
              <div className="bg-paper p-3 rounded-xl border border-line text-center shadow-sm">
                <span className="block text-xl font-black text-violet-500 tabular-nums leading-none mb-1 font-mono">
                  {currency}{calculations.evPerMile.toFixed(2)}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">EV / Unit</span>
              </div>
            </div>

            {/* 5-Year Visual Projection */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-muted">5-Year Fuel Cost Projection</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-orange-500 flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5"/> Petrol</span>
                    <span className="text-ink tabular-nums font-mono">{currency}{formatMoney(calculations.petrol5Yr)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-paper border border-line rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (calculations.petrol5Yr / Math.max(calculations.petrol5Yr, calculations.ev5Yr)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-violet-500 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5"/> Electric</span>
                    <span className="text-ink tabular-nums font-mono">{currency}{formatMoney(calculations.ev5Yr)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-paper border border-line rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (calculations.ev5Yr / Math.max(calculations.petrol5Yr, calculations.ev5Yr)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eco Bonus Note */}
            <div className="pt-3 border-t border-line mt-auto">
              <div className="flex items-start gap-2.5 bg-paper p-3 rounded-xl border border-line shadow-sm">
                <Leaf className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-muted leading-relaxed">
                  Driving EV eliminates ~<strong>{calculations.tailpipeCO2Lbs.toLocaleString("en-US")} lbs</strong> of tailpipe CO₂ annually.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
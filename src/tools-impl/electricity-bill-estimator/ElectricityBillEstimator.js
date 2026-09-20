"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Zap, Plug, Activity, Plus, Trash2, 
  Lightbulb, AlertTriangle, BatteryCharging, 
  TrendingUp, Settings, BarChart3, Info
} from "lucide-react";

// Tier-1 Standard Appliance Presets (Wattage & Typical Daily Hours)
const PRESETS = [
  { id: "custom", name: "Custom Appliance", watts: 100, hours: 2 },
  { id: "ac", name: "Central AC (3 Ton)", watts: 3500, hours: 8 },
  { id: "ev", name: "EV Charger (Level 2)", watts: 7000, hours: 4 },
  { id: "heater", name: "Space Heater", watts: 1500, hours: 5 },
  { id: "fridge", name: "Fridge / Freezer", watts: 150, hours: 8 }, // Compressors don't run 24/7, ~8h equivalent active time
  { id: "dryer", name: "Tumble Dryer", watts: 3000, hours: 1 },
  { id: "washer", name: "Washing Machine", watts: 500, hours: 1 },
  { id: "pc", name: "Gaming PC / Workstation", watts: 450, hours: 6 },
  { id: "tv", name: "Large LED TV (65\")+", watts: 120, hours: 5 },
  { id: "dishwasher", name: "Dishwasher", watts: 1800, hours: 1.5 },
  { id: "pool", name: "Pool Pump", watts: 1200, hours: 6 },
];

export default function ElectricityBillEstimator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Rate & Settings State (Default US Standards)
  const [ratePerKwh, setRatePerKwh] = useState(0.16); // National US Avg ~16 cents
  const [fixedCharge, setFixedCharge] = useState(12.00); // Standard Grid Connection Fee
  const [currency, setCurrency] = useState("$");
  const [includeVampire, setIncludeVampire] = useState(true);

  // New Appliance Input State
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [appName, setAppName] = useState("");
  const [appWatts, setAppWatts] = useState("");
  const [appHours, setAppHours] = useState("");
  const [appDays, setAppDays] = useState(30);

  // Added Appliances List
  const [appliances, setAppliances] = useState([
    { id: 1, name: "Fridge / Freezer", watts: 150, hours: 8, days: 30 },
    { id: 2, name: "Central AC (3 Ton)", watts: 3500, hours: 6, days: 30 }
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handlers
  const handlePresetSelect = (presetId) => {
    const preset = PRESETS.find(p => p.id === presetId);
    setActivePreset(preset);
    if (preset.id !== "custom") {
      setAppName(preset.name);
      setAppWatts(preset.watts);
      setAppHours(preset.hours);
      setAppDays(30);
    } else {
      setAppName("");
      setAppWatts("");
      setAppHours("");
    }
  };

  const addAppliance = (e) => {
    e.preventDefault();
    if (!appName.trim() || !appWatts || !appHours) return;

    setAppliances([...appliances, {
      id: Date.now(),
      name: appName,
      watts: parseFloat(appWatts),
      hours: parseFloat(appHours),
      days: parseFloat(appDays)
    }]);

    // Reset to custom
    handlePresetSelect("custom");
  };

  const removeAppliance = (id) => {
    setAppliances(appliances.filter(a => a.id !== id));
  };

  // Core Energy Engine
  const calculations = useMemo(() => {
    let totalKwh = 0;
    let applianceBreakdown = [];

    appliances.forEach(app => {
      // Formula: (Watts × Hours per day × Days per month) ÷ 1000 = kWh per month
      const kwh = (app.watts * app.hours * app.days) / 1000;
      const cost = kwh * (parseFloat(ratePerKwh) || 0);
      
      totalKwh += kwh;
      applianceBreakdown.push({ ...app, kwh, cost });
    });

    // Sort by most expensive (Energy Hogs)
    applianceBreakdown.sort((a, b) => b.cost - a.cost);
    const topHog = applianceBreakdown.length > 0 ? applianceBreakdown[0] : null;

    const baseCost = totalKwh * (parseFloat(ratePerKwh) || 0);
    
    // Vampire Load (Standby Power) typically 5-10% of total usage. We'll use 5%.
    const vampireKwh = includeVampire ? totalKwh * 0.05 : 0;
    const vampireCost = vampireKwh * (parseFloat(ratePerKwh) || 0);
    
    const fixedCostVal = parseFloat(fixedCharge) || 0;
    
    const grandTotalKwh = totalKwh + vampireKwh;
    const grandTotalCost = baseCost + vampireCost + fixedCostVal;

    // Percentages for Progress Bar
    const pctBase = grandTotalCost > 0 ? (baseCost / grandTotalCost) * 100 : 0;
    const pctVampire = grandTotalCost > 0 ? (vampireCost / grandTotalCost) * 100 : 0;
    const pctFixed = grandTotalCost > 0 ? (fixedCostVal / grandTotalCost) * 100 : 0;

    return {
      totalKwh: parseFloat(totalKwh.toFixed(1)),
      vampireKwh: parseFloat(vampireKwh.toFixed(1)),
      grandTotalKwh: parseFloat(grandTotalKwh.toFixed(1)),
      baseCost,
      vampireCost,
      fixedCostVal,
      grandTotalCost,
      pctBase,
      pctVampire,
      pctFixed,
      applianceBreakdown,
      topHog,
      isEmpty: appliances.length === 0
    };
  }, [appliances, ratePerKwh, fixedCharge, includeVampire]);

  // Format Helper
  const formatMoney = (amount) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 dark:bg-yellow-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-xl shadow-inner">
            <Zap className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Electricity Bill Estimator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Appliance Audit, Vampire Loads & Energy Hog Detector
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,450px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* Utility Rates & Settings */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-4">
                <span className="flex items-center gap-1.5"><Settings className="w-4 h-4 text-yellow-500" /> Utility Pricing</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Currency</label>
                  <input
                    type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-black text-slate-800 dark:text-slate-200 outline-none focus:border-yellow-500 transition-colors text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">Rate per kWh</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">{currency}</span>
                    <input
                      type="number" min="0" step="0.01" value={ratePerKwh} onChange={(e) => setRatePerKwh(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-3 text-sm font-black text-slate-800 dark:text-slate-200 outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Fixed Grid Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">{currency}</span>
                    <input
                      type="number" min="0" step="1" value={fixedCharge} onChange={(e) => setFixedCharge(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-3 text-sm font-black text-slate-800 dark:text-slate-200 outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vampire Load Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                includeVampire ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}>
                <input type="checkbox" checked={includeVampire} onChange={(e) => setIncludeVampire(e.target.checked)} className="mt-1 accent-amber-600 w-4 h-4" />
                <div>
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Plug className="w-4 h-4 text-amber-500" /> Include "Vampire Load" (Standby Power)
                  </span>
                  <span className="block text-[10px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                    Appliances like TVs, microwaves, and chargers consume power even when turned off. This automatically estimates an additional 5% hidden load to your bill.
                  </span>
                </div>
              </label>
            </div>

            {/* Add Appliance Form */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-4 pt-4">
                <span className="flex items-center gap-1.5"><BatteryCharging className="w-4 h-4 text-yellow-500" /> Appliance Inventory</span>
              </h3>
              
              <form onSubmit={addAppliance} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                <div>
                  <select 
                    value={activePreset.id} onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-yellow-500 mb-3"
                  >
                    {PRESETS.map(p => <option key={p.id} value={p.id}>{p.name} {p.id !== 'custom' ? `(~${p.watts}W)` : ''}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text" placeholder="Name" value={appName} onChange={(e) => setAppName(e.target.value)} required
                    className="col-span-1 lg:col-span-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:border-yellow-500"
                  />
                  <div className="relative">
                    <input
                      type="number" min="1" placeholder="Watts" value={appWatts} onChange={(e) => setAppWatts(e.target.value)} required
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm font-black outline-none focus:border-yellow-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">W</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number" min="0.1" max="24" step="0.1" placeholder="Hrs/Day" value={appHours} onChange={(e) => setAppHours(e.target.value)} required
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm font-black outline-none focus:border-yellow-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">H/D</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Days / Month:</span>
                    <input
                      type="number" min="1" max="31" value={appDays} onChange={(e) => setAppDays(e.target.value)} required
                      className="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs font-black text-center outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
              </form>

              {/* Added Appliances List */}
              <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {appliances.length === 0 ? (
                  <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    <p className="text-sm font-bold text-slate-400">No appliances added yet.</p>
                  </div>
                ) : (
                  appliances.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-yellow-300 transition-colors group">
                      <div className="truncate pr-4">
                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{app.name}</span>
                        <span className="block text-[10px] font-medium text-slate-500">
                          {app.watts}W • {app.hours}h/day • {app.days} days
                        </span>
                      </div>
                      <button onClick={() => removeAppliance(app.id)} className="text-slate-400 hover:text-rose-500 p-2 rounded-lg transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[600px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${calculations.isEmpty ? 'from-slate-400 to-slate-500' : 'from-yellow-400 to-orange-500'}`}></div>
            
            <div className="flex items-center justify-between mb-6 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <BarChart3 className="w-3.5 h-3.5 text-yellow-500" /> Bill Estimate
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                {calculations.grandTotalKwh} kWh / Month
              </span>
            </div>
            
            {/* Grand Total */}
            <div className="text-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Estimated Monthly Bill</span>
              <div className="flex justify-center items-start gap-1">
                <span className="text-2xl font-bold text-slate-400 mt-2">{currency}</span>
                <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                  {formatMoney(calculations.grandTotalCost)}
                </span>
              </div>
            </div>

            {/* Smart Energy Hog Alert */}
            {calculations.topHog && (
              <div className="mb-6 p-4 rounded-xl border bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/50 flex items-start gap-3 animate-in zoom-in-95">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">
                    Energy Hog Detected
                  </span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your <strong className="text-rose-700 dark:text-rose-400">{calculations.topHog.name}</strong> is costing you <strong className="text-rose-700 dark:text-rose-400">{currency}{formatMoney(calculations.topHog.cost)}</strong> every month ({(calculations.topHog.cost / calculations.grandTotalCost * 100).toFixed(0)}% of bill).
                  </p>
                </div>
              </div>
            )}

            {/* Visual Cost Breakdown */}
            <div className="space-y-4 mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                Bill Breakdown
              </h4>
              
              {/* Stacked Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 flex overflow-hidden">
                <div style={{ width: `${calculations.pctBase}%` }} className="h-full bg-yellow-400 transition-all duration-500"></div>
                <div style={{ width: `${calculations.pctVampire}%` }} className="h-full bg-amber-500 transition-all duration-500"></div>
                <div style={{ width: `${calculations.pctFixed}%` }} className="h-full bg-slate-500 transition-all duration-500"></div>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Appliance Usage</span>
                  <span className="font-black text-slate-800 dark:text-slate-100">{currency}{formatMoney(calculations.baseCost)}</span>
                </div>
                {includeVampire && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Vampire Load (Est. 5%)</span>
                    <span className="font-black text-slate-800 dark:text-slate-100">{currency}{formatMoney(calculations.vampireCost)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Fixed Grid Fees</span>
                  <span className="font-black text-slate-800 dark:text-slate-100">{currency}{formatMoney(calculations.fixedCostVal)}</span>
                </div>
              </div>
            </div>

            {/* Smart Savings Tip */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                  Unplugging secondary fridges or using smart power strips to kill "Vampire Loads" can instantly save you <strong>{currency}{formatMoney(calculations.vampireCost)}</strong> per month. Heating & Cooling usually account for 50%+ of typical bills.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
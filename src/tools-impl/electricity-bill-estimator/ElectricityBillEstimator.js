"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Zap, Plug, Plus, Trash2, 
  Lightbulb, AlertTriangle, BatteryCharging, 
  Settings, BarChart3
} from "lucide-react";

// Tier-1 Standard Appliance Presets (Wattage & Typical Daily Hours)
const PRESETS = [
  { id: "custom", name: "Custom Appliance", watts: 100, hours: 2 },
  { id: "ac", name: "Central AC (3 Ton)", watts: 3500, hours: 8 },
  { id: "ev", name: "EV Charger (Level 2)", watts: 7000, hours: 4 },
  { id: "heater", name: "Space Heater", watts: 1500, hours: 5 },
  { id: "fridge", name: "Fridge / Freezer", watts: 150, hours: 8 },
  { id: "dryer", name: "Tumble Dryer", watts: 3000, hours: 1 },
  { id: "washer", name: "Washing Machine", watts: 500, hours: 1 },
  { id: "pc", name: "Gaming PC / Workstation", watts: 450, hours: 6 },
  { id: "tv", name: "Large LED TV (65\")+", watts: 120, hours: 5 },
  { id: "dishwasher", name: "Dishwasher", watts: 1800, hours: 1.5 },
  { id: "pool", name: "Pool Pump", watts: 1200, hours: 6 },
];

export default function ElectricityBillEstimator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Rate & Settings State
  const [ratePerKwh, setRatePerKwh] = useState(0.16);
  const [fixedCharge, setFixedCharge] = useState(12.00);
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
      const kwh = (app.watts * app.hours * app.days) / 1000;
      const cost = kwh * (parseFloat(ratePerKwh) || 0);
      
      totalKwh += kwh;
      applianceBreakdown.push({ ...app, kwh, cost });
    });

    applianceBreakdown.sort((a, b) => b.cost - a.cost);
    const topHog = applianceBreakdown.length > 0 ? applianceBreakdown[0] : null;

    const baseCost = totalKwh * (parseFloat(ratePerKwh) || 0);
    const vampireKwh = includeVampire ? totalKwh * 0.05 : 0;
    const vampireCost = vampireKwh * (parseFloat(ratePerKwh) || 0);
    const fixedCostVal = parseFloat(fixedCharge) || 0;
    
    const grandTotalKwh = totalKwh + vampireKwh;
    const grandTotalCost = baseCost + vampireCost + fixedCostVal;

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

  const formatMoney = (amount) => amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-paper p-3 rounded-xl border border-line shrink-0">
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Electricity Bill Estimator
            </h2>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">
              Appliance Audit, Vampire Loads & Energy Hog Detector
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6 min-w-0">
          
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Utility Rates & Settings */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center justify-between border-b border-line pb-3 mb-4">
                <span className="flex items-center gap-1.5"><Settings className="w-4 h-4 text-yellow-500" /> Utility Pricing</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Currency</label>
                  <input
                    type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-xs font-black text-ink outline-none focus:border-brand text-center font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Rate per kWh</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted text-xs">{currency}</span>
                    <input
                      type="number" min="0" step="0.01" value={ratePerKwh} onChange={(e) => setRatePerKwh(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl pl-7 pr-3 py-2.5 text-xs font-black text-ink outline-none focus:border-brand font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Fixed Grid Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted text-xs">{currency}</span>
                    <input
                      type="number" min="0" step="1" value={fixedCharge} onChange={(e) => setFixedCharge(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl pl-7 pr-3 py-2.5 text-xs font-black text-ink outline-none focus:border-brand font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vampire Load Toggle */}
            <div>
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                includeVampire ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-surface border-line text-muted"
              }`}>
                <input type="checkbox" checked={includeVampire} onChange={(e) => setIncludeVampire(e.target.checked)} className="mt-0.5 accent-amber-500 w-4 h-4 shrink-0 cursor-pointer" />
                <div>
                  <span className="block text-xs font-black flex items-center gap-1.5">
                    <Plug className="w-4 h-4 text-amber-500" /> Include "Vampire Load" (Standby Power)
                  </span>
                  <span className="block text-[9px] font-bold opacity-80 mt-0.5 leading-relaxed">
                    Automatically estimates an additional 5% hidden load from electronics on standby.
                  </span>
                </div>
              </label>
            </div>

            {/* Add Appliance Form */}
            <div className="pt-2 border-t border-line">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center justify-between pb-3 pt-3">
                <span className="flex items-center gap-1.5"><BatteryCharging className="w-4 h-4 text-yellow-500" /> Appliance Inventory</span>
              </h3>
              
              <form onSubmit={addAppliance} className="p-3.5 bg-surface border border-line rounded-xl space-y-3">
                <div>
                  <select 
                    value={activePreset.id} onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand cursor-pointer"
                  >
                    {PRESETS.map(p => <option key={p.id} value={p.id}>{p.name} {p.id !== 'custom' ? `(~${p.watts}W)` : ''}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text" placeholder="Appliance Name" value={appName} onChange={(e) => setAppName(e.target.value)} required
                    className="w-full bg-paper border border-line rounded-xl px-3 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                  />
                  <div className="relative">
                    <input
                      type="number" min="1" placeholder="Watts" value={appWatts} onChange={(e) => setAppWatts(e.target.value)} required
                      className="w-full bg-paper border border-line rounded-xl px-3 py-2.5 text-xs font-black text-ink outline-none focus:border-brand pr-8 font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted">W</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number" min="0.1" max="24" step="0.1" placeholder="Hrs/Day" value={appHours} onChange={(e) => setAppHours(e.target.value)} required
                      className="w-full bg-paper border border-line rounded-xl px-3 py-2.5 text-xs font-black text-ink outline-none focus:border-brand pr-12 font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted uppercase">Hrs/Day</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted uppercase">Days:</span>
                    <input
                      type="number" min="1" max="31" value={appDays} onChange={(e) => setAppDays(e.target.value)} required
                      className="w-16 bg-paper border border-line rounded-xl px-2 py-2.5 text-xs font-black text-center text-ink outline-none font-mono"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="bg-brand hover:opacity-90 text-surface px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </form>

              {/* Added Appliances List */}
              <div className="mt-3 space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                {appliances.length === 0 ? (
                  <div className="text-center p-4 border border-dashed border-line rounded-xl bg-surface">
                    <p className="text-xs font-bold text-muted">No appliances added yet.</p>
                  </div>
                ) : (
                  appliances.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-surface border border-line rounded-xl hover:border-brand transition-colors group">
                      <div className="truncate pr-2 min-w-0">
                        <span className="block text-xs font-bold text-ink truncate">{app.name}</span>
                        <span className="block text-[9px] font-black text-muted uppercase tracking-wider font-mono">
                          {app.watts}W • {app.hours}h/day • {app.days} days
                        </span>
                      </div>
                      <button type="button" onClick={() => removeAppliance(app.id)} className="text-muted hover:text-rose-500 p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer">
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
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          
          <div className="bg-surface border border-line p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden flex flex-col space-y-5">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${calculations.isEmpty ? 'from-slate-400 to-slate-500' : 'from-yellow-400 to-orange-500'}`}></div>
            
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper border border-line text-[10px] font-black uppercase tracking-wider text-muted shadow-sm">
                <BarChart3 className="w-3.5 h-3.5 text-yellow-500" /> Bill Estimate
              </span>
              <span className="text-[10px] font-black text-muted uppercase tracking-wider bg-paper border border-line px-2.5 py-1 rounded-lg font-mono">
                {calculations.grandTotalKwh} kWh / Mo
              </span>
            </div>
            
            {/* Grand Total */}
            <div className="text-center py-2 border-y border-line">
              <span className="text-[9px] font-black text-muted uppercase tracking-wider block mb-1">Estimated Monthly Bill</span>
              <div className="flex justify-center items-baseline gap-1">
                <span className="text-xl font-bold text-muted">{currency}</span>
                <span className="text-4xl sm:text-5xl font-black text-ink tracking-tighter tabular-nums font-mono">
                  {formatMoney(calculations.grandTotalCost)}
                </span>
              </div>
            </div>

            {/* Smart Energy Hog Alert */}
            {calculations.topHog && (
              <div className="p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider mb-0.5">
                    Energy Hog Detected
                  </span>
                  <p className="text-[11px] font-bold leading-relaxed opacity-90">
                    Your <strong>{calculations.topHog.name}</strong> costs <strong>{currency}{formatMoney(calculations.topHog.cost)}</strong>/mo ({(calculations.topHog.cost / calculations.grandTotalCost * 100).toFixed(0)}% of bill).
                  </p>
                </div>
              </div>
            )}

            {/* Visual Cost Breakdown */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-muted">
                Bill Breakdown
              </h4>
              
              <div className="w-full bg-paper border border-line rounded-full h-3 flex overflow-hidden p-0.5">
                <div style={{ width: `${calculations.pctBase}%` }} className="h-full bg-yellow-400 rounded-l-full transition-all duration-500"></div>
                <div style={{ width: `${calculations.pctVampire}%` }} className="h-full bg-amber-500 transition-all duration-500"></div>
                <div style={{ width: `${calculations.pctFixed}%` }} className="h-full bg-slate-400 rounded-r-full transition-all duration-500"></div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Appliance Usage</span>
                  <span className="font-black text-ink font-mono">{currency}{formatMoney(calculations.baseCost)}</span>
                </div>
                {includeVampire && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Vampire Load (5%)</span>
                    <span className="font-black text-ink font-mono">{currency}{formatMoney(calculations.vampireCost)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Fixed Grid Fees</span>
                  <span className="font-black text-ink font-mono">{currency}{formatMoney(calculations.fixedCostVal)}</span>
                </div>
              </div>
            </div>

            {/* Smart Savings Tip */}
            <div className="pt-3 border-t border-line mt-auto">
              <div className="flex items-start gap-3 bg-paper p-3 rounded-xl border border-line shadow-sm">
                <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-muted leading-relaxed">
                  Smart power strips to kill standby power can save you <strong>{currency}{formatMoney(calculations.vampireCost)}</strong> monthly.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
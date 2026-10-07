"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Map, Fuel, Users, Car, Truck, Gauge, MapPin, 
  Wallet, Route, AlertCircle, Info, Calculator, 
  Settings2, SplitSquareHorizontal, DollarSign
} from "lucide-react";

// USA Optimized Vehicle Presets (Avg US Highway MPG)
const VEHICLE_PRESETS = [
  { id: "sedan", name: "Sedan / Hatchback", mpg: 35, kml: 15, icon: Car },
  { id: "suv", name: "SUV / 4x4", mpg: 24, kml: 10, icon: Truck },
  { id: "motorcycle", name: "Motorcycle", mpg: 60, kml: 25, icon: Gauge },
  { id: "camper", name: "Camper / RV", mpg: 12, kml: 5, icon: MapPin }
];

export default function RoadTripCostCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Tier-1 Specifics: Default to Imperial and USD ($)
  const [system, setSystem] = useState("imperial"); // metric (km, L) or imperial (mi, Gal)
  const [currency, setCurrency] = useState("$");

  // Localized Primary Inputs (Based on US Realities)
  const [distance, setDistance] = useState(300); // 300 Miles default
  const [fuelEfficiency, setFuelEfficiency] = useState(VEHICLE_PRESETS[1].mpg); // Default to common US vehicle (SUV) efficiency
  const [fuelPrice, setFuelPrice] = useState(3.50); // Typical US $ per Gallon
  
  // Advanced Modifiers
  const [passengers, setPassengers] = useState(1);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [addDetourBuffer, setAddDetourBuffer] = useState(true);

  // Active Preset Tracker
  const [activePreset, setActivePreset] = useState("suv");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle System Change (Imperial <-> Metric)
  const handleSystemChange = (newSystem) => {
    if (newSystem === system) return;
    setSystem(newSystem);
    
    // Automatically reset to default vehicle preset for the new system
    const defaultPreset = VEHICLE_PRESETS.find(p => p.id === "suv");
    setActivePreset("suv");
    setFuelEfficiency(newSystem === "metric" ? defaultPreset.kml : defaultPreset.mpg);
    
    // Convert current distance roughly just as a convenience, not exact math
    setDistance(newSystem === "metric" ? Math.round(distance * 1.609) : Math.round(distance / 1.609));
    
    // Convert current fuel price roughly
    setFuelPrice(newSystem === "metric" ? parseFloat((fuelPrice / 3.785).toFixed(2)) : parseFloat((fuelPrice * 3.785).toFixed(2)));
  };

  // Handle Preset Click
  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setFuelEfficiency(system === "metric" ? preset.kml : preset.mpg);
  };

  // Advanced Tier-1 Optimized Math Engine
  const calculations = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const eff = parseFloat(fuelEfficiency) || 0;
    const price = parseFloat(fuelPrice) || 0;
    const pax = Math.max(1, parseInt(passengers) || 1);

    if (dist <= 0 || eff <= 0 || price <= 0) {
      return { totalDistance: 0, fuelNeeded: 0, totalFuelCost: 0, costPerPerson: 0, wearAndTear: 0, totalTrueCost: 0 };
    }

    // 1. Distance Calculation (Including Round Trip & Buffer)
    let totalDist = dist;
    if (isRoundTrip) totalDist *= 2;
    if (addDetourBuffer) totalDist *= 1.1; // 10% buffer for US city traffic & highway exits

    // 2. Fuel Needed (Math is universal, labels change based on 'system')
    const fuelNeeded = totalDist / eff;

    // 3. Financials
    const totalFuelCost = fuelNeeded * price;
    const costPerPerson = totalFuelCost / pax;

    // 4. Localized True Cost Engine (Based on US AAA Data)
    // AAA estimates ~10 cents per mile for maintenance, tires, and depreciation over life.
    // If metric, convert 10 cents/mi to cents/km (0.10 / 1.609 ≈ 0.062)
    const wearTearRatePerUnit = system === "imperial" ? 0.10 : 0.062;
    const wearAndTear = totalDist * wearTearRatePerUnit;
    const totalTrueCost = totalFuelCost + wearAndTear;

    return {
      totalDistance: parseFloat(totalDist.toFixed(1)),
      fuelNeeded: parseFloat(fuelNeeded.toFixed(1)),
      totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
      costPerPerson: parseFloat(costPerPerson.toFixed(2)),
      wearAndTear: parseFloat(wearAndTear.toFixed(2)),
      totalTrueCost: parseFloat(totalTrueCost.toFixed(2))
    };
  }, [distance, fuelEfficiency, fuelPrice, passengers, isRoundTrip, addDetourBuffer, system]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header - Tier 1 Vitals Styled */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl shadow-inner">
            <Map className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Road Trip Cost Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              USA Standard Fuel Budget & True Journey Cost
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: LOCALIZED INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* System & Currency Toggle */}
            <div className="flex justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => handleSystemChange("imperial")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "imperial" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>Imperial (Mi / Gal)</button>
                <button onClick={() => handleSystemChange("metric")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "metric" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500"}`}>Metric (KM / L)</button>
              </div>
              <input
                type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-12 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs font-black text-center text-emerald-600 dark:text-emerald-400 outline-none"
                placeholder="Currency"
              />
            </div>

            {/* Localized Vehicle Presets */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pb-3 mb-4">
                <Settings2 className="w-4 h-4 text-emerald-500" /> USA Vehicle fleet averages
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VEHICLE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isActive = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        isActive 
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className={`block text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-500'}`}>
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">One-Way Distance</label>
                <div className="relative">
                  <input
                    type="number" min="1" value={distance} onChange={(e) => setDistance(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                    {system === "metric" ? "km" : "mi"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Vehicle Efficiency</label>
                <div className="relative">
                  <input
                    type="number" min="1" step="0.1" value={fuelEfficiency} onChange={(e) => { setFuelEfficiency(e.target.value); setActivePreset("custom"); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                    {system === "metric" ? "km/l" : "mpg"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Fuel Price</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-emerald-500 transition-colors">
                  <span className="shrink-0 w-10 text-center font-bold text-slate-400 text-sm">{currency}</span>
                  <input
                    type="number" min="0.1" step="0.01" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)}
                    className="w-full bg-transparent px-2 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase pr-3 shrink-0">
                    / {system === "metric" ? "Ltr" : "Gal"}
                  </span>
                </div>
              </div>

            </div>

            {/* Smart Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                isRoundTrip ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}>
                <input type="checkbox" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} className="mt-1 accent-emerald-600 w-4 h-4" />
                <div>
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">Round Trip Journey</span>
                  <span className="block text-[10px] font-medium text-slate-500 mt-0.5">Automatically doubles input distance</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                addDetourBuffer ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}>
                <input type="checkbox" checked={addDetourBuffer} onChange={(e) => setAddDetourBuffer(e.target.checked)} className="mt-1 accent-emerald-600 w-4 h-4" />
                <div>
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">10% Detour Buffer</span>
                  <span className="block text-[10px] font-medium text-slate-500 mt-0.5">Account for city traffic & exits</span>
                </div>
              </label>
            </div>

            {/* Passenger Splitter */}
            <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-500" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Split Journey Cost</h4>
                  <p className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80">Divide total equally among doston</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-emerald-600 hover:bg-emerald-100 transition-colors">-</button>
                <span className="text-lg font-black text-slate-800 dark:text-slate-200 w-4 text-center tabular-nums">{passengers}</span>
                <button onClick={() => setPassengers(passengers + 1)} className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-emerald-600 hover:bg-emerald-100 transition-colors">+</button>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[500px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600`}></div>
            
            <div className="flex items-center justify-between mb-8 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Calculator className="w-3.5 h-3.5 text-emerald-500" /> Your Journey Budget
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">
                Total: {calculations.totalDistance.toLocaleString("en-US")} {system === "metric" ? "km" : "mi"}
              </span>
            </div>
            
            {/* Primary Result: Total Fuel Cost */}
            <div className="text-center mb-8 pb-8 border-b border-slate-200 dark:border-slate-700 relative">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Estimated Fuel Cost</span>
              <div className="flex justify-center items-start gap-1">
                <span className="text-2xl font-bold text-slate-400 mt-2">{currency}</span>
                <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                  {calculations.totalFuelCost.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
            </div>

            {/* Split Breakdown - AAA style high tier UI */}
            {passengers > 1 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm text-center mb-6 animate-in zoom-in-95">
                <SplitSquareHorizontal className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Doston Share (Per Person)</span>
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {currency} {calculations.costPerPerson.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
            )}

            {/* True Cost Analyzer - Tier 1 Unique Feature */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-1">
                    AAA True Cost Estimation: {currency} {calculations.totalTrueCost.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                    Factors in localized US averages of <strong>{currency} {calculations.wearAndTear.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> for wear & tear, maintenance, and depreciation based on distance.
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
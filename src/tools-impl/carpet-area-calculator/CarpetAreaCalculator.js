"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Ruler, Plus, Trash2, Layers, Hammer, 
  DollarSign, Calculator, Info, AlertCircle, 
  TrendingUp, PieChart, Home
} from "lucide-react";

export default function CarpetAreaCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Localization & System
  const [system, setSystem] = useState("imperial"); // imperial (sq ft) or metric (sq m)
  const [currency, setCurrency] = useState("$");

  // Multi-Room State
  const [rooms, setRooms] = useState([
    { id: 1, name: "Living Room", length: 15, width: 12 }
  ]);

  // Stairs State
  const [includeStairs, setIncludeStairs] = useState(false);
  const [stairCount, setStairCount] = useState(12);

  // Pricing & Waste State (Per sq unit)
  const [carpetPrice, setCarpetPrice] = useState(3.50);
  const [paddingPrice, setPaddingPrice] = useState(0.80);
  const [laborPrice, setLaborPrice] = useState(1.50);
  const [overagePercent, setOveragePercent] = useState(10); // 10% waste buffer

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // System Toggle Handler (with realistic price adjustments)
  const handleSystemChange = (newSystem) => {
    if (newSystem === system) return;
    setSystem(newSystem);
    
    if (newSystem === "metric") {
      setCurrency("£");
      // Convert ft to m for existing rooms
      setRooms(rooms.map(r => ({
        ...r,
        length: parseFloat((r.length * 0.3048).toFixed(1)) || 0,
        width: parseFloat((r.width * 0.3048).toFixed(1)) || 0
      })));
      // Realistic per sq meter prices (~10.76x of sq ft)
      setCarpetPrice(38.00); 
      setPaddingPrice(8.50);
      setLaborPrice(16.00);
    } else {
      setCurrency("$");
      // Convert m to ft
      setRooms(rooms.map(r => ({
        ...r,
        length: parseFloat((r.length / 0.3048).toFixed(1)) || 0,
        width: parseFloat((r.width / 0.3048).toFixed(1)) || 0
      })));
      // Realistic per sq ft prices
      setCarpetPrice(3.50);
      setPaddingPrice(0.80);
      setLaborPrice(1.50);
    }
  };

  // Room Handlers
  const addRoom = () => {
    setRooms([...rooms, { id: Date.now(), name: `Room ${rooms.length + 1}`, length: "", width: "" }]);
  };

  const removeRoom = (id) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const updateRoom = (id, field, value) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Core Math Engine
  const calculations = useMemo(() => {
    // 1. Base Room Area
    let netRoomArea = 0;
    rooms.forEach(r => {
      const l = parseFloat(r.length) || 0;
      const w = parseFloat(r.width) || 0;
      netRoomArea += (l * w);
    });

    // 2. Stair Area
    // Standard stair: ~4 sq ft or ~0.37 sq m per step (tread + riser + slight wrap)
    const areaPerStair = system === "imperial" ? 4.0 : 0.37;
    const stairArea = includeStairs ? (Math.max(0, parseInt(stairCount) || 0) * areaPerStair) : 0;

    // 3. Net vs Gross Area
    const totalNetArea = netRoomArea + stairArea;
    const wasteMultiplier = 1 + (overagePercent / 100);
    const grossArea = totalNetArea * wasteMultiplier; // Area to actually buy

    // 4. Financials
    const costCarpet = grossArea * (parseFloat(carpetPrice) || 0);
    const costPadding = grossArea * (parseFloat(paddingPrice) || 0);
    const costLabor = grossArea * (parseFloat(laborPrice) || 0); // Labor usually charged on gross area installed
    
    const grandTotal = costCarpet + costPadding + costLabor;

    // Percentages for Bar
    const pctCarpet = grandTotal > 0 ? (costCarpet / grandTotal) * 100 : 0;
    const pctPadding = grandTotal > 0 ? (costPadding / grandTotal) * 100 : 0;
    const pctLabor = grandTotal > 0 ? (costLabor / grandTotal) * 100 : 0;

    return {
      netRoomArea: parseFloat(netRoomArea.toFixed(1)),
      stairArea: parseFloat(stairArea.toFixed(1)),
      totalNetArea: parseFloat(totalNetArea.toFixed(1)),
      grossArea: parseFloat(grossArea.toFixed(1)),
      wasteArea: parseFloat((grossArea - totalNetArea).toFixed(1)),
      costCarpet,
      costPadding,
      costLabor,
      grandTotal,
      pctCarpet,
      pctPadding,
      pctLabor,
      isZero: totalNetArea === 0
    };
  }, [rooms, includeStairs, stairCount, overagePercent, carpetPrice, paddingPrice, laborPrice, system]);

  // Format Helper
  const formatMoney = (amount) => amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl shadow-inner">
            <Layers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Carpet Area & Cost Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Multi-Room, Stairs & True Cost Estimation
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* System Toggle */}
            <div className="flex justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => handleSystemChange("imperial")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "imperial" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"}`}>US (Sq. Feet)</button>
                <button onClick={() => handleSystemChange("metric")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${system === "metric" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"}`}>Metric (Sq. Meters)</button>
              </div>
            </div>

            {/* Room Dimensions */}
            <div>
              <div className="flex items-center justify-between pb-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-indigo-500" /> Room Measurements
                </h3>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">In {system === "imperial" ? "Feet (ft)" : "Meters (m)"}</span>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-4">
                {rooms.map((room) => (
                  <div key={room.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-400 transition-colors">
                    <input
                      type="text" value={room.name} onChange={(e) => updateRoom(room.id, "name", e.target.value)}
                      placeholder="Room Name"
                      className="w-full sm:flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="number" min="0" step="0.1" value={room.length} onChange={(e) => updateRoom(room.id, "length", e.target.value)}
                        placeholder="Length"
                        className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-2 text-sm font-black text-center text-slate-800 dark:text-slate-200 outline-none"
                      />
                      <span className="text-slate-400 text-xs font-black">×</span>
                      <input
                        type="number" min="0" step="0.1" value={room.width} onChange={(e) => updateRoom(room.id, "width", e.target.value)}
                        placeholder="Width"
                        className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-2 text-sm font-black text-center text-slate-800 dark:text-slate-200 outline-none"
                      />
                      {rooms.length > 1 && (
                        <button onClick={() => removeRoom(room.id)} className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors ml-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addRoom}
                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Another Room
              </button>
            </div>

            {/* Stairs Calculator */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                includeStairs ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={includeStairs} onChange={(e) => setIncludeStairs(e.target.checked)} className="mt-0.5 accent-indigo-600 w-4 h-4" />
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">Include Staircase</span>
                    <span className="block text-[10px] font-medium text-slate-500 mt-0.5">Auto-calculates standard stair area</span>
                  </div>
                </div>
                
                {includeStairs && (
                  <div className="flex items-center gap-2 w-full sm:w-auto pl-7 sm:pl-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Number of Steps:</span>
                    <input
                      type="number" min="1" max="50" value={stairCount} onChange={(e) => setStairCount(parseInt(e.target.value) || 0)}
                      className="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-center font-black outline-none"
                    />
                  </div>
                )}
              </label>
            </div>

            {/* Cost Specifications */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between pb-4 pt-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> True Cost Pricing
                </h3>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Per {system === "imperial" ? "Sq Ft" : "Sq M"}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "carpet", label: "Carpet Material", val: carpetPrice, set: setCarpetPrice },
                  { id: "pad", label: "Padding / Underlay", val: paddingPrice, set: setPaddingPrice },
                  { id: "labor", label: "Labor / Install", val: laborPrice, set: setLaborPrice }
                ].map(item => (
                  <div key={item.id} className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">{item.label}</label>
                    <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-emerald-500 transition-colors">
                      <span className="shrink-0 w-8 text-center font-bold text-slate-400 text-sm">{currency}</span>
                      <input
                        type="number" min="0" step="0.1" value={item.val} onChange={(e) => item.set(e.target.value)}
                        className="w-full bg-transparent px-2 py-3 text-sm font-black text-slate-800 dark:text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overage Buffer Slider */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between pb-3">
                <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-amber-500" /> Pattern Match & Waste Buffer</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  {overagePercent}% Extra
                </span>
              </h3>
              <div className="px-1">
                <input
                  type="range" min="0" max="25" step="5"
                  value={overagePercent}
                  onChange={(e) => setOveragePercent(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-black/5 dark:border-white/5"
                />
                <div className="flex justify-between text-[9px] font-bold mt-2 uppercase tracking-widest text-slate-400">
                  <span>0% (Exact)</span>
                  <span className="text-amber-500">10% (Standard)</span>
                  <span>25% (Complex)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[600px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${calculations.isZero ? 'from-slate-400 to-slate-500' : 'from-indigo-400 to-violet-500'}`}></div>
            
            <div className="flex items-center justify-between mb-8 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Calculator className="w-3.5 h-3.5 text-indigo-500" /> Estimator Dashboard
              </span>
            </div>
            
            {/* Primary Result: Total Cost */}
            <div className="text-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Grand Total Estimate</span>
              <div className="flex justify-center items-start gap-1">
                <span className="text-2xl font-bold text-slate-400 mt-2">{currency}</span>
                <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums">
                  {formatMoney(calculations.grandTotal)}
                </span>
              </div>
            </div>

            {/* Visual Cost Breakdown */}
            <div className="space-y-4 mb-6">
              
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 flex overflow-hidden">
                <div style={{ width: `${calculations.pctCarpet}%` }} className="h-full bg-indigo-500 transition-all duration-500"></div>
                <div style={{ width: `${calculations.pctPadding}%` }} className="h-full bg-sky-500 transition-all duration-500"></div>
                <div style={{ width: `${calculations.pctLabor}%` }} className="h-full bg-amber-500 transition-all duration-500"></div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Carpet Material</span>
                  <span className="font-black text-slate-800 dark:text-slate-100">{currency}{formatMoney(calculations.costCarpet)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500"></div> Padding / Underlay</span>
                  <span className="font-black text-slate-800 dark:text-slate-100">{currency}{formatMoney(calculations.costPadding)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Labor & Install</span>
                  <span className="font-black text-slate-800 dark:text-slate-100">{currency}{formatMoney(calculations.costLabor)}</span>
                </div>
              </div>
            </div>

            {/* Required Area Stats */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-slate-400" /> Area Measurements
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Net Floor Area</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{calculations.totalNetArea} {system === "imperial" ? "sq ft" : "m²"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">+{overagePercent}% Waste Buffer</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">{calculations.wasteArea} {system === "imperial" ? "sq ft" : "m²"}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Buy This Much</span>
                <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                  {calculations.grossArea} {system === "imperial" ? "sq ft" : "m²"}
                </span>
              </div>
            </div>

            {/* Smart Info */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                  Carpet comes in rolls (typically 12ft or 15ft wide in the US). If a room is wider than the roll, installers must create a seam, which requires matching the pattern—hence the necessity of a 10-15% waste buffer.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
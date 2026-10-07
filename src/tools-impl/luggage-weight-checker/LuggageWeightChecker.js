"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Briefcase, Plane, Scale, Plus, Trash2, 
  AlertTriangle, CheckCircle2, DollarSign, 
  BaggageClaim, Shirt, Laptop, Droplets, Info
} from "lucide-react";

// Tier-1 Airline Baggage Data
const AIRLINES = [
  { id: "generic", name: "Standard (Default)", checkedLbs: 50, checkedKg: 23, carryLbs: 22, carryKg: 10, fee: 50 },
  { id: "delta", name: "Delta Air Lines", checkedLbs: 50, checkedKg: 23, carryLbs: 35, carryKg: 15, fee: 100 },
  { id: "american", name: "American Airlines", checkedLbs: 50, checkedKg: 23, carryLbs: 40, carryKg: 18, fee: 100 },
  { id: "united", name: "United Airlines", checkedLbs: 50, checkedKg: 23, carryLbs: 35, carryKg: 15, fee: 100 },
  { id: "ba", name: "British Airways", checkedLbs: 50, checkedKg: 23, carryLbs: 51, carryKg: 23, fee: 90 },
  { id: "qantas", name: "Qantas (Intl)", checkedLbs: 66, checkedKg: 30, carryLbs: 15, carryKg: 7, fee: 130 },
];

const CATEGORIES = [
  { id: "clothes", name: "Clothing & Shoes", icon: Shirt, color: "bg-indigo-500" },
  { id: "electronics", name: "Electronics", icon: Laptop, color: "bg-slate-500" },
  { id: "toiletries", name: "Toiletries & Liquids", icon: Droplets, color: "bg-teal-500" },
  { id: "misc", name: "Miscellaneous", icon: Briefcase, color: "bg-amber-500" }
];

export default function LuggageWeightChecker() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [unit, setUnit] = useState("lbs");
  const [bagType, setBagType] = useState("checked"); // checked or carryon
  const [airline, setAirline] = useState(AIRLINES[0]);
  const [itemName, setItemName] = useState("");
  const [itemWeight, setItemWeight] = useState("");
  const [itemCategory, setItemCategory] = useState(CATEGORIES[0].id);
  
  const [items, setItems] = useState([
    { id: 1, name: "Suitcase (Empty)", weight: 8.5, category: "misc", unit: "lbs" }
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle Unit Toggle and Convert Existing Items
  const handleUnitToggle = (newUnit) => {
    if (newUnit === unit) return;
    const convertedItems = items.map(item => ({
      ...item,
      weight: newUnit === "kg" ? parseFloat((item.weight / 2.20462).toFixed(2)) : parseFloat((item.weight * 2.20462).toFixed(2)),
      unit: newUnit
    }));
    setItems(convertedItems);
    setUnit(newUnit);
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemWeight || itemWeight <= 0) return;
    
    setItems([...items, {
      id: Date.now(),
      name: itemName,
      weight: parseFloat(itemWeight),
      category: itemCategory,
      unit: unit
    }]);
    setItemName("");
    setItemWeight("");
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  // Core Math Engine
  const calculations = useMemo(() => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    
    const limit = unit === "lbs" 
      ? (bagType === "checked" ? airline.checkedLbs : airline.carryLbs)
      : (bagType === "checked" ? airline.checkedKg : airline.carryKg);
      
    const remaining = limit - totalWeight;
    const isOverweight = remaining < 0;
    const overweightAmount = isOverweight ? Math.abs(remaining) : 0;
    
    // Progress Bar Percentage
    const percentage = Math.min(100, (totalWeight / limit) * 100);

    // Category Breakdown for Visuals
    const categoryTotals = CATEGORIES.map(cat => {
      const catTotal = items.filter(i => i.category === cat.id).reduce((sum, i) => sum + i.weight, 0);
      return { ...cat, total: catTotal, percentOfLimit: (catTotal / limit) * 100 };
    });

    return {
      totalWeight: parseFloat(totalWeight.toFixed(1)),
      limit,
      remaining: parseFloat(remaining.toFixed(1)),
      isOverweight,
      overweightAmount: parseFloat(overweightAmount.toFixed(1)),
      percentage,
      categoryTotals
    };
  }, [items, airline, bagType, unit]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-xl shadow-inner">
            <BaggageClaim className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Luggage Weight Checker
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Airline Limits & Penalty Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            <div className="flex justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => setBagType("checked")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${bagType === "checked" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"}`}>Checked Bag</button>
                <button onClick={() => setBagType("carryon")} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${bagType === "carryon" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"}`}>Carry-On</button>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => handleUnitToggle("lbs")} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${unit === "lbs" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"}`}>LBS</button>
                <button onClick={() => handleUnitToggle("kg")} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${unit === "kg" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"}`}>KG</button>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pb-3">
                <Plane className="w-4 h-4 text-indigo-500" /> Select Airline Rule
              </h3>
              <select 
                value={airline.id}
                onChange={(e) => setAirline(AIRLINES.find(a => a.id === e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                {AIRLINES.map(a => <option key={a.id} value={a.id}>{a.name} (Limit: {unit === 'lbs' ? (bagType === 'checked' ? a.checkedLbs : a.carryLbs) : (bagType === 'checked' ? a.checkedKg : a.carryKg)} {unit})</option>)}
              </select>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pb-3">
                <Scale className="w-4 h-4 text-indigo-500" /> Add Packing Items
              </h3>
              
              <form onSubmit={addItem} className="flex flex-wrap sm:flex-nowrap gap-3 mb-6">
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Item name (e.g., Heavy Jacket)"
                  className="w-full sm:flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                />
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full sm:w-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="relative w-full sm:w-28 shrink-0">
                  <input
                    type="number"
                    min="0.1" step="0.1"
                    value={itemWeight}
                    onChange={(e) => setItemWeight(e.target.value)}
                    placeholder="Weight"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-black text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
                </div>
                <button 
                  type="submit"
                  disabled={!itemName || !itemWeight}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl px-4 py-3 transition-colors flex items-center justify-center shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {items.length === 0 ? (
                  <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-400">Bag is currently empty.</p>
                  </div>
                ) : (
                  items.map(item => {
                    const CatIcon = CATEGORIES.find(c => c.id === item.category)?.icon || Briefcase;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <CatIcon className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-black font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                            {item.weight.toFixed(1)} {unit}
                          </span>
                          <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="space-y-6 sticky top-6">
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col min-h-[500px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${calculations.isOverweight ? 'from-rose-500 to-red-600' : 'from-indigo-400 to-purple-500'}`}></div>
            
            <div className="flex items-center justify-between mb-6 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Luggage Status
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Limit: {calculations.limit} {unit}
              </span>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Total Weight</span>
              <div className="flex justify-center items-end gap-2">
                <span className={`text-6xl font-black tracking-tighter tabular-nums ${calculations.isOverweight ? 'text-rose-600 dark:text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
                  {calculations.totalWeight}
                </span>
                <span className="text-lg font-bold text-slate-400 mb-1 uppercase">{unit}</span>
              </div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-6 flex overflow-hidden">
              {calculations.categoryTotals.map(cat => (
                cat.total > 0 && (
                  <div 
                    key={cat.id}
                    style={{ width: `${Math.min(cat.percentOfLimit, 100)}%` }} 
                    className={`h-full ${cat.color} transition-all duration-500`}
                    title={`${cat.name}: ${cat.total} ${unit}`}
                  ></div>
                )
              ))}
              {calculations.isOverweight && (
                <div 
                  style={{ width: `${Math.min(((calculations.totalWeight - calculations.limit) / calculations.limit) * 100, 100)}%` }} 
                  className="h-full bg-rose-500 animate-pulse"
                ></div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className={`p-4 rounded-xl border shadow-sm ${calculations.isOverweight ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-800/50' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {calculations.isOverweight ? <AlertTriangle className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</span>
                </div>
                <span className={`text-sm font-black ${calculations.isOverweight ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                  {calculations.isOverweight ? `Over by ${calculations.overweightAmount} ${unit}` : `${calculations.remaining} ${unit} Remaining`}
                </span>
              </div>
              
              <div className={`p-4 rounded-xl border shadow-sm ${calculations.isOverweight ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/50' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className={`w-4 h-4 ${calculations.isOverweight ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Est. Fee</span>
                </div>
                <span className={`text-sm font-black ${calculations.isOverweight ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {calculations.isOverweight ? `~$${airline.fee} Penalty` : 'No Fees'}
                </span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-1">
                    Smart Packing Tip
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                    {bagType === "carryon" 
                      ? "Airlines rarely weigh carry-ons unless they look visibly overstuffed, but strict carriers like Qantas will check. Keep heavy electronics accessible for TSA."
                      : "If you are dangerously close to the limit, wear your heaviest jacket and boots through airport security to save precious luggage weight."}
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
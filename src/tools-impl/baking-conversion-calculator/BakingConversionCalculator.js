"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChefHat, Scale, Ruler, Thermometer, ArrowRightLeft, 
  Info, CheckCircle2, AlertCircle, Layers, Flame
} from "lucide-react";

// Ingredient density database (Grams per US Cup)
const INGREDIENTS = [
  { id: "flour_ap", name: "All-Purpose Flour", gPerCup: 120 },
  { id: "flour_bread", name: "Bread Flour", gPerCup: 127 },
  { id: "flour_cake", name: "Cake Flour", gPerCup: 114 },
  { id: "sugar_white", name: "Granulated Sugar", gPerCup: 200 },
  { id: "sugar_brown", name: "Brown Sugar (Packed)", gPerCup: 213 },
  { id: "sugar_powder", name: "Powdered Sugar", gPerCup: 113 },
  { id: "butter", name: "Butter", gPerCup: 227 },
  { id: "cocoa", name: "Cocoa Powder", gPerCup: 85 },
  { id: "honey", name: "Honey / Syrup", gPerCup: 340 },
  { id: "milk", name: "Milk", gPerCup: 227 },
  { id: "water", name: "Water", gPerCup: 236 },
  { id: "oil", name: "Vegetable Oil", gPerCup: 218 },
  { id: "oats", name: "Rolled Oats", gPerCup: 90 },
  { id: "chocolate_chips", name: "Chocolate Chips", gPerCup: 170 },
  { id: "salt", name: "Table Salt", gPerCup: 273 }
].sort((a, b) => a.name.localeCompare(b.name));

const UNITS = {
  // Volume (Base: Cup)
  cup: { name: "Cups (US)", type: "vol", toBase: 1 },
  tbsp: { name: "Tablespoons", type: "vol", toBase: 1 / 16 },
  tsp: { name: "Teaspoons", type: "vol", toBase: 1 / 48 },
  ml: { name: "Milliliters (ml)", type: "vol", toBase: 1 / 236.588 },
  floz: { name: "Fluid Ounces (fl oz)", type: "vol", toBase: 1 / 8 },
  // Weight (Base: Grams)
  g: { name: "Grams (g)", type: "weight", toBase: 1 },
  kg: { name: "Kilograms (kg)", type: "weight", toBase: 1000 },
  oz: { name: "Ounces (oz)", type: "weight", toBase: 28.3495 },
  lb: { name: "Pounds (lb)", type: "weight", toBase: 453.592 }
};

export default function BakingConversionCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("ingredient"); // ingredient, pan, temp

  // Ingredient State
  const [ingAmount, setIngAmount] = useState(1);
  const [selectedIng, setSelectedIng] = useState(INGREDIENTS[0].id);
  const [fromUnit, setFromUnit] = useState("cup");
  const [toUnit, setToUnit] = useState("g");

  // Pan State
  const [fromPanShape, setFromPanShape] = useState("round");
  const [fromPanSize, setFromPanSize] = useState(8);
  const [toPanShape, setToPanShape] = useState("square");
  const [toPanSize, setToPanSize] = useState(8);

  // Temp State
  const [tempValue, setTempValue] = useState(350);
  const [tempUnit, setTempUnit] = useState("F");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- 1. Ingredient Calculation Engine ---
  const ingredientResult = useMemo(() => {
    const amt = parseFloat(ingAmount) || 0;
    if (amt <= 0) return 0;

    const ing = INGREDIENTS.find(i => i.id === selectedIng);
    const uFrom = UNITS[fromUnit];
    const uTo = UNITS[toUnit];
    
    if (!ing || !uFrom || !uTo) return 0;

    let standardAmount = amt * uFrom.toBase; // Convert to Base (Cups or Grams)
    let resultAmount = 0;

    if (uFrom.type === uTo.type) {
      // Vol to Vol OR Weight to Weight (Density not needed)
      resultAmount = standardAmount / uTo.toBase;
    } else if (uFrom.type === "vol" && uTo.type === "weight") {
      // Volume to Weight
      const grams = standardAmount * ing.gPerCup;
      resultAmount = grams / uTo.toBase;
    } else if (uFrom.type === "weight" && uTo.type === "vol") {
      // Weight to Volume
      const cups = standardAmount / ing.gPerCup;
      resultAmount = cups / uTo.toBase;
    }

    return parseFloat(resultAmount.toFixed(2));
  }, [ingAmount, selectedIng, fromUnit, toUnit]);

  // --- 2. Pan Size Scaling Engine ---
  const panResult = useMemo(() => {
    const calcArea = (shape, size) => {
      const s = parseFloat(size) || 0;
      if (shape === "round") return Math.PI * Math.pow(s / 2, 2);
      if (shape === "square") return s * s;
      if (shape === "9x13") return 9 * 13; // specialized rectangular
      if (shape === "loaf") return 8.5 * 4.5;
      return 0;
    };

    const fromArea = calcArea(fromPanShape, fromPanSize);
    const toArea = calcArea(toPanShape, toPanSize);

    if (fromArea === 0 || toArea === 0) return { multiplier: 0, advice: "" };

    const multiplier = toArea / fromArea;
    let advice = "";

    if (multiplier > 1.5) advice = "Baking time may increase slightly. Watch edges closely.";
    else if (multiplier < 0.7) advice = "Baking time will likely decrease. Check earlier than recipe states.";
    else advice = "Baking time should remain relatively similar.";

    return { multiplier: parseFloat(multiplier.toFixed(2)), advice, fromArea: fromArea.toFixed(1), toArea: toArea.toFixed(1) };
  }, [fromPanShape, fromPanSize, toPanShape, toPanSize]);

  // --- 3. Temperature Engine ---
  const tempResult = useMemo(() => {
    const val = parseFloat(tempValue) || 0;
    let c = 0, f = 0, gm = 0;

    if (tempUnit === "F") {
      f = val;
      c = (f - 32) * (5 / 9);
    } else if (tempUnit === "C") {
      c = val;
      f = (c * 9 / 5) + 32;
    }

    // Rough Gas Mark Calculation
    if (f < 275) gm = "1/4 or 1/2";
    else if (f < 300) gm = 1;
    else if (f < 325) gm = 2;
    else if (f < 350) gm = 3;
    else if (f < 375) gm = 4;
    else if (f < 400) gm = 5;
    else if (f < 425) gm = 6;
    else if (f < 450) gm = 7;
    else if (f < 475) gm = 8;
    else gm = 9;

    return { 
      F: Math.round(f), 
      C: Math.round(c), 
      GM: gm,
      heat: f >= 400 ? 'High (Hot)' : f >= 325 ? 'Moderate' : 'Low (Slow)' 
    };
  }, [tempValue, tempUnit]);


  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-rose-100 dark:bg-rose-900/50 p-3 rounded-xl shadow-inner">
            <ChefHat className="w-7 h-7 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Baking Conversion Pro
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Ingredients, Pans & Oven Temperature
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Custom Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
              <button onClick={() => setActiveTab("ingredient")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "ingredient" ? "bg-white dark:bg-slate-900 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <Scale className="w-4 h-4" /> Ingredients
              </button>
              <button onClick={() => setActiveTab("pan")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "pan" ? "bg-white dark:bg-slate-900 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <Layers className="w-4 h-4" /> Pan Sizes
              </button>
              <button onClick={() => setActiveTab("temp")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "temp" ? "bg-white dark:bg-slate-900 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <Thermometer className="w-4 h-4" /> Oven Temp
              </button>
            </div>

            {/* TAB 1: INGREDIENTS */}
            {activeTab === "ingredient" && (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Select Ingredient</label>
                  <select 
                    value={selectedIng} onChange={(e) => setSelectedIng(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500 transition-colors"
                  >
                    {INGREDIENTS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  <div className="space-y-3">
                    <input 
                      type="number" min="0" step="0.1" value={ingAmount} onChange={(e) => setIngAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-center text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500"
                    />
                    <select 
                      value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-rose-500"
                    >
                      <optgroup label="Volume">{Object.entries(UNITS).filter(([k,v]) => v.type === 'vol').map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                      <optgroup label="Weight">{Object.entries(UNITS).filter(([k,v]) => v.type === 'weight').map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-center pt-2">
                    <ArrowRightLeft className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  </div>

                  <div className="space-y-3">
                    <div className="w-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 text-lg font-black text-center text-rose-600 dark:text-rose-400">
                      {ingredientResult}
                    </div>
                    <select 
                      value={toUnit} onChange={(e) => setToUnit(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-rose-500"
                    >
                      <optgroup label="Weight">{Object.entries(UNITS).filter(([k,v]) => v.type === 'weight').map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                      <optgroup label="Volume">{Object.entries(UNITS).filter(([k,v]) => v.type === 'vol').map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAN SIZES */}
            {activeTab === "pan" && (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipe calls for:</label>
                    <select 
                      value={fromPanShape} onChange={(e) => setFromPanShape(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="round">Round Pan</option>
                      <option value="square">Square Pan</option>
                      <option value="9x13">9x13 Rectangular</option>
                      <option value="loaf">Standard Loaf</option>
                    </select>
                    {fromPanShape !== "9x13" && fromPanShape !== "loaf" && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" min="4" max="18" value={fromPanSize} onChange={(e) => setFromPanSize(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-black text-center text-slate-800 outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">Inches</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-slate-300" />
                  </div>

                  <div className="space-y-3 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800">
                    <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">I want to use:</label>
                    <select 
                      value={toPanShape} onChange={(e) => setToPanShape(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="round">Round Pan</option>
                      <option value="square">Square Pan</option>
                      <option value="9x13">9x13 Rectangular</option>
                      <option value="loaf">Standard Loaf</option>
                    </select>
                    {toPanShape !== "9x13" && toPanShape !== "loaf" && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" min="4" max="18" value={toPanSize} onChange={(e) => setToPanSize(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-black text-center text-slate-800 outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">Inches</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OVEN TEMP */}
            {activeTab === "temp" && (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Recipe Temp</label>
                    <input 
                      type="number" value={tempValue} onChange={(e) => setTempValue(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-2xl font-black text-center text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="w-24 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">&nbsp;</label>
                    <select 
                      value={tempUnit} onChange={(e) => setTempUnit(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-4 text-sm font-black text-center text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500"
                    >
                      <option value="F">°F</option>
                      <option value="C">°C</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-inner relative overflow-hidden min-h-[350px] flex flex-col">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-400 to-pink-500`}></div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 shadow-sm self-start">
              {activeTab === "ingredient" ? <Scale className="w-3.5 h-3.5 text-rose-500" /> : 
               activeTab === "pan" ? <Ruler className="w-3.5 h-3.5 text-rose-500" /> :
               <Thermometer className="w-3.5 h-3.5 text-rose-500" />}
              {activeTab === "ingredient" ? "Accurate Measurement" : activeTab === "pan" ? "Scaling Factor" : "Oven Equivalent"}
            </div>

            {/* Render Output Based on Tab */}
            {activeTab === "ingredient" && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-6">
                  <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                    {ingredientResult}
                  </span>
                  <span className="text-lg font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                    {UNITS[toUnit]?.name}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3 mt-auto">
                  <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Baking Science:</strong> Measuring by weight (grams) is vastly superior to volume (cups). Flour can compress up to 20% in a cup depending on how you scoop it!
                  </p>
                </div>
              </div>
            )}

            {activeTab === "pan" && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Multiply Recipe By</span>
                  <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                    {panResult.multiplier}x
                  </span>
                </div>
                {panResult.multiplier > 0 && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 mt-auto border shadow-sm ${
                    panResult.multiplier > 1.5 || panResult.multiplier < 0.7 
                      ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/50' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50'
                  }`}>
                    {panResult.multiplier > 1.5 || panResult.multiplier < 0.7 ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
                    <p className="text-xs font-bold leading-relaxed">{panResult.advice}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "temp" && (
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 block">{tempResult.F}°</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fahrenheit</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 block">{tempResult.C}°</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Celsius</span>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm mt-auto">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${tempResult.F >= 400 ? 'text-rose-500' : tempResult.F >= 325 ? 'text-amber-500' : 'text-blue-500'}`} />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{tempResult.heat} Heat</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-slate-800 dark:text-slate-200">{tempResult.GM}</span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gas Mark</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
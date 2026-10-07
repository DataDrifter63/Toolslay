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

    let standardAmount = amt * uFrom.toBase;
    let resultAmount = 0;

    if (uFrom.type === uTo.type) {
      resultAmount = standardAmount / uTo.toBase;
    } else if (uFrom.type === "vol" && uTo.type === "weight") {
      const grams = standardAmount * ing.gPerCup;
      resultAmount = grams / uTo.toBase;
    } else if (uFrom.type === "weight" && uTo.type === "vol") {
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
      if (shape === "9x13") return 9 * 13;
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

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-paper p-3 rounded-xl border border-line shrink-0">
            <ChefHat className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Baking Conversion Pro
            </h2>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">
              Ingredients, Pans & Oven Temperature
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6 min-w-0">
          
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Custom Tabs */}
            <div className="flex bg-surface p-1 rounded-xl border border-line">
              <button type="button" onClick={() => setActiveTab("ingredient")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "ingredient" ? "bg-paper text-rose-500 shadow-sm border border-line" : "text-muted hover:text-ink"}`}>
                <Scale className="w-3.5 h-3.5" /> Ingredients
              </button>
              <button type="button" onClick={() => setActiveTab("pan")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "pan" ? "bg-paper text-rose-500 shadow-sm border border-line" : "text-muted hover:text-ink"}`}>
                <Layers className="w-3.5 h-3.5" /> Pan Sizes
              </button>
              <button type="button" onClick={() => setActiveTab("temp")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "temp" ? "bg-paper text-rose-500 shadow-sm border border-line" : "text-muted hover:text-ink"}`}>
                <Thermometer className="w-3.5 h-3.5" /> Oven Temp
              </button>
            </div>

            {/* TAB 1: INGREDIENTS */}
            {activeTab === "ingredient" && (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Select Ingredient</label>
                  <select 
                    value={selectedIng} onChange={(e) => setSelectedIng(e.target.value)}
                    className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-xs font-bold text-ink outline-none focus:border-brand transition-colors"
                  >
                    {INGREDIENTS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  <div className="space-y-3">
                    <input 
                      type="number" min="0" step="0.1" value={ingAmount} onChange={(e) => setIngAmount(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-base sm:text-lg font-black text-center text-ink outline-none focus:border-brand font-mono"
                    />
                    <select 
                      value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand"
                    >
                      <optgroup label="Volume">{Object.entries(UNITS).filter(([k,v]) => v.type === 'vol').map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                      <optgroup label="Weight">{Object.entries(UNITS).filter(([k,v]) => v.type === 'weight').map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-muted rotate-90 sm:rotate-0" />
                  </div>

                  <div className="space-y-3">
                    <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-base sm:text-lg font-black text-center text-rose-600 dark:text-rose-400 font-mono">
                      {ingredientResult}
                    </div>
                    <select 
                      value={toUnit} onChange={(e) => setToUnit(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand"
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
                <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  
                  <div className="space-y-3 p-4 bg-surface rounded-xl border border-line">
                    <label className="text-[10px] font-black text-muted uppercase tracking-wider">Recipe calls for:</label>
                    <select 
                      value={fromPanShape} onChange={(e) => setFromPanShape(e.target.value)}
                      className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none"
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
                          className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-black text-center text-ink outline-none font-mono"
                        />
                        <span className="text-[10px] font-bold text-muted uppercase">Inches</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-muted rotate-90 sm:rotate-0" />
                  </div>

                  <div className="space-y-3 p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-wider">I want to use:</label>
                    <select 
                      value={toPanShape} onChange={(e) => setToPanShape(e.target.value)}
                      className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none"
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
                          className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-black text-center text-ink outline-none font-mono"
                        />
                        <span className="text-[10px] font-bold text-muted uppercase">Inches</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OVEN TEMP */}
            {activeTab === "temp" && (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 bg-surface rounded-xl border border-line">
                  <div className="w-full sm:flex-1 space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-wider">Recipe Temp</label>
                    <input 
                      type="number" value={tempValue} onChange={(e) => setTempValue(e.target.value)}
                      className="w-full bg-paper border border-line rounded-xl px-4 py-3 text-xl sm:text-2xl font-black text-center text-ink outline-none focus:border-brand font-mono"
                    />
                  </div>
                  <div className="w-full sm:w-28 space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-wider hidden sm:block">&nbsp;</label>
                    <select 
                      value={tempUnit} onChange={(e) => setTempUnit(e.target.value)}
                      className="w-full bg-paper border border-line rounded-xl px-3 py-3 text-xs font-black text-center text-ink outline-none focus:border-brand"
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
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          
          <div className="bg-surface border border-line p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden min-h-[350px] flex flex-col space-y-5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-400 to-pink-500"></div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper border border-line text-[10px] font-black uppercase tracking-wider text-muted shadow-sm self-start">
              {activeTab === "ingredient" ? <Scale className="w-3.5 h-3.5 text-rose-500" /> : 
               activeTab === "pan" ? <Ruler className="w-3.5 h-3.5 text-rose-500" /> :
               <Thermometer className="w-3.5 h-3.5 text-rose-500" />}
              {activeTab === "ingredient" ? "Accurate Measurement" : activeTab === "pan" ? "Scaling Factor" : "Oven Equivalent"}
            </div>

            {/* Render Output Based on Tab */}
            {activeTab === "ingredient" && (
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="text-center">
                  <span className="text-5xl sm:text-6xl font-black text-ink tracking-tighter font-mono block">
                    {ingredientResult}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-muted uppercase tracking-wider mt-1 block">
                    {UNITS[toUnit]?.name}
                  </span>
                </div>
                <div className="bg-paper p-4 rounded-xl border border-line shadow-sm flex items-start gap-3 mt-auto">
                  <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-muted leading-relaxed">
                    <strong>Baking Science:</strong> Measuring by weight (grams) is vastly superior to volume (cups). Flour can compress up to 20% in a cup depending on how you scoop it!
                  </p>
                </div>
              </div>
            )}

            {activeTab === "pan" && (
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="text-center">
                  <span className="text-[10px] font-black text-muted uppercase tracking-wider block mb-1">Multiply Recipe By</span>
                  <span className="text-5xl sm:text-6xl font-black text-ink tracking-tighter font-mono block">
                    {panResult.multiplier}x
                  </span>
                </div>
                {panResult.multiplier > 0 && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 border shadow-sm ${
                    panResult.multiplier > 1.5 || panResult.multiplier < 0.7 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {panResult.multiplier > 1.5 || panResult.multiplier < 0.7 ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
                    <p className="text-xs font-bold leading-relaxed">{panResult.advice}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "temp" && (
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-paper p-4 rounded-xl border border-line text-center shadow-sm">
                    <span className="text-2xl sm:text-3xl font-black text-ink block font-mono">{tempResult.F}°</span>
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider">Fahrenheit</span>
                  </div>
                  <div className="bg-paper p-4 rounded-xl border border-line text-center shadow-sm">
                    <span className="text-2xl sm:text-3xl font-black text-ink block font-mono">{tempResult.C}°</span>
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider">Celsius</span>
                  </div>
                </div>
                
                <div className="bg-paper p-4 rounded-xl border border-line flex items-center justify-between shadow-sm mt-auto">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${tempResult.F >= 400 ? 'text-rose-500' : tempResult.F >= 325 ? 'text-amber-500' : 'text-blue-500'}`} />
                    <span className="text-xs sm:text-sm font-bold text-ink">{tempResult.heat} Heat</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg sm:text-xl font-black text-ink font-mono">{tempResult.GM}</span>
                    <span className="block text-[9px] font-black text-muted uppercase tracking-wider">Gas Mark</span>
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
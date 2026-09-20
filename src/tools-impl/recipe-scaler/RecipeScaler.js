"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChefHat, Scale, Calculator, Plus, Trash2, 
  Utensils, Copy, CheckCircle2, RotateCcw,
  Wand2, Divide, X
} from "lucide-react";

export default function RecipeScaler() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Settings
  const [originalServings, setOriginalServings] = useState(4);
  const [targetServings, setTargetServings] = useState(8);
  
  // Ingredients State (Structured)
  const [ingredients, setIngredients] = useState([
    { id: 1, qty: 1.5, text: "cups all-purpose flour" },
    { id: 2, qty: 0.5, text: "teaspoon baking powder" },
    { id: 3, qty: 2, text: "large eggs" }
  ]);

  // Magic Paste State
  const [bulkText, setBulkText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ================= SMART CULINARY ENGINE ================= //

  // 1. Converts decimal to readable cooking fractions (e.g., 1.5 -> 1 ½)
  const decimalToFraction = (decimal) => {
    if (!decimal || isNaN(decimal) || decimal === 0) return "";
    
    const whole = Math.floor(decimal);
    const remainder = decimal - whole;
    const tolerance = 0.05;
    
    let frac = "";
    if (Math.abs(remainder - 0.33) < tolerance) frac = "⅓";
    else if (Math.abs(remainder - 0.66) < tolerance) frac = "⅔";
    else if (Math.abs(remainder - 0.25) < tolerance) frac = "¼";
    else if (Math.abs(remainder - 0.5) < tolerance) frac = "½";
    else if (Math.abs(remainder - 0.75) < tolerance) frac = "¾";
    else if (Math.abs(remainder - 0.125) < tolerance) frac = "⅛";
    else if (Math.abs(remainder - 0.375) < tolerance) frac = "⅜";
    else if (Math.abs(remainder - 0.625) < tolerance) frac = "⅝";
    else if (Math.abs(remainder - 0.875) < tolerance) frac = "⅞";
    else if (remainder > 0.05) return Number(decimal.toFixed(2)).toString(); // Fallback for weird decimals

    if (whole > 0 && frac) return `${whole} ${frac}`;
    if (whole > 0) return `${whole}`;
    if (frac) return frac;
    return "";
  };

  // 2. Magic Paste Parser: Extracts numbers/fractions from raw text
  const parseBulkText = () => {
    if (!bulkText.trim()) return;
    
    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    const newIngredients = lines.map((line, idx) => {
      // Regex to find leading numbers, decimals, or fractions (e.g., "1 1/2", "0.5", "2")
      const match = line.trim().match(/^([\d\s\.\/]+)(.*)$/);
      
      let qty = 0;
      let text = line.trim();

      if (match) {
        const qtyStr = match[1].trim();
        text = match[2].trim();
        
        // Evaluate the quantity string (handles spaces and slashes)
        const parts = qtyStr.split(' ');
        parts.forEach(p => {
          if (p.includes('/')) {
            const [n, d] = p.split('/');
            if (n && d) qty += (parseFloat(n) / parseFloat(d));
          } else {
            qty += parseFloat(p) || 0;
          }
        });
      }

      return { id: Date.now() + idx, qty, text };
    });

    setIngredients(newIngredients);
    setBulkText("");
  };

  // ================= SCALING LOGIC ================= //
  
  const scaleFactor = useMemo(() => {
    if (originalServings <= 0) return 1;
    return targetServings / originalServings;
  }, [originalServings, targetServings]);

  const scaledIngredients = useMemo(() => {
    return ingredients.map(ing => ({
      ...ing,
      scaledQty: ing.qty > 0 ? ing.qty * scaleFactor : 0
    }));
  }, [ingredients, scaleFactor]);


  // ================= HANDLERS ================= //

  const addEmptyIngredient = () => {
    setIngredients([...ingredients, { id: Date.now(), qty: 0, text: "" }]);
  };

  const updateIngredient = (id, field, value) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id === id) {
        return { ...ing, [field]: field === 'qty' ? (parseFloat(value) || 0) : value };
      }
      return ing;
    }));
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleQuickScale = (multiplier) => {
    setTargetServings(Math.max(1, originalServings * multiplier));
  };

  const copyToClipboard = () => {
    const textToCopy = scaledIngredients.map(ing => {
      const displayQty = decimalToFraction(ing.scaledQty);
      return displayQty ? `${displayQty} ${ing.text}` : ing.text;
    }).join('\n');
    
    navigator.clipboard.writeText(`Scaled for ${targetServings} servings:\n${textToCopy}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-xl shadow-inner">
            <ChefHat className="w-7 h-7 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Recipe Scaler Pro
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Smart Culinary Fractions & Conversions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* Servings Adjuster */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Scale className="w-4 h-4 text-orange-500" /> Scale Multiplier
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Original Servings</label>
                  <input
                    type="number" min="1"
                    value={originalServings}
                    onChange={(e) => setOriginalServings(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Servings</label>
                  <input
                    type="number" min="1"
                    value={targetServings}
                    onChange={(e) => setTargetServings(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 text-lg font-black text-orange-600 dark:text-orange-400 outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button onClick={() => handleQuickScale(0.5)} className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1">
                  <Divide className="w-3.5 h-3.5" /> Half
                </button>
                <button onClick={() => handleQuickScale(2)} className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1">
                  <X className="w-3.5 h-3.5" /> Double
                </button>
                <button onClick={() => handleQuickScale(3)} className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1">
                  <X className="w-3.5 h-3.5" /> Triple
                </button>
              </div>
            </div>

            {/* Ingredients Editor */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-orange-500" /> Original Ingredients
                </h3>
                <button 
                  onClick={() => setIngredients([])}
                  className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-3 mb-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0" step="0.1"
                      value={ing.qty || ""}
                      onChange={(e) => updateIngredient(ing.id, 'qty', e.target.value)}
                      placeholder="Qty"
                      className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-black text-center text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      value={ing.text}
                      onChange={(e) => updateIngredient(ing.id, 'text', e.target.value)}
                      placeholder="Ingredient name & unit (e.g., cups of flour)"
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500"
                    />
                    <button 
                      onClick={() => removeIngredient(ing.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addEmptyIngredient}
                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-orange-400 text-slate-500 hover:text-orange-500 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item Manually
              </button>
            </div>

            {/* Magic Paste Area */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                <Wand2 className="w-4 h-4" /> Magic Paste
              </h3>
              <p className="text-xs text-blue-800/70 dark:text-blue-300/70 mb-3 font-medium">
                Paste a list of ingredients directly from a website. We'll automatically separate numbers from text!
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"1 1/2 cups sugar\n2 eggs\n0.5 tsp vanilla extract"}
                className="w-full h-24 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3 text-sm font-medium outline-none focus:border-blue-500 resize-none custom-scrollbar mb-2"
              />
              <button
                onClick={parseBulkText}
                disabled={!bulkText.trim()}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-black uppercase tracking-widest transition-colors shadow-sm"
              >
                Extract Ingredients
              </button>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden flex flex-col h-[600px]">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-amber-500`}></div>
            
            <div className="flex items-center justify-between mb-6 pt-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-orange-500" /> Scaled Recipe
                </h3>
                <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                  Factor: {scaleFactor.toFixed(2)}x
                </span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-orange-600 dark:text-orange-400">{targetServings}</span>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">Servings</span>
              </div>
            </div>

            {/* Scaled Output List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {scaledIngredients.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                  <ChefHat className="w-12 h-12 mb-3" />
                  <p className="text-sm font-bold">No ingredients added yet.</p>
                </div>
              ) : (
                scaledIngredients.map((ing) => {
                  const displayQty = decimalToFraction(ing.scaledQty);
                  return (
                    <div key={ing.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="min-w-[60px] text-right shrink-0">
                        <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                          {displayQty}
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-tight">
                          {ing.text || "—"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Export/Copy Actions */}
            {scaledIngredients.length > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={copyToClipboard}
                  className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'Copied to Clipboard!' : 'Copy Scaled Recipe'}
                </button>
              </div>
            )}
            
          </div>

        </div>
      </div>
    </div>
  );
}
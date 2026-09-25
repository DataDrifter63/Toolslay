"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Scissors, Shirt, User, CheckCircle2, 
  Copy, Ruler, Activity, Globe, Info, AlertCircle, ShoppingBag
} from "lucide-react";

const CLOTHING_DATA = {
  women: {
    tops: [
      { int: "XS", us: "2", uk: "6", eu: "34", it: "38", chest_in: "32", chest_cm: "81" },
      { int: "S", us: "4-6", uk: "8-10", eu: "36-38", it: "40-42", chest_in: "34-35", chest_cm: "86-89" },
      { int: "M", us: "8-10", uk: "12-14", eu: "40-42", it: "44-46", chest_in: "36-37", chest_cm: "91-94" },
      { int: "L", us: "12-14", uk: "16-18", eu: "44-46", it: "48-50", chest_in: "38.5-40", chest_cm: "98-102" },
      { int: "XL", us: "16-18", uk: "20-22", eu: "48-50", it: "52-54", chest_in: "41.5-43", chest_cm: "105-109" },
      { int: "XXL", us: "20-22", uk: "24-26", eu: "52-54", it: "56-58", chest_in: "45-47", chest_cm: "114-119" }
    ],
    bottoms: [
      { int: "XS", us: "24-25", uk: "6", eu: "34", it: "38", waist_in: "24-25", waist_cm: "61-64", hip_in: "34.5", hip_cm: "88" },
      { int: "S", us: "26-27", uk: "8-10", eu: "36-38", it: "40-42", waist_in: "26-27", waist_cm: "66-69", hip_in: "36-37", hip_cm: "91-94" },
      { int: "M", us: "28-29", uk: "12-14", eu: "40-42", it: "44-46", waist_in: "28-29", waist_cm: "71-74", hip_in: "38-39", hip_cm: "97-99" },
      { int: "L", us: "30-31", uk: "16-18", eu: "44-46", it: "48-50", waist_in: "30.5-32", waist_cm: "77-81", hip_in: "41-42", hip_cm: "104-107" },
      { int: "XL", us: "32-33", uk: "20-22", eu: "48-50", it: "52-54", waist_in: "33.5-35", waist_cm: "85-89", hip_in: "44-46", hip_cm: "112-117" },
      { int: "XXL", us: "34-35", uk: "24-26", eu: "52-54", it: "56-58", waist_in: "37-39", waist_cm: "94-99", hip_in: "48-50", hip_cm: "122-127" }
    ],
    dresses: [
      { int: "XS", us: "2", uk: "6", eu: "34", it: "38", bust_in: "32", bust_cm: "81", waist_in: "24", waist_cm: "61" },
      { int: "S", us: "4-6", uk: "8-10", eu: "36-38", it: "40-42", bust_in: "34-35", bust_cm: "86-89", waist_in: "26-27", waist_cm: "66-69" },
      { int: "M", us: "8-10", uk: "12-14", eu: "40-42", it: "44-46", bust_in: "36-37", bust_cm: "91-94", waist_in: "28-29", waist_cm: "71-74" },
      { int: "L", us: "12-14", uk: "16-18", eu: "44-46", it: "48-50", bust_in: "38.5-40", bust_cm: "98-102", waist_in: "30.5-32", waist_cm: "77-81" },
      { int: "XL", us: "16", uk: "20", eu: "48", it: "52", bust_in: "41.5", bust_cm: "105", waist_in: "33.5", waist_cm: "85" },
      { int: "XXL", us: "18", uk: "22", eu: "50", it: "54", bust_in: "43.5", bust_cm: "110", waist_in: "35.5", waist_cm: "90" }
    ]
  },
  men: {
    tops: [
      { int: "XS", us: "34", uk: "34", eu: "44", it: "44", chest_in: "34", chest_cm: "86" },
      { int: "S", us: "36", uk: "36", eu: "46", it: "46", chest_in: "36", chest_cm: "91" },
      { int: "M", us: "38-40", uk: "38-40", eu: "48-50", it: "48-50", chest_in: "38-40", chest_cm: "97-102" },
      { int: "L", us: "42-44", uk: "42-44", eu: "52-54", it: "52-54", chest_in: "42-44", chest_cm: "107-112" },
      { int: "XL", us: "46-48", uk: "46-48", eu: "56-58", it: "56-58", chest_in: "46-48", chest_cm: "117-122" },
      { int: "XXL", us: "50-52", uk: "50-52", eu: "60-62", it: "60-62", chest_in: "50-52", chest_cm: "127-132" }
    ],
    bottoms: [
      { int: "XS", us: "28", uk: "28", eu: "38", it: "42", waist_in: "28", waist_cm: "71", inside_leg_in: "30", inside_leg_cm: "76" },
      { int: "S", us: "30", uk: "30", eu: "40", it: "44", waist_in: "30", waist_cm: "76", inside_leg_in: "31", inside_leg_cm: "79" },
      { int: "M", us: "32-34", uk: "32-34", eu: "42-44", it: "46-48", waist_in: "32-34", waist_cm: "81-86", inside_leg_in: "32", inside_leg_cm: "81" },
      { int: "L", us: "36-38", uk: "36-38", eu: "46-48", it: "50-52", waist_in: "36-38", waist_cm: "91-97", inside_leg_in: "33", inside_leg_cm: "84" },
      { int: "XL", us: "40-42", uk: "40-42", eu: "50-52", it: "54-56", waist_in: "40-42", waist_cm: "102-107", inside_leg_in: "34", inside_leg_cm: "86" },
      { int: "XXL", us: "44", uk: "44", eu: "54", it: "58", waist_in: "44", waist_cm: "112", inside_leg_in: "34", inside_leg_cm: "86" }
    ]
  }
};

export default function ClothingSizeConverter() {
  const [isMounted, setIsMounted] = useState(false);

  const [gender, setGender] = useState("women");
  const [garmentType, setGarmentType] = useState("tops");
  const [selectedSize, setSelectedSize] = useState("M");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (gender === "men" && garmentType === "dresses") {
      setGarmentType("tops");
    }
  }, [gender, garmentType]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeDataset = useMemo(() => {
    return CLOTHING_DATA[gender]?.[garmentType] || [];
  }, [gender, garmentType]);

  const activeResult = useMemo(() => {
    return activeDataset.find(item => item.int === selectedSize) || activeDataset || activeDataset[0] || { int: "M", us: "-", uk: "-", eu: "-" };
  }, [activeDataset, selectedSize]);

  const handleCopy = () => {
    let text = `👗 Sizing Passport (${gender.toUpperCase()} - ${garmentType.toUpperCase()} - Size ${activeResult.int})\n`;
    text += `US: ${activeResult.us} | UK: ${activeResult.uk} | EU: ${activeResult.eu}\n`;
    
    if (garmentType === "tops" || garmentType === "dresses") {
      text += `Chest/Bust: ${activeResult.chest_in || activeResult.bust_in}" (${activeResult.chest_cm || activeResult.bust_cm} cm)\n`;
    }
    if (garmentType === "bottoms" || garmentType === "dresses") {
      text += `Waist: ${activeResult.waist_in}" (${activeResult.waist_cm} cm)\n`;
    }
    if (garmentType === "bottoms" && gender === "women") {
      text += `Hips: ${activeResult.hip_in}" (${activeResult.hip_cm} cm)\n`;
    }
    
    text += `\nGenerated via Fit Engine`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Scissors className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Global Fit Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Apparel Sizing & Physical Measurements
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start min-w-0">
        
        {/* CONFIGURATION ENGINE */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Demographic */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-brand shrink-0" /> 1. Fit Demographic
              </label>
              <div className="flex bg-paper rounded-xl p-1 border border-line min-w-0 gap-1">
                <button 
                  type="button"
                  onClick={() => {setGender("women"); setSelectedSize("M");}}
                  className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all truncate ${gender === "women" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
                >
                  Women's Fit
                </button>
                <button 
                  type="button"
                  onClick={() => {setGender("men"); setSelectedSize("M");}}
                  className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all truncate ${gender === "men" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
                >
                  Men's Fit
                </button>
              </div>
            </div>

            <hr className="border-line" />

            {/* Garment Type */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                <Shirt className="w-3.5 h-3.5 text-brand shrink-0" /> 2. Garment Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 min-w-0">
                <button 
                  type="button"
                  onClick={() => setGarmentType("tops")}
                  className={`p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider truncate ${garmentType === "tops" ? "border-brand bg-brand/5 text-ink" : "border-line bg-paper text-muted hover:text-ink"}`}
                >
                  Tops / Shirts
                </button>
                
                <button 
                  type="button"
                  onClick={() => setGarmentType("bottoms")}
                  className={`p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider truncate ${garmentType === "bottoms" ? "border-brand bg-brand/5 text-ink" : "border-line bg-paper text-muted hover:text-ink"}`}
                >
                  Bottoms / Pants
                </button>

                {gender === "women" && (
                  <button 
                    type="button"
                    onClick={() => setGarmentType("dresses")}
                    className={`col-span-2 sm:col-span-1 p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider truncate ${garmentType === "dresses" ? "border-brand bg-brand/5 text-ink" : "border-line bg-paper text-muted hover:text-ink"}`}
                  >
                    Dresses
                  </button>
                )}
              </div>
            </div>

            <hr className="border-line" />

            {/* International Size Selector */}
            <div className="space-y-2.5 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center justify-between border-b border-line pb-2 truncate">
                <span className="flex items-center gap-1.5 truncate"><Globe className="w-3.5 h-3.5 text-brand shrink-0" /> 3. Select Standard Size</span>
                <span className="text-[8px] bg-paper px-2 py-0.5 rounded border border-line text-muted shrink-0">INTL</span>
              </h3>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 min-w-0">
                {activeDataset.map((item) => (
                  <button
                    type="button"
                    key={item.int}
                    onClick={() => setSelectedSize(item.int)}
                    className={`py-2.5 rounded-xl font-black text-xs transition-all border truncate ${
                      selectedSize === item.int 
                        ? "border-brand text-brand bg-surface shadow-sm" 
                        : "border-line bg-paper text-muted hover:text-ink"
                    }`}
                  >
                    {item.int}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD / PASSPORT */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Activity className="w-4 h-4 text-brand shrink-0" /> Fit Passport
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 rounded border border-line shrink-0 truncate max-w-[120px]">
                {gender} • {garmentType}
              </span>
            </div>

            {/* HERO METRIC: INT SIZE */}
            <div className="text-center bg-paper border border-line py-5 px-4 rounded-xl shadow-sm mb-4 relative overflow-hidden shrink-0 min-w-0">
              <span className="block text-[9px] font-black uppercase tracking-widest text-muted mb-1 truncate">
                Target Size Equivalent
              </span>
              <div className="flex justify-center items-center min-w-0">
                <span className="text-4xl sm:text-5xl font-black text-brand tracking-tight leading-none truncate">
                  {activeResult?.int || "-"}
                </span>
              </div>
            </div>

            {/* COUNTRY CONVERSIONS GRID */}
            <div className="grid grid-cols-3 gap-2.5 mb-4 shrink-0 min-w-0">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-line bg-paper min-w-0 truncate">
                <span className="text-[8px] font-black text-muted uppercase tracking-wider truncate">US Size</span>
                <span className="text-lg sm:text-xl font-black text-ink mt-0.5 truncate">{activeResult?.us || "-"}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-line bg-paper min-w-0 truncate">
                <span className="text-[8px] font-black text-muted uppercase tracking-wider truncate">UK Size</span>
                <span className="text-lg sm:text-xl font-black text-ink mt-0.5 truncate">{activeResult?.uk || "-"}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-line bg-paper min-w-0 truncate">
                <span className="text-[8px] font-black text-muted uppercase tracking-wider truncate">EU Size</span>
                <span className="text-lg sm:text-xl font-black text-ink mt-0.5 truncate">{activeResult?.eu || "-"}</span>
              </div>
            </div>

            {/* TAILOR'S TAPE (PHYSICAL MEASUREMENTS) */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2 shadow-sm mb-4 min-w-0">
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-ink px-2.5 py-2 border-b border-line shrink-0 truncate">
                <Ruler className="w-3.5 h-3.5 text-brand shrink-0" /> Tailor's Tape Measurements
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5 min-w-0 text-xs">
                
                {(garmentType === "tops" || garmentType === "dresses") && activeResult && (
                  <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg min-w-0">
                    <span className="font-bold text-muted truncate">{gender === 'women' && garmentType === 'dresses' ? 'Bust' : 'Chest'}</span>
                    <div className="text-right shrink-0 truncate pl-2">
                      <span className="font-black text-ink block truncate">{activeResult.chest_in || activeResult.bust_in || "-"}"</span>
                      <span className="text-[8px] font-bold text-muted truncate">{activeResult.chest_cm || activeResult.bust_cm || "-"} cm</span>
                    </div>
                  </div>
                )}

                {(garmentType === "bottoms" || garmentType === "dresses") && activeResult && (
                  <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg min-w-0">
                    <span className="font-bold text-muted truncate">Waist</span>
                    <div className="text-right shrink-0 truncate pl-2">
                      <span className="font-black text-ink block truncate">{activeResult.waist_in || "-"}"</span>
                      <span className="text-[8px] font-bold text-muted truncate">{activeResult.waist_cm || "-"} cm</span>
                    </div>
                  </div>
                )}

                {garmentType === "bottoms" && gender === "women" && activeResult && (
                  <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg min-w-0">
                    <span className="font-bold text-muted truncate">Hips</span>
                    <div className="text-right shrink-0 truncate pl-2">
                      <span className="font-black text-ink block truncate">{activeResult.hip_in || "-"}"</span>
                      <span className="text-[8px] font-bold text-muted truncate">{activeResult.hip_cm || "-"} cm</span>
                    </div>
                  </div>
                )}
                {garmentType === "bottoms" && gender === "men" && activeResult && (
                  <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg min-w-0">
                    <span className="font-bold text-muted truncate">Inside Leg</span>
                    <div className="text-right shrink-0 truncate pl-2">
                      <span className="font-black text-ink block truncate">{activeResult.inside_leg_in || "-"}"</span>
                      <span className="text-[8px] font-bold text-muted truncate">{activeResult.inside_leg_cm || "-"} cm</span>
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-3.5 rounded-xl bg-ink text-surface hover:opacity-95 text-xs font-black uppercase tracking-widest transition-opacity flex items-center justify-center gap-2 shrink-0"
            >
              {copied ? <><CheckCircle2 className="w-3.5 h-3.5 shrink-0"/> Sizing Copied!</> : <><Copy className="w-3.5 h-3.5 shrink-0"/> Copy Fit Passport</>}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
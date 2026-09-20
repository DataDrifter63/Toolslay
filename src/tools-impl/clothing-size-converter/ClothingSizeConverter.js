"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Scissors, Shirt, User, CheckCircle2, 
  Copy, Ruler, Activity, Globe, Info, AlertCircle, ShoppingBag
} from "lucide-react";

// Robust Global Sizing Database with Physical Measurements
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

  // States
  const [gender, setGender] = useState("women"); // 'women' or 'men'
  const [garmentType, setGarmentType] = useState("tops"); // 'tops', 'bottoms', 'dresses'
  const [selectedSize, setSelectedSize] = useState("M"); // Int Letter size
  const [copied, setCopied] = useState(false);

  // Auto-correct garment type if switching genders
  useEffect(() => {
    if (gender === "men" && garmentType === "dresses") {
      setGarmentType("tops");
    }
  }, [gender, garmentType]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute active dataset and active result
  const activeDataset = CLOTHING_DATA[gender][garmentType];
  const activeResult = useMemo(() => {
    return activeDataset.find(item => item.int === selectedSize) || activeDataset[2]; // Default to M
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
    
    text += `\nGenerated via Muxair Fit Engine`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  // Dynamic Theming
  const theme = {
    gradient: gender === "men" ? "from-indigo-100 via-sky-50 to-transparent dark:from-indigo-900/30 dark:via-sky-900/10" : "from-rose-100 via-pink-50 to-transparent dark:from-rose-900/30 dark:via-pink-900/10",
    bgIcon: gender === "men" ? "bg-gradient-to-br from-indigo-500 to-sky-500" : "bg-gradient-to-br from-rose-500 to-pink-500",
    textPri: gender === "men" ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400",
    borderLight: gender === "men" ? "border-indigo-200 dark:border-indigo-800" : "border-rose-200 dark:border-rose-800",
    bgLight: gender === "men" ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-rose-50 dark:bg-rose-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70 transition-colors duration-500`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md transition-colors duration-500`}>
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Global Fit Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Apparel Sizing & Physical Measurements
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Demographic */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <User className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Fit Demographic
              </h3>
              
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => {setGender("women"); setSelectedSize("M");}}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${gender === "women" ? "bg-white dark:bg-slate-700 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  Women's Fit
                </button>
                <button 
                  onClick={() => {setGender("men"); setSelectedSize("M");}}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${gender === "men" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  Men's Fit
                </button>
              </div>
            </div>

            {/* 2. Garment Type */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Shirt className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Garment Category
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => setGarmentType("tops")}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${garmentType === "tops" ? `${theme.borderLight} ${theme.bgLight} ${theme.textPri}` : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50 text-slate-500"}`}
                >
                  <span className="text-[11px] font-black uppercase tracking-widest">Tops / Shirts</span>
                </button>
                
                <button 
                  onClick={() => setGarmentType("bottoms")}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${garmentType === "bottoms" ? `${theme.borderLight} ${theme.bgLight} ${theme.textPri}` : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50 text-slate-500"}`}
                >
                  <span className="text-[11px] font-black uppercase tracking-widest">Bottoms / Pants</span>
                </button>

                {gender === "women" && (
                  <button 
                    onClick={() => setGarmentType("dresses")}
                    className={`col-span-2 sm:col-span-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${garmentType === "dresses" ? `${theme.borderLight} ${theme.bgLight} ${theme.textPri}` : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50 text-slate-500"}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest">Dresses</span>
                  </button>
                )}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 3. International Size Selector */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1.5"><Globe className={`w-3.5 h-3.5 ${theme.textPri}`} /> 3. Select Standard Size</span>
                <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">INTL LETTER</span>
              </h3>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {activeDataset.map((item) => (
                  <button
                    key={item.int}
                    onClick={() => setSelectedSize(item.int)}
                    className={`py-3 rounded-xl font-black text-sm transition-all border-2 ${
                      selectedSize === item.int 
                        ? `${theme.borderLight} ${theme.textPri} bg-white dark:bg-slate-800 shadow-sm scale-105` 
                        : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {item.int}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / PASSPORT ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[640px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Fit Passport
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  {gender} • {garmentType}
                </span>
              </div>

              {/* HERO METRIC: INT SIZE */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-6 px-4 rounded-3xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                <div className="absolute -left-4 -bottom-4 opacity-5 pointer-events-none">
                  <ShoppingBag className={`w-32 h-32 ${theme.textPri}`} />
                </div>
                
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 z-10 relative">
                  Target Size Equivalent
                </span>
                <div className="flex justify-center items-center z-10 relative">
                  <span className={`text-6xl sm:text-7xl font-black ${theme.textPri} tracking-tighter leading-none`}>
                    {activeResult.int}
                  </span>
                </div>
              </div>

              {/* COUNTRY CONVERSIONS GRID */}
              <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">US Size</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">{activeResult.us}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">UK Size</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">{activeResult.uk}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">EU Size</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">{activeResult.eu}</span>
                </div>
              </div>

              {/* TAILOR'S TAPE (PHYSICAL MEASUREMENTS) */}
              <div className={`flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border ${theme.borderLight} p-1 shadow-sm mb-4`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${theme.textPri} px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl`}>
                  <Ruler className="w-3.5 h-3.5" /> Tailor's Tape Measurements
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  
                  {/* Chest / Bust */}
                  {(garmentType === "tops" || garmentType === "dresses") && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-xs font-bold text-slate-500">{gender === 'women' && garmentType === 'dresses' ? 'Bust' : 'Chest'}</span>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">{activeResult.chest_in || activeResult.bust_in}"</span>
                        <span className="text-[10px] font-bold text-slate-400">{activeResult.chest_cm || activeResult.bust_cm} cm</span>
                      </div>
                    </div>
                  )}

                  {/* Waist */}
                  {(garmentType === "bottoms" || garmentType === "dresses") && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-xs font-bold text-slate-500">Waist</span>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">{activeResult.waist_in}"</span>
                        <span className="text-[10px] font-bold text-slate-400">{activeResult.waist_cm} cm</span>
                      </div>
                    </div>
                  )}

                  {/* Hips / Inseam */}
                  {garmentType === "bottoms" && gender === "women" && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-xs font-bold text-slate-500">Hips</span>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">{activeResult.hip_in}"</span>
                        <span className="text-[10px] font-bold text-slate-400">{activeResult.hip_cm} cm</span>
                      </div>
                    </div>
                  )}
                  {garmentType === "bottoms" && gender === "men" && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-xs font-bold text-slate-500">Inside Leg (Inseam)</span>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">{activeResult.inside_leg_in}"</span>
                        <span className="text-[10px] font-bold text-slate-400">{activeResult.inside_leg_cm} cm</span>
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={handleCopy}
                className="w-full py-4 rounded-xl bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                {copied ? <><CheckCircle2 className="w-4 h-4"/> Sizing Copied!</> : <><Copy className="w-4 h-4"/> Copy Fit Passport</>}
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
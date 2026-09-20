"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Baby, Heart, Sparkles, Filter, 
  RefreshCcw, Star, Bookmark, Copy, 
  CheckCircle2, Crown, Leaf, Clock, Zap
} from "lucide-react";

// Curated Premium Name Database
const NAME_DB = [
  // Girls
  { name: "Amelia", gender: "girl", origin: "German", meaning: "Work, industriousness", vibe: "vintage" },
  { name: "Aurora", gender: "girl", origin: "Latin", meaning: "Dawn", vibe: "mythological" },
  { name: "Hazel", gender: "girl", origin: "English", meaning: "The hazelnut tree", vibe: "nature" },
  { name: "Nova", gender: "girl", origin: "Latin", meaning: "New", vibe: "modern" },
  { name: "Eleanor", gender: "girl", origin: "Greek", meaning: "Shining light", vibe: "royal" },
  { name: "Ivy", gender: "girl", origin: "English", meaning: "Faithfulness", vibe: "nature" },
  { name: "Luna", gender: "girl", origin: "Latin", meaning: "Moon", vibe: "mythological" },
  { name: "Aria", gender: "girl", origin: "Italian", meaning: "Air, melody", vibe: "modern" },
  { name: "Clara", gender: "girl", origin: "Latin", meaning: "Bright, clear", vibe: "vintage" },
  { name: "Victoria", gender: "girl", origin: "Latin", meaning: "Victory", vibe: "royal" },
  // Boys
  { name: "Arthur", gender: "boy", origin: "Celtic", meaning: "Bear", vibe: "royal" },
  { name: "Silas", gender: "boy", origin: "Latin", meaning: "Forest, woods", vibe: "vintage" },
  { name: "Asher", gender: "boy", origin: "Hebrew", meaning: "Happy, blessed", vibe: "modern" },
  { name: "Leo", gender: "boy", origin: "Latin", meaning: "Lion", vibe: "vintage" },
  { name: "Orion", gender: "boy", origin: "Greek", meaning: "Rising star", vibe: "mythological" },
  { name: "Rowan", gender: "boy", origin: "Irish", meaning: "Little red one", vibe: "nature" },
  { name: "Julian", gender: "boy", origin: "Latin", meaning: "Youthful", vibe: "royal" },
  { name: "Ezra", gender: "boy", origin: "Hebrew", meaning: "Help", vibe: "modern" },
  { name: "Jasper", gender: "boy", origin: "Persian", meaning: "Bringer of treasure", vibe: "nature" },
  { name: "Atlas", gender: "boy", origin: "Greek", meaning: "Bearer of the heavens", vibe: "mythological" },
  // Neutral
  { name: "Sage", gender: "neutral", origin: "Latin", meaning: "Wise, knowing", vibe: "nature" },
  { name: "Quinn", gender: "neutral", origin: "Celtic", meaning: "Wise, counsel", vibe: "modern" },
  { name: "Eden", gender: "neutral", origin: "Hebrew", meaning: "Place of pleasure", vibe: "nature" },
  { name: "Rory", gender: "neutral", origin: "Irish", meaning: "Red king", vibe: "vintage" },
  { name: "Phoenix", gender: "neutral", origin: "Greek", meaning: "Dark red, rebirth", vibe: "mythological" }
];

const GENDERS = [
  { id: "any", label: "Any Gender", color: "slate" },
  { id: "girl", label: "Girls", color: "rose" },
  { id: "boy", label: "Boys", color: "sky" },
  { id: "neutral", label: "Gender Neutral", color: "emerald" }
];

const VIBES = [
  { id: "any", label: "Any Vibe", icon: Sparkles },
  { id: "vintage", label: "Vintage / Classic", icon: Clock },
  { id: "nature", label: "Nature & Earth", icon: Leaf },
  { id: "royal", label: "Royal & Noble", icon: Crown },
  { id: "modern", label: "Modern & Edgy", icon: Zap },
  { id: "mythological", label: "Mythological", icon: Star }
];

// Helper to get random item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function BabyNameGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Filters
  const [genderFilter, setGenderFilter] = useState(GENDERS[0]);
  const [vibeFilter, setVibeFilter] = useState(VIBES[0]);
  
  // States
  const [currentName, setCurrentName] = useState(null);
  const [suggestedMiddle, setSuggestedMiddle] = useState(null);
  const [favorites, setFavorites] = useState([]); // "The Nursery"
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize
  useEffect(() => {
    setIsMounted(true);
    generateName(GENDERS[0], VIBES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateName = (gFilter = genderFilter, vFilter = vibeFilter) => {
    setIsAnimating(true);
    
    setTimeout(() => {
      // Filter DB
      let filtered = NAME_DB.filter(n => {
        const matchGender = gFilter.id === "any" || n.gender === gFilter.id || n.gender === "neutral";
        const matchVibe = vFilter.id === "any" || n.vibe === vFilter.id;
        return matchGender && matchVibe;
      });

      // Fallback if filter is too strict
      if (filtered.length === 0) {
        filtered = NAME_DB.filter(n => gFilter.id === "any" || n.gender === gFilter.id || n.gender === "neutral");
      }

      // Ensure we don't get the exact same name twice in a row if possible
      let newName = getRandom(filtered);
      if (filtered.length > 1 && currentName && newName.name === currentName.name) {
        while (newName.name === currentName.name) {
          newName = getRandom(filtered);
        }
      }

      // Generate a suggested middle name (same gender, different name)
      const middleOptions = NAME_DB.filter(n => 
        (n.gender === newName.gender || n.gender === "neutral") && 
        n.name !== newName.name
      );
      const midName = getRandom(middleOptions);

      setCurrentName(newName);
      setSuggestedMiddle(midName);
      setIsAnimating(false);
    }, 300); // UI animation delay
  };

  const toggleFavorite = (nameObj) => {
    setFavorites(prev => {
      const exists = prev.find(n => n.name === nameObj.name);
      if (exists) {
        return prev.filter(n => n.name !== nameObj.name);
      } else {
        return [nameObj, ...prev];
      }
    });
  };

  const copyFavorites = () => {
    if (favorites.length === 0) return;
    const text = "Our Favorite Baby Names:\n" + favorites.map(f => `- ${f.name} (${f.meaning})`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted || !currentName) return null;

  const isFavorited = favorites.some(f => f.name === currentName.name);

  // Dynamic Theme based on gender
  const theme = 
    currentName.gender === "girl" ? { bg: "bg-rose-50", text: "text-rose-500", border: "border-rose-200", ring: "ring-rose-100" } :
    currentName.gender === "boy" ? { bg: "bg-sky-50", text: "text-sky-500", border: "border-sky-200", ring: "ring-sky-100" } :
    { bg: "bg-emerald-50", text: "text-emerald-500", border: "border-emerald-200", ring: "ring-emerald-100" };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-100 to-transparent dark:from-amber-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/30 p-3.5 rounded-2xl">
            <Baby className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Baby Name Studio
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Curated Meanings, Vibes & Middle Names
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6 items-start">
        
        {/* ================= LEFT: DISCOVERY ENGINE ================= */}
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Discovery Filters</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender Filter */}
              <div className="space-y-2">
                <select
                  value={genderFilter.id}
                  onChange={(e) => {
                    const sel = GENDERS.find(g => g.id === e.target.value);
                    setGenderFilter(sel);
                    generateName(sel, vibeFilter);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
                >
                  {GENDERS.map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>

              {/* Vibe Filter */}
              <div className="space-y-2">
                <select
                  value={vibeFilter.id}
                  onChange={(e) => {
                    const sel = VIBES.find(v => v.id === e.target.value);
                    setVibeFilter(sel);
                    generateName(genderFilter, sel);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
                >
                  {VIBES.map(v => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* THE NAME CARD (Focus Area) */}
          <div className="relative">
            <div className={`bg-white dark:bg-[#0d1117] border-2 ${theme.border} rounded-[2rem] p-8 sm:p-12 shadow-lg text-center transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} relative overflow-hidden`}>
              
              <div className={`absolute top-0 right-0 w-48 h-48 opacity-20 bg-gradient-to-bl from-current to-transparent rounded-bl-full ${theme.text}`}></div>

              <div className="relative z-10">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.bg} ${theme.text} text-[10px] font-black uppercase tracking-widest mb-6`}>
                  {currentName.vibe} • {currentName.gender}
                </span>

                <h3 className="text-5xl sm:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-4">
                  {currentName.name}
                </h3>

                <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 mb-8 italic">
                  "{currentName.meaning}"
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Origin</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{currentName.origin}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Suggested Middle</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{suggestedMiddle?.name}</span>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => toggleFavorite(currentName)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                      isFavorited 
                      ? "bg-rose-500 text-white hover:bg-rose-600 ring-4 ring-rose-100 dark:ring-rose-900/30" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                    }`}
                  >
                    <Heart className={`w-7 h-7 ${isFavorited ? 'fill-white' : ''}`} />
                  </button>

                  <button
                    onClick={() => generateName()}
                    className="flex-1 max-w-[200px] h-16 rounded-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-5 h-5" /> Next Idea
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: THE NURSERY (FAVORITES) ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[500px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Bookmark className="w-4 h-4 text-amber-500" /> The Nursery
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
                  {favorites.length} Saved
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {favorites.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Heart className="w-10 h-10 text-slate-400 mb-3" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No names saved yet.<br/>Tap the heart to save!</p>
                  </div>
                ) : (
                  favorites.map((fav, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-sm flex items-center justify-between group">
                      <div>
                        <span className="block text-sm font-black text-slate-800 dark:text-slate-100">
                          {fav.name}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 truncate block max-w-[150px]">
                          {fav.meaning}
                        </span>
                      </div>
                      <button 
                        onClick={() => toggleFavorite(fav)}
                        className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {favorites.length > 0 && (
                <button
                  onClick={copyFavorites}
                  className="mt-4 w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Copied!</> : <><Copy className="w-4 h-4"/> Copy List</>}
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
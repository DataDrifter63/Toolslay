"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dog, Cat, Bird, Sparkles, 
  Heart, RefreshCcw, Bookmark, Copy, 
  CheckCircle2, Crown, Pizza, Shield,
  Bone, Smile, Info
} from "lucide-react";

// Curated Premium Pet Name Database with Lore/Descriptions
const PET_NAME_DB = [
  // FOOD INSPIRED
  { name: "Waffles", species: "any", vibe: "food", desc: "For a sweet, golden, and slightly textured friend." },
  { name: "Tater Tot", species: "dog", vibe: "food", desc: "Perfect for a small, chunky, and irresistible pup." },
  { name: "Mochi", species: "cat", vibe: "food", desc: "For a soft, squishy, and sweet feline." },
  { name: "Sirloin", species: "dog", vibe: "food", desc: "A meaty name for a strong, beefy bulldog or pug." },
  { name: "Noodle", species: "any", vibe: "food", desc: "Ideal for a long, wiggly, and clumsy pet." },
  
  // FUNNY / DERPY
  { name: "Bark Twain", species: "dog", vibe: "funny", desc: "For the intellectual dog with a lot to say." },
  { name: "Chairman Meow", species: "cat", vibe: "funny", desc: "He rules the house with an iron paw." },
  { name: "Dozer", species: "dog", vibe: "funny", desc: "He sleeps 20 hours a day and snores loudly." },
  { name: "Snoop Dog", species: "dog", vibe: "funny", desc: "Always sniffing around where he shouldn't be." },
  { name: "Catrick Swayze", species: "cat", vibe: "funny", desc: "Nobody puts this kitty in a corner." },
  
  // ROYAL / NOBLE
  { name: "Winston", species: "dog", vibe: "royal", desc: "Dignified, loyal, and demands respect (and treats)." },
  { name: "Cleopatra", species: "cat", vibe: "royal", desc: "Regal, demanding, and wears natural eyeliner." },
  { name: "Duke", species: "any", vibe: "royal", desc: "A noble title for a pet of high standing." },
  { name: "Duchess", species: "cat", vibe: "royal", desc: "She won't eat cheap food and prefers silk pillows." },
  { name: "Kingston", species: "dog", vibe: "royal", desc: "The absolute ruler of the dog park." },
  
  // BADASS / STRONG
  { name: "Thor", species: "dog", vibe: "badass", desc: "Bringer of thunder (when the mailman arrives)." },
  { name: "Ripley", species: "cat", vibe: "badass", desc: "A survivor who hunts bugs without mercy." },
  { name: "Ghost", species: "dog", vibe: "badass", desc: "Silent, pale, and fiercely loyal." },
  { name: "Rambo", species: "any", vibe: "badass", desc: "Fearless, untamed, and ready for action." },
  { name: "Valkyrie", species: "dog", vibe: "badass", desc: "A fierce warrior maiden of the backyard." },

  // CUTE / SWEET
  { name: "Luna", species: "any", vibe: "cute", desc: "For a pet that lights up your darkest nights." },
  { name: "Milo", species: "any", vibe: "cute", desc: "Energetic, friendly, and universally loved." },
  { name: "Daisy", species: "dog", vibe: "cute", desc: "Sweet, classic, and always happy to see you." },
  { name: "Pippin", species: "cat", vibe: "cute", desc: "Small, curious, and constantly getting into trouble." },
  { name: "Bubbles", species: "any", vibe: "cute", desc: "Full of energy, light, and easily distracted." },
  
  // BIRDS & EXOTICS
  { name: "Zazu", species: "exotic", vibe: "funny", desc: "Always giving you unsolicited advice (squawking)." },
  { name: "Yoshi", species: "exotic", vibe: "cute", desc: "Perfect for a colorful lizard or bird." },
  { name: "Kiwi", species: "exotic", vibe: "food", desc: "Small, round, and slightly fuzzy." },
  { name: "Dracula", species: "exotic", vibe: "badass", desc: "Ideal for a bat, snake, or a very goth parrot." }
];

const SPECIES = [
  { id: "any", label: "Any Pet", icon: Sparkles, color: "slate" },
  { id: "dog", label: "Dog", icon: Dog, color: "amber" },
  { id: "cat", label: "Cat", icon: Cat, color: "violet" },
  { id: "exotic", label: "Bird / Exotic", icon: Bird, color: "emerald" }
];

const VIBES = [
  { id: "any", label: "Surprise Me!", icon: Sparkles },
  { id: "cute", label: "Sweet & Cute", icon: Heart },
  { id: "funny", label: "Funny & Derpy", icon: Smile },
  { id: "royal", label: "Royal & Posh", icon: Crown },
  { id: "badass", label: "Badass", icon: Shield },
  { id: "food", label: "Food Inspired", icon: Pizza }
];

// Helper to get random item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function PetNameGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Filters
  const [speciesFilter, setSpeciesFilter] = useState(SPECIES[0]);
  const [vibeFilter, setVibeFilter] = useState(VIBES[0]);
  
  // States
  const [currentName, setCurrentName] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize
  useEffect(() => {
    setIsMounted(true);
    generateName(SPECIES[0], VIBES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateName = (sFilter = speciesFilter, vFilter = vibeFilter) => {
    setIsAnimating(true);
    
    setTimeout(() => {
      // Filter DB
      let filtered = PET_NAME_DB.filter(n => {
        const matchSpecies = sFilter.id === "any" || n.species === sFilter.id || n.species === "any";
        const matchVibe = vFilter.id === "any" || n.vibe === vFilter.id;
        return matchSpecies && matchVibe;
      });

      // Fallback if filter is too strict (e.g., Badass Bird might not exist)
      if (filtered.length === 0) {
        filtered = PET_NAME_DB.filter(n => sFilter.id === "any" || n.species === sFilter.id || n.species === "any");
      }
      
      // Ultimate fallback
      if (filtered.length === 0) {
        filtered = PET_NAME_DB;
      }

      // Ensure we don't get the exact same name twice in a row if possible
      let newName = getRandom(filtered);
      if (filtered.length > 1 && currentName && newName.name === currentName.name) {
        while (newName.name === currentName.name) {
          newName = getRandom(filtered);
        }
      }

      setCurrentName(newName);
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
    const text = "Our Pet Name Shortlist:\n" + favorites.map(f => `- ${f.name}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted || !currentName) return null;

  const isFavorited = favorites.some(f => f.name === currentName.name);

  // Dynamic Theme based on determined species of the current name
  const isDog = currentName.species === "dog" || (currentName.species === "any" && speciesFilter.id === "dog");
  const isCat = currentName.species === "cat" || (currentName.species === "any" && speciesFilter.id === "cat");
  const isExotic = currentName.species === "exotic" || (currentName.species === "any" && speciesFilter.id === "exotic");

  const theme = 
    isDog ? { bg: "bg-amber-50", text: "text-amber-500", border: "border-amber-200", ring: "ring-amber-100", darkBg: "dark:bg-amber-900/20" } :
    isCat ? { bg: "bg-violet-50", text: "text-violet-500", border: "border-violet-200", ring: "ring-violet-100", darkBg: "dark:bg-violet-900/20" } :
    isExotic ? { bg: "bg-emerald-50", text: "text-emerald-500", border: "border-emerald-200", ring: "ring-emerald-100", darkBg: "dark:bg-emerald-900/20" } :
    { bg: "bg-sky-50", text: "text-sky-500", border: "border-sky-200", ring: "ring-sky-100", darkBg: "dark:bg-sky-900/20" };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-100 to-transparent dark:from-orange-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/30 p-3.5 rounded-2xl">
            <Dog className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Pet Name Studio
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Personality-Matched Names & Lore
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6 items-start">
        
        {/* ================= LEFT: DISCOVERY ENGINE ================= */}
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Species Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <PawIcon className="w-3.5 h-3.5" /> What kind of pet?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIES.map(s => {
                    const Icon = s.icon;
                    const isActive = speciesFilter.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSpeciesFilter(s);
                          generateName(s, vibeFilter);
                        }}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                          isActive
                            ? `bg-${s.color}-50 dark:bg-${s.color}-900/20 border-${s.color}-500 text-${s.color}-600 dark:text-${s.color}-400`
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vibe Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Their Personality/Vibe
                </label>
                <div className="relative">
                  <select
                    value={vibeFilter.id}
                    onChange={(e) => {
                      const sel = VIBES.find(v => v.id === e.target.value);
                      setVibeFilter(sel);
                      generateName(speciesFilter, sel);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
                  >
                    {VIBES.map(v => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* THE COLLAR TAG CARD (Focus Area) */}
          <div className="relative">
            <div className={`bg-white dark:bg-[#0d1117] border-2 ${theme.border} rounded-[2rem] p-8 sm:p-12 shadow-lg text-center transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'} relative overflow-hidden flex flex-col items-center`}>
              
              <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 bg-gradient-to-bl from-current to-transparent rounded-bl-full ${theme.text}`}></div>

              {/* Digital Collar Tag UI - NOW ALWAYS RECTANGULAR/BONE-SHAPED */}
              <div className="relative z-10 w-full max-w-sm mx-auto mb-8">
                {/* Collar Ring */}
                <div className="w-8 h-8 rounded-full border-4 border-slate-300 dark:border-slate-600 mx-auto -mb-2 relative z-20 bg-transparent"></div>
                
                {/* The Tag Base (Always rectangular with bone knobs) */}
                <div className={`relative rounded-3xl ${theme.bg} ${theme.darkBg} border-4 ${theme.border} p-8 shadow-inner flex flex-col items-center justify-center`}>
                  
                  {/* Bone End Knobs */}
                  <div className={`absolute -left-4 -top-2 w-8 h-8 rounded-full ${theme.bg} ${theme.darkBg} border-t-4 border-l-4 ${theme.border}`}></div>
                  <div className={`absolute -left-4 -bottom-2 w-8 h-8 rounded-full ${theme.bg} ${theme.darkBg} border-b-4 border-l-4 ${theme.border}`}></div>
                  <div className={`absolute -right-4 -top-2 w-8 h-8 rounded-full ${theme.bg} ${theme.darkBg} border-t-4 border-r-4 ${theme.border}`}></div>
                  <div className={`absolute -right-4 -bottom-2 w-8 h-8 rounded-full ${theme.bg} ${theme.darkBg} border-b-4 border-r-4 ${theme.border}`}></div>

                  <h3 className={`text-4xl sm:text-5xl font-black ${theme.text} tracking-tight drop-shadow-sm`}>
                    {currentName.name}
                  </h3>
                </div>
              </div>

              <div className="relative z-10 w-full max-w-md mx-auto">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3`}>
                  {currentName.vibe} Vibe
                </span>

                <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 mb-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                  {currentName.desc}
                </p>

                {/* Primary Actions */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => toggleFavorite(currentName)}
                    className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all shadow-md ${
                      isFavorited 
                      ? "bg-rose-500 text-white hover:bg-rose-600 ring-4 ring-rose-100 dark:ring-rose-900/30" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorited ? 'fill-white' : ''}`} />
                  </button>

                  <button
                    onClick={() => generateName()}
                    className={`flex-1 h-14 rounded-full ${theme.bg} ${theme.darkBg} ${theme.text} border border-transparent hover:${theme.border} font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2`}
                  >
                    <RefreshCcw className="w-5 h-5" /> Roll Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: THE SHORTLIST ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[550px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Bookmark className="w-4 h-4 text-orange-500" /> Shortlist
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
                  {favorites.length} Saved
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {favorites.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Bone className="w-10 h-10 text-slate-400 mb-3" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No names saved yet.<br/>Tap the heart to save!</p>
                  </div>
                ) : (
                  favorites.map((fav, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-sm flex items-center justify-between group">
                      <div>
                        <span className="block text-sm font-black text-slate-800 dark:text-slate-100">
                          {fav.name}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 block">
                          {fav.vibe} vibe
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
                  {copied ? <><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Copied!</> : <><Copy className="w-4 h-4"/> Copy Shortlist</>}
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom simple paw icon since Lucide doesn't have a direct "Paw" in all versions
function PawIcon(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
      <circle cx="7" cy="8" r="1.5" />
      <circle cx="17" cy="8" r="1.5" />
      <circle cx="10.5" cy="5" r="1.5" />
      <circle cx="13.5" cy="5" r="1.5" />
    </svg>
  );
}
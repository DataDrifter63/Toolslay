"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Swords, Wand2, Shield, Sparkles, 
  Scroll, Dices, Copy, CheckCircle2, 
  History, Map, Crown, Skull
} from "lucide-react";

// --- RPG LORE & DATA DICTIONARIES ---
const RACES = [
  { id: "elf", label: "Elf", icon: Sparkles, desc: "Ethereal, melodic, and ancient." },
  { id: "dwarf", label: "Dwarf", icon: Shield, desc: "Guttural, strong, and historic." },
  { id: "orc", label: "Orc", icon: Skull, desc: "Fierce, sharp, and dominant." },
  { id: "human", label: "Human", icon: Map, desc: "Diverse, familiar, and noble." },
  { id: "tiefling", label: "Demon-kin", icon: Wand2, desc: "Infernal, mystical, and dark." }
];

const VIBES = [
  { id: "warrior", label: "Warrior", icon: Swords, color: "rose", bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500" },
  { id: "mage", label: "Mage", icon: Wand2, color: "violet", bg: "bg-violet-500", text: "text-violet-500", border: "border-violet-500" },
  { id: "rogue", label: "Rogue", icon: Skull, color: "emerald", bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500" },
  { id: "noble", label: "Noble", icon: Crown, color: "amber", bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500" }
];

const NAME_FRAGMENTS = {
  elf: {
    pre: ["Ael", "Fae", "Gael", "Ili", "Lian", "Syl", "Thal", "Val", "Xil", "Yel"],
    mid: ["a", "ari", "eno", "ian", "ora", "qui", "rel", "sari", "xian"],
    suf: ["dor", "las", "lyn", "myr", "rion", "thas", "vyr", "wyn", "zira"]
  },
  dwarf: {
    pre: ["Bal", "Brog", "Dwal", "Gim", "Karg", "Mor", "Thor", "Thra", "Ul", "Zir"],
    mid: ["a", "da", "ga", "ka", "li", "ra", "ro", "tho", "vu"],
    suf: ["bur", "din", "drin", "gar", "in", "li", "or", "ur", "z"]
  },
  orc: {
    pre: ["Azu", "Dro", "Grom", "Krag", "Mok", "Thra", "Ugl", "Ur", "Xar", "Zog"],
    mid: ["a", "ba", "ga", "ka", "ma", "ra", "ta", "va", "za"],
    suf: ["gash", "gore", "kai", "lok", "mak", "mar", "nak", "th", "zol"]
  },
  human: {
    pre: ["Ald", "Bern", "Cael", "Dar", "Eri", "Falk", "Gar", "Hen", "Kael", "Lor"],
    mid: ["a", "bert", "can", "dan", "en", "fred", "ic", "on", "ric", "ward"],
    suf: ["ald", "ard", "ford", "mer", "ric", "son", "ton", "us", "win"]
  },
  tiefling: {
    pre: ["Ak", "Amo", "Bal", "Deme", "Kar", "Mal", "Mor", "Xan", "Zar", "Zev"],
    mid: ["a", "ar", "en", "ir", "on", "ra", "th", "ur", "xi"],
    suf: ["dos", "kai", "kos", "men", "nos", "thos", "us", "xir", "zi"]
  }
};

const TITLES = {
  warrior: ["the Unbroken", "Shield-Breaker", "the Fierce", "Blood-drinker", "the Ironclad", "Giant-slayer", "the Relentless", "of the Vanguard"],
  mage: ["the Arcane", "Weaver of Shadows", "the Wise", "Spell-binder", "the Seer", "of the Mystic Eye", "Storm-caller", "the Enigma"],
  rogue: ["the Silent", "Shadow-walker", "the Swift", "Coin-stealer", "the Unseen", "Night-terror", "the Ghost", "Venom-laced"],
  noble: ["of the High Court", "the Golden", "First of their Name", "the Proud", "the Exiled", "Heir of the Throne", "the Majestic", "Sun-kissed"]
};

const ORIGINS = [
  "From the Deep Woods", "Born of the Ashen Mountains", "From the Crystal Spires",
  "Of the Forgotten Isles", "From the Scorched Wastes", "Raised in the Undercity",
  "From the Gleaming Capital", "Of the Frozen Tundra", "Hailing from the Shimmering Coast"
];

// Helper: Random item from array
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function FantasyNameGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Controls
  const [race, setRace] = useState(RACES[0]);
  const [vibe, setVibe] = useState(VIBES[0]);
  const [useMid, setUseMid] = useState(true);

  // App State
  const [currentHero, setCurrentHero] = useState(null);
  const [history, setHistory] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Initial Generate on Mount
  useEffect(() => {
    setIsMounted(true);
    handleGenerate(RACES[0], VIBES[0], true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = (selectedRace = race, selectedVibe = vibe, includeMid = useMid) => {
    const data = NAME_FRAGMENTS[selectedRace.id];
    
    // Syllable Math
    const pre = rand(data.pre);
    const mid = includeMid && Math.random() > 0.3 ? rand(data.mid) : "";
    const suf = rand(data.suf);
    
    const fullName = pre + mid + suf;
    const title = rand(TITLES[selectedVibe.id]);
    const origin = rand(ORIGINS);
    
    // Artificial "Meaning" Generator based on Prefix/Suffix logic
    const meanings = ["Bringer of", "Shadow of", "Light of", "Protector of", "Seeker of", "Voice of"];
    const nouns = ["the Dawn", "the Void", "Truth", "the Elements", "Stars", "the Realm"];
    const meaning = `"${rand(meanings)} ${rand(nouns)}"`;

    const newHero = {
      id: Date.now(),
      name: fullName,
      title: title,
      origin: origin,
      meaning: meaning,
      race: selectedRace,
      vibe: selectedVibe
    };

    setCurrentHero(newHero);
    setHistory((prev) => [newHero, ...prev].slice(0, 10)); // Keep last 10
  };

  const handleCopy = (hero) => {
    const textToCopy = `${hero.name} ${hero.title}\nRace: ${hero.race.label}\nOrigin: ${hero.origin}\nMeaning: ${hero.meaning}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(hero.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-100 to-transparent dark:from-indigo-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3.5 rounded-2xl">
            <Scroll className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Fantasy Name Forge
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              RPG Character Lore & Title Generator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-6 items-start">
        
        {/* ================= LEFT: FORGE CONTROLS ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Race Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Map className="w-4 h-4 text-indigo-500" /> Lineage & Race
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RACES.map((r) => {
                  const Icon = r.icon;
                  const isActive = race.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRace(r)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1.5 ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`block text-xs font-black uppercase tracking-widest ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {r.label}
                        </span>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                      </div>
                      <span className="block text-[10px] font-medium text-slate-500">
                        {r.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Class / Vibe Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Swords className="w-4 h-4 text-indigo-500" /> Class & Vibe
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {VIBES.map((v) => {
                  const Icon = v.icon;
                  const isActive = vibe.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setVibe(v)}
                      className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        isActive
                          ? `bg-${v.color}-50 dark:bg-${v.color}-900/20 ${v.border} shadow-sm scale-[1.02]`
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? v.text : 'text-slate-400'}`} />
                      <span className={`block text-[10px] font-black uppercase tracking-widest ${isActive ? v.text : 'text-slate-600 dark:text-slate-400'}`}>
                        {v.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Syllable Complexity Toggle */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Complex Names</span>
                <span className="text-[10px] font-medium text-slate-500">Allow longer, 3-syllable names</span>
              </div>
              <div 
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${useMid ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                onClick={() => setUseMid(!useMid)}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${useMid ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>

            {/* BIG GENERATE BUTTON */}
            <button
              onClick={() => handleGenerate()}
              className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Dices className="w-6 h-6" /> Roll New Character
            </button>

          </div>
        </div>

        {/* ================= RIGHT: HERO DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[700px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Current Hero
                </span>
              </div>
              
              {/* PRIMARY HERO CARD */}
              {currentHero && (
                <div 
                  key={currentHero.id}
                  className={`bg-white dark:bg-slate-900 border-2 ${currentHero.vibe.border} rounded-2xl p-6 shadow-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 mb-8`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-bl from-current to-transparent rounded-bl-full ${currentHero.vibe.text}`}></div>
                  
                  <div className="relative z-10 text-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                      {currentHero.race.label} {currentHero.vibe.label}
                    </span>
                    <h3 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-3">
                      {currentHero.name}
                    </h3>
                    <span className={`text-lg font-bold uppercase tracking-widest ${currentHero.vibe.text}`}>
                      {currentHero.title}
                    </span>
                  </div>

                  <div className="space-y-3 relative z-10 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Origin</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{currentHero.origin}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Meaning</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 italic">{currentHero.meaning}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(currentHero)}
                    className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      copiedId === currentHero.id 
                      ? "bg-emerald-500 text-white" 
                      : `bg-slate-100 dark:bg-slate-800 ${currentHero.vibe.text} hover:opacity-80`
                    }`}
                  >
                    {copiedId === currentHero.id ? <><CheckCircle2 className="w-4 h-4"/> Copied to Clipboard</> : <><Copy className="w-4 h-4"/> Copy Full Lore</>}
                  </button>
                </div>
              )}

              {/* THE TAVERN (HISTORY) */}
              <div className="flex-1 flex flex-col">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-400" /> The Tavern (Recent Rolls)
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {history.slice(1).map((hero) => (
                    <div 
                      key={hero.id} 
                      className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer"
                      onClick={() => handleCopy(hero)}
                    >
                      <div>
                        <span className="block text-sm font-black text-slate-800 dark:text-slate-100">
                          {hero.name} <span className="opacity-60">{hero.title}</span>
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          {hero.race.label} {hero.vibe.label}
                        </span>
                      </div>
                      <button className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                        {copiedId === hero.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                  
                  {history.length <= 1 && (
                    <div className="h-full flex items-center justify-center text-center opacity-40">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Keep rolling to fill the tavern</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
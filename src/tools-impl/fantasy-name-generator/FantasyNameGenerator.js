"use client";

import React, { useState, useEffect } from "react";
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

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function FantasyNameGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [race, setRace] = useState(RACES[0]);
  const [vibe, setVibe] = useState(VIBES[0]);
  const [useMid, setUseMid] = useState(true);

  const [currentHero, setCurrentHero] = useState(null);
  const [history, setHistory] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    handleGenerate(RACES[0], VIBES[0], true);
  }, []);

  const handleGenerate = (selectedRace = race, selectedVibe = vibe, includeMid = useMid) => {
    const data = NAME_FRAGMENTS[selectedRace.id];
    
    const pre = rand(data.pre);
    const mid = includeMid && Math.random() > 0.3 ? rand(data.mid) : "";
    const suf = rand(data.suf);
    
    const fullName = pre + mid + suf;
    const title = rand(TITLES[selectedVibe.id]);
    const origin = rand(ORIGINS);
    
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
    setHistory((prev) => [newHero, ...prev].slice(0, 10));
  };

  const handleCopy = (hero) => {
    const textToCopy = `${hero.name} ${hero.title}\nRace: ${hero.race.label}\nOrigin: ${hero.origin}\nMeaning: ${hero.meaning}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(hero.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Scroll className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Fantasy Name Forge
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              RPG character lore & title generator with custom syllable algorithms.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: FORGE CONTROLS */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 font-sans">
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 mb-3 border-b border-line pb-2">
                <Map className="w-3.5 h-3.5 text-brand" /> Lineage & Race
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {RACES.map((r) => {
                  const Icon = r.icon;
                  const isActive = race.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRace(r)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        isActive
                          ? "bg-brand/10 border-brand shadow-sm"
                          : "bg-surface border-line hover:border-brand/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`block text-xs font-black uppercase tracking-wider ${isActive ? 'text-brand' : 'text-ink'}`}>
                          {r.label}
                        </span>
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand' : 'text-muted'}`} />
                      </div>
                      <span className="block text-[10px] font-bold text-muted truncate">
                        {r.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 mb-3 border-b border-line pb-2">
                <Swords className="w-3.5 h-3.5 text-brand" /> Class & Vibe
              </label>
              
              <div className="grid grid-cols-2 gap-2.5">
                {VIBES.map((v) => {
                  const Icon = v.icon;
                  const isActive = vibe.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVibe(v)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        isActive
                          ? "bg-brand/10 border-brand shadow-sm"
                          : "bg-surface border-line hover:border-brand/50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-muted'}`} />
                      <span className={`block text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-brand' : 'text-ink'}`}>
                        {v.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface p-3.5 rounded-xl border border-line">
              <div>
                <span className="block text-xs font-bold text-ink uppercase tracking-wider mb-0.5">Complex Names</span>
                <span className="text-[10px] font-bold text-muted">Allow longer, 3-syllable names</span>
              </div>
              <button 
                type="button"
                onClick={() => setUseMid(!useMid)}
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${useMid ? 'bg-brand' : 'bg-line'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-surface shadow-sm transition-transform ${useMid ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleGenerate()}
              className="w-full py-3.5 rounded-xl bg-brand text-surface text-xs font-black uppercase tracking-wider shadow-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Dices className="w-4 h-4" /> Roll New Character
            </button>

          </div>
        </div>

        {/* RIGHT: HERO DASHBOARD */}
        <div className="space-y-4 sm:space-y-6 w-full font-sans">
          
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" /> Current Hero
              </span>
            </div>
            
            {currentHero && (
              <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden animate-in fade-in">
                <div className="text-center mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted block mb-1">
                    {currentHero.race.label} · {currentHero.vibe.label}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-ink tracking-tight leading-none mb-2 break-all">
                    {currentHero.name}
                  </h3>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand">
                    {currentHero.title}
                  </span>
                </div>

                <div className="space-y-2 border-t border-line pt-3">
                  <div className="flex justify-between items-center bg-paper px-3 py-2 rounded-xl border border-line">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted">Origin</span>
                    <span className="text-xs font-bold text-ink">{currentHero.origin}</span>
                  </div>
                  <div className="flex justify-between items-center bg-paper px-3 py-2 rounded-xl border border-line">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted">Meaning</span>
                    <span className="text-xs font-bold text-ink italic">{currentHero.meaning}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(currentHero)}
                  className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    copiedId === currentHero.id 
                      ? "bg-emerald-500 text-surface" 
                      : "bg-surface border border-line text-ink hover:border-brand"
                  }`}
                >
                  {copiedId === currentHero.id ? <><CheckCircle2 className="w-4 h-4"/> Copied Lore</> : <><Copy className="w-4 h-4"/> Copy Full Lore</>}
                </button>
              </div>
            )}

            {/* THE TAVERN (HISTORY) */}
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-muted" /> The Tavern (Recent Rolls)
              </h4>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {history.slice(1).map((hero) => (
                  <div 
                    key={hero.id} 
                    className="group bg-surface border border-line p-3 rounded-xl flex items-center justify-between hover:border-brand/50 transition-colors cursor-pointer"
                    onClick={() => handleCopy(hero)}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="block text-xs font-black text-ink truncate">
                        {hero.name} <span className="text-muted font-normal">{hero.title}</span>
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                        {hero.race.label} · {hero.vibe.label}
                      </span>
                    </div>
                    <button type="button" className="text-muted group-hover:text-brand transition-colors shrink-0">
                      {copiedId === hero.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
                
                {history.length <= 1 && (
                  <div className="py-8 text-center opacity-40">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Keep rolling to fill the tavern</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
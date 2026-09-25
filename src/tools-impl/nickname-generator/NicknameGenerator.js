"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Dices, Swords, Sparkles, Cpu, Ghost, 
  Copy, Heart, Check, Trash2, Shield, Settings2, Zap 
} from "lucide-react";

const THEMES = [
  { id: "gamer", name: "Pro Gamer", icon: Swords, color: "text-rose-500", bg: "bg-rose-500" },
  { id: "cyber", name: "Cyberpunk", icon: Cpu, color: "text-cyan-500", bg: "bg-cyan-500" },
  { id: "aesthetic", name: "Aesthetic", icon: Sparkles, color: "text-violet-500", bg: "bg-violet-500" },
  { id: "fantasy", name: "Fantasy RPG", icon: Ghost, color: "text-amber-500", bg: "bg-amber-500" }
];

const DICTIONARY = {
  gamer: {
    prefixes: ["Toxic", "Sweaty", "Flick", "Aim", "God", "Slayer", "Noob", "Elite", "FaZe", "Optic", "Ghost", "Ninja", "Rogue"],
    suffixes: ["XYZ", "TTV", "FPS", "God", "King", "Bot", "Viper", "Strike", "Snipe", "Dash"]
  },
  cyber: {
    prefixes: ["Neon", "Cyber", "Glitch", "Byte", "Synth", "Wire", "Null", "Zero", "Tech", "Hax", "Vex", "Net"],
    suffixes: ["Punk", "Corp", "Run", "Grid", "OS", "Link", "Drive", "Bite", "Ghost", "Flux"]
  },
  aesthetic: {
    prefixes: ["Luna", "Aura", "Cloud", "Star", "Mint", "Peach", "Dream", "Soft", "Velvet", "Opal", "Fairy", "Hazel"],
    suffixes: ["Sky", "Dust", "Wave", "Glow", "Breeze", "Tide", "Dew", "Petal", "Moon", "Rain"]
  },
  fantasy: {
    prefixes: ["Storm", "Blood", "Iron", "Wolf", "Dragon", "Shadow", "Grim", "Dark", "Frost", "Fire", "Night", "Rune"],
    suffixes: ["Bane", "Born", "Forge", "Heart", "Soul", "Rider", "Walker", "Sword", "Fang", "Claw"]
  }
};

const toLeetSpeak = (str) => {
  const leetMap = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7' };
  return str.split('').map(char => leetMap[char.toLowerCase()] || char).join('');
};

export default function NicknameGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const [baseWord, setBaseWord] = useState("");
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [generatedNames, setGeneratedNames] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  const [useLeetSpeak, setUseLeetSpeak] = useState(false);
  const [addNumbers, setAddNumbers] = useState(true);
  const [isShort, setIsShort] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generateNames = useCallback(() => {
    const dict = DICTIONARY[activeTheme.id];
    let newNames = [];
    
    for (let i = 0; i < 9; i++) {
      let name = "";
      const randomPrefix = dict.prefixes[Math.floor(Math.random() * dict.prefixes.length)];
      const randomSuffix = dict.suffixes[Math.floor(Math.random() * dict.suffixes.length)];
      
      if (baseWord.trim()) {
        const cleanBase = baseWord.trim().replace(/\s+/g, '');
        const format = Math.random();
        if (format < 0.33) name = `${randomPrefix}${cleanBase}`;
        else if (format < 0.66) name = `${cleanBase}${randomSuffix}`;
        else name = `${randomPrefix}${cleanBase}${randomSuffix}`;
      } else {
        name = `${randomPrefix}${randomSuffix}`;
      }

      if (isShort) {
        name = name.substring(0, 7);
      }

      if (useLeetSpeak) {
        name = toLeetSpeak(name);
      }

      if (addNumbers && Math.random() > 0.3) {
        const num = Math.floor(Math.random() * 99) + 1;
        name = `${name}${num < 10 ? '0'+num : num}`;
      }

      newNames.push(name);
    }
    
    setGeneratedNames([...new Set(newNames)].slice(0, 9));
  }, [baseWord, activeTheme, useLeetSpeak, addNumbers, isShort]);

  useEffect(() => {
    if (isMounted) {
      generateNames();
    }
  }, [isMounted, generateNames]);

  const handleCopy = (name, index) => {
    navigator.clipboard.writeText(name);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const toggleFavorite = (name) => {
    if (favorites.includes(name)) {
      setFavorites(favorites.filter(n => n !== name));
    } else {
      setFavorites([...favorites, name]);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Dices className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Pro Gamertag Studio
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Generate unique gamer tags, aliases, and persona handles instantly.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted bg-surface border border-line px-3 py-1.5 rounded-xl">
            {favorites.length} Saved in Vault
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONTROLS & SETTINGS */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-5 w-full box-border font-sans">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">Base Name / Real Name (Optional)</label>
              <input 
                type="text" 
                value={baseWord} 
                onChange={(e) => setBaseWord(e.target.value)}
                placeholder="e.g. Ali, John, Viper..."
                className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">Select Persona / Vibe</label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map(theme => {
                  const Icon = theme.icon;
                  const isActive = activeTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setActiveTheme(theme)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        isActive 
                          ? "border-brand bg-brand text-surface shadow-sm" 
                          : "border-line bg-surface text-muted hover:text-ink hover:border-brand/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{theme.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-line">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-brand" /> Pro Modifiers
              </label>
              
              <label className="flex items-center justify-between p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">1337 Speak (Hacker)</span>
                <input type="checkbox" checked={useLeetSpeak} onChange={(e) => setUseLeetSpeak(e.target.checked)} className="w-4 h-4 accent-brand rounded cursor-pointer" />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">Add Random Numbers</span>
                <input type="checkbox" checked={addNumbers} onChange={(e) => setAddNumbers(e.target.checked)} className="w-4 h-4 accent-brand rounded cursor-pointer" />
              </label>

              <label className="flex items-center justify-between p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">Keep it Short (OG Style)</span>
                <input type="checkbox" checked={isShort} onChange={(e) => setIsShort(e.target.checked)} className="w-4 h-4 accent-brand rounded cursor-pointer" />
              </label>
            </div>

            <button 
              type="button"
              onClick={generateNames}
              className="w-full py-3 px-4 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 shadow-sm flex items-center justify-center gap-2"
            >
              <Dices className="w-4 h-4" /> Roll New Names
            </button>

          </div>
        </div>

        {/* RIGHT: OUTPUT GRID & VAULT */}
        <div className="space-y-4 sm:space-y-6 w-full">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {generatedNames.map((name, index) => {
              const isFav = favorites.includes(name);
              const isCopied = copiedIndex === index;
              
              return (
                <div key={index} className="group relative bg-paper border border-line rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:border-brand transition-all shadow-sm">
                  <span className="text-base sm:text-lg font-black text-ink tracking-tight text-center break-all w-full font-sans">
                    {name}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => handleCopy(name, index)}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface border border-line text-muted hover:text-brand hover:border-brand transition-colors"
                      title="Copy Name"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => toggleFavorite(name)}
                      className={`flex items-center justify-center w-8 h-8 rounded-xl border transition-colors ${
                        isFav 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                          : 'bg-surface border-line text-muted hover:text-rose-400'
                      }`}
                      title="Save to Vault"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Shield className="w-2.5 h-2.5" /> Rare
                  </div>
                </div>
              );
            })}
          </div>

          {favorites.length > 0 && (
            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 font-sans">
              <div className="flex justify-between items-center border-b border-line pb-3">
                <h3 className="font-bold text-ink text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-current" /> Favorites Vault
                </h3>
                <button type="button" onClick={() => setFavorites([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest">
                  Clear Vault
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav, i) => (
                  <div key={i} className="flex items-center gap-2 bg-surface px-3 py-2 rounded-xl border border-line">
                    <span className="text-xs font-bold text-ink">{fav}</span>
                    <div className="w-px h-3 bg-line mx-0.5"></div>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(fav); }} className="text-muted hover:text-brand transition-colors" title="Copy">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => toggleFavorite(fav)} className="text-muted hover:text-rose-500 transition-colors" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
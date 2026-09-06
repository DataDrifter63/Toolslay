"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dices, Swords, Sparkles, Cpu, Ghost, Copy, Heart, Check, Trash2, Shield, Settings2 } from "lucide-react";

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
  const [baseWord, setBaseWord] = useState("");
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [generatedNames, setGeneratedNames] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  const [useLeetSpeak, setUseLeetSpeak] = useState(false);
  const [addNumbers, setAddNumbers] = useState(true);
  const [isShort, setIsShort] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

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
    generateNames();
  }, [generateNames]);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
            <Dices className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Gamertag Studio</h2>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
             {favorites.length} Saved in Vault
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-6 items-start">
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-5">
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Base Name / Real Name (Optional)</label>
                <input 
                  type="text" 
                  value={baseWord} 
                  onChange={(e) => setBaseWord(e.target.value)}
                  placeholder="e.g. Ali, John, Viper..."
                  className="w-full text-sm font-bold p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                />
             </div>

             <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Select Persona / Vibe</label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map(theme => {
                    const Icon = theme.icon;
                    const isActive = activeTheme.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setActiveTheme(theme)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          isActive 
                            ? `border-transparent ${theme.bg} text-white shadow-md transform scale-[1.02]` 
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{theme.name}</span>
                      </button>
                    )
                  })}
                </div>
             </div>

             <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Pro Modifiers
                </label>
                
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">1337 Speak (Hacker)</span>
                  <input type="checkbox" checked={useLeetSpeak} onChange={(e) => setUseLeetSpeak(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                </label>
                
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add Random Numbers</span>
                  <input type="checkbox" checked={addNumbers} onChange={(e) => setAddNumbers(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Keep it Short (OG Style)</span>
                  <input type="checkbox" checked={isShort} onChange={(e) => setIsShort(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                </label>
             </div>

             <button 
               onClick={generateNames}
               className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3.5 rounded-lg transition-colors shadow-md shadow-indigo-500/20 active:scale-[0.98]"
             >
               <Dices className="w-5 h-5" /> Roll New Names
             </button>
          </div>
        </div>

        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {generatedNames.map((name, index) => {
               const isFav = favorites.includes(name);
               const isCopied = copiedIndex === index;
               
               return (
                 <div key={index} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:shadow-lg animate-in zoom-in-95 duration-200">
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight text-center break-all w-full">
                      {name}
                    </span>
                    
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleCopy(name, index)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Copy Name"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => toggleFavorite(name)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                          isFav 
                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' 
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-400'
                        }`}
                        title="Save to Vault"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="absolute top-2 left-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                      <Shield className="w-3 h-3" /> Rare
                    </div>
                 </div>
               )
             })}
           </div>

           {favorites.length > 0 && (
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                   <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                     <Heart className="w-4 h-4 text-rose-500 fill-current" /> Favorites Vault
                   </h3>
                   <button onClick={() => setFavorites([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest">
                     Clear Vault
                   </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {favorites.map((fav, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 group">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{fav}</span>
                      <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                      <button onClick={() => { navigator.clipboard.writeText(fav); alert('Copied!'); }} className="text-slate-400 hover:text-indigo-500 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleFavorite(fav)} className="text-slate-400 hover:text-rose-500 transition-colors">
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
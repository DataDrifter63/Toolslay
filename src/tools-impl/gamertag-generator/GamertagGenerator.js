"use client";

import React, { useState, useEffect } from "react";
import { 
  Gamepad2, Copy, ShieldCheck, CheckCircle2, 
  Sparkles, RefreshCw, Sliders, Hash, Type, Dna
} from "lucide-react";

// Extensive Word Banks for Unique Generation
const wordBank = {
  tryhard: {
    prefix: ['Clutch', 'Toxic', 'Vex', 'Rage', 'Blitz', 'Zex', 'Killa', 'Ghost', 'Void', 'Apex', 'Sweat', 'Optic', 'Faze'],
    suffix: ['God', 'Aim', 'Shot', 'Flick', 'Tap', 'Slayer', 'King', 'Viper', 'Demon', 'Ninja', 'Pro', 'X']
  },
  funny: {
    prefix: ['Sleepy', 'Snack', 'Wobbly', 'Tiny', 'Oops', 'Noodle', 'Couch', 'Spicy', 'Laggy', 'Boba', 'Tactical', 'Chonky'],
    suffix: ['Goblin', 'Duck', 'Toast', 'Bean', 'Pie', 'Potato', 'Grandma', 'Dorito', 'Lord', 'Waffle', 'Nugget', 'Panda']
  },
  og: {
    prefix: ['Kyo', 'Zel', 'Nyx', 'Ryn', 'Jax', 'Bex', 'Zen', 'Ash', 'Vex', 'Vand', 'Neo', 'Lax'],
    suffix: ['IQ', 'OX', 'IX', 'OM', 'UN', 'AX', 'AZ', 'Y', 'X', 'Z', 'Q', 'V']
  },
  scifi: {
    prefix: ['Pixel', 'Neon', 'Binary', 'Chrome', 'Data', 'Nano', 'Quantum', 'Glitch', 'Matrix', 'Circuit', 'Grid', 'Astro'],
    suffix: ['Flux', 'Rook', 'Arc', 'Wave', 'Core', 'Bit', 'Byte', 'Node', 'Sync', 'Link', 'Hex', 'Pulse']
  },
  aesthetic: {
    prefix: ['Aura', 'Lunar', 'Velvet', 'Crystal', 'Ethereal', 'Pastel', 'Dream', 'Silk', 'Cloud', 'Star', 'Lotus', 'Dusk'],
    suffix: ['Dust', 'Gaze', 'Whisper', 'Tears', 'Skies', 'Vibe', 'Echo', 'Glow', 'Breeze', 'Rain', 'Mist', 'Moon']
  }
};

const extraTags = ['TTV', 'xX', 'YT', 'Pro', 'Real'];

// Utility functions
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const toLeetspeak = (str) => {
  const leetMap = { 'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7' };
  return str.split('').map(char => leetMap[char.toLowerCase()] || char).join('');
};

export default function GamertagGenerator() {
  const [platformLimit, setPlatformLimit] = useState("15");
  const [vibe, setVibe] = useState("tryhard");
  const [keyword, setKeyword] = useState("");
  const [addNumbers, setAddNumbers] = useState(false);
  const [useLeetspeak, setUseLeetspeak] = useState(false);
  const [addClanTag, setAddClanTag] = useState(false);
  
  const [generatedTags, setGeneratedTags] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateTags();
  }, [platformLimit, vibe, keyword, addNumbers, useLeetspeak, addClanTag]);

  const generateTags = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const currentBank = wordBank[vibe];
      const limit = parseInt(platformLimit);
      let newTags = new Set();
      let safetyCounter = 0;
      
      const cleanKeyword = keyword.trim().replace(/\s+/g, '');

      // Generate 16 unique tags
      while (newTags.size < 16 && safetyCounter < 300) {
        safetyCounter++;
        let tag = '';

        if (cleanKeyword) {
          const formatType = Math.floor(Math.random() * 3);
          if (formatType === 0) tag = cleanKeyword + getRandom(currentBank.suffix);
          else if (formatType === 1) tag = getRandom(currentBank.prefix) + cleanKeyword;
          else tag = cleanKeyword; 
        } else {
          if (vibe === 'og') {
            tag = getRandom(currentBank.prefix) + (Math.random() > 0.5 ? getRandom(currentBank.suffix) : '');
          } else {
            tag = getRandom(currentBank.prefix) + getRandom(currentBank.suffix);
          }
        }

        if (useLeetspeak && Math.random() > 0.3) {
          tag = toLeetspeak(tag);
        }

        if (addNumbers) {
          const num = Math.floor(Math.random() * 99) + 1;
          tag += (Math.random() > 0.5 ? '_' : '') + num;
        }

        if (addClanTag && !tag.toLowerCase().includes('xx')) {
          const extra = getRandom(extraTags);
          if (extra === 'xX') tag = `xX${tag}Xx`;
          else tag = (Math.random() > 0.5) ? `${extra}_${tag}` : `${tag}_${extra}`;
        }

        if (tag.length > limit) {
          tag = tag.substring(0, limit);
          if (tag.endsWith('_')) tag = tag.slice(0, -1);
        }

        if (tag.length >= 3) {
          newTags.add(tag);
        }
      }

      setGeneratedTags(Array.from(newTags));
      setIsGenerating(false);
    }, 150);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Gamertag Generator
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-1 leading-snug">
              Generate unique gaming usernames for Xbox, PlayStation, Steam & Discord.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Platform Safe
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 flex-col-reverse lg:flex-row">
          
          {/* PREVIEW & RESULTS PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-wider text-ink flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand shrink-0" />
                  <span>Generated Tags</span>
                </h3>
                <span className="px-2 py-1 rounded-lg bg-paper border border-line text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted shadow-sm hidden sm:block whitespace-nowrap shrink-0">
                  {generatedTags.length} Results
                </span>
                <span className="px-2 py-1 rounded-lg bg-paper border border-line text-[9px] font-black uppercase tracking-wider text-muted shadow-sm sm:hidden whitespace-nowrap shrink-0">
                  6 Results
                </span>
              </div>

              {/* Tags Display Grid */}
              <div className="min-h-0 sm:min-h-[340px] border border-line rounded-2xl bg-paper p-3 sm:p-4 shadow-inner">
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 transition-opacity duration-200 ${isGenerating ? 'opacity-40' : 'opacity-100'}`}>
                  {generatedTags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopy(tag, idx)}
                      className={`relative w-full items-center justify-between p-3 rounded-xl border text-xs sm:text-sm font-mono font-bold tracking-wide transition-all shadow-sm ${
                        idx >= 6 ? 'hidden sm:flex' : 'flex'
                      } ${
                        copiedIndex === idx 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-surface border-line text-ink hover:border-brand hover:text-brand'
                      }`}
                    >
                      <span className="truncate pr-4">{tag}</span>
                      {copiedIndex === idx ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-line">
              <button
                type="button"
                onClick={generateTags}
                disabled={isGenerating}
                className="w-full h-10 sm:h-11 px-4 rounded-xl bg-brand text-surface font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-sm hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isGenerating ? 'animate-spin' : ''}`} /> 
                {isGenerating ? 'Generating...' : 'Generate New Batch'}
              </button>
            </div>
          </div>

          {/* CONFIGURATION PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-4 h-fit">
            <div>
              <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" />
                Generator Settings
              </h3>
              <p className="text-[9px] sm:text-[10px] text-muted mt-0.5">
                Customize vibe, limits, and style parameters.
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Optional Keyword Input */}
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Custom Name / Keyword (Optional)
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  maxLength={10}
                  placeholder="e.g. Ghost, Alex..."
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none shadow-inner focus:border-brand"
                />
              </div>

              {/* Platform Limits */}
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Platform Constraints
                </label>
                <select
                  value={platformLimit}
                  onChange={(e) => setPlatformLimit(e.target.value)}
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="15">Xbox Live (Max 15 Chars)</option>
                  <option value="16">PlayStation / PSN (Max 16 Chars)</option>
                  <option value="32">Steam / PC (Max 32 Chars)</option>
                </select>
              </div>

              {/* Gamertag Vibe */}
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Style / Vibe
                </label>
                <select
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="tryhard">Competitive / Tryhard</option>
                  <option value="scifi">Cyberpunk / Sci-Fi</option>
                  <option value="og">OG / Short & Rare</option>
                  <option value="funny">Funny / Meme</option>
                  <option value="aesthetic">Aesthetic / Chill</option>
                </select>
              </div>

              {/* Advanced Modifiers Toggle Grid */}
              <div className="pt-1.5">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted block mb-2">
                  Advanced Modifiers
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 border border-line rounded-xl bg-paper cursor-pointer shadow-sm hover:border-brand transition-colors">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-ink flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-brand" /> Add Numbers
                    </span>
                    <input
                      type="checkbox"
                      checked={addNumbers}
                      onChange={(e) => setAddNumbers(e.target.checked)}
                      className="w-4 h-4 accent-brand rounded border-line cursor-pointer shrink-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-line rounded-xl bg-paper cursor-pointer shadow-sm hover:border-brand transition-colors">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-ink flex items-center gap-2">
                      <Type className="w-3.5 h-3.5 text-brand" /> Leetspeak (E → 3)
                    </span>
                    <input
                      type="checkbox"
                      checked={useLeetspeak}
                      onChange={(e) => setUseLeetspeak(e.target.checked)}
                      className="w-4 h-4 accent-brand rounded border-line cursor-pointer shrink-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-line rounded-xl bg-paper cursor-pointer shadow-sm hover:border-brand transition-colors">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-ink flex items-center gap-2">
                      <Dna className="w-3.5 h-3.5 text-brand" /> Clan Tags (xX, TTV)
                    </span>
                    <input
                      type="checkbox"
                      checked={addClanTag}
                      onChange={(e) => setAddClanTag(e.target.checked)}
                      className="w-4 h-4 accent-brand rounded border-line cursor-pointer shrink-0"
                    />
                  </label>
                </div>
              </div>

            </div>

            <div className="p-3 rounded-xl bg-paper border border-line text-[10px] sm:text-xs text-muted leading-relaxed flex items-start gap-2.5 shadow-inner mt-4">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                All names are generated entirely in your browser. No data is stored, ensuring complete privacy.
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
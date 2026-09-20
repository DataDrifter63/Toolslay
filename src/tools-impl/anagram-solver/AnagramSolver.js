"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Keyboard, Search, CheckCircle2, Copy, 
  HelpCircle, Activity, Award, BarChart3,
  ListOrdered, Zap, ShieldAlert, Loader2, Globe2
} from "lucide-react";

// Scrabble Point Values
const SCRABBLE_SCORES = {
  a:1, b:3, c:3, d:2, e:1, f:4, g:2, h:4, i:1, j:8, k:5, l:1, m:3,
  n:1, o:1, p:3, q:10, r:1, s:1, t:1, u:1, v:4, w:4, x:8, y:4, z:10
};

// Fallback core dict if offline/loading
const FALLBACK_DICT = ["hello", "hell", "he", "oh", "lo", "test", "tent", "text", "muxair", "data", "drift"];

export default function AnagramSolver() {
  const [isMounted, setIsMounted] = useState(false);
  const [inputLetters, setInputLetters] = useState("HELLO");
  const [dictionary, setDictionary] = useState(FALLBACK_DICT);
  const [dictSource, setDictSource] = useState("Fallback (Loading Global Dict...)");
  const [isLoadingDict, setIsLoadingDict] = useState(true);
  const [copied, setCopied] = useState(null);

  // Load World-Wide Dictionary (370k+ words dataset from dwyl/english-words or similar CDN)
  useEffect(() => {
    setIsMounted(true);
    let isCancelled = false;

    async function loadGlobalDictionary() {
      try {
        // Fetching standard public JSON dictionary (370k words object/array)
        const response = await fetch("https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json");
        if (response.ok && !isCancelled) {
          const data = await response.json();
          // The dwyl repo returns an object where keys are words: { "a": 1, "aa": 1, ... }
          const wordsArray = Object.keys(data);
          setDictionary(wordsArray);
          setDictSource(`Global Enterprise Dict (${wordsArray.length.toLocaleString()} words)`);
        }
      } catch (err) {
        console.warn("CDN fetch failed or offline, using fallback dict.", err);
      } finally {
        if (!isCancelled) setIsLoadingDict(false);
      }
    }

    loadGlobalDictionary();
    return () => { isCancelled = true; };
  }, []);

  // --- CORE LEXICAL ENGINE (Optimized Frequency & Prefix/Length Mapping) ---
  const results = useMemo(() => {
    const rawInput = inputLetters.toLowerCase().replace(/[^a-z?]/g, '');
    if (!rawInput) return { grouped: {}, count: 0, maxScore: 0 };

    const wildcards = (rawInput.match(/\?/g) || []).length;
    const availableLetters = rawInput.replace(/\?/g, '');
    const maxLen = rawInput.length;
    
    const getFrequencyMap = (str) => {
      const map = {};
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        map[char] = (map[char] || 0) + 1;
      }
      return map;
    };

    const inputMap = getFrequencyMap(availableLetters);

    const canFormWord = (word) => {
      // Quick length pre-check
      if (word.length > maxLen) return false;
      const wordMap = getFrequencyMap(word);
      let requiredWildcards = 0;

      for (let char in wordMap) {
        const available = inputMap[char] || 0;
        if (wordMap[char] > available) {
          requiredWildcards += (wordMap[char] - available);
        }
      }
      return requiredWildcards <= wildcards;
    };

    const calculateScore = (word) => {
      let score = 0;
      for (let i = 0; i < word.length; i++) {
        score += SCRABBLE_SCORES[word[i]] || 0;
      }
      return score;
    };

    const matches = [];
    let maxScore = 0;
    const seen = new Set();
    const len = dictionary.length;

    // Fast loop with smart pruning
    for (let i = 0; i < len; i++) {
      const word = dictionary[i];
      if (!word) continue;
      const wLen = word.length;
      if (wLen < 2 || wLen > maxLen) continue;
      if (seen.has(word)) continue;

      if (canFormWord(word)) {
        seen.add(word);
        const score = calculateScore(word);
        if (score > maxScore) maxScore = score;
        matches.push({ word, score, length: wLen });
      }
    }

    // Sort by score descending, then length descending
    matches.sort((a, b) => b.score - a.score || b.length - a.length);

    // Group by length
    const grouped = {};
    for (let i = 0; i < matches.length; i++) {
      const item = matches[i];
      if (!grouped[item.length]) grouped[item.length] = [];
      grouped[item.length].push(item);
    }

    return { grouped, count: matches.length, maxScore };
  }, [inputLetters, dictionary]);

  const handleCopy = (word) => {
    navigator.clipboard.writeText(word);
    setCopied(word);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isMounted) return null;

  // Premium Violet/Fuchsia Theme
  const theme = {
    gradient: "from-violet-200 via-fuchsia-100 to-transparent dark:from-violet-900/30 dark:via-fuchsia-900/20",
    bgIcon: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    textPri: "text-violet-600 dark:text-violet-400",
    textSec: "text-fuchsia-600 dark:text-fuchsia-400",
    borderLight: "border-violet-200 dark:border-violet-800/50",
    bgLight: "bg-violet-50 dark:bg-violet-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Keyboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Global Lexical Anagram Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5 text-violet-500" />
              {isLoadingDict ? "Loading 370k+ World Dictionary Dataset..." : dictSource}
            </p>
          </div>
        </div>
        {isLoadingDict && (
          <div className="flex items-center gap-2 text-xs font-bold text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-xl border border-violet-200 dark:border-violet-800">
            <Loader2 className="w-4 h-4 animate-spin" /> Syncing CDN...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.3fr] gap-6 items-start">
        
        {/* ================= LEFT: INPUT ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. Letter Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Search className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Enter Your Tiles
                </h3>
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all overflow-hidden shadow-inner`}>
                <input
                  type="text"
                  value={inputLetters} 
                  onChange={(e) => setInputLetters(e.target.value)}
                  placeholder="e.g. ABER??"
                  className="w-full bg-transparent px-5 py-5 text-2xl font-black tracking-widest text-slate-800 dark:text-slate-100 outline-none uppercase"
                  spellCheck="false"
                />
              </div>

              {/* Input Analytics */}
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded-lg text-[10px] font-black uppercase tracking-widest">
                   <ListOrdered className="w-3.5 h-3.5" /> Length: {inputLetters.replace(/[^a-zA-Z?]/g, '').length}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg text-[10px] font-black uppercase tracking-widest">
                   <HelpCircle className="w-3.5 h-3.5" /> Wildcards: {(inputLetters.match(/\?/g) || []).length}
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Pro Tips */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Zap className={`w-3.5 h-3.5 ${theme.textPri}`} /> Big Data Engine Features
              </h3>
              
              <ul className="space-y-3">
                <li className="flex gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="text-violet-500 font-bold">•</span>
                  Scans world dictionary datasets dynamically without UI freeze.
                </li>
                <li className="flex gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="text-violet-500 font-bold">•</span>
                  Type <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-800 dark:text-slate-200">HELLO</code> to see all valid international English permutations (`hello`, `hell`, etc.).
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULTS DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[600px] font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Discovery Results
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-[#0d1117] px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  Real-Time BigData
                </span>
              </div>

              {/* Data Analytics Dashboard */}
              <div className="grid grid-cols-2 gap-2 mb-6 shrink-0">
                <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <BarChart3 className="w-5 h-5 text-violet-500 mb-1" />
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">{results.count}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Words Found</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <Award className="w-5 h-5 text-fuchsia-500 mb-1" />
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">{results.maxScore}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Highest Score</span>
                </div>
              </div>

              {/* The Actual Output Area */}
              <div className="flex-1 bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden flex flex-col group">
                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-6">
                  
                  {results.count === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                      <Keyboard className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center">
                        {inputLetters ? "No Words Found" : "Awaiting Letters"}
                      </span>
                    </div>
                  ) : (
                    Object.keys(results.grouped).sort((a, b) => b - a).map(length => (
                      <div key={length} className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {length}-Letter Words
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            ({results.grouped[length].length})
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                          {results.grouped[length].map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleCopy(item.word)}
                              className="group relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all overflow-hidden pr-2"
                            >
                              <div className="bg-white dark:bg-[#0d1117] border-r border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                {copied === item.word ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                                ) : (
                                  item.word
                                )}
                              </div>
                              <div className="px-1.5 flex items-center gap-0.5 text-[9px] font-bold text-slate-400 group-hover:text-violet-500">
                                <Award className="w-2.5 h-2.5" /> {item.score}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
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
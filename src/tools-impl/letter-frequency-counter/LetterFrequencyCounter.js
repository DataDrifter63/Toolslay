"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3, Hash, FileText, Download, 
  CheckCircle2, Sliders, Zap, Activity, Layers, Flame
} from "lucide-react";

// Standard English Letter Frequencies (%) for comparison
const ENGLISH_BENCHMARKS = {
  a: 8.17, b: 1.49, c: 2.78, d: 4.25, e: 12.70, f: 2.23, g: 2.02,
  h: 6.09, i: 6.97, j: 0.15, k: 0.77, l: 4.03, m: 2.41, n: 6.75,
  o: 7.51, p: 1.93, q: 0.10, r: 5.99, s: 6.33, t: 9.06, u: 2.76,
  v: 0.98, w: 2.36, x: 0.15, y: 1.97, z: 0.07
};

export default function LetterFrequencyCounter() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [text, setText] = useState(
    "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take arms against a sea of troubles And by opposing end them."
  );

  const [caseSensitive, setCaseSensitive] = useState(false);
  const [ignoreNonAlpha, setIgnoreNonAlpha] = useState(true);
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE FREQUENCY & N-GRAM ENGINE ---
  const analysis = useMemo(() => {
    if (!text) {
      return {
        totalChars: 0,
        alphaCount: 0,
        frequencyMap: [],
        topBigrams: [],
        topTrigrams: [],
        maxFreq: 1
      };
    }

    const workingText = caseSensitive ? text : text.toLowerCase();
    const chars = Array.from(workingText);
    
    const freqMap = {};
    let alphaCount = 0;
    let maxFreq = 1;

    // Alphabet A-Z initialize
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const baseMap = {};
    alphabet.forEach(ch => { baseMap[ch] = 0; });

    chars.forEach(ch => {
      const isAlpha = /[a-z]/i.test(ch);
      if (isAlpha) {
        alphaCount++;
        const targetCh = caseSensitive ? ch : ch.toLowerCase();
        baseMap[targetCh] = (baseMap[targetCh] || 0) + 1;
        if (baseMap[targetCh] > maxFreq) maxFreq = baseMap[targetCh];
      } else if (!ignoreNonAlpha) {
        baseMap[ch] = (baseMap[ch] || 0) + 1;
        if (baseMap[ch] > maxFreq) maxFreq = baseMap[ch];
      }
    });

    const frequencyList = Object.entries(baseMap)
      .map(([char, count]) => {
        const lowerCh = char.toLowerCase();
        const percent = alphaCount > 0 && /[a-z]/.test(lowerCh) ? ((count / alphaCount) * 100).toFixed(2) : "0.00";
        const benchmark = ENGLISH_BENCHMARKS[lowerCh] || 0;
        return { char, count, percent: parseFloat(percent), benchmark };
      })
      .filter(item => ignoreNonAlpha ? /[a-z]/i.test(item.char) : true)
      .sort((a, b) => b.count - a.count || a.char.localeCompare(b.char));

    // Bigrams & Trigrams extraction (Alpha only for linguistics value)
    const cleanAlphaStr = workingText.replace(/[^a-z]/g, '');
    const bigrams = {};
    const trigrams = {};

    for (let i = 0; i < cleanAlphaStr.length - 1; i++) {
      const bg = cleanAlphaStr.substr(i, 2);
      bigrams[bg] = (bigrams[bg] || 0) + 1;
    }
    for (let i = 0; i < cleanAlphaStr.length - 2; i++) {
      const tg = cleanAlphaStr.substr(i, 3);
      trigrams[tg] = (trigrams[tg] || 0) + 1;
    }

    const topBigrams = Object.entries(bigrams).sort((a, b) => b - a).slice(0, 5);
    const topTrigrams = Object.entries(trigrams).sort((a, b) => b - a).slice(0, 5);

    return {
      totalChars: text.length,
      alphaCount,
      frequencyMap: frequencyList,
      topBigrams,
      topTrigrams,
      maxFreq
    };
  }, [text, caseSensitive, ignoreNonAlpha]);

  const handleExportCSV = () => {
    if (!analysis.frequencyMap.length) return;
    const csvRows = ["Character,Count,Percentage(%),EnglishBenchmark(%)"];
    analysis.frequencyMap.forEach(item => {
      csvRows.push(`"${item.char}",${item.count},${item.percent},${item.benchmark}`);
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "muxair-letter-frequency-analysis.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  // Premium Indigo & Violet Theme
  const theme = {
    gradient: "from-indigo-200 via-violet-100 to-transparent dark:from-indigo-900/30 dark:via-violet-900/20",
    bgIcon: "bg-gradient-to-br from-indigo-500 to-violet-600",
    textPri: "text-indigo-600 dark:text-indigo-400",
    textSec: "text-violet-600 dark:text-violet-400",
    borderLight: "border-indigo-200 dark:border-indigo-800/50",
    bgLight: "bg-indigo-50 dark:bg-indigo-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Cryptographic Frequency Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Letter Distribution, N-Gram & Zipf Benchmark Analyzer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-6 items-start">
        
        {/* ================= LEFT: CONFIG & INPUT ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 font-sans">
            
            {/* Source Text Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <FileText className={`w-3.5 h-3.5 ${theme.textPri}`} /> Corpus / Source Text
                </label>
                <button onClick={() => setText("")} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors">
                  Clear
                </button>
              </div>
              <textarea
                value={text} 
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste text corpus here for cryptographic frequency analysis..."
                rows="8"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
                spellCheck="false"
              />
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Analysis Toggles */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Sliders className={`w-3.5 h-3.5 ${theme.textPri}`} /> Parsing Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input type="checkbox" checked={ignoreNonAlpha} onChange={(e) => setIgnoreNonAlpha(e.target.checked)} className="w-4 h-4 accent-indigo-500 rounded" />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Alpha Only (A-Z)</span>
                    <span className="block text-[9px] text-slate-500">Exclude numbers, symbols</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="w-4 h-4 accent-indigo-500 rounded" />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Case Sensitive</span>
                    <span className="block text-[9px] text-slate-500">Treat A and a separately</span>
                  </div>
                </label>

                <label className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input type="checkbox" checked={showBenchmarks} onChange={(e) => setShowBenchmarks(e.target.checked)} className="w-4 h-4 accent-indigo-500 rounded" />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Overlay English Benchmark (%)</span>
                    <span className="block text-[9px] text-slate-500">Compare text pattern against standard English letter distribution</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Quick N-Grams Inspector */}
            <div className="space-y-3 pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Top Linguistic N-Grams
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Top Bigrams (2-letter)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.topBigrams.length ? analysis.topBigrams.map(([bg, cnt]) => (
                      <span key={bg} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {bg} <span className="text-[8px] text-indigo-500">({cnt})</span>
                      </span>
                    )) : <span className="text-[10px] text-slate-400">N/A</span>}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Top Trigrams (3-letter)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.topTrigrams.length ? analysis.topTrigrams.map(([tg, cnt]) => (
                      <span key={tg} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {tg} <span className="text-[8px] text-indigo-500">({cnt})</span>
                      </span>
                    )) : <span className="text-[10px] text-slate-400">N/A</span>}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: DISTRIBUTION DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col h-[700px] font-sans">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden transition-colors duration-500">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Frequency Distribution Matrix
                </span>
                
                <button 
                  onClick={handleExportCSV}
                  disabled={!analysis.frequencyMap.length}
                  className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    exported ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  }`}
                >
                  {exported ? <><CheckCircle2 className="w-3.5 h-3.5"/> Exported CSV</> : <><Download className="w-3.5 h-3.5"/> Export CSV</>}
                </button>
              </div>

              {/* Data Analytics KPI Bar */}
              <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <Hash className="w-4 h-4 text-indigo-500 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{analysis.alphaCount.toLocaleString()}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Processed Alpha Chars</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <Layers className="w-4 h-4 text-violet-500 mb-1" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{analysis.frequencyMap.length}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Unique Symbols</span>
                </div>
              </div>

              {/* Matrix List with Visual Progress Bars */}
              <div className="flex-1 bg-white dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-y-auto custom-scrollbar p-4 space-y-3">
                {analysis.frequencyMap.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                    <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
                    <span className="text-xs font-bold uppercase tracking-widest text-center">
                      Awaiting Text Corpus
                    </span>
                  </div>
                ) : (
                  analysis.frequencyMap.map((item, idx) => {
                    const widthPercent = Math.max(2, (item.count / analysis.maxFreq) * 100);
                    const diffFromBenchmark = item.percent - item.benchmark;

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black uppercase text-indigo-600 dark:text-indigo-400">
                              {item.char}
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {item.count.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">({item.percent}%)</span>
                            </span>
                          </div>

                          {showBenchmarks && /[a-z]/i.test(item.char) && (
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-slate-400">Eng: {item.benchmark}%</span>
                              <span className={`font-bold px-1.5 py-0.5 rounded ${Math.abs(diffFromBenchmark) > 3 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                {diffFromBenchmark > 0 ? `+${diffFromBenchmark.toFixed(1)}%` : `${diffFromBenchmark.toFixed(1)}%`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                            style={{ width: `${widthPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
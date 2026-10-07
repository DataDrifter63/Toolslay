"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FileText, AlertTriangle, CheckCircle2, Search, Filter, Trash2, Zap, Play, Edit3, Target, Info } from "lucide-react";

// 100+ Stop words including the, to, and, etc.
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

export default function KeywordDensityChecker() {
  const [isMounted, setIsMounted] = useState(false);
  const [text, setText] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [excludeStopWords, setExcludeStopWords] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [mode, setMode] = useState("edit"); // "edit" or "preview"

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadDummyData = () => {
    setText("SEO stands for Search Engine Optimization. SEO is the process of improving your website to increase its visibility in Google, Microsoft Bing, and other search engines. The better visibility your pages have in search results, the more likely you are to be found and clicked on. Ultimately, the goal of search engine optimization is to help attract website visitors who will become customers, clients or an audience that keeps coming back. SEO helps with organic traffic. We love SEO.");
    setFocusKeyword("seo");
    setMode("edit");
  };

  // Memoized Core Analysis
  const analysis = useMemo(() => {
    if (!text.trim()) {
      return { words: 0, chars: 0, readTime: 0, baseCount: 0, ngrams: { 1: [], 2: [], 3: [] }, focusStats: null };
    }

    const chars = text.length;
    const rawWords = text.toLowerCase().match(/\b[\w'-]+\b/g) || [];
    const totalWords = rawWords.length;
    const readTime = Math.ceil(totalWords / 200);

    const filteredWords = excludeStopWords 
      ? rawWords.filter(w => !STOP_WORDS.has(w))
      : rawWords;

    const baseCount = excludeStopWords ? filteredWords.length : totalWords;

    const generateNGrams = (wordsArr, n) => {
      if (wordsArr.length < n || baseCount === 0) return [];
      const counts = {};
      
      for (let i = 0; i <= wordsArr.length - n; i++) {
        const gram = wordsArr.slice(i, i + n).join(" ");
        if (n === 1 && (gram.length < 2 || !isNaN(gram))) continue;
        counts[gram] = (counts[gram] || 0) + 1;
      }

      return Object.entries(counts)
        .map(([word, count]) => {
          const density = ((count / baseCount) * 100);
          return {
            word,
            count,
            density: density.toFixed(1),
            status: density > 3 ? "stuffed" : density >= 1 ? "optimal" : "low"
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);
    };

    const ngramsData = {
      1: generateNGrams(filteredWords, 1),
      2: generateNGrams(filteredWords, 2),
      3: generateNGrams(filteredWords, 3),
    };

    // Focus Keyword Check
    let focusStats = null;
    if (focusKeyword.trim()) {
      const fk = focusKeyword.toLowerCase().trim();
      // Count in raw text
      const regex = new RegExp(`\\b${fk}\\b`, "gi");
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      const density = baseCount > 0 ? ((count / baseCount) * 100) : 0;
      focusStats = {
        word: fk,
        count,
        density: density.toFixed(1),
        status: density > 3 ? "stuffed" : density >= 1 ? "optimal" : "low"
      };
    }

    return { words: totalWords, chars, readTime, baseCount, ngrams: ngramsData, focusStats };
  }, [text, excludeStopWords, focusKeyword]);

  // Function to render text with color highlights
  const renderHighlightedText = () => {
    if (!text) return null;

    // Create a fast lookup map for 1-gram words
    const wordMap = new Map();
    analysis.ngrams[1].forEach(item => wordMap.set(item.word, item.status));

    // Split keeping words and punctuation intact
    const tokens = text.split(/(\b[\w'-]+\b)/);

    return tokens.map((token, i) => {
      const lowerToken = token.toLowerCase();
      
      // If it's a word we have analyzed and it's not a stop word
      if (wordMap.has(lowerToken) && (!excludeStopWords || !STOP_WORDS.has(lowerToken))) {
        const status = wordMap.get(lowerToken);
        let colorClass = "bg-blue-100 text-blue-800 font-medium"; // Low (Blue)
        if (status === "stuffed") colorClass = "bg-rose-200 text-rose-900 border-b-2 border-rose-500 font-bold shadow-sm"; // Red
        if (status === "optimal") colorClass = "bg-emerald-200 text-emerald-900 border-b-2 border-emerald-500 font-bold shadow-sm"; // Green

        return (
          <span key={i} className={`px-0.5 rounded-sm transition-all duration-300 ${colorClass}`} title={`${status.toUpperCase()} Density`}>
            {token}
          </span>
        );
      }
      return <span key={i}>{token}</span>;
    });
  };

  const handleAnalyze = () => {
    if (text.trim().length > 0) {
      setMode("preview");
    }
  };

  const currentList = analysis.ngrams[activeTab];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
            <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">Pro Keyword Analyzer</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NLP Density & Highlighting Engine</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,450px] gap-6 items-start">
        
        {/* ================= LEFT COLUMN: INPUT / PREVIEW ================= */}
        <div className="space-y-4">
          
          {/* Focus Keyword Box (New Feature) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm flex items-center gap-4">
             <div className="flex-1">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-1.5">
                 <Target className="w-3.5 h-3.5" /> Target Focus Keyword
               </label>
               <input 
                 type="text" 
                 value={focusKeyword}
                 onChange={(e) => setFocusKeyword(e.target.value)}
                 placeholder="e.g. SEO optimization"
                 className="w-full text-sm font-semibold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
               />
             </div>
             {analysis.focusStats && mode === "preview" && (
               <div className="w-[120px] shrink-0 border-l border-slate-100 dark:border-slate-800 pl-4 py-1">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</div>
                 <div className={`text-sm font-black ${
                   analysis.focusStats.status === 'stuffed' ? 'text-rose-500' : analysis.focusStats.status === 'optimal' ? 'text-emerald-500' : 'text-blue-500'
                 }`}>
                   {analysis.focusStats.density}%
                 </div>
               </div>
             )}
          </div>

          {/* Main Editor/Preview Area */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col h-[550px]">
             
             {/* Toolbar */}
             <div className="flex flex-wrap justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
               <div className="flex items-center gap-2">
                 {mode === "preview" ? (
                   <button onClick={() => setMode("edit")} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all">
                     <Edit3 className="w-4 h-4" /> Edit Text
                   </button>
                 ) : (
                   <button onClick={handleAnalyze} disabled={!text.trim()} className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg shadow-sm transition-all">
                     <Play className="w-4 h-4" /> Analyze Highlights
                   </button>
                 )}
                 
                 {mode === "edit" && (
                   <button onClick={loadDummyData} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-500 transition-colors ml-2">
                     <Zap className="w-3.5 h-3.5" /> Sample
                   </button>
                 )}
               </div>
               
               <div className="flex items-center gap-3">
                 <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5" /> Ignore Stop Words
                    </span>
                    <input type="checkbox" checked={excludeStopWords} onChange={(e) => setExcludeStopWords(e.target.checked)} className="w-3.5 h-3.5 accent-indigo-600" />
                 </label>
                 {mode === "edit" && (
                   <button onClick={() => setText("")} className="text-slate-400 hover:text-rose-500 transition-colors p-1" title="Clear">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 )}
               </div>
             </div>

             {/* Text Area vs Highlighted View */}
             {mode === "edit" ? (
               <textarea 
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 placeholder="Paste your article or content here. Click 'Analyze Highlights' to see visual keyword density..."
                 className="flex-1 w-full p-6 text-sm font-medium text-slate-800 dark:text-slate-200 bg-transparent resize-none outline-none leading-relaxed custom-scrollbar placeholder:text-slate-400"
               />
             ) : (
               <div className="flex-1 w-full p-6 overflow-y-auto custom-scrollbar bg-[#fafafa] dark:bg-[#0d1117]">
                 <div className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                   {renderHighlightedText()}
                 </div>
               </div>
             )}

             {/* Quick Stats Footer */}
             <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-4 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700">
               <div className="flex flex-col items-center justify-center">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Words</span>
                 <span className="text-xl font-black text-slate-700 dark:text-slate-200">{analysis.words.toLocaleString()}</span>
               </div>
               <div className="flex flex-col items-center justify-center">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analyzed Words</span>
                 <span className="text-xl font-black text-slate-700 dark:text-slate-200">{analysis.baseCount.toLocaleString()}</span>
               </div>
               <div className="flex flex-col items-center justify-center">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Est. Read Time</span>
                 <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{analysis.readTime} min</span>
               </div>
             </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ANALYSIS OUTPUT ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col h-[640px] overflow-hidden">
           
           {/* Tabs */}
           <div className="flex border-b border-slate-100 dark:border-slate-800 p-1.5 bg-slate-50 dark:bg-slate-950/50">
             {[
               { id: 1, label: "1-Word", desc: "Core Words" },
               { id: 2, label: "2-Words", desc: "Short Phrases" },
               { id: 3, label: "3-Words", desc: "Long-Tail LSI" }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex-1 py-2 px-1 flex flex-col items-center rounded-lg transition-all ${
                   activeTab === tab.id 
                     ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                     : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                 }`}
               >
                 <span className="text-sm font-black">{tab.label}</span>
                 <span className="text-[9px] uppercase tracking-widest opacity-70">{tab.desc}</span>
               </button>
             ))}
           </div>

           {/* Results List */}
           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
             {analysis.words === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60">
                 <FileText className="w-12 h-12" />
                 <p className="text-sm font-semibold">Paste text to see keyword density</p>
               </div>
             ) : currentList.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60">
                 <Filter className="w-12 h-12" />
                 <p className="text-sm font-semibold">No phrases found. Try adding more text.</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {/* Table Header */}
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                   <div className="flex-1">Keyword / Phrase</div>
                   <div className="w-16 text-center">Count</div>
                   <div className="w-24 text-right">Density</div>
                 </div>

                 {/* List Items */}
                 {currentList.map((item, idx) => (
                   <div key={idx} className="group flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                     
                     <div className="flex-1 min-w-0 pr-4">
                       <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate capitalize">{item.word}</h4>
                       
                       {/* Density Progress Bar */}
                       <div className="mt-2 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                         <div 
                           className={`h-full rounded-full ${
                             item.status === 'stuffed' ? 'bg-rose-500' : item.status === 'optimal' ? 'bg-emerald-500' : 'bg-blue-400'
                           }`} 
                           style={{ width: `${Math.min(item.density * 10, 100)}%` }} // Scaled visually
                         ></div>
                       </div>
                     </div>

                     <div className="w-16 text-center">
                       <span className="inline-block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded">
                         {item.count}
                       </span>
                     </div>

                     <div className="w-24 flex flex-col items-end justify-center">
                       <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                         {item.density}%
                       </span>
                       {item.status === 'stuffed' ? (
                         <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-rose-500 mt-1">
                           <AlertTriangle className="w-3 h-3" /> Stuffed
                         </span>
                       ) : item.status === 'optimal' ? (
                         <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500 mt-1">
                           <CheckCircle2 className="w-3 h-3" /> Optimal
                         </span>
                       ) : (
                         <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500 mt-1">
                           Low
                         </span>
                       )}
                     </div>

                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Legend Footer */}
           <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 p-4 flex justify-between gap-2">
             <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div> Low (&lt;1%)
             </div>
             <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Optimal (1-3%)
             </div>
             <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
               <div className="w-2 h-2 rounded-full bg-rose-500"></div> Stuffed (&gt;3%)
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
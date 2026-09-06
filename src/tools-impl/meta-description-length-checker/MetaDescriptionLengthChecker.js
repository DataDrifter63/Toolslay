"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Monitor, Smartphone, CheckCircle2, Copy, Sparkles, Calendar, Zap, Type } from "lucide-react";

const POWER_WORDS = [
  "best", "free", "guide", "top", "easy", "proven", "ultimate", "fast", "simple", "step-by-step",
  "checklist", "cheap", "discount", "guaranteed", "review", "new", "2026", "how to", "instant"
];

const CTA_WORDS = [
  "get", "buy", "learn", "download", "try", "discover", "click", "find", "start", "see", "read", "check"
];

export default function MetaDescriptionLengthChecker() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [title, setTitle] = useState("10 Best Free SEO Utility Tools for Webmasters in 2026");
  const [description, setDescription] = useState("Discover top-rated free SEO utility tools to boost your web traffic. Analyze keyword density, build UTM links, and optimize your meta tags effortlessly.");
  const [url, setUrl] = useState("https://toolslay.com/blog/best-seo-tools");
  const [targetKeyword, setTargetKeyword] = useState("free SEO utility tools");
  
  const [device, setDevice] = useState("desktop");
  const [includeDate, setIncludeDate] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculatePixelWidth = (text, font) => {
    if (typeof window === "undefined") return 0;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return 0;
    context.font = font;
    return Math.round(context.measureText(text).width);
  };

  const metrics = useMemo(() => {
    if (!description) {
      return {
        charCount: 0,
        pixelWidth: 0,
        maxPixels: device === "desktop" ? 960 : 680,
        status: "empty",
        ctrScore: 0,
        hasCta: false,
        hasPowerWord: false,
        hasKeyword: false
      };
    }

    const charCount = description.length;
    const fontSpec = device === "desktop" ? "14px Arial, sans-serif" : "13px Arial, sans-serif";
    
    let baseText = description;
    if (includeDate) {
      baseText = "Sep 4, 2026 - " + description;
    }

    const pixelWidth = calculatePixelWidth(baseText, fontSpec);
    const maxPixels = device === "desktop" ? 960 : 680;

    let status = "optimal";
    if (pixelWidth > maxPixels) {
      status = "over";
    } else if (pixelWidth < (maxPixels * 0.45)) {
      status = "low";
    }

    const lowerDesc = description.toLowerCase();
    const hasCta = CTA_WORDS.some(word => lowerDesc.includes(word));
    const hasPowerWord = POWER_WORDS.some(word => lowerDesc.includes(word));
    const hasKeyword = targetKeyword.trim() ? lowerDesc.includes(targetKeyword.toLowerCase().trim()) : false;
    const hasNumber = /\d+/.test(description);

    let ctrScore = 40;
    if (status === "optimal") ctrScore += 25;
    if (hasCta) ctrScore += 15;
    if (hasPowerWord) ctrScore += 10;
    if (hasKeyword) ctrScore += 10;

    return {
      charCount,
      pixelWidth,
      maxPixels,
      status,
      ctrScore: Math.min(ctrScore, 100),
      hasCta,
      hasPowerWord,
      hasKeyword,
      hasNumber
    };
  }, [description, device, includeDate, targetKeyword, isMounted]);

  const renderSerpDescription = () => {
    if (!description) return <span className="text-slate-400 italic">Enter a meta description to see the SERP preview...</span>;

    let fullText = includeDate ? "Sep 4, 2026 - " + description : description;
    
    if (!targetKeyword.trim()) {
      return fullText;
    }

    const kw = targetKeyword.trim();
    const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const parts = fullText.split(regex);

    return parts.map((part, index) => 
      regex.test(part) ? (
        <strong key={index} className="font-extrabold text-slate-900 dark:text-slate-100">
          {part}
        </strong>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg">
            <Search className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">Pro SERP Meta Simulator</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pixel-Width & CTR Optimization Guard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
           <button 
             onClick={() => setDevice("desktop")} 
             className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${device === 'desktop' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Monitor className="w-3.5 h-3.5" /> Desktop
           </button>
           <button 
             onClick={() => setDevice("mobile")} 
             className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${device === 'mobile' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Smartphone className="w-3.5 h-3.5" /> Mobile
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-5">
             <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Target Keyword (for SERP Bold Simulation)
                </label>
                <input 
                  type="text" 
                  value={targetKeyword} 
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="e.g. free SEO utility tools"
                  className="w-full text-sm font-semibold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
             </div>

             <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Page Title Tag</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title..."
                  className="w-full text-sm font-medium p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
             </div>

             <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Meta Description</label>
                  <button onClick={handleCopy} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                    {isCopied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Text</>}
                  </button>
                </div>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  placeholder="Type your meta description here..."
                  className="w-full text-sm font-medium p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 resize-none leading-relaxed"
                />
             </div>

             <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Breadcrumb / URL</label>
                <input 
                  type="text" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
                />
             </div>

             <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeDate} 
                    onChange={(e) => setIncludeDate(e.target.checked)} 
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Simulate Google Date Prefix (Steals ~100px)
                  </span>
                </label>
             </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
             <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                 <Type className="w-4 h-4 text-emerald-500" /> Pixel & Character Density
               </h3>
               <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                 metrics.status === 'over' 
                   ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                   : metrics.status === 'low' 
                     ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                     : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
               }`}>
                 {metrics.status === 'over' ? 'Truncated (...)' : metrics.status === 'low' ? 'Too Short' : 'Optimal Length'}
               </span>
             </div>

             <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold">
                 <span className="text-slate-600 dark:text-slate-400">
                   Pixels: <strong className="text-slate-900 dark:text-slate-100">{metrics.pixelWidth}px</strong> / {metrics.maxPixels}px
                 </span>
                 <span className="text-slate-600 dark:text-slate-400">
                   Chars: <strong className="text-slate-900 dark:text-slate-100">{metrics.charCount}</strong> / {device === 'desktop' ? '160' : '120'}
                 </span>
               </div>
               <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-300 ${
                     metrics.status === 'over' ? 'bg-rose-500' : metrics.status === 'low' ? 'bg-amber-400' : 'bg-emerald-500'
                   }`}
                   style={{ width: `${Math.min((metrics.pixelWidth / metrics.maxPixels) * 100, 100)}%` }}
                 ></div>
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-6 min-w-0 flex flex-col sticky top-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" /> Google {device === 'desktop' ? 'Desktop' : 'Mobile'} Preview
                </span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                  Google SERP 2026
                </span>
              </div>

              <div className={`p-4 rounded-lg bg-white dark:bg-[#171717] border border-slate-100 dark:border-slate-800/80 font-sans ${device === 'mobile' ? 'max-w-[360px] mx-auto shadow-md' : 'w-full'}`}>
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                     <span className="text-[10px] font-black text-indigo-500">T</span>
                   </div>
                   <div className="flex flex-col min-w-0">
                     <span className="text-[12px] text-[#202124] dark:text-[#bdc1c6] font-normal leading-tight truncate">
                       ToolSlay
                     </span>
                     <span className="text-[10px] text-[#4d5156] dark:text-[#9aa0a6] font-normal leading-tight truncate">
                       {url || "https://example.com"}
                     </span>
                   </div>
                 </div>

                 <h3 className="text-[18px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline font-normal leading-snug cursor-pointer mb-1 line-clamp-1">
                   {title || "Example Title Tag"}
                 </h3>

                 <p className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed font-normal break-words">
                   {renderSerpDescription()}
                 </p>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                   <Zap className="w-4 h-4 text-amber-500" /> CTR Optimization Score
                 </h3>
                 <span className={`text-lg font-black ${metrics.ctrScore >= 80 ? 'text-emerald-500' : metrics.ctrScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                   {metrics.ctrScore}/100
                 </span>
              </div>

              <div className="space-y-2.5 text-xs">
                 <div className="flex items-center justify-between">
                   <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                     <CheckCircle2 className={`w-4 h-4 ${metrics.status === 'optimal' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                     Pixel Length in Safe Zone (960px)
                   </span>
                   <span className="font-bold text-slate-700 dark:text-slate-300">{metrics.status === 'optimal' ? 'Pass' : 'Fix'}</span>
                 </div>

                 <div className="flex items-center justify-between">
                   <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                     <CheckCircle2 className={`w-4 h-4 ${metrics.hasKeyword ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                     Contains Target Keyword
                   </span>
                   <span className="font-bold text-slate-700 dark:text-slate-300">{metrics.hasKeyword ? 'Yes' : 'No'}</span>
                 </div>

                 <div className="flex items-center justify-between">
                   <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                     <CheckCircle2 className={`w-4 h-4 ${metrics.hasCta ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                     Call-To-Action (Learn, Get, Try...)
                   </span>
                   <span className="font-bold text-slate-700 dark:text-slate-300">{metrics.hasCta ? 'Detected' : 'Missing'}</span>
                 </div>

                 <div className="flex items-center justify-between">
                   <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                     <CheckCircle2 className={`w-4 h-4 ${metrics.hasPowerWord ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                     Emotional / Power Words Included
                   </span>
                   <span className="font-bold text-slate-700 dark:text-slate-300">{metrics.hasPowerWord ? 'Yes' : 'No'}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
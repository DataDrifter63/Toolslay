"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link2, Share2, Copy, CheckCircle2, Settings2, QrCode, History, Globe, Search, Mail, Smartphone, Trash2 } from "lucide-react";

const PRESETS = [
  { id: "google", name: "Google Ads", icon: Search, source: "google", medium: "cpc", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "meta", name: "Meta Ads", icon: Share2, source: "facebook", medium: "paid_social", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  { id: "tiktok", name: "TikTok Ads", icon: Smartphone, source: "tiktok", medium: "paid_video", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  { id: "email", name: "Newsletter", icon: Mail, source: "newsletter", medium: "email", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
];

export default function UtmLinkBuilder() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [baseUrl, setBaseUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  
  const [forceLowercase, setForceLowercase] = useState(true);
  const [spaceChar, setSpaceChar] = useState("_");
  
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [vault, setVault] = useState([]);

  useEffect(() => {
    setIsMounted(true);
    const savedVault = localStorage.getItem("utm_vault");
    if (savedVault) {
      try { setVault(JSON.parse(savedVault)); } catch (e) {}
    }
  }, []);

  const formatParam = useCallback((str) => {
    if (!str) return "";
    let s = str.trim();
    if (forceLowercase) s = s.toLowerCase();
    s = s.replace(/\s+/g, spaceChar);
    return s;
  }, [forceLowercase, spaceChar]);

  useEffect(() => {
    if (!baseUrl.trim()) {
      setGeneratedUrl("");
      return;
    }

    let url = baseUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      if (source) params.set("utm_source", formatParam(source));
      if (medium) params.set("utm_medium", formatParam(medium));
      if (campaign) params.set("utm_campaign", formatParam(campaign));
      if (term) params.set("utm_term", formatParam(term));
      if (content) params.set("utm_content", formatParam(content));

      const paramStr = params.toString();
      urlObj.search = paramStr ? `?${paramStr}` : "";
      setGeneratedUrl(urlObj.toString());
    } catch (e) {
      let fallbackUrl = url;
      const params = new URLSearchParams();
      if (source) params.set("utm_source", formatParam(source));
      if (medium) params.set("utm_medium", formatParam(medium));
      if (campaign) params.set("utm_campaign", formatParam(campaign));
      if (term) params.set("utm_term", formatParam(term));
      if (content) params.set("utm_content", formatParam(content));
      
      const paramStr = params.toString();
      if (paramStr) {
        fallbackUrl += (fallbackUrl.includes("?") ? "&" : "?") + paramStr;
      }
      setGeneratedUrl(fallbackUrl);
    }
  }, [baseUrl, source, medium, campaign, term, content, formatParam]);

  const applyPreset = (preset) => {
    setSource(preset.source);
    setMedium(preset.medium);
    if (!campaign) setCampaign("promo_2026");
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const saveToVault = () => {
    if (!generatedUrl) return;
    const newEntry = {
      id: Date.now(),
      url: generatedUrl,
      campaign: campaign || "unnamed_campaign",
      date: new Date().toLocaleDateString()
    };
    const newVault = [newEntry, ...vault].slice(0, 10);
    setVault(newVault);
    localStorage.setItem("utm_vault", JSON.stringify(newVault));
  };

  const clearVault = () => {
    setVault([]);
    localStorage.removeItem("utm_vault");
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
            <Link2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">Pro UTM Builder</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Campaign Tracking Engine</p>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-bold text-slate-500">
           <History className="w-4 h-4" /> Vault: {vault.length}/10
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,450px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-6">
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" /> Destination URL (Required)
                </label>
                <input 
                  type="url" 
                  value={baseUrl} 
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="e.g. https://yourwebsite.com/product"
                  className="w-full text-base font-medium p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
             </div>

             <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">1-Click Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESETS.map(preset => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.02] active:scale-95 ${preset.bg}`}
                      >
                        <Icon className={`w-5 h-5 ${preset.color}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{preset.name}</span>
                      </button>
                    )
                  })}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Campaign Source <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. google, newsletter" className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100" />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Campaign Medium <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="e.g. cpc, email, banner" className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100" />
               </div>

               <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Campaign Name <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="e.g. summer_sale, black_friday" className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100" />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Campaign Term <span className="font-normal opacity-70">(Optional)</span>
                  </label>
                  <input type="text" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. running shoes" className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100" />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Campaign Content <span className="font-normal opacity-70">(Optional)</span>
                  </label>
                  <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="e.g. logolink, textlink" className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100" />
               </div>
             </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
             <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                 <Settings2 className="w-4 h-4 text-slate-400" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Data Cleanliness (GA4 Guard)</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm cursor-pointer border border-slate-100 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Force Lowercase</span>
                    <span className="block text-[10px] text-slate-500">Prevents "Fb" & "fb" split</span>
                  </div>
                  <input type="checkbox" checked={forceLowercase} onChange={(e) => setForceLowercase(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                </label>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Replace Spaces</span>
                    <span className="block text-[10px] text-slate-500">Safe URL formatting</span>
                  </div>
                  <select 
                    value={spaceChar} 
                    onChange={(e) => setSpaceChar(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-900 text-xs font-bold px-2 py-1.5 rounded outline-none text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="_">Underscore (_)</option>
                    <option value="-">Dash (-)</option>
                    <option value="%20">%20 (URL Space)</option>
                  </select>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6 min-w-0 flex flex-col sticky top-6">
           <div className={`border p-1 rounded-xl shadow-sm transition-all duration-300 ${generatedUrl ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 border-transparent shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-lg h-full flex flex-col gap-4">
                 <div className="flex justify-between items-start">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                     <Link2 className="w-4 h-4 text-indigo-500" /> Final Campaign URL
                   </h3>
                 </div>

                 <div className="bg-slate-50 dark:bg-[#0d1117] p-4 rounded-lg border border-slate-100 dark:border-slate-800 min-h-[100px] flex items-center justify-center break-all relative group">
                   {generatedUrl ? (
                     <p className="text-sm font-medium text-slate-800 dark:text-slate-300 leading-relaxed w-full">
                       {generatedUrl}
                     </p>
                   ) : (
                     <span className="text-sm font-semibold text-slate-400 opacity-50 text-center">
                       Enter Destination URL above to generate your tracking link.
                     </span>
                   )}
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={handleCopy}
                     disabled={!generatedUrl}
                     className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all shadow-sm ${
                       !generatedUrl 
                         ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                         : isCopied 
                           ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' 
                           : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 active:scale-[0.98]'
                     }`}
                   >
                     {isCopied ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                   </button>
                   
                   <button 
                     onClick={saveToVault}
                     disabled={!generatedUrl}
                     className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all border ${
                       !generatedUrl 
                         ? 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed' 
                         : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                     }`}
                   >
                     <History className="w-4 h-4" /> Save Link
                   </button>
                 </div>
              </div>
           </div>

           {generatedUrl && (
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm flex items-center gap-5 animate-in fade-in slide-in-from-top-4">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(generatedUrl)}`} 
                    alt="UTM QR Code"
                    className="w-20 h-20"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-indigo-500" /> Offline Tracking QR
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Scan this code to test your UTM parameters on mobile. Right-click the image to save it for print media.
                  </p>
                </div>
             </div>
           )}

           {vault.length > 0 && (
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col max-h-[300px]">
               <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-500" /> Recent Campaigns
                  </h3>
                  <button onClick={clearVault} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
               </div>
               
               <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                 {vault.map((entry) => (
                   <div key={entry.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg group transition-colors flex justify-between items-center gap-4">
                     <div className="min-w-0 flex-1">
                       <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 truncate">{entry.campaign}</span>
                         <span className="text-[9px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{entry.date}</span>
                       </div>
                       <p className="text-[10px] text-slate-500 truncate font-mono">{entry.url}</p>
                     </div>
                     <button 
                       onClick={() => { navigator.clipboard.writeText(entry.url); alert("Copied from Vault!"); }}
                       className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-all opacity-0 group-hover:opacity-100 shrink-0"
                       title="Copy URL"
                     >
                       <Copy className="w-4 h-4" />
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
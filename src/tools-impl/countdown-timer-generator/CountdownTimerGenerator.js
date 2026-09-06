"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Timer, Calendar, Code, Palette, Settings, Copy, CheckCircle2, Zap, LayoutTemplate } from "lucide-react";

const THEMES = [
  { id: "dark", name: "Midnight Pro", bg: "#1e293b", text: "#ffffff", accent: "#6366f1" },
  { id: "danger", name: "Urgency Red", bg: "#fef2f2", text: "#991b1b", accent: "#ef4444" },
  { id: "cyber", name: "Cyber Neon", bg: "#000000", text: "#00ffcc", accent: "#00ffcc" },
  { id: "clean", name: "Minimal White", bg: "#ffffff", text: "#333333", accent: "#10b981" }
];

export default function CountdownTimerGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const [widgetId, setWidgetId] = useState("timer-preview");

  const [mode, setMode] = useState("fixed");
  const [targetDate, setTargetDate] = useState("");
  const [evergreenMinutes, setEvergreenMinutes] = useState(15);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [title, setTitle] = useState("Limited Time Offer Ends In:");
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setWidgetId(`timer-${Math.random().toString(36).substr(2, 9)}`);
    setIsMounted(true);

    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(23, 59, 0, 0);
    const offset = tmrw.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(tmrw - offset)).toISOString().slice(0, 16);
    setTargetDate(localISOTime);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let interval;
    let endTime;

    if (mode === "fixed" && targetDate) {
      endTime = new Date(targetDate).getTime();
    } else if (mode === "evergreen") {
      endTime = Date.now() + evergreenMinutes * 60 * 1000;
    }

    const updateTimer = () => {
      const now = Date.now();
      const distance = endTime - now;

      if (distance < 0 || isNaN(distance)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (interval) clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [mode, targetDate, evergreenMinutes, isMounted]);

  const generateEmbedCode = useCallback(() => {
    const hexBg = activeTheme.bg;
    const hexText = activeTheme.text;
    const hexAccent = activeTheme.accent;

    let jsLogic = "";
    
    if (mode === "fixed") {
      let safeIsoDate = new Date().toISOString(); 
      if (targetDate) {
        const parsedDate = new Date(targetDate);
        if (!isNaN(parsedDate.getTime())) {
          safeIsoDate = parsedDate.toISOString();
        }
      }
      
      jsLogic = `
        var endTime = new Date("${safeIsoDate}").getTime();
      `;
    } else {
      jsLogic = `
        var timerKey = 'evg_${widgetId}';
        var endTime = localStorage.getItem(timerKey);
        if (!endTime || endTime < new Date().getTime()) {
          endTime = new Date().getTime() + (${evergreenMinutes} * 60 * 1000);
          localStorage.setItem(timerKey, endTime);
        }
      `;
    }

    const rawHtml = `
<!-- Pro Scarcity Embed Start -->
<div id="${widgetId}" style="font-family: system-ui, -apple-system, sans-serif; background: ${hexBg}; color: ${hexText}; padding: 24px; border-radius: 12px; text-align: center; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid ${hexAccent}33;">
  <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; font-weight: 700; color: ${hexText};">${title}</h3>
  <div style="display: flex; justify-content: center; gap: 12px;">
    <div style="display: flex; flex-direction: column; align-items: center; width: 70px;">
      <div id="${widgetId}-d" style="font-size: 32px; font-weight: 800; line-height: 1; color: ${hexAccent};">00</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; opacity: 0.7; font-weight: 600;">Days</div>
    </div>
    <div style="font-size: 32px; font-weight: 800; color: ${hexAccent}; opacity: 0.5;">:</div>
    <div style="display: flex; flex-direction: column; align-items: center; width: 70px;">
      <div id="${widgetId}-h" style="font-size: 32px; font-weight: 800; line-height: 1; color: ${hexAccent};">00</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; opacity: 0.7; font-weight: 600;">Hours</div>
    </div>
    <div style="font-size: 32px; font-weight: 800; color: ${hexAccent}; opacity: 0.5;">:</div>
    <div style="display: flex; flex-direction: column; align-items: center; width: 70px;">
      <div id="${widgetId}-m" style="font-size: 32px; font-weight: 800; line-height: 1; color: ${hexAccent};">00</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; opacity: 0.7; font-weight: 600;">Mins</div>
    </div>
    <div style="font-size: 32px; font-weight: 800; color: ${hexAccent}; opacity: 0.5;">:</div>
    <div style="display: flex; flex-direction: column; align-items: center; width: 70px;">
      <div id="${widgetId}-s" style="font-size: 32px; font-weight: 800; line-height: 1; color: ${hexAccent};">00</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; opacity: 0.7; font-weight: 600;">Secs</div>
    </div>
  </div>
</div>
<script>
  (function() {
    ${jsLogic}
    var updateTimer = setInterval(function() {
      var now = new Date().getTime();
      var distance = endTime - now;
      if (distance < 0 || isNaN(distance)) {
        clearInterval(updateTimer);
        return;
      }
      var d = Math.floor(distance / (1000 * 60 * 60 * 24));
      var h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var s = Math.floor((distance % (1000 * 60)) / 1000);
      
      document.getElementById('${widgetId}-d').innerText = d < 10 ? '0'+d : d;
      document.getElementById('${widgetId}-h').innerText = h < 10 ? '0'+h : h;
      document.getElementById('${widgetId}-m').innerText = m < 10 ? '0'+m : m;
      document.getElementById('${widgetId}-s').innerText = s < 10 ? '0'+s : s;
    }, 1000);
  })();
</script>
<!-- Pro Scarcity Embed End -->
    `;
    return rawHtml.trim();
  }, [mode, targetDate, evergreenMinutes, activeTheme, title, widgetId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const pad = (num) => (num < 10 ? `0${num}` : num);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-lg">
            <Timer className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">Pro Scarcity Engine</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Web/Shopify Embed Generator</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl flex gap-1 shadow-sm">
             <button 
               onClick={() => setMode("fixed")}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                 mode === "fixed" ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
               }`}
             >
               <Calendar className="w-4 h-4" /> Fixed Date
             </button>
             <button 
               onClick={() => setMode("evergreen")}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                 mode === "evergreen" ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/50" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
               }`}
             >
               <Zap className="w-4 h-4" /> Evergreen Mode
             </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-5">
             <div className="space-y-4">
               <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                 <Settings className="w-4 h-4 text-slate-400" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Timer Configuration</h3>
               </div>
               
               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Widget Title (Optional)</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Offer Ends In..."
                    className="w-full text-sm font-semibold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-rose-500 text-slate-800 dark:text-slate-100"
                  />
               </div>

               {mode === "fixed" ? (
                 <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">End Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={targetDate} 
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full text-sm font-semibold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-rose-500 text-slate-800 dark:text-slate-100"
                    />
                 </div>
               ) : (
                 <div className="space-y-2 animate-in fade-in slide-in-from-left-4">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex justify-between">
                      <span>Duration (Minutes)</span>
                      <span className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 rounded">Resets per visitor</span>
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={evergreenMinutes} 
                      onChange={(e) => setEvergreenMinutes(e.target.value)}
                      className="w-full text-sm font-semibold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-rose-500 text-slate-800 dark:text-slate-100"
                    />
                 </div>
               )}
             </div>

             <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                 <Palette className="w-4 h-4 text-slate-400" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Visual Theme</h3>
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setActiveTheme(theme)}
                      style={{ 
                        backgroundColor: theme.bg, 
                        color: theme.text,
                        borderColor: activeTheme.id === theme.id ? theme.accent : 'transparent'
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-transform ${activeTheme.id === theme.id ? 'scale-[1.02] shadow-md' : 'opacity-80 hover:opacity-100'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{theme.name}</span>
                      <div className="w-4 h-1 rounded-full mt-2" style={{ backgroundColor: theme.accent }}></div>
                    </button>
                  ))}
               </div>
             </div>
          </div>
        </div>

        {/* ✅ FIX: Added min-w-0 to prevent CSS Grid flex-blowout from the <pre> tag */}
        <div className="space-y-6 min-w-0 w-full">
           <div className="bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700 p-8 rounded-xl shadow-inner min-h-[250px] flex items-center justify-center relative overflow-hidden"
                style={{ 
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)', 
                  backgroundSize: '20px 20px' 
                }}>
             <div className="absolute top-4 left-4 flex items-center gap-2">
               <LayoutTemplate className="w-4 h-4 text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Preview</span>
             </div>

             <div 
               style={{ 
                 background: activeTheme.bg, 
                 color: activeTheme.text, 
                 borderColor: `${activeTheme.accent}33` 
               }}
               className="p-6 rounded-xl text-center w-full max-w-[500px] shadow-lg border relative z-10 transition-colors duration-300"
             >
                {title && (
                  <h3 className="mt-0 mb-4 text-lg font-bold" style={{ color: activeTheme.text }}>
                    {title}
                  </h3>
                )}
                <div className="flex justify-center gap-3">
                  {[
                    { label: "Days", val: timeLeft.days },
                    { label: "Hours", val: timeLeft.hours },
                    { label: "Mins", val: timeLeft.minutes },
                    { label: "Secs", val: timeLeft.seconds }
                  ].map((unit, i, arr) => (
                    <React.Fragment key={unit.label}>
                      <div className="flex flex-col items-center w-[70px]">
                        <div className="text-4xl font-extrabold leading-none tracking-tight" style={{ color: activeTheme.accent }}>
                          {pad(unit.val)}
                        </div>
                        <div className="text-[11px] uppercase tracking-widest mt-1.5 opacity-70 font-semibold">
                          {unit.label}
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                         <div className="text-4xl font-extrabold opacity-50" style={{ color: activeTheme.accent }}>:</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
             </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
             <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-slate-200 text-sm">HTML/JS Embed Code</h3>
                  <span className="bg-emerald-900/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ml-2 border border-emerald-800/50 hidden sm:inline-block">Works Anywhere</span>
                </div>
                <button 
                  onClick={handleCopyCode}
                  className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                    isCopied 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {isCopied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
                </button>
             </div>
             <div className="p-4 bg-[#0d1117] overflow-x-auto custom-scrollbar">
               <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre">
                 <code>{generateEmbedCode()}</code>
               </pre>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
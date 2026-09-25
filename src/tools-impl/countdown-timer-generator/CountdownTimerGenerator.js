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
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Timer className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Pro Scarcity Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Web / Shopify embed countdown timer generator.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-4 sm:gap-6 items-start w-full">
        
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-1.5 rounded-2xl flex gap-1 shadow-sm font-sans">
             <button 
               type="button"
               onClick={() => setMode("fixed")}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                 mode === "fixed" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"
               }`}
             >
               <Calendar className="w-3.5 h-3.5" /> Fixed Date
             </button>
             <button 
               type="button"
               onClick={() => setMode("evergreen")}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                 mode === "evergreen" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"
               }`}
             >
               <Zap className="w-3.5 h-3.5" /> Evergreen
             </button>
          </div>

          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-5 font-sans">
             <div className="space-y-4">
               <div className="flex items-center gap-1.5 border-b border-line pb-2">
                 <Settings className="w-3.5 h-3.5 text-brand" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">Timer Configuration</h3>
               </div>
               
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Widget Title (Optional)</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Offer Ends In..."
                    className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                  />
               </div>

               {mode === "fixed" ? (
                  <div className="space-y-1.5 animate-in fade-in">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">End Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={targetDate} 
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                    />
                  </div>
               ) : (
                  <div className="space-y-1.5 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted">Duration (Minutes)</label>
                      <span className="text-[9px] font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-lg">Resets per visitor</span>
                    </div>
                    <input 
                      type="number" 
                      min="1"
                      value={evergreenMinutes} 
                      onChange={(e) => setEvergreenMinutes(e.target.value)}
                      className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                    />
                  </div>
               )}
             </div>

             <div className="space-y-3 pt-4 border-t border-line">
               <div className="flex items-center gap-1.5 border-b border-line pb-2">
                 <Palette className="w-3.5 h-3.5 text-brand" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">Visual Theme</h3>
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setActiveTheme(theme)}
                      style={{ 
                        backgroundColor: theme.bg, 
                        color: theme.text,
                        borderColor: activeTheme.id === theme.id ? theme.accent : 'transparent'
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-transform ${activeTheme.id === theme.id ? 'scale-[1.02] shadow-sm' : 'opacity-80 hover:opacity-100'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{theme.name}</span>
                      <div className="w-4 h-1 rounded-full mt-2" style={{ backgroundColor: theme.accent }}></div>
                    </button>
                  ))}
               </div>
             </div>
          </div>
        </div>

        {/* RIGHT: PREVIEW & CODE */}
        <div className="space-y-4 sm:space-y-6 min-w-0 w-full">
           <div className="bg-surface border border-line p-6 sm:p-8 rounded-2xl shadow-sm min-h-[250px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-4 left-4 flex items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5 text-muted" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Live Preview</span>
              </div>

              <div 
                style={{ 
                  background: activeTheme.bg, 
                  color: activeTheme.text, 
                  borderColor: `${activeTheme.accent}33` 
                }}
                className="p-6 rounded-2xl text-center w-full max-w-[500px] shadow-card border relative z-10 transition-colors duration-300 font-sans"
              >
                {title && (
                  <h3 className="mt-0 mb-4 text-base sm:text-lg font-bold" style={{ color: activeTheme.text }}>
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
                        <div className="text-3xl sm:text-4xl font-extrabold leading-none tracking-tight font-mono" style={{ color: activeTheme.accent }}>
                          {pad(unit.val)}
                        </div>
                        <div className="text-[10px] sm:text-[11px] uppercase tracking-widest mt-1.5 opacity-70 font-semibold">
                          {unit.label}
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                         <div className="text-3xl sm:text-4xl font-extrabold opacity-50 font-mono" style={{ color: activeTheme.accent }}>:</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
           </div>

           <div className="bg-paper border border-line rounded-2xl overflow-hidden shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-line bg-surface font-sans">
                <div className="flex items-center gap-2 min-w-0">
                  <Code className="w-4 h-4 text-brand shrink-0" />
                  <h3 className="font-bold text-ink text-xs uppercase tracking-wider truncate">HTML/JS Embed Code</h3>
                  <span className="bg-brand/10 text-brand text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ml-1 border border-brand/20 hidden sm:inline-block">Works Anywhere</span>
                </div>
                <button 
                  type="button"
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                    isCopied 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                      : 'bg-surface border border-line text-ink hover:border-brand'
                  }`}
                >
                  {isCopied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
                </button>
              </div>
              <div className="p-4 bg-surface overflow-x-auto">
                <pre className="text-xs text-ink font-mono leading-relaxed whitespace-pre">
                  <code>{generateEmbedCode()}</code>
                </pre>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
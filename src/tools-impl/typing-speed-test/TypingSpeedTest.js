"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Keyboard, Clock, Target, Trophy, 
  RotateCcw, Flame, AlertCircle, Code, 
  Type, Activity, BarChart4, Zap, 
  Gauge, Skull, ChevronRight
} from "lucide-react";

// --- ADVANCED WORD BANKS ---
const WORD_BANKS = {
  prose: {
    easy: "the a is it to be and of in that have i for not on with he as you do at go me my up so out".split(" "),
    medium: "people history world family government system computer reading method understanding theory knowledge ability economics science literature management investment".split(" "),
    hard: "Zealous! Exquisite? multi-faceted O'Reilly co-operate 1984's Aesthetic, Jurisdiction. Xenophobia: Quixotic; Vulnerable() #hashtag @mention 100% $50.00".split(" ")
  },
  code: {
    easy: "let var const if for in of map set new this true null void int float char string bool".split(" "),
    medium: "function return console.log() setTimeout() async await Promise import export default class extends super typeof instanceof".split(" "),
    hard: "document.getElementById() Object.entries() Array.prototype.reduce() try{}catch(e){} (()=>{})() JSON.stringify() /[a-zA-Z0-9]+/g __dirname module.exports".split(" ")
  }
};

const DURATIONS = [15, 30, 60];
const MODES = [
  { id: "prose", label: "Prose", icon: Type },
  { id: "code", label: "Code", icon: Code }
];
const DIFFICULTIES = [
  { id: "easy", label: "Easy", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
  { id: "medium", label: "Normal", icon: Gauge, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  { id: "hard", label: "Hard", icon: Skull, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800" }
];

export default function TypingSpeedTest() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Settings
  const [duration, setDuration] = useState(30);
  const [mode, setMode] = useState(MODES[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]); // Default Medium
  
  // Test State
  const [status, setStatus] = useState("idle"); // idle, active, finished
  const [timeLeft, setTimeLeft] = useState(30);
  const [textToType, setTextToType] = useState("");
  const [userInput, setUserInput] = useState("");
  
  // Analytics State
  const [errors, setErrors] = useState({}); // { 'a': 3, 'k': 1 }
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  
  // Refs
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const arenaRef = useRef(null);

  // Initialize Text
  const generateText = () => {
    const bank = WORD_BANKS[mode.id][difficulty.id];
    let generated = [];
    // Generate 60 random words based on settings
    for(let i=0; i<60; i++) {
      generated.push(bank[Math.floor(Math.random() * bank.length)]);
    }
    setTextToType(generated.join(" "));
  };

  useEffect(() => {
    setIsMounted(true);
    generateText();
    setTimeLeft(duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, difficulty, duration]);

  // Timer Effect
  useEffect(() => {
    if (status === "active" && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && status === "active") {
      setStatus("finished");
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status, timeLeft]);

  // Handle Input
  const handleInputChange = (e) => {
    if (status === "finished") return;
    
    const val = e.target.value;
    
    // Prevent pasting chunks
    if (val.length - userInput.length > 1) return;

    if (status === "idle" && val.length > 0) {
      setStatus("active");
    }

    setTotalKeystrokes(prev => prev + 1);

    // Error Tracking (Heatmap)
    if (val.length > userInput.length) {
      const charIndex = val.length - 1;
      const expectedChar = textToType[charIndex];
      const typedChar = val[charIndex];

      if (expectedChar && typedChar !== expectedChar) {
        setErrors(prev => ({ ...prev, [expectedChar]: (prev[expectedChar] || 0) + 1 }));
      }
    }

    setUserInput(val);
  };

  // 100% Fixed Restart Logic
  const handleRestart = () => {
    clearInterval(timerRef.current);
    setStatus("idle");
    setTimeLeft(duration);
    setUserInput("");
    setErrors({});
    setTotalKeystrokes(0);
    generateText();
    
    // Force focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      // Scroll to arena if on mobile
      arenaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  // Advanced Metric Calculations
  const metrics = useMemo(() => {
    const totalTyped = userInput.length;
    let correctChars = 0;
    
    for (let i = 0; i < totalTyped; i++) {
      if (userInput[i] === textToType[i]) correctChars++;
    }

    const uncorrectedErrors = totalTyped - correctChars;
    const timeElapsedMins = (duration - timeLeft) / 60 || 0.01; 
    
    const rawWpm = Math.round((totalTyped / 5) / timeElapsedMins);
    const netWpm = Math.round(Math.max(0, rawWpm - (uncorrectedErrors / timeElapsedMins)));
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

    const troubleKeys = Object.entries(errors)
      .filter(([key]) => key !== " ")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return { rawWpm, netWpm, accuracy, correctChars, uncorrectedErrors, troubleKeys };
  }, [userInput, textToType, duration, timeLeft, errors]);

  // Helper to click anywhere in arena to focus
  const handleAreaClick = () => {
    if (status !== "finished") inputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header - Dims & Hides during active typing for Immersive Focus */}
      <div className={`transition-all duration-700 ease-in-out ${status === "active" ? "opacity-0 h-0 overflow-hidden mb-0 scale-95" : "opacity-100 h-auto scale-100 mb-6"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-100 to-transparent dark:from-indigo-900/20 rounded-bl-full -z-10 opacity-70"></div>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3.5 rounded-2xl">
              <Keyboard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Typing Speed Engine
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Pro-Level Analytics & WPM Tracker
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6" ref={arenaRef}>
        
        {/* ================= CONTROLS & TEST ARENA ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-[2rem] shadow-sm relative overflow-hidden transition-all duration-500">
          
          {/* Top Controls - Completely hides when testing */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-500 origin-top ${status === "active" ? "opacity-0 h-0 overflow-hidden scale-y-0" : "opacity-100 h-auto mb-8 scale-y-100"}`}>
            
            {/* Left Controls (Mode & Duration) */}
            <div className="flex flex-wrap gap-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
                {MODES.map((m) => (
                  <button 
                    key={m.id} onClick={() => { setMode(m); setStatus("idle"); }} 
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode.id === m.id ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  >
                    <m.icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                ))}
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
                {DURATIONS.map((sec) => (
                  <button 
                    key={sec} onClick={() => { setDuration(sec); setTimeLeft(sec); setStatus("idle"); }} 
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${duration === sec ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Right Control (Difficulty) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner w-full sm:w-auto">
              {DIFFICULTIES.map((d) => (
                <button 
                  key={d.id} onClick={() => { setDifficulty(d); setStatus("idle"); }} 
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${difficulty.id === d.id ? `${d.bg} ${d.color} shadow-sm border ${d.border}` : "text-slate-500 border border-transparent hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <d.icon className="w-3.5 h-3.5" /> {d.label}
                </button>
              ))}
            </div>
            
          </div>

          {/* Live Metrics Header */}
          <div className={`flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 transition-all duration-300 ${status === "finished" ? "opacity-0 h-0 overflow-hidden mb-0 pb-0" : "opacity-100"}`}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${timeLeft <= 10 && status === "active" ? 'text-rose-500 animate-pulse' : 'text-indigo-500'}`} />
                <span className={`text-3xl font-black tabular-nums tracking-tighter ${timeLeft <= 10 && status === "active" ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
                  00:{timeLeft.toString().padStart(2, '0')}
                </span>
              </div>
              
              {/* Live Live WPM updates only when active */}
              {status === "active" && (
                <div className="hidden sm:flex items-center gap-2 animate-in fade-in zoom-in slide-in-from-left-4">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-xl font-black tabular-nums text-emerald-500">
                    {metrics.netWpm} <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/50">WPM</span>
                  </span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleRestart}
              className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl"
            >
              <RotateCcw className="w-4 h-4" /> Restart
            </button>
          </div>

          {/* Typing Area */}
          <div 
            className={`relative cursor-text select-none transition-all duration-500 ${status === "finished" ? "h-0 opacity-0 overflow-hidden" : "min-h-[220px] opacity-100"}`}
            onClick={handleAreaClick}
          >
            {/* Hidden Input field */}
            <input 
              ref={inputRef}
              type="text"
              className="absolute opacity-0 -z-10 w-0 h-0"
              value={userInput}
              onChange={handleInputChange}
              onBlur={() => status === "active" && setStatus("idle")} // Pause
              disabled={status === "finished"}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            
            {/* The Text Renderer */}
            <div className="text-[26px] sm:text-[32px] font-mono leading-[1.6] tracking-wide flex flex-wrap gap-x-[12px] gap-y-1">
              {textToType.split(" ").map((word, wordIdx) => {
                const isCurrentWord = userInput.split(" ").length - 1 === wordIdx;
                const isPastWord = userInput.split(" ").length - 1 > wordIdx;
                
                // Determine if past word has error to underline it
                let wordHasError = false;
                if (isPastWord) {
                  const typedWord = userInput.split(" ")[wordIdx];
                  if (typedWord !== word) wordHasError = true;
                }
                
                return (
                  <div key={wordIdx} className={`relative rounded transition-colors ${isCurrentWord ? 'bg-slate-100/80 dark:bg-slate-800/80' : ''} ${wordHasError ? 'border-b-4 border-rose-500/50' : ''}`}>
                    {word.split("").map((char, charIdx) => {
                      const prevWordsLength = textToType.split(" ").slice(0, wordIdx).join(" ").length;
                      const globalIndex = wordIdx === 0 ? charIdx : prevWordsLength + 1 + charIdx;
                      
                      const typedChar = userInput[globalIndex];
                      let colorClass = "text-slate-300 dark:text-slate-600"; // pending
                      
                      if (typedChar) {
                        if (typedChar === char) {
                          colorClass = "text-slate-800 dark:text-slate-100"; // correct
                        } else {
                          colorClass = "text-rose-500 bg-rose-500/20 rounded"; // incorrect
                        }
                      }

                      const isCursor = userInput.length === globalIndex && status !== "finished";

                      return (
                        <span key={charIdx} className={`relative ${colorClass}`}>
                          {char}
                          {isCursor && (
                            <span className="absolute -left-[2px] top-[10%] bottom-[10%] w-[3px] bg-indigo-500 animate-pulse z-10 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                          )}
                        </span>
                      );
                    })}
                    
                    {/* Extra typed characters */}
                    {isCurrentWord && userInput.split(" ")[wordIdx]?.length > word.length && (
                      <span className="text-rose-500 bg-rose-500/20 rounded opacity-80">
                        {userInput.split(" ")[wordIdx].slice(word.length)}
                      </span>
                    )}

                    {/* Cursor at the end of word */}
                    {isCurrentWord && userInput.length === textToType.split(" ").slice(0, wordIdx + 1).join(" ").length && status !== "finished" && (
                      <span className="absolute -right-[6px] top-[10%] bottom-[10%] w-[3px] bg-indigo-500 animate-pulse z-10 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Click to focus overlay */}
            {status === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-xl z-20">
                <span className="bg-indigo-600 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(99,102,241,0.4)] flex items-center gap-3 animate-bounce">
                  <Keyboard className="w-5 h-5" /> Click or Start Typing
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ================= RESULTS DASHBOARD (Stunning UI) ================= */}
        {status === "finished" && (
          <div className="bg-white dark:bg-[#0d1117] border-2 border-indigo-500/30 dark:border-indigo-500/20 p-2 sm:p-3 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-500 slide-in-from-bottom-8">
            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-[2rem] p-6 sm:p-10">
              
              <div className="text-center mb-10">
                <span className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-sm mb-4">
                  <Trophy className="w-4 h-4" /> Test Complete
                </span>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  {difficulty.label} Mode • {mode.label} • {duration} Seconds
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                
                {/* WPM Main Score */}
                <div className="md:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden flex flex-col items-center justify-center text-center group transform transition-transform hover:scale-[1.02]">
                  <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Flame className="w-48 h-48 text-indigo-500" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Net Speed</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl lg:text-8xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter tabular-nums leading-none drop-shadow-md">
                      {metrics.netWpm}
                    </span>
                    <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">WPM</span>
                  </div>
                </div>

                {/* Accuracy & Keystrokes Stack */}
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                  
                  {/* Accuracy */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-slate-400" /> Accuracy
                    </span>
                    <span className={`text-5xl font-black tabular-nums tracking-tight ${metrics.accuracy >= 95 ? 'text-emerald-500 drop-shadow-sm' : 'text-amber-500'}`}>
                      {metrics.accuracy}%
                    </span>
                  </div>

                  {/* Raw Speed */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 flex items-center gap-1.5">
                      <BarChart4 className="w-4 h-4 text-slate-400" /> Raw Speed
                    </span>
                    <span className="text-5xl font-black text-slate-800 dark:text-slate-100 tabular-nums tracking-tight">
                      {metrics.rawWpm}
                    </span>
                  </div>

                  {/* Keystroke Breakdown (Full Width in its grid) */}
                  <div className="col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-around items-center">
                    <div className="text-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Keys</span>
                      <span className="text-xl font-black text-slate-700 dark:text-slate-300">{totalKeystrokes}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="text-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Correct</span>
                      <span className="text-xl font-black text-emerald-500">{metrics.correctChars}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="text-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Errors</span>
                      <span className="text-xl font-black text-rose-500">{metrics.uncorrectedErrors}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Advanced Analytics & CTA */}
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                
                <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500" /> Trouble Keys (Missed Most)
                  </h4>
                  {metrics.troubleKeys.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {metrics.troubleKeys.map(([key, count], idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                          <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-sm">
                            <span className="text-lg font-mono font-black text-slate-800 dark:text-slate-100">{key}</span>
                          </div>
                          <div>
                            <span className="block text-xs font-black text-rose-500">{count} Errors</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Mistyped</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-16 flex items-center justify-center text-xs font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                      Perfect Precision! No recurring errors.
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-auto shrink-0">
                  <button 
                    onClick={handleRestart}
                    className="w-full lg:w-auto px-10 py-6 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-sm shadow-[0_15px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                  >
                    Test Again <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Zap, Target, RotateCcw, Trophy, 
  AlertTriangle, Copy, CheckCircle2, 
  Activity, Info, Gauge, Clock, 
  Sparkles, Brain, Flame
} from "lucide-react";

const MODES = [
  { id: "visual", label: "Classic Visual", icon: Zap, desc: "Click as soon as screen turns GREEN" },
  { id: "target", label: "Aim & Target", icon: Target, desc: "Click the target wherever it appears" },
  { id: "choice", label: "Choice (Go / No-Go)", icon: Brain, desc: "Click GREEN only! Ignore RED" }
];

export default function ReactionTimeTest() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Game Configuration
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  
  // Test State: 'idle' | 'waiting' | 'ready' | 'too_soon' | 'result' | 'finished'
  const [gameState, setGameState] = useState("idle");
  const [attempts, setAttempts] = useState([]); // Array of ms values
  const [currentMs, setCurrentMs] = useState(null);
  const [choiceColor, setChoiceColor] = useState("green"); // For choice mode: 'green' or 'red'
  
  // Target position for Aim mode
  const [targetPos, setTargetPos] = useState({ top: "50%", left: "50%" });
  
  // Analytics / Interactivity
  const [copied, setCopied] = useState(false);

  // Refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => clearTimeout(timerRef.current);
  }, []);

  // Trigger next randomized attempt timer
  const startWaitTimer = () => {
    setGameState("waiting");
    clearTimeout(timerRef.current);
    
    // Randomized delay between 2 to 5 seconds
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;
    
    timerRef.current = setTimeout(() => {
      // Setup Ready State
      if (selectedMode.id === "target") {
        const randomTop = Math.floor(Math.random() * 70 + 15) + "%";
        const randomLeft = Math.floor(Math.random() * 70 + 15) + "%";
        setTargetPos({ top: randomTop, left: randomLeft });
      } else if (selectedMode.id === "choice") {
        // 75% chance green, 25% chance red
        const isGreen = Math.random() > 0.25;
        setChoiceColor(isGreen ? "green" : "red");
      }
      
      startTimeRef.current = Date.now();
      setGameState("ready");

      // Auto-fail if choice red is shown and user correctly waits 1.5s
      if (selectedMode.id === "choice") {
        // Handled in click logic or timeout
      }
    }, randomDelay);
  };

  // Main Arena Click Handler
  const handleArenaClick = (e) => {
    // Prevent button bubbling double triggers
    if (e && e.stopPropagation) e.stopPropagation();

    if (gameState === "idle") {
      setAttempts([]);
      startWaitTimer();
    } else if (gameState === "waiting") {
      // Early Click Penalty
      clearTimeout(timerRef.current);
      setGameState("too_soon");
    } else if (gameState === "ready") {
      const ms = Date.now() - startTimeRef.current;
      
      // Choice mode red penalty check
      if (selectedMode.id === "choice" && choiceColor === "red") {
        setGameState("too_soon");
        return;
      }

      setCurrentMs(ms);
      const newAttempts = [...attempts, ms];
      setAttempts(newAttempts);

      if (newAttempts.length >= 5) {
        setGameState("finished");
      } else {
        setGameState("result");
      }
    } else if (gameState === "too_soon" || gameState === "result") {
      startWaitTimer();
    }
  };

  const handleReset = () => {
    clearTimeout(timerRef.current);
    setGameState("idle");
    setAttempts([]);
    setCurrentMs(null);
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    handleReset();
  };

  // Metrics & Ranking Calculation
  const stats = useMemo(() => {
    if (attempts.length === 0) return null;
    
    const sum = attempts.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / attempts.length);
    const best = Math.min(...attempts);
    const worst = Math.max(...attempts);
    
    // Standard Deviation (Consistency)
    const variance = attempts.reduce((acc, curr) => acc + Math.pow(curr - avg, 2), 0) / attempts.length;
    const stdDev = Math.round(Math.sqrt(variance));

    // Rank Engine
    let rank = { title: "Average Human", badge: "👤", color: "text-amber-500", desc: "Standard human visual response time." };
    if (avg < 190) {
      rank = { title: "F1 Driver Reflexes", badge: "⚡", color: "text-cyan-500", desc: "Top 0.1% superhuman reflex speed!" };
    } else if (avg < 230) {
      rank = { title: "Esports Pro Grade", badge: "🎮", color: "text-indigo-500", desc: "Exceptional motor & spatial reflexes." };
    } else if (avg < 270) {
      rank = { title: "Faster Than Average", badge: "🏎️", color: "text-emerald-500", desc: "Quicker than 75% of participants." };
    } else if (avg > 350) {
      rank = { title: "Sleepy Sloth", badge: "🦥", color: "text-rose-500", desc: "Slower than average. Try staying focused!" };
    }

    return { avg, best, worst, stdDev, rank };
  }, [attempts]);

  const handleCopy = () => {
    if (!stats) return;
    const text = `⚡ My Reaction Speed Test Results (${selectedMode.label}):\n• Average: ${stats.avg} ms\n• Best: ${stats.best} ms\n• Rank: ${stats.rank.badge} ${stats.rank.title}\nTested on Muxair Utility Tools`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-100 to-transparent dark:from-amber-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/30 p-3.5 rounded-2xl">
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Reaction Speed Test
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Reflex, Aim & Cognitive Response Engine
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Mode Selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isActive = selectedMode.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeSelect(m)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-2 ${
                    isActive
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      {m.label}
                    </span>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN INTERACTIVE TEST ARENA */}
        {gameState !== "finished" ? (
          <div
            onClick={selectedMode.id === "target" && gameState === "ready" ? undefined : handleArenaClick}
            className={`relative w-full h-[400px] rounded-[2.5rem] border-4 shadow-xl cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center p-8 text-center overflow-hidden ${
              gameState === "idle" ? "bg-slate-900 border-slate-800 text-white" :
              gameState === "waiting" ? "bg-rose-600 border-rose-500 text-white" :
              gameState === "ready" ? (selectedMode.id === "choice" && choiceColor === "red" ? "bg-rose-600 border-rose-500 text-white" : "bg-emerald-500 border-emerald-400 text-white") :
              gameState === "too_soon" ? "bg-amber-500 border-amber-400 text-white" :
              "bg-sky-600 border-sky-500 text-white"
            }`}
          >
            {/* Round Tracker Badge */}
            <div className="absolute top-6 left-6 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white/80 border border-white/10">
              Attempt {attempts.length} / 5
            </div>

            {/* Arena Content States */}
            {gameState === "idle" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto border border-white/20">
                  <Zap className="w-10 h-10 text-amber-400 animate-pulse" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Click Anywhere to Start
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                  {selectedMode.desc}
                </p>
              </div>
            )}

            {gameState === "waiting" && (
              <div className="space-y-4 animate-in fade-in">
                <Clock className="w-16 h-16 text-white/80 animate-spin mx-auto" />
                <h3 className="text-4xl font-black tracking-tight">
                  Wait for Green...
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Do not click yet!
                </p>
              </div>
            )}

            {gameState === "ready" && (
              <>
                {selectedMode.id === "target" ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleArenaClick(); }}
                    style={{ top: targetPos.top, left: targetPos.left }}
                    className="absolute w-20 h-20 rounded-full bg-white text-slate-900 border-4 border-slate-900 flex items-center justify-center shadow-2xl animate-in zoom-in-50 duration-150 active:scale-95"
                  >
                    <Target className="w-10 h-10 text-emerald-600" />
                  </button>
                ) : selectedMode.id === "choice" && choiceColor === "red" ? (
                  <div className="space-y-4 animate-in zoom-in-95">
                    <AlertTriangle className="w-20 h-20 text-white mx-auto animate-bounce" />
                    <h3 className="text-5xl font-black tracking-tight">STOP! DON'T CLICK!</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/80">Red Light Penalty</p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in zoom-in-95">
                    <Zap className="w-20 h-20 text-white mx-auto animate-bounce" />
                    <h3 className="text-6xl font-black tracking-tight">CLICK NOW!</h3>
                  </div>
                )}
              </>
            )}

            {gameState === "too_soon" && (
              <div className="space-y-4 animate-in fade-in">
                <AlertTriangle className="w-16 h-16 text-white mx-auto" />
                <h3 className="text-4xl font-black tracking-tight">Too Soon!</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                  You clicked before green appeared. Click to try again.
                </p>
              </div>
            )}

            {gameState === "result" && (
              <div className="space-y-4 animate-in zoom-in-95">
                <div className="text-7xl font-black tracking-tighter tabular-nums">
                  {currentMs} <span className="text-2xl font-bold uppercase tracking-widest">ms</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                  Click anywhere to continue to attempt {attempts.length + 1}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* RESULTS DASHBOARD */
          <div className="bg-white dark:bg-[#0d1117] border-2 border-amber-500/30 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
            {stats && (
              <div className="space-y-8">
                
                {/* Grand Rank Banner */}
                <div className="text-center pb-8 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-6xl block mb-3">{stats.rank.badge}</span>
                  <h3 className={`text-3xl sm:text-4xl font-black tracking-tight ${stats.rank.color} mb-2`}>
                    {stats.rank.title}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {stats.rank.desc}
                  </p>
                </div>

                {/* Core Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Average Speed
                    </span>
                    <span className="text-4xl font-black text-amber-500 tabular-nums">
                      {stats.avg} <span className="text-xs font-bold text-slate-400">ms</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Best Attempt
                    </span>
                    <span className="text-4xl font-black text-emerald-500 tabular-nums">
                      {stats.best} <span className="text-xs font-bold text-slate-400">ms</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Worst Attempt
                    </span>
                    <span className="text-4xl font-black text-slate-700 dark:text-slate-300 tabular-nums">
                      {stats.worst} <span className="text-xs font-bold text-slate-400">ms</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Consistency (±)
                    </span>
                    <span className="text-4xl font-black text-indigo-500 tabular-nums">
                      {stats.stdDev} <span className="text-xs font-bold text-slate-400">ms</span>
                    </span>
                  </div>
                </div>

                {/* Individual Attempt Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-500" /> Round Breakdown
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {attempts.map((ms, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          #{idx + 1}
                        </span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">
                          {ms} ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" /> Test Again
                  </button>

                  <button
                    onClick={handleCopy}
                    className="py-4 px-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Copied</> : <><Copy className="w-5 h-5" /> Share Score</>}
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
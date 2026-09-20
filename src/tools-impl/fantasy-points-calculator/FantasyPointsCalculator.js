"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Trophy, Calculator, Activity, BarChart3, 
  UserPlus, X, Target, Zap, ShieldAlert,
  ChevronRight, Save, LayoutDashboard
} from "lucide-react";

// --- SCORING RULES CONFIGURATION ---
const SCORING = {
  passingYards: 0.04, // 1 pt per 25 yds
  passingTD: 4,
  interceptions: -2,
  rushingYards: 0.1,  // 1 pt per 10 yds
  rushingTD: 6,
  receivingYards: 0.1, // 1 pt per 10 yds
  receivingTD: 6,
  fumblesLost: -2,
  twoPointConv: 2
};

const FORMATS = [
  { id: "standard", label: "Standard", ppr: 0 },
  { id: "half", label: "Half-PPR", ppr: 0.5 },
  { id: "full", label: "Full-PPR", ppr: 1 }
];

const POSITIONS = [
  { id: "QB", label: "Quarterback", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
  { id: "RB", label: "Running Back", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
  { id: "WR", label: "Wide Receiver", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  { id: "TE", label: "Tight End", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800" }
];

export default function FantasyPointsCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Settings
  const [format, setFormat] = useState(FORMATS[2]); // Default Full-PPR
  const [position, setPosition] = useState(POSITIONS[0]);
  const [playerName, setPlayerName] = useState("");
  
  // Stats State
  const [stats, setStats] = useState({
    passYds: "", passTD: "", ints: "",
    rushYds: "", rushTD: "",
    rec: "", recYds: "", recTD: "",
    fumbles: "", twoPt: ""
  });

  // Bench / Roster History
  const [bench, setBench] = useState([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStatChange = (field, value) => {
    // Only allow numbers
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setStats(prev => ({ ...prev, [field]: value }));
    }
  };

  // --- CORE CALCULATION ENGINE ---
  const calculations = useMemo(() => {
    const pYds = parseFloat(stats.passYds) || 0;
    const pTD = parseFloat(stats.passTD) || 0;
    const ints = parseFloat(stats.ints) || 0;
    
    const rYds = parseFloat(stats.rushYds) || 0;
    const rTD = parseFloat(stats.rushTD) || 0;
    
    const rec = parseFloat(stats.rec) || 0;
    const recYds = parseFloat(stats.recYds) || 0;
    const recTD = parseFloat(stats.recTD) || 0;
    
    const fumb = parseFloat(stats.fumbles) || 0;
    const twoPt = parseFloat(stats.twoPt) || 0;

    const passingPts = (pYds * SCORING.passingYards) + (pTD * SCORING.passingTD);
    const rushingPts = (rYds * SCORING.rushingYards) + (rTD * SCORING.rushingTD);
    const receivingPts = (rec * format.ppr) + (recYds * SCORING.receivingYards) + (recTD * SCORING.receivingTD);
    const bonusPts = (twoPt * SCORING.twoPointConv);
    const negativePts = (ints * SCORING.interceptions) + (fumb * SCORING.fumblesLost);

    const total = passingPts + rushingPts + receivingPts + bonusPts + negativePts;
    
    // For visual bars (ignoring negative for scale)
    const grossTotal = passingPts + rushingPts + receivingPts + bonusPts || 1; 

    return {
      passingPts, rushingPts, receivingPts, bonusPts, negativePts, total,
      pctPass: Math.max(0, (passingPts / grossTotal) * 100),
      pctRush: Math.max(0, (rushingPts / grossTotal) * 100),
      pctRec: Math.max(0, (receivingPts / grossTotal) * 100)
    };
  }, [stats, format]);

  const addToBench = () => {
    if (calculations.total === 0 && !playerName) return;
    
    const newPlayer = {
      id: Date.now(),
      name: playerName || `Unnamed ${position.id}`,
      pos: position.id,
      format: format.label,
      pts: calculations.total.toFixed(2),
      breakdown: { ...calculations }
    };
    
    setBench(prev => [newPlayer, ...prev].slice(0, 10)); // Keep last 10
    
    // Reset inputs
    setPlayerName("");
    setStats({
      passYds: "", passTD: "", ints: "",
      rushYds: "", rushTD: "", rec: "", 
      recYds: "", recTD: "", fumbles: "", twoPt: ""
    });
  };

  const removePlayer = (id) => {
    setBench(prev => prev.filter(p => p.id !== id));
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100 via-teal-50 to-transparent dark:from-emerald-900/30 dark:via-teal-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3.5 rounded-2xl shadow-md">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Muxair Fantasy Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Pro Stat Calculator & Bench Roster
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: STATS INPUT ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Top Config: Format & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" /> League Scoring
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
                  {FORMATS.map((f) => (
                    <button 
                      key={f.id} onClick={() => setFormat(f)}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${format.id === f.id ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Player Position
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
                  {POSITIONS.map((p) => (
                    <button 
                      key={p.id} onClick={() => setPosition(p)}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${position.id === p.id ? `${p.bg} ${p.color} border ${p.border} shadow-sm` : "text-slate-500 border border-transparent hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Main Stat Grid */}
            <div className="space-y-6">
              
              <div className="relative">
                <input
                  type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Player Name (Optional)"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Dynamic Grids based on Position */}
              <div className="space-y-5">
                
                {/* PASSING (Highlighted for QB) */}
                <div className={`p-4 rounded-2xl border transition-all ${position.id === 'QB' ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${position.id === 'QB' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                    <Target className="w-3.5 h-3.5" /> Passing Stats
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Yards</label>
                      <input type="text" value={stats.passYds} onChange={(e) => handleStatChange("passYds", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Touchdowns</label>
                      <input type="text" value={stats.passTD} onChange={(e) => handleStatChange("passTD", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Interceptions</label>
                      <input type="text" value={stats.ints} onChange={(e) => handleStatChange("ints", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-rose-500" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* RUSHING (Highlighted for RB) */}
                <div className={`p-4 rounded-2xl border transition-all ${position.id === 'RB' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${position.id === 'RB' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                    <Zap className="w-3.5 h-3.5" /> Rushing Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Yards</label>
                      <input type="text" value={stats.rushYds} onChange={(e) => handleStatChange("rushYds", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Touchdowns</label>
                      <input type="text" value={stats.rushTD} onChange={(e) => handleStatChange("rushTD", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* RECEIVING (Highlighted for WR/TE) */}
                <div className={`p-4 rounded-2xl border transition-all ${['WR', 'TE'].includes(position.id) ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${['WR', 'TE'].includes(position.id) ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                    <Activity className="w-3.5 h-3.5" /> Receiving Stats
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Receptions</label>
                      <input type="text" value={stats.rec} onChange={(e) => handleStatChange("rec", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-amber-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Yards</label>
                      <input type="text" value={stats.recYds} onChange={(e) => handleStatChange("recYds", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-amber-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Touchdowns</label>
                      <input type="text" value={stats.recTD} onChange={(e) => handleStatChange("recTD", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-amber-500" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* MISC (Fumbles / 2PT) */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-rose-500"/> Fumbles Lost</label>
                      <input type="text" value={stats.fumbles} onChange={(e) => handleStatChange("fumbles", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-rose-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">2-Pt Conversions</label>
                      <input type="text" value={stats.twoPt} onChange={(e) => handleStatChange("twoPt", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-slate-500" placeholder="0" />
                    </div>
                </div>

              </div>
            </div>

            <button
              onClick={addToBench}
              disabled={calculations.total === 0 && !playerName}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Save to Roster Bench
            </button>
            
          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD & ROSTER ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[650px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Calculator className="w-4 h-4 text-emerald-500" /> Active Calculation
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-sm border ${position.border} ${position.bg} ${position.color}`}>
                  {position.id} • {format.label}
                </span>
              </div>

              {/* LIVE POINTS DISPLAY */}
              <div className="text-center mb-8 bg-white dark:bg-slate-900 py-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-5">
                  <Trophy className="w-32 h-32 text-emerald-500" />
                </div>
                <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Total Fantasy Points</span>
                <div className="flex items-end justify-center gap-2">
                  <span className={`text-6xl sm:text-7xl font-black tabular-nums tracking-tighter leading-none ${calculations.total < 0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {calculations.total.toFixed(2)}
                  </span>
                  <span className="text-xl font-bold text-slate-400 mb-1">pts</span>
                </div>
                
                {/* Visual Point Breakdown Bar */}
                {calculations.total > 0 && (
                  <div className="w-3/4 mx-auto mt-6">
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {calculations.pctPass > 0 && <div style={{ width: `${calculations.pctPass}%` }} className="bg-blue-500" title={`Passing: ${calculations.passingPts} pts`}></div>}
                      {calculations.pctRush > 0 && <div style={{ width: `${calculations.pctRush}%` }} className="bg-emerald-500" title={`Rushing: ${calculations.rushingPts} pts`}></div>}
                      {calculations.pctRec > 0 && <div style={{ width: `${calculations.pctRec}%` }} className="bg-amber-500" title={`Receiving: ${calculations.receivingPts} pts`}></div>}
                    </div>
                    <div className="flex justify-between mt-2 px-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                      {calculations.pctPass > 0 && <span className="text-blue-500">Pass</span>}
                      {calculations.pctRush > 0 && <span className="text-emerald-500">Rush</span>}
                      {calculations.pctRec > 0 && <span className="text-amber-500">Rec</span>}
                    </div>
                  </div>
                )}
                
                {calculations.negativePts < 0 && (
                  <span className="block mt-4 text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                    Includes {calculations.negativePts} penalty points
                  </span>
                )}
              </div>

              {/* ROSTER BENCH */}
              <div className="flex-1 flex flex-col min-h-0">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5 shrink-0">
                  <BarChart3 className="w-3.5 h-3.5" /> Roster Bench (Comparison)
                </h4>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  {bench.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <UserPlus className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No players on bench.<br/>Calculate and save to compare.</p>
                    </div>
                  ) : (
                    bench.map((player) => {
                      const pColor = POSITIONS.find(p => p.id === player.pos)?.color || "text-slate-500";
                      return (
                        <div key={player.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between hover:border-emerald-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                              <span className={`text-xs font-black ${pColor}`}>{player.pos}</span>
                            </div>
                            <div>
                              <span className="block text-sm font-black text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                                {player.name}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                {player.format}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">
                              {player.pts}
                            </span>
                            <button 
                              onClick={() => removePlayer(player.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })
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
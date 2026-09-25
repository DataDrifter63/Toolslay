"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Trophy, Calculator, Activity, BarChart3, 
  UserPlus, X, Target, Zap, ShieldAlert,
  ChevronRight, Save, LayoutDashboard
} from "lucide-react";

const SCORING = {
  passingYards: 0.04,
  passingTD: 4,
  interceptions: -2,
  rushingYards: 0.1,
  rushingTD: 6,
  receivingYards: 0.1,
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
  { id: "QB", label: "Quarterback" },
  { id: "RB", label: "Running Back" },
  { id: "WR", label: "Wide Receiver" },
  { id: "TE", label: "Tight End" }
];

export default function FantasyPointsCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [format, setFormat] = useState(FORMATS[2]);
  const [position, setPosition] = useState(POSITIONS[0]);
  const [playerName, setPlayerName] = useState("");
  
  const [stats, setStats] = useState({
    passYds: "", passTD: "", ints: "",
    rushYds: "", rushTD: "",
    rec: "", recYds: "", recTD: "",
    fumbles: "", twoPt: ""
  });

  const [bench, setBench] = useState([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStatChange = (field, value) => {
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setStats(prev => ({ ...prev, [field]: value }));
    }
  };

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
    
    setBench(prev => [newPlayer, ...prev].slice(0, 10));
    
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
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Muxair Fantasy Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Pro stat calculator and bench roster comparison tool.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: STATS INPUT ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-5 font-sans">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-line pb-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-brand" /> League Scoring
                </label>
                <div className="flex bg-surface border border-line rounded-xl p-1">
                  {FORMATS.map((f) => (
                    <button 
                      key={f.id} type="button" onClick={() => setFormat(f)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${format.id === f.id ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-brand" /> Position
                </label>
                <div className="flex bg-surface border border-line rounded-xl p-1">
                  {POSITIONS.map((p) => (
                    <button 
                      key={p.id} type="button" onClick={() => setPosition(p)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${position.id === p.id ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
                    >
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Player Name (Optional)"
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-3">
                
                {/* PASSING */}
                <div className="p-3.5 rounded-xl border border-line bg-surface">
                  <h4 className="text-[10px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-ink">
                    <Target className="w-3.5 h-3.5 text-brand" /> Passing Stats
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[9px] font-bold text-muted mb-1">Yards</label>
                      <input type="text" value={stats.passYds} onChange={(e) => handleStatChange("passYds", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted mb-1">TDs</label>
                      <input type="text" value={stats.passTD} onChange={(e) => handleStatChange("passTD", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted mb-1">INTs</label>
                      <input type="text" value={stats.ints} onChange={(e) => handleStatChange("ints", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-rose-500" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* RUSHING */}
                <div className="p-3.5 rounded-xl border border-line bg-surface">
                  <h4 className="text-[10px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-ink">
                    <Zap className="w-3.5 h-3.5 text-brand" /> Rushing Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[9px] font-bold text-muted mb-1">Yards</label>
                      <input type="text" value={stats.rushYds} onChange={(e) => handleStatChange("rushYds", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted mb-1">TDs</label>
                      <input type="text" value={stats.rushTD} onChange={(e) => handleStatChange("rushTD", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* RECEIVING */}
                <div className="p-3.5 rounded-xl border border-line bg-surface">
                  <h4 className="text-[10px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-ink">
                    <Activity className="w-3.5 h-3.5 text-brand" /> Receiving Stats
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[9px] font-bold text-muted mb-1">Rec</label>
                      <input type="text" value={stats.rec} onChange={(e) => handleStatChange("rec", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted mb-1">Yards</label>
                      <input type="text" value={stats.recYds} onChange={(e) => handleStatChange("recYds", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted mb-1">TDs</label>
                      <input type="text" value={stats.recTD} onChange={(e) => handleStatChange("recTD", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* MISC */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-surface rounded-xl border border-line">
                   <div>
                      <label className="block text-[9px] font-bold text-muted mb-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-rose-500"/> Fumbles Lost</label>
                      <input type="text" value={stats.fumbles} onChange={(e) => handleStatChange("fumbles", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-rose-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted mb-1">2-Pt Conv</label>
                      <input type="text" value={stats.twoPt} onChange={(e) => handleStatChange("twoPt", e.target.value)} className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand" placeholder="0" />
                    </div>
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={addToBench}
              disabled={calculations.total === 0 && !playerName}
              className="w-full py-3.5 rounded-xl bg-brand text-surface text-xs font-black uppercase tracking-wider shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save to Roster Bench
            </button>
            
          </div>
        </div>

        {/* RIGHT: THE DASHBOARD & ROSTER */}
        <div className="space-y-4 sm:space-y-6 w-full font-sans">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col min-h-[550px]">
             
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Calculator className="w-4 h-4 text-brand" /> Active Calculation
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted bg-surface border border-line px-2.5 py-1 rounded-xl">
                {position.id} · {format.label}
              </span>
            </div>

            {/* LIVE POINTS DISPLAY */}
            <div className="text-center mb-6 bg-surface py-6 rounded-2xl border border-line shadow-sm relative overflow-hidden">
              <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1">Total Fantasy Points</span>
              <div className="flex items-end justify-center gap-1.5">
                <span className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter leading-none font-mono ${calculations.total < 0 ? 'text-rose-500' : 'text-ink'}`}>
                  {calculations.total.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-muted mb-1">pts</span>
              </div>
              
              {calculations.total > 0 && (
                <div className="w-3/4 mx-auto mt-4">
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-paper border border-line">
                    {calculations.pctPass > 0 && <div style={{ width: `${calculations.pctPass}%` }} className="bg-blue-500" title="Passing"></div>}
                    {calculations.pctRush > 0 && <div style={{ width: `${calculations.pctRush}%` }} className="bg-emerald-500" title="Rushing"></div>}
                    {calculations.pctRec > 0 && <div style={{ width: `${calculations.pctRec}%` }} className="bg-amber-500" title="Receiving"></div>}
                  </div>
                </div>
              )}
              
              {calculations.negativePts < 0 && (
                <span className="block mt-3 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                  Includes {calculations.negativePts} penalty points
                </span>
              )}
            </div>

            {/* ROSTER BENCH */}
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 flex items-center gap-1.5 shrink-0">
                <BarChart3 className="w-3.5 h-3.5 text-muted" /> Roster Bench ({bench.length})
              </h4>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                {bench.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-50">
                    <UserPlus className="w-8 h-8 text-muted mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted">No players on bench.<br/>Calculate and save to compare.</p>
                  </div>
                ) : (
                  bench.map((player) => (
                    <div key={player.id} className="group bg-surface border border-line p-3 rounded-xl flex items-center justify-between hover:border-brand/50 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-paper flex items-center justify-center border border-line shrink-0">
                          <span className="text-[10px] font-black text-brand">{player.pos}</span>
                        </div>
                        <div className="min-w-0 pr-2">
                          <span className="block text-xs font-black text-ink truncate">
                            {player.name}
                          </span>
                          <span className="text-[9px] font-bold text-muted uppercase tracking-wider">
                            {player.format}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-base font-black text-ink tabular-nums font-mono">
                          {player.pts}
                        </span>
                        <button 
                          type="button"
                          onClick={() => removePlayer(player.id)}
                          className="text-muted hover:text-rose-500 transition-colors p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
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
  );
}
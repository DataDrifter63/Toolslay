"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy, Users, Shuffle, Printer, 
  Settings, ChevronRight, AlertCircle, 
  PlayCircle, RefreshCcw, LayoutTemplate
} from "lucide-react";

export default function TournamentBracketGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Inputs
  const [tournamentName, setTournamentName] = useState("Muxair Championship");
  const [teamsInput, setTeamsInput] = useState("Team Alpha\nTeam Bravo\nTeam Charlie\nTeam Delta\nTeam Echo");
  const [error, setError] = useState("");
  
  // Bracket State
  const [bracket, setBracket] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const handleShuffleClick = () => {
    const list = teamsInput.split("\n").filter(t => t.trim() !== "");
    const shuffled = shuffleArray(list);
    setTeamsInput(shuffled.join("\n"));
  };

  // --- SMART TOURNAMENT ENGINE ---
  const generateBracket = () => {
    let teamList = teamsInput.split("\n").map(t => t.trim()).filter(t => t !== "");
    
    if (teamList.length < 2) {
      setError("Please enter at least 2 teams to generate a bracket.");
      return;
    }
    if (teamList.length > 64) {
      setError("Maximum 64 teams supported for visual layout.");
      return;
    }
    setError("");

    // Find next power of 2 (2, 4, 8, 16, 32, 64)
    let pow = 1;
    while (pow < teamList.length) pow *= 2;

    // Smart Seeding Distribution (Ensures BYEs don't fight BYEs)
    const slots = new Array(pow).fill("BYE");
    let currentSlot = 0;
    
    // Fill even slots first, then odd slots to distribute teams evenly
    for (let i = 0; i < teamList.length; i++) {
      slots[currentSlot] = teamList[i];
      currentSlot += 2;
      if (currentSlot >= pow) {
        currentSlot = 1;
      }
    }

    const roundsCount = Math.log2(pow);
    const newBracket = [];

    // Initialize blank rounds
    for (let r = 0; r < roundsCount; r++) {
      const matchesInRound = pow / Math.pow(2, r + 1);
      const roundMatches = [];
      for (let m = 0; m < matchesInRound; m++) {
        roundMatches.push({
          id: `r${r}-m${m}`,
          p1: r === 0 ? slots[m * 2] : null,
          p2: r === 0 ? slots[m * 2 + 1] : null,
          winner: null
        });
      }
      newBracket.push(roundMatches);
    }

    // Auto-advance BYEs for Round 1
    newBracket[0].forEach((match, idx) => {
      if (match.p1 === "BYE" || match.p2 === "BYE") {
        const winner = match.p1 === "BYE" ? match.p2 : match.p1;
        match.winner = winner;
        
        // Push winner to Round 2 automatically
        if (roundsCount > 1) {
          const nextIdx = Math.floor(idx / 2);
          const isTop = idx % 2 === 0;
          if (isTop) newBracket[1][nextIdx].p1 = winner;
          else newBracket[1][nextIdx].p2 = winner;
        }
      }
    });

    setBracket(newBracket);
    setIsGenerated(true);
  };

  // Click to Advance Logic
  const handleAdvance = (roundIdx, matchIdx, teamName) => {
    if (!teamName || teamName === "BYE") return;
    
    const newBracket = [...bracket];
    const match = newBracket[roundIdx][matchIdx];
    
    // If clicking the same winner again, do nothing
    if (match.winner === teamName) return;
    
    // Set Winner
    match.winner = teamName;

    // Cascade advance to next round
    if (roundIdx < newBracket.length - 1) {
      const nextIdx = Math.floor(matchIdx / 2);
      const isTop = matchIdx % 2 === 0;
      
      if (isTop) {
        newBracket[roundIdx + 1][nextIdx].p1 = teamName;
      } else {
        newBracket[roundIdx + 1][nextIdx].p2 = teamName;
      }
      
      // Clear any downstream winners if the user changed a past match result
      for (let r = roundIdx + 1; r < newBracket.length; r++) {
        const downstreamIdx = Math.floor(matchIdx / Math.pow(2, r - roundIdx));
        newBracket[r][downstreamIdx].winner = null;
      }
    }
    
    setBracket(newBracket);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 font-sans">
      
      {/* Premium Header (Hidden in Print Mode) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100 via-cyan-50 to-transparent dark:from-blue-900/30 dark:via-cyan-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-3.5 rounded-2xl shadow-md">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Pro Bracket Generator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Auto-Seeding & Printable Layouts
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION SIDEBAR ================= */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-6 print:hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Settings className="w-3.5 h-3.5" /> Tournament Name
                </label>
                <input
                  type="text" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Participants List
                  </label>
                  <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded">
                    {teamsInput.split("\n").filter(t => t.trim() !== "").length} Teams
                  </span>
                </div>
                <textarea
                  value={teamsInput} onChange={(e) => setTeamsInput(e.target.value)}
                  rows={8}
                  placeholder="Paste teams here (one per line)..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
                ></textarea>
                <button 
                  onClick={handleShuffleClick}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Shuffle Seeds
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800/50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button
              onClick={generateBracket}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <LayoutTemplate className="w-5 h-5" /> Generate Bracket
            </button>
            
            {isGenerated && (
              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-600 dark:text-slate-300 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            )}

          </div>
        </div>

        {/* ================= RIGHT: THE INTERACTIVE BRACKET ================= */}
        <div className="flex-1 w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner relative overflow-hidden min-h-[600px] print:m-0 print:border-none print:shadow-none print:bg-white print:dark:bg-white print:fixed print:inset-0 print:z-50">
          
          {/* Print Header (Only visible when printing) */}
          <div className="hidden print:block text-center pt-8 pb-4">
            <h1 className="text-3xl font-black text-black uppercase tracking-widest border-b-4 border-black inline-block pb-2">
              {tournamentName}
            </h1>
          </div>

          {!isGenerated ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-50 print:hidden">
              <PlayCircle className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-slate-500">Awaiting Generation</p>
              <p className="text-xs font-medium text-slate-400 mt-2 max-w-xs">Enter your teams on the left and click generate to build your interactive bracket.</p>
            </div>
          ) : (
            <div className="absolute inset-0 overflow-auto custom-scrollbar p-8 print:p-4 print:overflow-visible">
              
              {/* Bracket Container */}
              <div className="flex gap-12 min-w-max h-full items-stretch print:text-black">
                
                {bracket.map((round, rIdx) => (
                  <div key={rIdx} className="flex flex-col justify-around w-[220px] shrink-0">
                    
                    {/* Round Header */}
                    <div className="text-center mb-6 shrink-0">
                      <span className="inline-block bg-slate-200 dark:bg-slate-800 print:bg-gray-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 print:text-black">
                        {rIdx === bracket.length - 1 ? "Finals" : rIdx === bracket.length - 2 ? "Semi-Finals" : `Round ${rIdx + 1}`}
                      </span>
                    </div>

                    {/* Matches */}
                    <div className="flex flex-col justify-around flex-1 gap-4">
                      {round.map((match, mIdx) => (
                        <div key={match.id} className="relative group flex items-center justify-center">
                          
                          {/* Match Card */}
                          <div className="w-full bg-white dark:bg-slate-900 print:bg-white border-2 border-slate-200 dark:border-slate-700 print:border-gray-400 rounded-xl overflow-hidden shadow-sm flex flex-col">
                            
                            {/* Team 1 (Top) */}
                            <button
                              onClick={() => handleAdvance(rIdx, mIdx, match.p1)}
                              disabled={!match.p1 || match.p1 === "BYE"}
                              className={`text-left px-3 py-2.5 text-sm font-bold border-b border-slate-100 dark:border-slate-800 print:border-gray-300 transition-colors flex items-center justify-between ${
                                match.p1 === "BYE" ? "text-slate-400 bg-slate-50 dark:bg-slate-800/50 print:bg-gray-50 italic" 
                                : match.winner === match.p1 ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 print:font-black print:text-black print:bg-gray-100" 
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 print:text-black"
                              }`}
                            >
                              <span className="truncate pr-2">{match.p1 || "-"}</span>
                              {match.winner === match.p1 && <Trophy className="w-3.5 h-3.5 shrink-0 text-blue-500 print:text-black" />}
                            </button>
                            
                            {/* Team 2 (Bottom) */}
                            <button
                              onClick={() => handleAdvance(rIdx, mIdx, match.p2)}
                              disabled={!match.p2 || match.p2 === "BYE"}
                              className={`text-left px-3 py-2.5 text-sm font-bold transition-colors flex items-center justify-between ${
                                match.p2 === "BYE" ? "text-slate-400 bg-slate-50 dark:bg-slate-800/50 print:bg-gray-50 italic" 
                                : match.winner === match.p2 ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 print:font-black print:text-black print:bg-gray-100" 
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 print:text-black"
                              }`}
                            >
                              <span className="truncate pr-2">{match.p2 || "-"}</span>
                              {match.winner === match.p2 && <Trophy className="w-3.5 h-3.5 shrink-0 text-blue-500 print:text-black" />}
                            </button>

                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* The Champion Slot */}
                {bracket.length > 0 && (
                  <div className="flex flex-col justify-around w-[220px] shrink-0">
                    <div className="text-center mb-6 shrink-0">
                      <span className="inline-block bg-amber-100 dark:bg-amber-900/30 print:bg-gray-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 print:text-black">
                        Tournament Champion
                      </span>
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      <div className="w-full bg-gradient-to-br from-amber-400 to-orange-500 print:from-white print:to-white print:border-4 print:border-black p-[2px] rounded-xl shadow-lg">
                        <div className="bg-white dark:bg-slate-900 print:bg-white rounded-[10px] px-4 py-6 text-center flex flex-col items-center justify-center">
                          <Trophy className="w-10 h-10 text-amber-500 mb-3 print:text-black" />
                          <span className="text-lg font-black text-slate-800 dark:text-slate-100 print:text-black uppercase tracking-tight">
                            {bracket[bracket.length - 1][0].winner || "TBD"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
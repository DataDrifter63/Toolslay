"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy, Users, Shuffle, Printer, 
  Settings, ChevronRight, AlertCircle, 
  PlayCircle, RefreshCcw, LayoutTemplate
} from "lucide-react";

export default function TournamentBracketGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [tournamentName, setTournamentName] = useState("My Tournament");
  const [teamsInput, setTeamsInput] = useState("Team Alpha\nTeam Bravo\nTeam Charlie\nTeam Delta\nTeam Echo");
  const [error, setError] = useState("");
  
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

    let pow = 1;
    while (pow < teamList.length) pow *= 2;

    const slots = new Array(pow).fill("BYE");
    let currentSlot = 0;
    
    for (let i = 0; i < teamList.length; i++) {
      slots[currentSlot] = teamList[i];
      currentSlot += 2;
      if (currentSlot >= pow) {
        currentSlot = 1;
      }
    }

    const roundsCount = Math.log2(pow);
    const newBracket = [];

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

    newBracket[0].forEach((match, idx) => {
      if (match.p1 === "BYE" || match.p2 === "BYE") {
        const winner = match.p1 === "BYE" ? match.p2 : match.p1;
        match.winner = winner;
        
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

  const handleAdvance = (roundIdx, matchIdx, teamName) => {
    if (!teamName || teamName === "BYE") return;
    
    const newBracket = [...bracket];
    const match = newBracket[roundIdx][matchIdx];
    
    if (match.winner === teamName) return;
    
    match.winner = teamName;

    if (roundIdx < newBracket.length - 1) {
      const nextIdx = Math.floor(matchIdx / 2);
      const isTop = matchIdx % 2 === 0;
      
      if (isTop) {
        newBracket[roundIdx + 1][nextIdx].p1 = teamName;
      } else {
        newBracket[roundIdx + 1][nextIdx].p2 = teamName;
      }
      
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

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="print:hidden bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Pro Bracket Generator
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Auto-seeding tournament manager and printable layouts.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION SIDEBAR */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-4 sm:space-y-6 print:hidden font-sans">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-5">
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Settings className="w-3.5 h-3.5 text-brand" /> Tournament Name
                </label>
                <input
                  type="text" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)}
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand" /> Participants List
                  </label>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-brand/10 text-brand px-2 py-0.5 rounded border border-brand/20">
                    {teamsInput.split("\n").filter(t => t.trim() !== "").length} Teams
                  </span>
                </div>
                <textarea
                  value={teamsInput} onChange={(e) => setTeamsInput(e.target.value)}
                  rows={7}
                  placeholder="Paste teams here (one per line)..."
                  className="w-full bg-surface border border-line rounded-xl p-3 text-xs font-bold text-ink outline-none focus:border-brand resize-none custom-scrollbar"
                ></textarea>
                <button 
                  type="button"
                  onClick={handleShuffleClick}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-wider text-ink bg-surface border border-line hover:border-brand/50 rounded-xl transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5 text-brand" /> Shuffle Seeds
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold border border-rose-500/20">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button
              type="button"
              onClick={generateBracket}
              className="w-full py-3.5 rounded-xl bg-brand text-surface text-xs font-black uppercase tracking-wider shadow-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            >
              <LayoutTemplate className="w-4 h-4" /> Generate Bracket
            </button>
            
            {isGenerated && (
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3 rounded-xl bg-surface border border-line text-ink text-xs font-black uppercase tracking-wider hover:border-brand transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-brand" /> Print / PDF
              </button>
            )}

          </div>
        </div>

        {/* RIGHT: THE INTERACTIVE BRACKET */}
        <div className="flex-1 w-full bg-paper border border-line rounded-2xl shadow-sm relative overflow-hidden min-h-[550px] print:m-0 print:border-none print:shadow-none print:bg-surface print:fixed print:inset-0 print:z-50 font-sans">
          
          <div className="hidden print:block text-center pt-8 pb-4">
            <h2 className="text-2xl font-black text-ink uppercase tracking-widest border-b-2 border-ink inline-block pb-2">
              {tournamentName}
            </h2>
          </div>

          {!isGenerated ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-50 print:hidden">
              <PlayCircle className="w-12 h-12 text-muted mb-3" />
              <p className="text-[10px] font-black uppercase tracking-wider text-muted">Awaiting Generation</p>
              <p className="text-xs font-medium text-muted mt-1 max-w-xs">Enter your teams on the left and click generate to build your bracket.</p>
            </div>
          ) : (
            <div className="absolute inset-0 overflow-auto custom-scrollbar p-6 print:p-4 print:overflow-visible">
              
              <div className="flex gap-8 min-w-max h-full items-stretch">
                
                {bracket.map((round, rIdx) => (
                  <div key={rIdx} className="flex flex-col justify-around w-[200px] shrink-0">
                    
                    <div className="text-center mb-4 shrink-0">
                      <span className="inline-block bg-surface border border-line px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted">
                        {rIdx === bracket.length - 1 ? "Finals" : rIdx === bracket.length - 2 ? "Semi-Finals" : `Round ${rIdx + 1}`}
                      </span>
                    </div>

                    <div className="flex flex-col justify-around flex-1 gap-3">
                      {round.map((match, mIdx) => (
                        <div key={match.id} className="relative group flex items-center justify-center">
                          
                          <div className="w-full bg-surface border border-line rounded-xl overflow-hidden shadow-sm flex flex-col">
                            
                            <button
                              type="button"
                              onClick={() => handleAdvance(rIdx, mIdx, match.p1)}
                              disabled={!match.p1 || match.p1 === "BYE"}
                              className={`text-left px-3 py-2 text-xs font-bold border-b border-line transition-colors flex items-center justify-between ${
                                match.p1 === "BYE" ? "text-muted bg-paper italic" 
                                : match.winner === match.p1 ? "bg-brand/10 text-brand font-black" 
                                : "text-ink hover:bg-paper"
                              }`}
                            >
                              <span className="truncate pr-2 font-mono">{match.p1 || "-"}</span>
                              {match.winner === match.p1 && <Trophy className="w-3 h-3 shrink-0 text-brand" />}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleAdvance(rIdx, mIdx, match.p2)}
                              disabled={!match.p2 || match.p2 === "BYE"}
                              className={`text-left px-3 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                                match.p2 === "BYE" ? "text-muted bg-paper italic" 
                                : match.winner === match.p2 ? "bg-brand/10 text-brand font-black" 
                                : "text-ink hover:bg-paper"
                              }`}
                            >
                              <span className="truncate pr-2 font-mono">{match.p2 || "-"}</span>
                              {match.winner === match.p2 && <Trophy className="w-3 h-3 shrink-0 text-brand" />}
                            </button>

                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {bracket.length > 0 && (
                  <div className="flex flex-col justify-around w-[200px] shrink-0">
                    <div className="text-center mb-4 shrink-0">
                      <span className="inline-block bg-brand/10 border border-brand/20 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand">
                        Champion
                      </span>
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      <div className="w-full bg-surface border border-brand/40 p-4 rounded-xl shadow-sm text-center flex flex-col items-center justify-center">
                        <Trophy className="w-8 h-8 text-brand mb-2" />
                        <span className="text-sm font-black text-ink uppercase tracking-tight font-mono">
                          {bracket[bracket.length - 1][0].winner || "TBD"}
                        </span>
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
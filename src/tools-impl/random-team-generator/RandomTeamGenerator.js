"use client";

import React, { useState, useCallback } from "react";
import { Users, Shuffle, Star, Trash2, Copy, Download, UserPlus, Zap, Scale } from "lucide-react";

export default function RandomTeamGenerator() {
  const [players, setPlayers] = useState([
    { id: 1, name: "Ali", skill: 5 },
    { id: 2, name: "Usman", skill: 4 },
    { id: 3, name: "Zain", skill: 2 },
    { id: 4, name: "Umer", skill: 3 },
    { id: 5, name: "Hamza", skill: 5 },
    { id: 6, name: "Bilal", skill: 1 },
    { id: 7, name: "Saad", skill: 3 },
    { id: 8, name: "Raza", skill: 4 },
  ]);
  
  const [bulkInput, setBulkInput] = useState("");
  const [numTeams, setNumTeams] = useState(2);
  const [mode, setMode] = useState("balanced"); // "random" or "balanced"
  const [teams, setTeams] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;
    
    // Split by comma or newline, remove empty, create player objects
    const newNames = bulkInput.split(/[,\n]/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
      
    const newPlayers = newNames.map(name => ({
      id: Date.now() + Math.random(),
      name,
      skill: 3 // Default average skill
    }));

    setPlayers([...players, ...newPlayers]);
    setBulkInput("");
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const updateSkill = (id, newSkill) => {
    setPlayers(players.map(p => p.id === id ? { ...p, skill: newSkill } : p));
  };

  const clearAll = () => {
    if(confirm("Are you sure you want to remove all players?")) {
      setPlayers([]);
      setTeams([]);
    }
  };

  const generateTeams = () => {
    if (players.length < numTeams) {
      alert("You need at least as many players as teams!");
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      // 1. Shuffle initially to randomize players with the same skill level
      let pool = [...players].sort(() => Math.random() - 0.5);
      
      let generatedTeams = Array.from({ length: numTeams }, (_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
        members: [],
        skillTotal: 0
      }));

      if (mode === "balanced") {
        // 2. Sort by skill descending for snake-draft distribution
        pool.sort((a, b) => b.skill - a.skill);
        
        pool.forEach(player => {
          // 3. Find the team with the lowest current skill total
          generatedTeams.sort((a, b) => a.skillTotal - b.skillTotal);
          generatedTeams[0].members.push(player);
          generatedTeams[0].skillTotal += player.skill;
        });
      } else {
        // Pure Random Round-Robin
        pool.forEach((player, i) => {
          const teamIndex = i % numTeams;
          generatedTeams[teamIndex].members.push(player);
          generatedTeams[teamIndex].skillTotal += player.skill;
        });
      }

      // Re-sort teams by ID to keep display consistent
      generatedTeams.sort((a, b) => a.id - b.id);
      setTeams(generatedTeams);
      setIsGenerating(false);
    }, 400); // Small delay for visual feedback
  };

  const handleCopy = () => {
    if (teams.length === 0) return;
    let text = "🏆 Generated Teams:\n\n";
    teams.forEach(t => {
      text += `--- ${t.name} ---\n`;
      t.members.forEach(m => {
        text += `• ${m.name} ${mode === 'balanced' ? `(Skill: ${m.skill})` : ''}\n`;
      });
      text += "\n";
    });
    navigator.clipboard.writeText(text);
    alert("Teams copied to clipboard!");
  };

  const handleExportCSV = () => {
    if (teams.length === 0) return;
    let csv = "Team,Player Name,Skill Level\n";
    teams.forEach(t => {
      t.members.forEach(m => {
        csv += `"${t.name}","${m.name.replace(/"/g, '""')}",${m.skill}\n`;
      });
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Teams_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Squad Builder</h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
           <button 
             onClick={() => setMode("random")} 
             className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'random' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Shuffle className="w-3.5 h-3.5" /> Pure Random
           </button>
           <button 
             onClick={() => setMode("balanced")} 
             className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'balanced' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Scale className="w-3.5 h-3.5" /> Fair-Play Balanced
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6 items-start">
        
        {/* ================= LEFT COLUMN: INPUT ================= */}
        <div className="space-y-4">
          
          {/* Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Number of Teams</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="2" max="20" 
                    value={numTeams} 
                    onChange={(e) => setNumTeams(parseInt(e.target.value))}
                    className="flex-grow accent-indigo-600"
                  />
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 w-8 text-center">{numTeams}</span>
                </div>
             </div>

             <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Quick Add Players</label>
                <textarea 
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Paste names here (comma or newline separated)..."
                  className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 h-24 resize-none"
                />
                <button 
                  onClick={handleBulkAdd}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold py-2.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <UserPlus className="w-4 h-4" /> Add to Roster
                </button>
             </div>
          </div>

          {/* Player Roster */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col h-[50vh] max-h-[500px]">
             <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                 <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                   Player Roster <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs">{players.length}</span>
                 </h3>
                 {players.length > 0 && (
                   <button onClick={clearAll} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider">
                     Clear All
                   </button>
                 )}
             </div>
             
             <div className="overflow-y-auto flex-grow p-2 space-y-1 custom-scrollbar">
               {players.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                   <Users className="w-8 h-8 opacity-20" />
                   <p className="text-sm font-medium">Roster is empty. Add players above to start building teams.</p>
                 </div>
               ) : (
                 players.map((player) => (
                   <div key={player.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group transition-colors">
                     <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate pr-2">{player.name}</span>
                     
                     <div className="flex items-center gap-3">
                       {mode === "balanced" && (
                         <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                           {[1,2,3,4,5].map(star => (
                             <button 
                               key={star} 
                               onClick={() => updateSkill(player.id, star)}
                               className={`transition-colors ${star <= player.skill ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                             >
                               <Star className="w-3.5 h-3.5 fill-current" />
                             </button>
                           ))}
                         </div>
                       )}
                       <button onClick={() => removePlayer(player.id)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: OUTPUT ================= */}
        <div className="space-y-6">
           
           {/* Big Generate Button */}
           <button 
             onClick={generateTeams}
             disabled={players.length === 0 || isGenerating}
             className={`w-full relative overflow-hidden flex items-center justify-center gap-3 text-lg font-black text-white py-5 rounded-xl shadow-lg transition-all transform active:scale-[0.98] ${
               players.length === 0 
                 ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed' 
                 : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25'
             }`}
           >
             {isGenerating ? (
               <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
               <>
                 <Zap className="w-6 h-6" /> Generate {numTeams} Teams
               </>
             )}
           </button>

           {/* Results Output */}
           {teams.length > 0 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Final Matchup</h3>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="text-slate-400 hover:text-indigo-500 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" title="Copy Text">
                      <Copy className="w-5 h-5" />
                    </button>
                    <button onClick={handleExportCSV} className="text-slate-400 hover:text-emerald-500 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all" title="Download CSV">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {teams.map((team, index) => (
                    <div key={team.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                       {/* Team Header */}
                       <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <h4 className="font-black text-indigo-600 dark:text-indigo-400">{team.name}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-slate-900 px-2 py-1 rounded text-slate-500 shadow-sm border border-slate-100 dark:border-slate-800">
                            {team.members.length} {team.members.length === 1 ? 'Player' : 'Players'}
                          </span>
                       </div>
                       
                       {/* Team Members */}
                       <div className="p-2 space-y-1 min-h-[100px]">
                         {team.members.map(member => (
                           <div key={member.id} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{member.name}</span>
                              {mode === "balanced" && (
                                <div className="flex gap-0.5">
                                  {Array.from({ length: member.skill }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
                                  ))}
                                </div>
                              )}
                           </div>
                         ))}
                       </div>

                       {/* Balanced Stats Footer */}
                       {mode === "balanced" && (
                         <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-2 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                           <span>Team Skill Power</span>
                           <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded">
                             {team.skillTotal} PTS
                           </span>
                         </div>
                       )}
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
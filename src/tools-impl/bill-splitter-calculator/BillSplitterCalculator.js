"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Receipt, Users, Percent, DollarSign, 
  UserPlus, X, Copy, CheckCircle2, 
  PieChart, Divide, AlertCircle, Utensils
} from "lucide-react";

export default function BillSplitterCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Base Inputs
  const [subtotal, setSubtotal] = useState("");
  const [tax, setTax] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  
  // Modes: 'even' or 'custom'
  const [splitMode, setSplitMode] = useState("even");
  
  // Even Mode State
  const [peopleCount, setPeopleCount] = useState("3");
  
  // Custom Mode State
  const [friends, setFriends] = useState([
    { id: 1, name: "Person 1", amount: "" },
    { id: 2, name: "Person 2", amount: "" }
  ]);
  
  // UI States
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value) => {
    if (value === "") {
      setter("");
      return;
    }
    // Allow valid numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const addFriend = () => {
    setFriends([...friends, { id: Date.now(), name: `Person ${friends.length + 1}`, amount: "" }]);
  };

  const removeFriend = (id) => {
    if (friends.length > 2) {
      setFriends(friends.filter(f => f.id !== id));
    }
  };

  const updateFriend = (id, field, value) => {
    setFriends(friends.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  // --- CORE SPLIT ENGINE ---
  const calculations = useMemo(() => {
    const sub = parseFloat(subtotal) || 0;
    const tx = parseFloat(tax) || 0;
    const tipRate = parseFloat(tipPercent) || 0;
    
    const tipAmt = sub * (tipRate / 100);
    const grandTotal = sub + tx + tipAmt;

    let breakdown = [];
    let unassignedSubtotal = 0;
    let unassignedTotal = 0;

    if (splitMode === "even") {
      const pCount = parseInt(peopleCount) || 1;
      const safeCount = Math.max(1, pCount);
      const perPerson = grandTotal / safeCount;
      
      for (let i = 0; i < safeCount; i++) {
        breakdown.push({
          name: `Person ${i + 1}`,
          base: sub / safeCount,
          taxTip: (tx + tipAmt) / safeCount,
          total: perPerson
        });
      }
    } else {
      // Custom Pro-Rata Split
      let assignedSub = 0;
      
      const mappedFriends = friends.map(f => {
        const pSub = parseFloat(f.amount) || 0;
        assignedSub += pSub;
        
        // Pro-rata ratio based on subtotal (to distribute tax and tip fairly)
        const ratio = sub > 0 ? (pSub / sub) : 0;
        const pTaxTip = (tx + tipAmt) * ratio;
        
        return {
          name: f.name || "Unnamed",
          base: pSub,
          taxTip: pTaxTip,
          total: pSub + pTaxTip
        };
      });

      breakdown = mappedFriends;
      unassignedSubtotal = Math.max(0, sub - assignedSub);
      
      if (unassignedSubtotal > 0 && sub > 0) {
        const unassignedRatio = unassignedSubtotal / sub;
        unassignedTotal = unassignedSubtotal + ((tx + tipAmt) * unassignedRatio);
      }
    }

    const formatCurrency = (val) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return {
      sub, tx, tipAmt, grandTotal,
      breakdown, unassignedSubtotal, unassignedTotal,
      formatCurrency
    };
  }, [subtotal, tax, tipPercent, splitMode, peopleCount, friends]);

  const handleCopy = () => {
    if (calculations.grandTotal === 0) return;
    
    let text = `🧾 Bill Split Summary\nTotal Bill: ${calculations.formatCurrency(calculations.grandTotal)}\n\n`;
    
    calculations.breakdown.forEach(p => {
      text += `• ${p.name}: ${calculations.formatCurrency(p.total)}\n`;
    });

    if (splitMode === 'custom' && calculations.unassignedTotal > 0) {
      text += `\n⚠️ Unassigned Amount: ${calculations.formatCurrency(calculations.unassignedTotal)}\n`;
    }
    
    text += `\nPowered by Muxair Utility Engine`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-100 via-orange-50 to-transparent dark:from-rose-900/30 dark:via-orange-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-3.5 rounded-2xl shadow-md">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              FairSplit Engine
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Itemized Bill & Tip Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,440px] gap-6 items-start">
        
        {/* ================= LEFT: BILL CONFIGURATION ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* Split Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
              <button 
                onClick={() => setSplitMode("even")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${splitMode === "even" ? "bg-white dark:bg-slate-700 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <Divide className="w-4 h-4" /> Split Evenly
              </button>
              <button 
                onClick={() => setSplitMode("custom")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${splitMode === "custom" ? "bg-white dark:bg-slate-700 text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <Utensils className="w-4 h-4" /> Itemized / Custom
              </button>
            </div>

            {/* Bill Details */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Receipt className="w-3.5 h-3.5" /> 1. Enter Bill Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subtotal (Before Tax/Tip)</label>
                  <div className="relative flex items-center">
                    <DollarSign className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text" value={subtotal} onChange={(e) => handleNumInput(setSubtotal, e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-rose-500 transition-colors tabular-nums"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tax Amount</label>
                  <div className="relative flex items-center">
                    <DollarSign className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text" value={tax} onChange={(e) => handleNumInput(setTax, e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-3 text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-rose-500 transition-colors tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Tip Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tip Percentage</label>
                <div className="flex gap-2 mb-2">
                  {['10', '15', '18', '20'].map(pct => (
                    <button
                      key={pct} onClick={() => setTipPercent(pct)}
                      className={`flex-1 py-2 rounded-lg text-sm font-black transition-colors border ${tipPercent === pct ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="relative flex items-center">
                  <Percent className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text" value={tipPercent} onChange={(e) => handleNumInput(setTipPercent, e.target.value)}
                    placeholder="Custom Tip %"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-rose-500 transition-colors tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* SPLIT CONFIGURATION */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2 pt-4">
                <Users className="w-3.5 h-3.5" /> 2. Split Configuration
              </h3>

              {splitMode === "even" ? (
                <div className="bg-orange-50/50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-200 dark:border-orange-800/50 flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-black text-slate-800 dark:text-slate-100">Number of People</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 block">Dividing evenly</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPeopleCount(Math.max(1, parseInt(peopleCount || 1) - 1).toString())} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xl font-bold flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">-</button>
                    <input
                      type="text" value={peopleCount} onChange={(e) => handleNumInput(setPeopleCount, e.target.value)}
                      className="w-16 bg-transparent text-2xl font-black text-center text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <button onClick={() => setPeopleCount((parseInt(peopleCount || 1) + 1).toString())} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xl font-bold flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">+</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enter specific item subtotals for each friend. Tax & Tip will be distributed proportionally.</span>
                  </div>
                  
                  <div className="space-y-2">
                    {friends.map((friend, idx) => (
                      <div key={friend.id} className="flex gap-2">
                        <input
                          type="text" value={friend.name} onChange={(e) => updateFriend(friend.id, 'name', e.target.value)}
                          placeholder={`Person ${idx + 1}`}
                          className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 transition-colors"
                        />
                        <div className="relative flex items-center w-32">
                          <DollarSign className="absolute left-3 w-4 h-4 text-slate-400" />
                          <input
                            type="text" value={friend.amount} onChange={(e) => {
                              if (/^\d*\.?\d*$/.test(e.target.value)) updateFriend(friend.id, 'amount', e.target.value);
                            }}
                            placeholder="0.00"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 transition-colors tabular-nums"
                          />
                        </div>
                        {friends.length > 2 && (
                          <button onClick={() => removeFriend(friend.id)} className="w-12 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl border border-rose-100 dark:border-rose-900 hover:bg-rose-100 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addFriend}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:border-orange-400 hover:text-orange-500 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" /> Add Another Person
                  </button>
                  
                  {calculations.unassignedSubtotal > 0 && parseFloat(subtotal) > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-800/50 mt-4">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> 
                      <div>
                        You have {calculations.formatCurrency(calculations.unassignedSubtotal)} of the subtotal left unassigned. Ensure all items are claimed!
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD RECEIPT ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[650px] max-h-[800px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Receipt className="w-4 h-4 text-rose-500" /> Bill Summary
                </span>
              </div>

              {/* GRAND TOTAL HERO */}
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-6 px-4 rounded-2xl shadow-sm mb-6 relative overflow-hidden shrink-0">
                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                  <PieChart className="w-24 h-24 text-rose-500" />
                </div>
                
                <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Grand Total</span>
                <span className="text-5xl font-black text-rose-600 dark:text-rose-400 tracking-tighter tabular-nums leading-none">
                  {calculations.formatCurrency(calculations.grandTotal)}
                </span>
                
                <div className="flex justify-center gap-4 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Tax: {calculations.formatCurrency(calculations.tx)}</span>
                  <span>Tip: {calculations.formatCurrency(calculations.tipAmt)}</span>
                </div>
              </div>

              {/* DETAILED BREAKDOWN */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
                
                {/* Header Row */}
                <div className="flex text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2 pt-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex-1">Person</div>
                  <div className="w-1/4 text-right hidden sm:block">Item Base</div>
                  <div className="w-1/4 text-right hidden sm:block">+ Tax/Tip</div>
                  <div className="w-1/3 sm:w-1/4 text-right text-rose-500">Total Owed</div>
                </div>

                {/* Rows */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {calculations.breakdown.map((person, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center px-3 py-3 transition-colors ${idx !== calculations.breakdown.length -1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                    >
                      <div className="flex-1">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate block max-w-[100px] sm:max-w-[120px]">{person.name}</span>
                      </div>
                      <div className="w-1/4 text-right hidden sm:block">
                        <span className="text-[11px] font-bold tabular-nums text-slate-400">
                          {calculations.formatCurrency(person.base)}
                        </span>
                      </div>
                      <div className="w-1/4 text-right hidden sm:block">
                        <span className="text-[11px] font-bold tabular-nums text-slate-400">
                          +{calculations.formatCurrency(person.taxTip)}
                        </span>
                      </div>
                      <div className="w-1/3 sm:w-1/4 text-right">
                        <span className="text-sm font-black tabular-nums text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md">
                          {calculations.formatCurrency(person.total)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Unassigned Row (Custom Mode) */}
                  {splitMode === 'custom' && calculations.unassignedTotal > 0 && (
                    <div className="flex items-center px-3 py-3 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/50">
                      <div className="flex-1">
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5"/> Unassigned</span>
                      </div>
                      <div className="w-1/4 text-right hidden sm:block">
                        <span className="text-[11px] font-bold tabular-nums text-amber-500/70">{calculations.formatCurrency(calculations.unassignedSubtotal)}</span>
                      </div>
                      <div className="w-1/4 text-right hidden sm:block">
                        <span className="text-[11px] font-bold tabular-nums text-amber-500/70">+{calculations.formatCurrency(calculations.unassignedTotal - calculations.unassignedSubtotal)}</span>
                      </div>
                      <div className="w-1/3 sm:w-1/4 text-right">
                        <span className="text-sm font-black tabular-nums text-amber-600 dark:text-amber-400">{calculations.formatCurrency(calculations.unassignedTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SHARE ACTION */}
              <button
                onClick={handleCopy}
                disabled={calculations.grandTotal === 0}
                className="w-full mt-4 py-4 rounded-xl bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                {copied ? <><CheckCircle2 className="w-4 h-4"/> Breakdown Copied!</> : <><Copy className="w-4 h-4"/> Copy for WhatsApp</>}
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Receipt, Users, Percent, DollarSign, 
  UserPlus, X, Copy, CheckCircle2, 
  PieChart, Divide, AlertCircle, Utensils
} from "lucide-react";

export default function BillSplitterCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [subtotal, setSubtotal] = useState("");
  const [tax, setTax] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  
  const [splitMode, setSplitMode] = useState("even");
  const [peopleCount, setPeopleCount] = useState("3");
  
  const [friends, setFriends] = useState([
    { id: 1, name: "Person 1", amount: "" },
    { id: 2, name: "Person 2", amount: "" }
  ]);
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (setter, value) => {
    if (value === "") {
      setter("");
      return;
    }
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
      let assignedSub = 0;
      
      const mappedFriends = friends.map(f => {
        const pSub = parseFloat(f.amount) || 0;
        assignedSub += pSub;
        
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

  const baseInputStyle = "w-full min-w-0 bg-paper border border-line rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-ink outline-none focus:border-brand transition-colors tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="bg-brand/15 text-brand p-3 rounded-xl shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              FairSplit Engine
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5 truncate">
              Itemized Bill & Tip Calculator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,440px] gap-6 items-start min-w-0">
        
        {/* BILL CONFIGURATION */}
        <div className="space-y-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
            
            {/* Split Mode Toggle */}
            <div className="flex bg-paper rounded-xl p-1 border border-line min-w-0 gap-1">
              <button 
                type="button"
                onClick={() => setSplitMode("even")}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all min-w-0 truncate ${splitMode === "even" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
              >
                <Divide className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Split Evenly</span>
              </button>
              <button 
                type="button"
                onClick={() => setSplitMode("custom")}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all min-w-0 truncate ${splitMode === "custom" ? "bg-surface text-brand shadow-sm border border-line" : "text-muted hover:text-ink"}`}
              >
                <Utensils className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Itemized / Custom</span>
              </button>
            </div>

            {/* Bill Details */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 truncate">
                <Receipt className="w-3.5 h-3.5 shrink-0" /> 1. Enter Bill Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <div className="min-w-0">
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 truncate">Subtotal (Before Tax/Tip)</label>
                  <div className="relative flex items-center min-w-0">
                    <DollarSign className="absolute left-3 w-4 h-4 text-muted shrink-0" />
                    <input
                      type="text" value={subtotal} onChange={(e) => handleNumInput(setSubtotal, e.target.value)}
                      placeholder="0.00"
                      className={`${baseInputStyle} pl-9`}
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 truncate">Tax Amount</label>
                  <div className="relative flex items-center min-w-0">
                    <DollarSign className="absolute left-3 w-4 h-4 text-muted shrink-0" />
                    <input
                      type="text" value={tax} onChange={(e) => handleNumInput(setTax, e.target.value)}
                      placeholder="0.00"
                      className={`${baseInputStyle} pl-9`}
                    />
                  </div>
                </div>
              </div>

              {/* Tip Selection */}
              <div className="min-w-0">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2 truncate">Tip Percentage</label>
                <div className="flex gap-1.5 sm:gap-2 mb-2 min-w-0">
                  {['10', '15', '18', '20'].map(pct => (
                    <button
                      key={pct} type="button" onClick={() => setTipPercent(pct)}
                      className={`flex-1 py-2 rounded-lg text-xs font-black transition-colors border truncate ${tipPercent === pct ? 'bg-surface border-brand text-brand shadow-sm' : 'bg-paper border-line text-muted hover:border-brand/40'}`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="relative flex items-center min-w-0">
                  <Percent className="absolute left-3 w-4 h-4 text-muted shrink-0" />
                  <input
                    type="text" value={tipPercent} onChange={(e) => handleNumInput(setTipPercent, e.target.value)}
                    placeholder="Custom Tip %"
                    className={`${baseInputStyle} pl-9`}
                  />
                </div>
              </div>
            </div>

            {/* SPLIT CONFIGURATION */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2 pt-2 truncate">
                <Users className="w-3.5 h-3.5 shrink-0" /> 2. Split Configuration
              </h3>

              {splitMode === "even" ? (
                <div className="bg-paper p-4 rounded-xl border border-line flex items-center justify-between gap-4 min-w-0">
                  <div className="min-w-0">
                    <span className="block text-xs sm:text-sm font-bold text-ink truncate">Number of People</span>
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mt-0.5 block truncate">Dividing evenly</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button type="button" onClick={() => setPeopleCount(Math.max(1, parseInt(peopleCount || 1) - 1).toString())} className="w-9 h-9 rounded-lg bg-surface border border-line text-base font-bold flex items-center justify-center hover:border-brand transition-colors">−</button>
                    <input
                      type="text" value={peopleCount} onChange={(e) => handleNumInput(setPeopleCount, e.target.value)}
                      className="w-12 bg-transparent text-xl font-black text-center text-ink outline-none tabular-nums"
                    />
                    <button type="button" onClick={() => setPeopleCount((parseInt(peopleCount || 1) + 1).toString())} className="w-9 h-9 rounded-lg bg-surface border border-line text-base font-bold flex items-center justify-center hover:border-brand transition-colors">+</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 min-w-0">
                  <span className="block text-[10px] font-semibold text-muted uppercase tracking-wider truncate">Enter specific item subtotals. Tax/tip distributes pro-rata.</span>
                  
                  <div className="space-y-2 min-w-0">
                    {friends.map((friend, idx) => (
                      <div key={friend.id} className="flex gap-2 min-w-0">
                        <input
                          type="text" value={friend.name} onChange={(e) => updateFriend(friend.id, 'name', e.target.value)}
                          placeholder={`Person ${idx + 1}`}
                          className="flex-1 min-w-0 bg-paper border border-line rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-ink outline-none focus:border-brand truncate"
                        />
                        <div className="relative flex items-center w-28 sm:w-32 shrink-0">
                          <DollarSign className="absolute left-2.5 w-3.5 h-3.5 text-muted shrink-0" />
                          <input
                            type="text" value={friend.amount} onChange={(e) => {
                              if (/^\d*\.?\d*$/.test(e.target.value)) updateFriend(friend.id, 'amount', e.target.value);
                            }}
                            placeholder="0.00"
                            className="w-full min-w-0 bg-paper border border-line rounded-xl pl-7 pr-2.5 py-2.5 text-xs sm:text-sm font-bold text-ink outline-none focus:border-brand tabular-nums"
                          />
                        </div>
                        {friends.length > 2 && (
                          <button type="button" onClick={() => removeFriend(friend.id)} className="w-10 flex items-center justify-center bg-paper text-[#e11d48] rounded-xl border border-[#fb7185]/30 hover:bg-[#fb7185]/10 transition-colors shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addFriend}
                    className="w-full py-2.5 rounded-xl border border-dashed border-line text-muted hover:border-brand hover:text-brand font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Another Person
                  </button>
                  
                  {calculations.unassignedSubtotal > 0 && parseFloat(subtotal) > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-paper text-[#d97706] rounded-xl text-xs font-bold border border-[#f59e0b]/30 mt-3 min-w-0">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> 
                      <span className="truncate">Unassigned: {calculations.formatCurrency(calculations.unassignedSubtotal)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* DASHBOARD RECEIPT */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-5 sm:p-6 rounded-2xl shadow-card flex flex-col min-h-[500px] min-w-0">
            
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3 shrink-0 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink truncate">
                <Receipt className="w-4 h-4 text-brand shrink-0" /> Bill Summary
              </span>
            </div>

            {/* GRAND TOTAL HERO */}
            <div className="text-center bg-paper border border-line py-5 px-4 rounded-xl shadow-sm mb-5 relative overflow-hidden shrink-0 min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 truncate">Grand Total</span>
              <span className="text-4xl sm:text-5xl font-black text-brand tracking-tight tabular-nums leading-none truncate block">
                {calculations.formatCurrency(calculations.grandTotal)}
              </span>
              
              <div className="flex justify-center gap-4 mt-3 text-[10px] font-bold text-muted uppercase tracking-wider min-w-0 truncate">
                <span className="truncate">Tax: {calculations.formatCurrency(calculations.tx)}</span>
                <span className="truncate">Tip: {calculations.formatCurrency(calculations.tipAmt)}</span>
              </div>
            </div>

            {/* DETAILED BREAKDOWN */}
            <div className="flex-1 flex flex-col min-h-0 bg-paper rounded-xl border border-line p-2 shadow-sm min-w-0">
              <div className="flex text-[9px] font-black uppercase tracking-widest text-muted px-2.5 pb-2 pt-1 border-b border-line shrink-0 min-w-0">
                <div className="flex-1 truncate">Person</div>
                <div className="w-1/4 text-right hidden sm:block truncate">Base</div>
                <div className="w-1/4 text-right hidden sm:block truncate">+ Tax/Tip</div>
                <div className="w-1/3 sm:w-1/4 text-right text-brand truncate">Total</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar min-w-0">
                {calculations.breakdown.map((person, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center px-2.5 py-2.5 transition-colors ${idx !== calculations.breakdown.length -1 ? 'border-b border-line/50' : ''} hover:bg-surface/50 min-w-0 text-xs`}
                  >
                    <div className="flex-1 min-w-0 truncate pr-2">
                      <span className="font-black text-ink truncate block">{person.name}</span>
                    </div>
                    <div className="w-1/4 text-right hidden sm:block truncate">
                      <span className="text-[10px] font-semibold tabular-nums text-muted">
                        {calculations.formatCurrency(person.base)}
                      </span>
                    </div>
                    <div className="w-1/4 text-right hidden sm:block truncate">
                      <span className="text-[10px] font-semibold tabular-nums text-muted">
                        +{calculations.formatCurrency(person.taxTip)}
                      </span>
                    </div>
                    <div className="w-1/3 sm:w-1/4 text-right shrink-0">
                      <span className="text-xs font-black tabular-nums text-brand bg-brand/10 px-2 py-1 rounded-md">
                        {calculations.formatCurrency(person.total)}
                      </span>
                    </div>
                  </div>
                ))}

                {splitMode === 'custom' && calculations.unassignedTotal > 0 && (
                  <div className="flex items-center px-2.5 py-2.5 bg-[#d97706]/10 border-t border-[#f59e0b]/30 text-xs min-w-0">
                    <div className="flex-1 min-w-0 truncate">
                      <span className="font-black text-[#d97706] flex items-center gap-1 truncate"><AlertCircle className="w-3.5 h-3.5 shrink-0"/> Unassigned</span>
                    </div>
                    <div className="w-1/3 sm:w-1/4 text-right shrink-0">
                      <span className="font-black tabular-nums text-[#d97706]">{calculations.formatCurrency(calculations.unassignedTotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SHARE ACTION */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={calculations.grandTotal === 0}
              className="w-full mt-4 py-3.5 rounded-xl bg-ink text-surface hover:opacity-90 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {copied ? <><CheckCircle2 className="w-4 h-4 text-teal"/> Breakdown Copied!</> : <><Copy className="w-4 h-4"/> Copy for WhatsApp</>}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  GraduationCap, Percent, Globe, BookOpen, 
  TrendingUp, Award, AlertCircle, Info, Calculator, Star
} from "lucide-react";

// Academic Scales Configuration
const SCALES = [
  { id: "4.0", name: "US Standard (4.0)", max: 4.0, icon: Globe, color: "text-amber-500", border: "border-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { id: "5.0", name: "Weighted US (5.0)", max: 5.0, icon: BookOpen, color: "text-blue-500", border: "border-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "10.0", name: "India / CGPA (10.0)", max: 10.0, icon: GraduationCap, color: "text-emerald-500", border: "border-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
];

// Indian CGPA Conversion Formulas
const CGPA_FORMULAS = [
  { id: "cbse", name: "Standard (CBSE)", formula: "CGPA × 9.5", desc: "Common for CBSE and many institutions." },
  { id: "vtu", name: "Engineering (VTU/AICTE)", formula: "(CGPA - 0.75) × 10", desc: "Used by VTU and various technical universities." },
  { id: "generic", name: "Direct Multiplier", formula: "CGPA × 10", desc: "Straight multiple of 10." },
  { id: "mumbai", name: "Mumbai Uni (Approx)", formula: "7.1 × CGPA + 11", desc: "Polynomial approximation for MU." }
];

// US Scale Data Points for Interpolation (GPA, Percentage, Letter)
const US_4_0_MAPPING = [
  { gpa: 4.0, pct: 96, grade: "A+", honors: "Summa Cum Laude" },
  { gpa: 3.7, pct: 92, grade: "A", honors: "Magna Cum Laude" },
  { gpa: 3.3, pct: 88, grade: "A-", honors: "Cum Laude" },
  { gpa: 3.0, pct: 85, grade: "B+", honors: "Dean's List" },
  { gpa: 2.7, pct: 82, grade: "B", honors: "Good Standing" },
  { gpa: 2.3, pct: 78, grade: "B-", honors: "Satisfactory" },
  { gpa: 2.0, pct: 75, grade: "C+", honors: "Satisfactory" },
  { gpa: 1.7, pct: 72, grade: "C", honors: "Below Average" },
  { gpa: 1.3, pct: 68, grade: "C-", honors: "Passing Risk" },
  { gpa: 1.0, pct: 65, grade: "D", honors: "Barely Passing" },
  { gpa: 0.0, pct: 50, grade: "F", honors: "Failing" }
];

export default function GpaToPercentageConverter() {
  const [isMounted, setIsMounted] = useState(false);
  
  // State
  const [activeScale, setActiveScale] = useState(SCALES[0]);
  const [gpaValue, setGpaValue] = useState("3.5");
  const [cgpaFormula, setCgpaFormula] = useState(CGPA_FORMULAS[0]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle Scale Change and clamp GPA
  const handleScaleChange = (scale) => {
    setActiveScale(scale);
    let val = parseFloat(gpaValue) || 0;
    if (val > scale.max) val = scale.max;
    // Set some sensible defaults based on scale
    if (scale.id === "10.0" && val < 5) val = 8.5;
    if (scale.id === "4.0" && val > 4) val = 3.5;
    if (scale.id === "5.0" && val < 1) val = 4.2;
    setGpaValue(val.toString());
  };

  // Advanced Math Engine
  const results = useMemo(() => {
    const val = parseFloat(gpaValue);
    if (isNaN(val) || val < 0) {
      return { percentage: 0, grade: "-", honors: "-", nextMilestone: null };
    }

    let percentage = 0;
    let grade = "-";
    let honors = "-";
    let nextMilestone = null;

    if (activeScale.id === "10.0") {
      // Indian CGPA Formulas
      if (cgpaFormula.id === "cbse") percentage = val * 9.5;
      else if (cgpaFormula.id === "vtu") percentage = (val - 0.75) * 10;
      else if (cgpaFormula.id === "generic") percentage = val * 10;
      else if (cgpaFormula.id === "mumbai") percentage = (7.1 * val) + 11;
      
      // Cap at 100
      percentage = Math.min(Math.max(percentage, 0), 100);

      // Honors classification (Standard Indian System)
      if (percentage >= 75) { grade = "A+"; honors = "First Class with Distinction"; }
      else if (percentage >= 60) { grade = "A"; honors = "First Class"; }
      else if (percentage >= 50) { grade = "B"; honors = "Second Class"; }
      else if (percentage >= 40) { grade = "C"; honors = "Pass Class"; }
      else { grade = "F"; honors = "Fail"; }

      // Next Milestone logic
      if (val < 10) {
        const nextTarget = Math.ceil(val / 0.5) * 0.5;
        if (nextTarget > val) {
          nextMilestone = `+${(nextTarget - val).toFixed(2)} CGPA to reach ${nextTarget.toFixed(1)}`;
        }
      }

    } else {
      // US 4.0 or 5.0 Scale using Interpolation
      const mappingTable = US_4_0_MAPPING;
      
      // Normalize 5.0 to 4.0 scale purely for letter grade/honor mapping, 
      // but keep percentage proportional if it exceeds 4.0
      let evalGpa = val;
      if (activeScale.id === "5.0") {
        if (val > 4.0) {
          // Extra credit for 5.0 weighted
          percentage = 96 + ((val - 4.0) * 4); // Maps 4.0-5.0 to 96-100% linearly
          percentage = Math.min(percentage, 100);
          grade = "A+";
          honors = "Highest Honors (Weighted)";
        } else {
          // Standard mapping applies
        }
      }

      // Linear Interpolation Algorithm
      if (evalGpa <= 4.0) {
        for (let i = 0; i < mappingTable.length; i++) {
          const current = mappingTable[i];
          if (evalGpa === current.gpa) {
            percentage = current.pct;
            grade = current.grade;
            honors = current.honors;
            break;
          }
          
          if (i < mappingTable.length - 1) {
            const next = mappingTable[i + 1];
            if (evalGpa < current.gpa && evalGpa > next.gpa) {
              // Interpolate between current and next
              const gpaRange = current.gpa - next.gpa;
              const pctRange = current.pct - next.pct;
              const ratio = (evalGpa - next.gpa) / gpaRange;
              percentage = next.pct + (ratio * pctRange);
              
              // Grade mapping takes the lower bound grade conventionally, or interpolate visually
              grade = current.grade; 
              honors = current.honors;
              
              // Next Milestone
              nextMilestone = `+${(current.gpa - evalGpa).toFixed(2)} GPA for an ${current.grade}`;
              break;
            }
          }
        }
        if (evalGpa < mappingTable[mappingTable.length - 1].gpa) {
          percentage = 0; grade = "F"; honors = "Failing";
        }
      }
    }

    return {
      percentage: percentage.toFixed(2),
      grade,
      honors,
      nextMilestone
    };
  }, [gpaValue, activeScale, cgpaFormula]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-xl shadow-inner">
            <Calculator className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              GPA to Percentage Converter
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Global Scale Translator & Academic Predictor
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 sm:p-8 rounded-2xl shadow-sm space-y-8">
            
            {/* Scale Selector */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Globe className="w-4 h-4 text-amber-500" /> Choose Academic Scale
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SCALES.map((scale) => {
                  const Icon = scale.icon;
                  return (
                    <button
                      key={scale.id}
                      onClick={() => handleScaleChange(scale)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col items-start gap-2 ${
                        activeScale.id === scale.id
                          ? `${scale.bg} ${scale.border} shadow-sm`
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeScale.id === scale.id ? scale.color : 'text-slate-400'}`} />
                      <span className={`block text-xs font-black ${activeScale.id === scale.id ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                        {scale.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GPA Input */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-amber-500" /> Enter Your {activeScale.id === "10.0" ? "CGPA" : "GPA"}</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">Max: {activeScale.max}</span>
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:w-2/3">
                  <input
                    type="range"
                    min="0"
                    max={activeScale.max}
                    step="0.01"
                    value={gpaValue}
                    onChange={(e) => setGpaValue(e.target.value)}
                    className={`w-full h-3 rounded-lg appearance-none cursor-pointer ${activeScale.bg} border border-black/5 dark:border-white/5`}
                    style={{ accentColor: activeScale.id === '10.0' ? '#10b981' : activeScale.id === '5.0' ? '#3b82f6' : '#f59e0b' }}
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase px-1">
                    <span>0.0</span>
                    <span>{activeScale.max / 2}</span>
                    <span>{activeScale.max}</span>
                  </div>
                </div>
                
                <div className="w-full sm:w-1/3 relative">
                  <input
                    type="number"
                    min="0"
                    max={activeScale.max}
                    step="0.01"
                    value={gpaValue}
                    onChange={(e) => {
                      let v = parseFloat(e.target.value);
                      if (v > activeScale.max) v = activeScale.max;
                      setGpaValue(v || "");
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-2xl font-black text-center text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Indian Specific Formula Toggles */}
            {activeScale.id === "10.0" && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-3">
                  <Calculator className="w-4 h-4 text-emerald-500" /> Conversion Formula
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CGPA_FORMULAS.map((form) => (
                    <label 
                      key={form.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        cgpaFormula.id === form.id
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="cgpaFormula"
                        checked={cgpaFormula.id === form.id}
                        onChange={() => setCgpaFormula(form)}
                        className="mt-1 accent-emerald-600 w-4 h-4"
                      />
                      <div>
                        <span className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-0.5">{form.name}</span>
                        <span className="block text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-1 bg-emerald-100 dark:bg-emerald-900/50 inline-block px-1 rounded">{form.formula}</span>
                        <span className="block text-[9px] font-medium text-slate-500">{form.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* US Scale Information Tip */}
            {activeScale.id !== "10.0" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3 items-start animate-in fade-in">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                  <strong>Scientific Non-Linear Conversion:</strong> Unlike basic calculators that divide by 4, this tool uses standard academic interpolation (e.g., 3.0 = 85%, not 75%) to provide an exact percentage mapped to real university grade bounds.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-inner text-center relative overflow-hidden">
            {/* Dynamic Top Accent Bar based on Scale */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
              activeScale.id === '10.0' ? 'from-emerald-400 to-teal-500' :
              activeScale.id === '5.0' ? 'from-blue-400 to-indigo-500' :
              'from-amber-400 to-orange-500'
            }`}></div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 shadow-sm">
              <Percent className="w-3.5 h-3.5 text-slate-400" /> Equivalent Percentage
            </div>
            
            <div className="flex flex-col items-center justify-center mb-8 relative">
              <span className={`text-7xl font-black tracking-tighter ${
                parseFloat(results.percentage) >= 90 ? 'text-emerald-500' : 
                parseFloat(results.percentage) >= 75 ? 'text-amber-500' : 
                parseFloat(results.percentage) >= 60 ? 'text-blue-500' : 
                'text-rose-500'
              }`}>
                {results.percentage}<span className="text-3xl text-slate-400 ml-1">%</span>
              </span>
            </div>

            {/* Academic Standings Grid */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-700 dark:text-slate-200 mb-1">{results.grade}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Letter Grade
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-slate-700 dark:text-slate-200 mb-1 leading-tight min-h-[40px] flex items-center">{results.honors}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Academic Standing
                </span>
              </div>
            </div>
          </div>

          {/* Next Milestone Actionable Insight */}
          {results.nextMilestone && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                <TrendingUp className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mb-0.5">Next Milestone</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {results.nextMilestone}
                </p>
              </div>
            </div>
          )}
          
          {/* Edge case warning */}
          {parseFloat(gpaValue) === 0 && (
            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                A GPA of 0.0 means academic failure. Contact your academic advisor immediately.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
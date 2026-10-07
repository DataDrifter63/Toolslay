"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Percent, Plus, Trash2, Target, 
  BookOpen, BarChart
} from "lucide-react";

// Standard US/Global Grading Scale
const GRADING_SCALE = [
  { min: 97, grade: "A+", gpa: "4.0", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", msg: "Outstanding" },
  { min: 93, grade: "A", gpa: "4.0", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", msg: "Excellent" },
  { min: 90, grade: "A-", gpa: "3.7", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", msg: "Great" },
  { min: 87, grade: "B+", gpa: "3.3", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", msg: "Very Good" },
  { min: 83, grade: "B", gpa: "3.0", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", msg: "Good" },
  { min: 80, grade: "B-", gpa: "2.7", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", msg: "Above Average" },
  { min: 77, grade: "C+", gpa: "2.3", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", msg: "Average" },
  { min: 73, grade: "C", gpa: "2.0", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", msg: "Satisfactory" },
  { min: 70, grade: "C-", gpa: "1.7", color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", msg: "Barely Satisfactory" },
  { min: 67, grade: "D+", gpa: "1.3", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", msg: "Poor" },
  { min: 60, grade: "D", gpa: "1.0", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", msg: "Very Poor" },
  { min: 0,  grade: "F", gpa: "0.0", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", msg: "Fail" }
];

export default function GradePercentageCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Dynamic Subjects List
  const [subjects, setSubjects] = useState([
    { id: 1, name: "Assessment 1", obtained: "", total: "" }
  ]);

  // Target Predictor State
  const [targetPercentage, setTargetPercentage] = useState(90);
  const [futureTotalMarks, setFutureTotalMarks] = useState(100);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: `Assessment ${subjects.length + 1}`, obtained: "", total: "" }]);
  };

  const removeSubject = (id) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const updateSubject = (id, field, value) => {
    const newVal = value === "" ? "" : Math.max(0, parseFloat(value) || 0);
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: newVal } : s));
  };

  // Core Math Engine
  const calculations = useMemo(() => {
    let totalObtained = 0;
    let totalMax = 0;

    subjects.forEach(sub => {
      const obt = parseFloat(sub.obtained) || 0;
      const tot = parseFloat(sub.total) || 0;
      totalObtained += obt;
      totalMax += tot;
    });

    let percentage = 0;
    if (totalMax > 0) {
      percentage = (totalObtained / totalMax) * 100;
    }

    const currentGrade = GRADING_SCALE.find(g => percentage >= g.min) || GRADING_SCALE[GRADING_SCALE.length - 1];

    let neededMarks = 0;
    let predictorMsg = null;
    let predictorStatus = "neutral";

    if (totalMax > 0 && futureTotalMarks > 0) {
      const requiredTotalSum = (targetPercentage / 100) * (totalMax + (parseFloat(futureTotalMarks) || 0));
      neededMarks = requiredTotalSum - totalObtained;

      if (neededMarks <= 0) {
        neededMarks = 0;
        predictorMsg = "Target already secured! You just need >0 marks.";
        predictorStatus = "optimal";
      } else if (neededMarks > futureTotalMarks) {
        predictorMsg = `Mathematically impossible. Max possible is ${(((totalObtained + futureTotalMarks) / (totalMax + futureTotalMarks)) * 100).toFixed(1)}%`;
        predictorStatus = "danger";
      } else if (neededMarks > futureTotalMarks * 0.9) {
        predictorMsg = "Very challenging! You need near perfect score.";
        predictorStatus = "warning";
      } else {
        predictorMsg = "Achievable. Stay focused on your prep!";
        predictorStatus = "optimal";
      }
    }

    return {
      totalObtained: parseFloat(totalObtained.toFixed(2)),
      totalMax: parseFloat(totalMax.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2)),
      gradeInfo: currentGrade,
      neededMarks: parseFloat(Math.max(0, neededMarks).toFixed(1)),
      predictorMsg,
      predictorStatus
    };
  }, [subjects, targetPercentage, futureTotalMarks]);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-paper p-3 rounded-xl border border-line shrink-0">
            <Percent className="w-6 h-6 text-fuchsia-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Grade Percentage Calculator
            </h2>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">
              Marks, GPA & Target Grade Predictor
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6 min-w-0">
          
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-fuchsia-500" /> Academic Scores
              </h3>
              <span className="text-[9px] bg-surface border border-line px-2 py-0.5 rounded-lg text-muted font-black">
                {subjects.length} Entry(s)
              </span>
            </div>

            {/* Dynamic Subjects List */}
            <div className="space-y-3">
              {subjects.map((sub, index) => (
                <div key={sub.id} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end p-3.5 bg-surface rounded-xl border border-line transition-colors">
                  
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black text-muted uppercase tracking-wider">Name / Subject</label>
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => setSubjects(subjects.map(s => s.id === sub.id ? { ...s, name: e.target.value } : s))}
                      placeholder="e.g. Midterm"
                      className="w-full bg-paper border border-line rounded-xl px-3 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                    />
                  </div>

                  <div className="flex gap-2 sm:contents">
                    <div className="w-full sm:w-28 space-y-1.5">
                      <label className="text-[10px] font-black text-muted uppercase tracking-wider">Obtained</label>
                      <input
                        type="number"
                        min="0"
                        value={sub.obtained}
                        onChange={(e) => updateSubject(sub.id, "obtained", e.target.value)}
                        placeholder="Marks"
                        className="w-full bg-paper border border-line rounded-xl px-3 py-2.5 text-xs font-black text-ink outline-none focus:border-brand"
                      />
                    </div>

                    <div className="w-full sm:w-28 space-y-1.5">
                      <label className="text-[10px] font-black text-muted uppercase tracking-wider">Total</label>
                      <input
                        type="number"
                        min="1"
                        value={sub.total}
                        onChange={(e) => updateSubject(sub.id, "total", e.target.value)}
                        placeholder="Max"
                        className="w-full bg-paper border border-line rounded-xl px-3 py-2.5 text-xs font-black text-ink outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  {subjects.length > 1 ? (
                    <button 
                      type="button"
                      onClick={() => removeSubject(sub.id)}
                      className="self-end sm:self-auto p-2.5 bg-surface border border-line hover:border-rose-500/50 text-muted hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="hidden sm:block w-[38px]"></div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSubject}
              className="w-full py-3.5 rounded-xl border border-dashed border-line hover:border-brand text-muted hover:text-brand text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer bg-surface"
            >
              <Plus className="w-4 h-4" /> Add Another Subject
            </button>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          
          {/* Main Percentage Result */}
          <div className="bg-surface border border-line p-6 sm:p-8 rounded-2xl shadow-sm text-center relative overflow-hidden space-y-5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-400 to-indigo-500"></div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper border border-line text-[10px] font-black uppercase tracking-wider text-muted shadow-sm">
              <BarChart className="w-3.5 h-3.5 text-fuchsia-500" /> Overall Performance
            </div>
            
            {/* The Big Percentage */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              <div className="absolute inset-0 m-auto w-36 h-36 rounded-full border-8 border-line opacity-40"></div>

              <div className="relative z-10 flex flex-col items-center justify-center w-36 h-36">
                <span className="text-3xl sm:text-4xl font-black text-ink tracking-tighter font-mono">
                  {calculations.percentage}<span className="text-xl text-muted">%</span>
                </span>
                <span className="text-[10px] font-black text-muted uppercase tracking-wider mt-1 font-mono">
                  {calculations.totalObtained} / {calculations.totalMax}
                </span>
              </div>
            </div>

            {/* Grades Grid */}
            {calculations.totalMax > 0 && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-line">
                <div className={`p-3.5 rounded-xl border flex flex-col items-center justify-center shadow-sm ${calculations.gradeInfo.bg} ${calculations.gradeInfo.border}`}>
                  <span className={`text-2xl font-black font-mono ${calculations.gradeInfo.color}`}>{calculations.gradeInfo.grade}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted mt-1">Letter Grade</span>
                </div>
                <div className={`p-3.5 rounded-xl border flex flex-col items-center justify-center shadow-sm ${calculations.gradeInfo.bg} ${calculations.gradeInfo.border}`}>
                  <span className={`text-2xl font-black font-mono ${calculations.gradeInfo.color}`}>{calculations.gradeInfo.gpa}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted mt-1">US GPA (4.0)</span>
                </div>
              </div>
            )}
            
            {calculations.totalMax > 0 && (
              <div className="text-center pt-1">
                <span className="text-xs font-bold text-muted">Remark: <span className={`font-black ${calculations.gradeInfo.color}`}>{calculations.gradeInfo.msg}</span></span>
              </div>
            )}
          </div>

          {/* Target Grade Predictor (What-if Mode) */}
          <div className="bg-paper border border-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-3">
              <Target className="w-4 h-4 text-indigo-500" /> Target Grade Predictor
            </h3>
            
            <p className="text-xs font-bold text-muted leading-relaxed">
              Find out how many marks you need in your <b>next exam</b> to achieve your desired overall percentage.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider">Target %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-xs font-black text-indigo-500 outline-none focus:border-brand font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider">Next Exam Total</label>
                <input
                  type="number"
                  min="1"
                  value={futureTotalMarks}
                  onChange={(e) => setFutureTotalMarks(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-xs font-black text-ink outline-none focus:border-brand font-mono"
                />
              </div>
            </div>

            {calculations.totalMax > 0 && futureTotalMarks > 0 && (
              <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-colors ${
                calculations.predictorStatus === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' :
                calculations.predictorStatus === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}>
                <div>
                  <span className="block text-[9px] font-black uppercase tracking-wider opacity-80 mb-0.5">Required Marks</span>
                  <span className="text-[11px] font-bold leading-tight block">{calculations.predictorMsg}</span>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="text-2xl font-black font-mono">
                    {calculations.neededMarks}
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
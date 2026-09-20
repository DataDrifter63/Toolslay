"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Percent, Plus, Trash2, Award, Target, 
  TrendingUp, BookOpen, AlertCircle, CheckCircle2,
  BarChart
} from "lucide-react";

// Standard US/Global Grading Scale
const GRADING_SCALE = [
  { min: 97, grade: "A+", gpa: "4.0", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", msg: "Outstanding" },
  { min: 93, grade: "A", gpa: "4.0", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", msg: "Excellent" },
  { min: 90, grade: "A-", gpa: "3.7", color: "text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", msg: "Great" },
  { min: 87, grade: "B+", gpa: "3.3", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", msg: "Very Good" },
  { min: 83, grade: "B", gpa: "3.0", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", msg: "Good" },
  { min: 80, grade: "B-", gpa: "2.7", color: "text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", msg: "Above Average" },
  { min: 77, grade: "C+", gpa: "2.3", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", msg: "Average" },
  { min: 73, grade: "C", gpa: "2.0", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", msg: "Satisfactory" },
  { min: 70, grade: "C-", gpa: "1.7", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", msg: "Barely Satisfactory" },
  { min: 67, grade: "D+", gpa: "1.3", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800", msg: "Poor" },
  { min: 60, grade: "D", gpa: "1.0", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800", msg: "Very Poor" },
  { min: 0,  grade: "F", gpa: "0.0", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800", msg: "Fail" }
];

export default function GradePercentageCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Dynamic Subjects List (Defaults to 1 item for quick calculation)
  const [subjects, setSubjects] = useState([
    { id: 1, name: "Assessment 1", obtained: "", total: "" }
  ]);

  // Target Predictor State
  const [targetPercentage, setTargetPercentage] = useState(90);
  const [futureTotalMarks, setFutureTotalMarks] = useState(100);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handlers for dynamic list
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
      // Prevent obtained being strictly greater than total visually, but allow math to run
      totalObtained += obt;
      totalMax += tot;
    });

    let percentage = 0;
    if (totalMax > 0) {
      percentage = (totalObtained / totalMax) * 100;
    }

    // Find Grade based on percentage
    const currentGrade = GRADING_SCALE.find(g => percentage >= g.min) || GRADING_SCALE[GRADING_SCALE.length - 1];

    // Predictor Math: How many marks needed in next exam to hit target %?
    // Formula: (Current Obtained + Needed) / (Current Total + Future Total) = Target % / 100
    // Needed = ((Target / 100) * (Current Total + Future Total)) - Current Obtained
    let neededMarks = 0;
    let predictorMsg = null;
    let predictorStatus = "neutral"; // neutral, optimal, warning, danger

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

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-50 dark:bg-fuchsia-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-fuchsia-100 dark:bg-fuchsia-900/50 p-3 rounded-xl shadow-inner">
            <Percent className="w-7 h-7 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Grade Percentage Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Marks, GPA & Target Grade Predictor
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-fuchsia-500" /> Academic Scores
              </h3>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                {subjects.length} Entry(s)
              </span>
            </div>

            {/* Dynamic Subjects List */}
            <div className="space-y-4">
              {subjects.map((sub, index) => (
                <div key={sub.id} className="grid grid-cols-[1fr,120px,120px,auto] gap-3 items-end p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors hover:border-fuchsia-200 dark:hover:border-fuchsia-900/50">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Name / Subject</label>
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => setSubjects(subjects.map(s => s.id === sub.id ? { ...s, name: e.target.value } : s))}
                      placeholder="e.g. Midterm"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-fuchsia-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Obtained</label>
                    <input
                      type="number"
                      min="0"
                      value={sub.obtained}
                      onChange={(e) => updateSubject(sub.id, "obtained", e.target.value)}
                      placeholder="Marks"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-black text-slate-800 dark:text-slate-200 outline-none focus:border-fuchsia-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Total</label>
                    <input
                      type="number"
                      min="1"
                      value={sub.total}
                      onChange={(e) => updateSubject(sub.id, "total", e.target.value)}
                      placeholder="Max"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-black text-slate-800 dark:text-slate-200 outline-none focus:border-fuchsia-500"
                    />
                  </div>

                  {subjects.length > 1 ? (
                    <button 
                      onClick={() => removeSubject(sub.id)}
                      className="p-2.5 mb-[1px] bg-slate-200 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-[36px]"></div> // Spacer for alignment
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addSubject}
              className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-fuchsia-400 dark:hover:border-fuchsia-600 text-slate-500 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Another Subject
            </button>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          {/* Main Percentage Result */}
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-inner text-center relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-400 to-indigo-500`}></div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 shadow-sm">
              <BarChart className="w-3.5 h-3.5 text-fuchsia-500" /> Overall Performance
            </div>
            
            {/* The Big Percentage */}
            <div className="flex flex-col items-center justify-center mb-8 relative">
              {/* Circular aesthetic ring */}
              <div className="absolute inset-0 m-auto w-40 h-40 rounded-full border-[12px] border-slate-100 dark:border-slate-800 opacity-50"></div>
              <div 
                className="absolute inset-0 m-auto w-40 h-40 rounded-full border-[12px] border-transparent"
                style={{
                  borderTopColor: calculations.totalMax > 0 ? (calculations.percentage >= 50 ? '#10b981' : '#f43f5e') : 'transparent',
                  borderRightColor: calculations.totalMax > 0 && calculations.percentage >= 25 ? (calculations.percentage >= 50 ? '#10b981' : '#f43f5e') : 'transparent',
                  borderBottomColor: calculations.totalMax > 0 && calculations.percentage >= 50 ? '#10b981' : 'transparent',
                  borderLeftColor: calculations.totalMax > 0 && calculations.percentage >= 75 ? '#10b981' : 'transparent',
                  transform: 'rotate(-45deg)'
                }}
              ></div>

              <div className="relative z-10 flex flex-col items-center justify-center w-40 h-40">
                <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                  {calculations.percentage}<span className="text-2xl text-slate-400">%</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {calculations.totalObtained} / {calculations.totalMax}
                </span>
              </div>
            </div>

            {/* Grades Grid */}
            {calculations.totalMax > 0 && (
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center shadow-sm ${calculations.gradeInfo.bg} ${calculations.gradeInfo.border}`}>
                  <span className={`text-2xl font-black ${calculations.gradeInfo.color}`}>{calculations.gradeInfo.grade}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 mt-1">Letter Grade</span>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center shadow-sm ${calculations.gradeInfo.bg} ${calculations.gradeInfo.border}`}>
                  <span className={`text-2xl font-black ${calculations.gradeInfo.color}`}>{calculations.gradeInfo.gpa}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 mt-1">US GPA (4.0)</span>
                </div>
              </div>
            )}
            
            {calculations.totalMax > 0 && (
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-slate-500">Remark: <span className={calculations.gradeInfo.color}>{calculations.gradeInfo.msg}</span></span>
              </div>
            )}
          </div>

          {/* Target Grade Predictor (What-if Mode) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Target className="w-4 h-4 text-indigo-500" /> Target Grade Predictor
            </h3>
            
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Find out how many marks you need in your <b>next exam</b> to achieve your desired overall percentage.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-black text-indigo-600 dark:text-indigo-400 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Next Exam Total</label>
                <input
                  type="number"
                  min="1"
                  value={futureTotalMarks}
                  onChange={(e) => setFutureTotalMarks(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-black text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {calculations.totalMax > 0 && futureTotalMarks > 0 && (
              <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-colors ${
                calculations.predictorStatus === 'danger' ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' :
                calculations.predictorStatus === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
              }`}>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Required Marks</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{calculations.predictorMsg}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-2xl font-black ${
                    calculations.predictorStatus === 'danger' ? 'text-rose-600 dark:text-rose-400' :
                    calculations.predictorStatus === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
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
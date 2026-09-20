"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  GraduationCap, Calendar, Clock, BookOpen, Plus, 
  Trash2, AlertTriangle, CheckCircle2, Target,
  Zap, CalendarClock, ShieldAlert
} from "lucide-react";

export default function StudyTimeCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [examName, setExamName] = useState("Final Exams");
  const [examDate, setExamDate] = useState("");
  const [dailyCapacity, setDailyCapacity] = useState(4);
  const [reserveRevisionDay, setReserveRevisionDay] = useState(true);
  
  // Topics State
  const [topics, setTopics] = useState([
    { id: 1, name: "Chapter 1: Fundamentals", hours: 3 },
    { id: 2, name: "Chapter 2: Advanced Concepts", hours: 5 },
  ]);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicHours, setNewTopicHours] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Set default exam date to 7 days from today
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    setExamDate(futureDate.toISOString().split('T')[0]);
  }, []);

  const addTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !newTopicHours || newTopicHours <= 0) return;
    
    setTopics([...topics, {
      id: Date.now(),
      name: newTopicName,
      hours: parseFloat(newTopicHours)
    }]);
    setNewTopicName("");
    setNewTopicHours("");
  };

  const removeTopic = (id) => {
    setTopics(topics.filter(t => t.id !== id));
  };

  // Smart Calculation Engine
  const calculations = useMemo(() => {
    const totalHours = topics.reduce((sum, topic) => sum + topic.hours, 0);
    
    let daysLeft = 0;
    if (examDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eDate = new Date(examDate);
      eDate.setHours(0, 0, 0, 0);
      daysLeft = Math.ceil((eDate - today) / (1000 * 60 * 60 * 24));
    }

    // Effective days after removing revision buffer
    let effectiveDays = daysLeft;
    if (reserveRevisionDay && daysLeft > 1) {
      effectiveDays = daysLeft - 1;
    }
    
    // Prevent division by zero if exam is today/tomorrow
    effectiveDays = Math.max(1, effectiveDays);

    const requiredDailyHours = totalHours / effectiveDays;
    
    // Feasibility Logic
    let status = {};
    if (daysLeft < 0) {
      status = { type: "danger", label: "Exam Passed", msg: "The exam date has already passed.", color: "rose" };
    } else if (daysLeft === 0) {
      status = { type: "danger", label: "Exam Today", msg: "Good luck! No time left for new topics.", color: "rose" };
    } else if (requiredDailyHours > dailyCapacity) {
      status = { type: "danger", label: "Overloaded", msg: `You need ${requiredDailyHours.toFixed(1)}h/day but only have ${dailyCapacity}h. Cut topics or study more!`, color: "rose" };
    } else if (requiredDailyHours > dailyCapacity * 0.75) {
      status = { type: "warning", label: "Challenging", msg: "Tight schedule. You will need strict discipline.", color: "amber" };
    } else {
      status = { type: "optimal", label: "Optimal", msg: "Great! You have plenty of time to cover the syllabus.", color: "emerald" };
    }

    return {
      totalHours,
      daysLeft,
      effectiveDays,
      requiredDailyHours: requiredDailyHours.toFixed(1),
      status
    };
  }, [examDate, topics, dailyCapacity, reserveRevisionDay]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 dark:bg-violet-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-violet-100 dark:bg-violet-900/50 p-3 rounded-xl shadow-inner">
            <GraduationCap className="w-7 h-7 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Study Time Calculator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Smart Exam Prep & Feasibility Planner
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            {/* Exam Details */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Target className="w-4 h-4 text-violet-500" /> Exam Parameters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Exam Name</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. Physics Final"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Daily Study Capacity (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5 flex flex-col justify-end pb-1">
                  <label 
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      reserveRevisionDay 
                        ? "bg-violet-50 border-violet-500 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300" 
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={reserveRevisionDay}
                      onChange={(e) => setReserveRevisionDay(e.target.checked)}
                      className="w-4 h-4 accent-violet-600"
                    />
                    <div>
                      <span className="block text-xs font-bold">Reserve Revision Day</span>
                      <span className="block text-[9px] font-medium opacity-80">Keep last day for mock tests</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Syllabus / Topics Manager */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-violet-500" /> Syllabus Topics</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{topics.length} Items</span>
              </h3>
              
              {/* Add Topic Form */}
              <form onSubmit={addTopic} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Topic Name..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500"
                />
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={newTopicHours}
                  onChange={(e) => setNewTopicHours(e.target.value)}
                  placeholder="Hrs"
                  className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-bold text-center text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500"
                />
                <button 
                  type="submit"
                  disabled={!newTopicName || !newTopicHours}
                  className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl px-4 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              {/* Topics List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {topics.length === 0 ? (
                  <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-400">No topics added yet.</p>
                  </div>
                ) : (
                  topics.map(topic => (
                    <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-violet-300 transition-colors group">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{topic.name}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-black font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                          {topic.hours}h
                        </span>
                        <button onClick={() => removeTopic(topic.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-400 to-fuchsia-500`}></div>
            
            <h3 className="text-center text-sm font-black text-slate-800 dark:text-slate-100 mb-6 truncate px-4">
              {examName || "Your Study Plan"}
            </h3>
            
            {/* Macro Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <CalendarClock className="w-5 h-5 mx-auto text-violet-500 mb-2" />
                <span className="block text-2xl font-black text-slate-800 dark:text-slate-100">{calculations.daysLeft > 0 ? calculations.daysLeft : 0}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days Left</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <Clock className="w-5 h-5 mx-auto text-fuchsia-500 mb-2" />
                <span className="block text-2xl font-black text-slate-800 dark:text-slate-100">{calculations.totalHours}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Hrs</span>
              </div>
            </div>

            {/* Daily Target */}
            <div className="text-center bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Required Daily Study</span>
              <div className="flex items-baseline justify-center gap-2">
                <span className={`text-5xl font-black tracking-tighter ${calculations.status.type === 'danger' ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
                  {calculations.requiredDailyHours > 0 && calculations.daysLeft > 0 ? calculations.requiredDailyHours : "0"}
                </span>
                <span className="text-lg font-bold text-slate-400">hrs/day</span>
              </div>
            </div>

            {/* Feasibility Warning */}
            {calculations.daysLeft > 0 && (
              <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
                calculations.status.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' :
                calculations.status.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' :
                'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300'
              }`}>
                {calculations.status.color === 'emerald' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : 
                 calculations.status.color === 'amber' ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> : 
                 <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-0.5">{calculations.status.label}</h4>
                  <p className="text-[11px] font-medium leading-relaxed opacity-90">{calculations.status.msg}</p>
                </div>
              </div>
            )}
          </div>

          {/* Pomodoro Action Plan */}
          {topics.length > 0 && calculations.daysLeft > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Zap className="w-4 h-4 text-violet-500" /> Pomodoro Action Plan
              </h3>
              
              <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                {topics.map(topic => {
                  // 1 hour = 2 Pomodoros (25m study + 5m break)
                  const pomodoros = Math.ceil(topic.hours * 2);
                  return (
                    <div key={topic.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate pr-2">
                        {topic.name}
                      </span>
                      <div className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-md shrink-0">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-black tracking-wider">{pomodoros} Sessions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-slate-400 mt-4 text-center">1 Session = 25m Focus + 5m Break</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
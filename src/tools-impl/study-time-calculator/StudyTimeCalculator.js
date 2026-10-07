"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  GraduationCap, Clock, BookOpen, Plus, 
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

    let effectiveDays = daysLeft;
    if (reserveRevisionDay && daysLeft > 1) {
      effectiveDays = daysLeft - 1;
    }
    
    effectiveDays = Math.max(1, effectiveDays);

    const requiredDailyHours = totalHours / effectiveDays;
    
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

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-paper p-3 rounded-xl border border-line shrink-0">
            <GraduationCap className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Study Time Calculator
            </h2>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">
              Smart Exam Prep & Feasibility Planner
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6 min-w-0">
          
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Exam Details */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-3 mb-4">
                <Target className="w-4 h-4 text-violet-500" /> Exam Parameters
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Exam Name</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. Physics Final"
                    className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-xs font-bold text-ink outline-none focus:border-brand transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-xs font-bold text-ink outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Daily Study Capacity (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-xs font-bold text-ink outline-none focus:border-brand transition-colors"
                  />
                </div>
                
                <div className="space-y-2 flex flex-col justify-end">
                  <label 
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      reserveRevisionDay 
                        ? "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400" 
                        : "bg-surface border-line text-muted"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={reserveRevisionDay}
                      onChange={(e) => setReserveRevisionDay(e.target.checked)}
                      className="w-4 h-4 accent-violet-500 cursor-pointer shrink-0"
                    />
                    <div>
                      <span className="block text-xs font-black">Reserve Revision Day</span>
                      <span className="block text-[9px] font-bold opacity-80">Keep last day for mock tests</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Syllabus / Topics Manager */}
            <div className="pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center justify-between border-b border-line pb-3 mb-4">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-violet-500" /> Syllabus Topics</span>
                <span className="text-[9px] bg-surface border border-line px-2 py-0.5 rounded-lg text-muted font-black">{topics.length} Items</span>
              </h3>
              
              {/* Add Topic Form */}
              <form onSubmit={addTopic} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Topic Name..."
                  className="flex-1 bg-surface border border-line rounded-xl px-4 py-3 text-xs font-bold text-ink outline-none focus:border-brand"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newTopicHours}
                    onChange={(e) => setNewTopicHours(e.target.value)}
                    placeholder="Hrs"
                    className="w-24 sm:w-20 bg-surface border border-line rounded-xl px-3 py-3 text-xs font-black text-center text-ink outline-none focus:border-brand"
                  />
                  <button 
                    type="submit"
                    disabled={!newTopicName || !newTopicHours}
                    className="flex-1 sm:flex-none bg-brand hover:opacity-90 disabled:opacity-50 text-surface rounded-xl px-5 py-3 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Topics List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {topics.length === 0 ? (
                  <div className="text-center p-6 bg-surface rounded-xl border border-dashed border-line">
                    <p className="text-xs font-bold text-muted">No topics added yet.</p>
                  </div>
                ) : (
                  topics.map(topic => (
                    <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface hover:border-violet-500/50 transition-colors group">
                      <span className="text-xs font-bold text-ink truncate pr-4">{topic.name}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-black font-mono px-2 py-1 bg-paper border border-line rounded-lg text-muted">
                          {topic.hours}h
                        </span>
                        <button type="button" onClick={() => removeTopic(topic.id)} className="text-muted hover:text-rose-500 transition-colors cursor-pointer">
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
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden space-y-5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-400 to-fuchsia-500"></div>
            
            <h3 className="text-center text-xs font-black text-ink truncate px-4 uppercase tracking-wider">
              {examName || "Your Study Plan"}
            </h3>
            
            {/* Macro Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper p-4 rounded-xl border border-line shadow-sm text-center">
                <CalendarClock className="w-5 h-5 mx-auto text-violet-500 mb-2" />
                <span className="block text-xl sm:text-2xl font-black text-ink font-mono">{calculations.daysLeft > 0 ? calculations.daysLeft : 0}</span>
                <span className="text-[9px] font-black text-muted uppercase tracking-wider">Days Left</span>
              </div>
              <div className="bg-paper p-4 rounded-xl border border-line shadow-sm text-center">
                <Clock className="w-5 h-5 mx-auto text-fuchsia-500 mb-2" />
                <span className="block text-xl sm:text-2xl font-black text-ink font-mono">{calculations.totalHours}</span>
                <span className="text-[9px] font-black text-muted uppercase tracking-wider">Total Hrs</span>
              </div>
            </div>

            {/* Daily Target */}
            <div className="text-center bg-paper p-5 rounded-xl border border-line shadow-sm">
              <span className="text-[9px] font-black text-muted uppercase tracking-wider block mb-1">Required Daily Study</span>
              <div className="flex items-baseline justify-center gap-2">
                <span className={`text-4xl sm:text-5xl font-black tracking-tighter font-mono ${calculations.status.type === 'danger' ? 'text-rose-500' : 'text-ink'}`}>
                  {calculations.requiredDailyHours > 0 && calculations.daysLeft > 0 ? calculations.requiredDailyHours : "0"}
                </span>
                <span className="text-sm font-bold text-muted">hrs/day</span>
              </div>
            </div>

            {/* Feasibility Warning */}
            {calculations.daysLeft > 0 && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
                calculations.status.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                calculations.status.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}>
                {calculations.status.color === 'emerald' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : 
                 calculations.status.color === 'amber' ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> : 
                 <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider mb-0.5">{calculations.status.label}</h4>
                  <p className="text-[11px] font-bold leading-relaxed opacity-90">{calculations.status.msg}</p>
                </div>
              </div>
            )}
          </div>

          {/* Pomodoro Action Plan */}
          {topics.length > 0 && calculations.daysLeft > 0 && (
            <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-3">
                <Zap className="w-4 h-4 text-violet-500" /> Pomodoro Action Plan
              </h3>
              
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {topics.map(topic => {
                  const pomodoros = Math.ceil(topic.hours * 2);
                  return (
                    <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-line">
                      <span className="text-xs font-bold text-ink truncate pr-2">
                        {topic.name}
                      </span>
                      <div className="flex items-center gap-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-lg shrink-0 border border-violet-500/20">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-black tracking-wider">{pomodoros} Sessions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] font-bold text-muted text-center uppercase tracking-wider">1 Session = 25m Focus + 5m Break</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
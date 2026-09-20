"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Activity, Clock, Play, Pause, SkipForward, SkipBack, 
  RotateCcw, CheckCircle2, ChevronRight, User, Briefcase, 
  ArrowDownToLine, ArrowUpFromLine, HeartPulse
} from "lucide-react";

const STRETCH_DB = [
  { id: 'neck_rolls', name: 'Neck Rolls', duration: 30, areas: ['upper', 'desk'], instruction: 'Drop your chin to your chest and slowly roll your head in a full circle. Switch directions halfway.', icon: '💆' },
  { id: 'chest_opener', name: 'Chest Opener', duration: 45, areas: ['upper', 'desk'], instruction: 'Clasp hands behind your back, straighten arms, and gently pull your shoulders back while lifting your chest.', icon: '👐' },
  { id: 'cat_cow', name: 'Cat-Cow Stretch', duration: 60, areas: ['upper', 'lower', 'desk'], instruction: 'On hands and knees, inhale to arch your back (Cow), exhale to round your spine toward the ceiling (Cat).', icon: '🐈' },
  { id: 'childs_pose', name: 'Child\'s Pose', duration: 60, areas: ['lower', 'all'], instruction: 'Kneel, sit back on your heels, reach your arms forward on the floor, and rest your forehead down.', icon: '🧘' },
  { id: 'seated_twist', name: 'Seated Spinal Twist', duration: 60, areas: ['upper', 'lower', 'desk'], instruction: 'Sit up straight, cross right leg over left, and gently twist your torso to the right. Hold 30s, then switch.', icon: '🔀' },
  { id: 'hamstring', name: 'Standing Hamstring', duration: 60, areas: ['lower'], instruction: 'Keep one leg straight, bend the other slightly, and hinge at the hips to stretch the back of the straight leg. Hold 30s per side.', icon: '🦵' },
  { id: 'quad', name: 'Standing Quad Stretch', duration: 60, areas: ['lower'], instruction: 'Hold onto a wall, grab your left ankle with your left hand, and pull your heel toward your glutes. Switch halfway.', icon: '🦿' },
  { id: 'wrist', name: 'Wrist Extensors', duration: 30, areas: ['upper', 'desk'], instruction: 'Extend your arm, palm facing down. Use your other hand to gently pull your fingers toward you.', icon: '✋' },
  { id: 'shoulder_cross', name: 'Cross-Body Shoulder', duration: 60, areas: ['upper', 'desk'], instruction: 'Pull one arm across your chest using the other arm. Keep your shoulder dropped. Hold 30s per side.', icon: '🫂' },
  { id: 'butterfly', name: 'Butterfly Stretch', duration: 60, areas: ['lower'], instruction: 'Sit with the soles of your feet together, sit up tall, and gently press your knees toward the floor.', icon: '🦋' },
  { id: 'down_dog', name: 'Downward Facing Dog', duration: 60, areas: ['upper', 'lower'], instruction: 'From hands and knees, lift your hips up and back, pressing your chest toward your thighs. Keep spine straight.', icon: '🐕' },
  { id: 'hip_flexor', name: 'Kneeling Hip Flexor', duration: 60, areas: ['lower', 'desk'], instruction: 'Kneel on one knee, step the other foot forward, and gently push your hips forward until you feel a stretch. Switch halfway.', icon: '🏃' },
  { id: 'side_reach', name: 'Overhead Side Reach', duration: 45, areas: ['upper', 'desk'], instruction: 'Reach one arm overhead and gently lean to the opposite side, stretching your obliques. Switch halfway.', icon: '🧍' },
  { id: 'glute_bridge', name: 'Glute Bridge Hold', duration: 45, areas: ['lower'], instruction: 'Lie on your back, knees bent. Squeeze glutes and lift hips toward the ceiling. Hold the stretch at the top.', icon: '🌉' }
];

const FOCUS_AREAS = [
  { id: "all", label: "Full Body", icon: User, desc: "Balanced head-to-toe routine" },
  { id: "desk", label: "Desk Worker", icon: Briefcase, desc: "Fix posture & relieve tech neck" },
  { id: "upper", label: "Upper Body", icon: ArrowUpFromLine, desc: "Shoulders, chest, and back" },
  { id: "lower", label: "Lower Body", icon: ArrowDownToLine, desc: "Legs, hips, and glutes" }
];

const DURATIONS = [5, 10, 15, 20]; // minutes

export default function StretchingRoutineGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // App State: 'setup' | 'preview' | 'active' | 'finished'
  const [step, setStep] = useState("setup");
  
  // Setup State
  const [focus, setFocus] = useState("desk");
  const [durationMins, setDurationMins] = useState(10);
  
  // Routine State
  const [routine, setRoutine] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  
  // Player State
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Timer Engine
  useEffect(() => {
    let timer;
    if (step === "active" && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === "active" && timeLeft === 0 && routine.length > 0) {
      handleNext();
    }
    return () => clearInterval(timer);
  }, [step, isPaused, timeLeft, routine]);

  const generateRoutine = () => {
    let available = STRETCH_DB.filter(s => s.areas.includes(focus) || focus === 'all');
    // Shuffle array for variety
    available = [...available].sort(() => 0.5 - Math.random());
    
    let targetSecs = durationMins * 60;
    let currentSecs = 0;
    let generated = [];
    let i = 0;

    // Build routine until target time is met
    while (currentSecs < targetSecs) {
      if (i >= available.length) i = 0; // Loop if requested time exceeds unique stretches
      generated.push(available[i]);
      currentSecs += available[i].duration;
      i++;
    }

    setRoutine(generated);
    setStep("preview");
  };

  const startRoutine = () => {
    setActiveIdx(0);
    setTimeLeft(routine[0].duration);
    setIsPaused(false);
    setStep("active");
  };

  const handleNext = () => {
    if (activeIdx < routine.length - 1) {
      const nextIdx = activeIdx + 1;
      setActiveIdx(nextIdx);
      setTimeLeft(routine[nextIdx].duration);
    } else {
      setStep("finished");
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      const prevIdx = activeIdx - 1;
      setActiveIdx(prevIdx);
      setTimeLeft(routine[prevIdx].duration);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 dark:bg-cyan-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-cyan-100 dark:bg-cyan-900/50 p-3 rounded-xl shadow-inner">
            <Activity className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Stretching Routine Generator
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Custom Follow-Along Mobility Flow
            </p>
          </div>
        </div>
      </div>

      {/* ================= STEP 1: SETUP ================= */}
      {step === "setup" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 sm:p-8 rounded-2xl shadow-sm space-y-8 animate-in fade-in zoom-in-95">
          
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300">1</span>
              Target Area
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FOCUS_AREAS.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setFocus(area.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    focus === area.id
                      ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-cyan-300"
                  }`}
                >
                  <area.icon className={`w-5 h-5 mb-2 ${focus === area.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500'}`} />
                  <span className={`block text-sm font-extrabold mb-1 ${focus === area.id ? 'text-cyan-800 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-200'}`}>
                    {area.label}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {area.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300">2</span>
              Time Available
            </h3>
            <div className="flex flex-wrap gap-3">
              {DURATIONS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDurationMins(mins)}
                  className={`flex-1 py-4 rounded-xl border-2 text-center transition-all min-w-[80px] ${
                    durationMins === mins
                      ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-cyan-300"
                  }`}
                >
                  <span className={`block text-xl font-black ${durationMins === mins ? 'text-cyan-800 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-200'}`}>
                    {mins}
                  </span>
                  <span className={`block text-[10px] font-bold uppercase tracking-widest ${durationMins === mins ? 'text-cyan-600 dark:text-cyan-500' : 'text-slate-400'}`}>
                    Mins
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateRoutine}
            className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            Generate Routine <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= STEP 2: PREVIEW ================= */}
      {step === "preview" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-8">
          <div className="p-6 bg-slate-50 dark:bg-[#0d1117] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Your Custom Routine</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                {routine.length} Movements • ~{durationMins} Minutes
              </p>
            </div>
            <button onClick={() => setStep("setup")} className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
              Edit Setup
            </button>
          </div>
          
          <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
            {routine.map((stretch, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-500 shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{stretch.icon} {stretch.name}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{stretch.duration} seconds</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <button
              onClick={startRoutine}
              className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Play className="w-4 h-4 fill-current" /> Start Player
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: ACTIVE PLAYER ================= */}
      {step === "active" && routine[activeIdx] && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 sm:p-10 rounded-2xl shadow-sm text-center animate-in fade-in zoom-in-95">
          
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
            <span>Stretch {activeIdx + 1} of {routine.length}</span>
            <button onClick={() => setStep("preview")} className="hover:text-slate-700 dark:hover:text-slate-200">Exit Player</button>
          </div>

          <div className="mb-8 relative max-w-[240px] mx-auto">
            {/* Circular Progress (Simplified UI representation) */}
            <div className="w-full aspect-square rounded-full border-8 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-cyan-50 dark:bg-cyan-900/20 transition-all duration-1000 origin-bottom"
                style={{ height: `${(timeLeft / routine[activeIdx].duration) * 100}%`, top: 'auto', bottom: 0 }}
              />
              <span className="relative z-10 text-6xl font-black text-slate-800 dark:text-slate-100 tabular-nums tracking-tighter">
                {formatTime(timeLeft)}
              </span>
              <span className="relative z-10 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                Time Remaining
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3">
              {routine[activeIdx].icon} {routine[activeIdx].name}
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              {routine[activeIdx].instruction}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handlePrev}
              disabled={activeIdx === 0}
              className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-6 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
            >
              {isPaused ? <Play className="w-8 h-8 fill-current ml-1" /> : <Pause className="w-8 h-8 fill-current" />}
            </button>

            <button 
              onClick={handleNext}
              className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: FINISHED ================= */}
      {step === "finished" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-10 rounded-2xl shadow-sm text-center animate-in zoom-in-95 fade-in">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">Routine Complete!</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Great job! You've successfully completed your {durationMins}-minute mobility session. Your body thanks you.
          </p>
          <button
            onClick={() => {
              setStep("setup");
              setRoutine([]);
            }}
            className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" /> Start New Routine
          </button>
        </div>
      )}

    </div>
  );
}
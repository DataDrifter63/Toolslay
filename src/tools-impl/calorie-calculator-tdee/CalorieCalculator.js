"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Flame, Activity, Scale, CalendarDays, Zap, PieChart, Plus, Minus } from "lucide-react";

// ✅ PRO CUSTOM STEPPER (Fixes all input & up/down arrow issues)
const PremiumStepper = ({ value, min, max, onChange, unit }) => {
  const handleDec = () => {
    let val = Number(value);
    if (isNaN(val)) val = min + 1;
    if (val > min) onChange(val - 1);
  };
  
  const handleInc = () => {
    let val = Number(value);
    if (isNaN(val)) val = min - 1;
    if (val < max) onChange(val + 1);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '') onChange('');
    else onChange(Number(val));
  };

  return (
    <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 transition-shadow">
      <button onClick={handleDec} className="p-4 text-slate-500 hover:text-orange-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Minus className="w-5 h-5" />
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={handleChange}
        className="w-full text-center text-xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
      />
      <button onClick={handleInc} className="p-4 text-slate-500 hover:text-orange-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Plus className="w-5 h-5" />
      </button>
      {unit && <span className="pr-4 font-black text-slate-400 select-none uppercase text-xs tracking-widest">{unit}</span>}
    </div>
  );
};

const CalorieCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  // ✅ Fixed Default Values (Using Numbers instead of Strings)
  const [system, setSystem] = useState("metric"); 
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(25);
  
  const [cm, setCm] = useState(175);
  const [kg, setKg] = useState(75);
  
  // Single Imperial Height State
  const [totalInches, setTotalInches] = useState(69); // 5 ft 9 in
  const [lbs, setLbs] = useState(165);
  
  const [activity, setActivity] = useState("1.55"); 
  const [goal, setGoal] = useState("maintain"); 

  const [results, setResults] = useState({
    bmr: 0,
    tdee: 0,
    targetCalories: 0,
    macros: { protein: 0, carbs: 0, fats: 0 },
    zigZag: []
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSystemSwitch = (newSystem) => {
    if (newSystem === "imperial" && system === "metric") {
      const inches = (Number(cm) || 0) / 2.54;
      setTotalInches(Math.round(inches));
      setLbs(Math.round((Number(kg) || 0) * 2.20462));
    } else if (newSystem === "metric" && system === "imperial") {
      setCm(Math.round((Number(totalInches) || 0) * 2.54));
      setKg(Math.round((Number(lbs) || 0) / 2.20462));
    }
    setSystem(newSystem);
  };

  const calculateCalories = useCallback(() => {
    let weightInKg = 0;
    let heightInCm = 0;
    const currentAge = Number(age) || 0;

    if (system === "metric") {
      weightInKg = Number(kg) || 0;
      heightInCm = Number(cm) || 0;
    } else {
      weightInKg = (Number(lbs) || 0) * 0.453592;
      heightInCm = (Number(totalInches) || 0) * 2.54;
    }

    if (weightInKg <= 0 || heightInCm <= 0 || currentAge <= 0) {
      setResults({ bmr: 0, tdee: 0, targetCalories: 0, macros: { protein: 0, carbs: 0, fats: 0 }, zigZag: [] });
      return;
    }

    let bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * currentAge);
    bmr = gender === "male" ? bmr + 5 : bmr - 161;

    const tdee = bmr * parseFloat(activity);

    let targetCals = tdee;
    let macroSplit = { p: 0.3, c: 0.4, f: 0.3 };

    if (goal === "lose") {
      targetCals = tdee - 500; 
      macroSplit = { p: 0.4, c: 0.3, f: 0.3 };
    } else if (goal === "gain") {
      targetCals = tdee + 500; 
      macroSplit = { p: 0.3, c: 0.5, f: 0.2 };
    }

    const minSafe = gender === "male" ? 1500 : 1200;
    if (targetCals < minSafe) targetCals = minSafe;

    const pGrams = (targetCals * macroSplit.p) / 4;
    const cGrams = (targetCals * macroSplit.c) / 4;
    const fGrams = (targetCals * macroSplit.f) / 9;

    const lowCals = targetCals * 0.85;
    const highCals = targetCals * 1.15;
    
    const zigZagSchedule = [
      { day: "Monday", type: "Low", cals: lowCals, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-900/20" },
      { day: "Tuesday", type: "Low", cals: lowCals, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-900/20" },
      { day: "Wednesday", type: "High", cals: highCals, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
      { day: "Thursday", type: "Normal", cals: targetCals, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
      { day: "Friday", type: "Normal", cals: targetCals, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
      { day: "Saturday", type: "High", cals: highCals, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
      { day: "Sunday", type: "Normal", cals: targetCals, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    ];

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCals),
      macros: {
        protein: Math.round(pGrams),
        carbs: Math.round(cGrams),
        fats: Math.round(fGrams)
      },
      zigZag: zigZagSchedule
    });
  }, [system, gender, age, cm, kg, totalInches, lbs, activity, goal]);

  useEffect(() => {
    calculateCalories();
  }, [calculateCalories]);

  const displayImperialHeight = () => {
    const total = Number(totalInches) || 0;
    const ft = Math.floor(total / 12);
    const inc = total % 12;
    return `${ft} ft ${inc} in`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">TDEE & Macro Engine</h2>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={() => handleSystemSwitch("metric")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'metric' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500'}`}>Metric</button>
          <button onClick={() => handleSystemSwitch("imperial")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'imperial' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500'}`}>Imperial</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Gender</label>
              <div className="flex gap-2 h-[60px]">
                <button onClick={() => setGender("male")} className={`flex-1 rounded-lg font-bold border transition-all ${gender === 'male' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 hover:border-blue-200'}`}>Male</button>
                <button onClick={() => setGender("female")} className={`flex-1 rounded-lg font-bold border transition-all ${gender === 'female' ? 'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 hover:border-pink-200'}`}>Female</button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Age</label>
              <PremiumStepper value={age} min={15} max={100} onChange={setAge} unit="Yrs" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><Scale className="w-4 h-4 text-orange-500"/> Weight</label>
              {system === 'metric' ? (
                <PremiumStepper value={kg} min={20} max={300} onChange={setKg} unit="kg" />
              ) : (
                <PremiumStepper value={lbs} min={40} max={600} onChange={setLbs} unit="lbs" />
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><Activity className="w-4 h-4 text-orange-500"/> Height</label>
              {system === 'metric' ? (
                <PremiumStepper value={cm} min={100} max={250} onChange={setCm} unit="cm" />
              ) : (
                <div className="flex flex-col gap-2">
                  <PremiumStepper value={totalInches} min={36} max={96} onChange={setTotalInches} unit="inches" />
                  <div className="text-center text-[11px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 dark:bg-orange-900/20 py-1.5 rounded-md border border-orange-100 dark:border-orange-800/50">
                    Equals: {displayImperialHeight()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Activity Level</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full text-sm font-bold p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-100 cursor-pointer">
                <option value="1.2">Sedentary (Office job, no exercise)</option>
                <option value="1.375">Lightly Active (Exercise 1-3 days/week)</option>
                <option value="1.55">Moderately Active (Exercise 3-5 days/week)</option>
                <option value="1.725">Very Active (Hard exercise 6-7 days/week)</option>
                <option value="1.9">Extra Active (Physical job + Hard exercise)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Primary Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lose', label: 'Cut', desc: 'Lose Fat' },
                  { id: 'maintain', label: 'Maintain', desc: 'Stay Same' },
                  { id: 'gain', label: 'Bulk', desc: 'Build Muscle' }
                ].map((g) => (
                  <button 
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${goal === g.id ? 'bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-400 scale-[1.02] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 hover:border-orange-200'}`}
                  >
                    <span className="font-black text-sm">{g.label}</span>
                    <span className="text-[10px] uppercase font-bold opacity-70 mt-1">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 h-full sticky top-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-24 h-24 text-orange-500"/></div>
             
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Daily Target Calories</h3>
               <div className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-2">
                 {isMounted && results.targetCalories > 0 ? results.targetCalories : "0"}
               </div>
               <div className="text-sm font-semibold text-orange-500 flex items-center justify-center gap-2">
                 <Flame className="w-4 h-4"/> Maintenance (TDEE): {isMounted ? results.tdee : 0} kcal
               </div>
             </div>

             {results.targetCalories > 0 && (
               <div className="mt-8 pt-6 border-t border-slate-800">
                 <div className="flex items-center gap-2 mb-4 justify-center">
                     <PieChart className="w-4 h-4 text-slate-400"/>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Macros</h4>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                     <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-center">
                         <span className="block text-2xl font-black text-rose-400">{results.macros.protein}g</span>
                         <span className="text-[10px] font-bold text-rose-500/70 uppercase">Protein</span>
                     </div>
                     <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-lg text-center">
                         <span className="block text-2xl font-black text-sky-400">{results.macros.carbs}g</span>
                         <span className="text-[10px] font-bold text-sky-500/70 uppercase">Carbs</span>
                     </div>
                     <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-center">
                         <span className="block text-2xl font-black text-amber-400">{results.macros.fats}g</span>
                         <span className="text-[10px] font-bold text-amber-500/70 uppercase">Fats</span>
                     </div>
                 </div>
               </div>
             )}
          </div>

          {results.targetCalories > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Zig-Zag Calorie Cycle</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                Break metabolism plateaus by cycling calories. This 7-day schedule averages exactly to your {results.targetCalories} daily target.
              </p>
              
              <div className="space-y-2">
                {results.zigZag.map((day, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors ${day.bg}`}>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-20">{day.day}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${day.color} bg-white/50 dark:bg-black/20`}>{day.type}</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">{Math.round(day.cals)} <span className="text-[10px] text-slate-400 font-medium">kcal</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalorieCalculator;
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Flame, Activity, Scale, CalendarDays, 
  Zap, PieChart, Plus, Minus, Copy, Check 
} from "lucide-react";

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
    <div className="flex items-center bg-surface border border-line rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all h-12 md:h-14 min-w-0">
      <button 
        type="button" 
        onClick={handleDec} 
        className="w-12 h-full flex items-center justify-center text-muted hover:text-brand hover:bg-paper transition-colors text-lg shrink-0"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={handleChange}
        className="w-full text-center text-base md:text-lg font-bold bg-transparent focus:outline-none text-ink [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0" 
      />
      <button 
        type="button" 
        onClick={handleInc} 
        className="w-12 h-full flex items-center justify-center text-muted hover:text-brand hover:bg-paper transition-colors text-lg shrink-0"
      >
        <Plus className="w-4 h-4" />
      </button>
      {unit && <span className="pr-4 font-bold text-muted select-none uppercase text-xs tracking-widest shrink-0">{unit}</span>}
    </div>
  );
};

const CalorieCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [system, setSystem] = useState("metric"); 
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(25);
  
  const [cm, setCm] = useState(175);
  const [kg, setKg] = useState(75);
  
  const [totalInches, setTotalInches] = useState(69); 
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
      { day: "Monday", type: "Low", cals: lowCals, color: "text-[#38bdf8]", bg: "bg-[#38bdf8]/10" },
      { day: "Tuesday", type: "Low", cals: lowCals, color: "text-[#38bdf8]", bg: "bg-[#38bdf8]/10" },
      { day: "Wednesday", type: "High", cals: highCals, color: "text-[#fb7185]", bg: "bg-[#fb7185]/10" },
      { day: "Thursday", type: "Normal", cals: targetCals, color: "text-teal", bg: "bg-teal/10" },
      { day: "Friday", type: "Normal", cals: targetCals, color: "text-teal", bg: "bg-teal/10" },
      { day: "Saturday", type: "High", cals: highCals, color: "text-[#fb7185]", bg: "bg-[#fb7185]/10" },
      { day: "Sunday", type: "Normal", cals: targetCals, color: "text-teal", bg: "bg-teal/10" },
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

  const copyResult = async () => {
    if (results.targetCalories <= 0) return;
    const text = 
      `TDEE & Macro Summary (${goal.toUpperCase()} Goal)\n` +
      `Daily Target Calories: ${results.targetCalories} kcal\n` +
      `Maintenance TDEE: ${results.tdee} kcal\n\n` +
      `Recommended Macros:\n` +
      `- Protein: ${results.macros.protein}g\n` +
      `- Carbs: ${results.macros.carbs}g\n` +
      `- Fats: ${results.macros.fats}g`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch (error) {
      setCopied(false);
    }
  };

  const displayImperialHeight = () => {
    const total = Number(totalInches) || 0;
    const ft = Math.floor(total / 12);
    const inc = total % 12;
    return `${ft} ft ${inc} in`;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Flame className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              TDEE & Macro Engine
            </h2>
          </div>

          <div className="flex bg-paper border border-line p-1 rounded-lg shrink-0">
            <button 
              type="button" 
              onClick={() => handleSystemSwitch("metric")} 
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-md transition-all ${system === 'metric' ? 'bg-surface text-brand shadow-sm border border-line' : 'text-muted'}`}
            >
              Metric
            </button>
            <button 
              type="button" 
              onClick={() => handleSystemSwitch("imperial")} 
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-md transition-all ${system === 'imperial' ? 'bg-surface text-brand shadow-sm border border-line' : 'text-muted'}`}
            >
              Imperial
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] items-start gap-6 md:gap-8 min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="flex flex-col gap-6 md:gap-8 min-w-0">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0">
              <div className="space-y-2 min-w-0">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block">Gender</label>
                <div className="flex gap-2.5 h-12 md:h-14">
                  <button 
                    type="button" 
                    onClick={() => setGender("male")} 
                    className={`flex-1 rounded-lg font-bold border transition-all text-sm md:text-base ${gender === 'male' ? 'bg-brand/10 border-brand/30 text-brand shadow-sm' : 'bg-surface border-line text-muted hover:text-ink'}`}
                  >
                    Male
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setGender("female")} 
                    className={`flex-1 rounded-lg font-bold border transition-all text-sm md:text-base ${gender === 'female' ? 'bg-brand/10 border-brand/30 text-brand shadow-sm' : 'bg-surface border-line text-muted hover:text-ink'}`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block">Age</label>
                <PremiumStepper value={age} min={15} max={100} onChange={setAge} unit="Yrs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 pt-6 border-t border-line min-w-0">
              <div className="space-y-2 min-w-0">
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                  <Scale className="w-4 h-4 md:w-5 md:h-5 text-brand"/> Weight
                </label>
                {system === 'metric' ? (
                  <PremiumStepper value={kg} min={20} max={300} onChange={setKg} unit="kg" />
                ) : (
                  <PremiumStepper value={lbs} min={40} max={600} onChange={setLbs} unit="lbs" />
                )}
              </div>

              <div className="space-y-2 min-w-0">
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                  <Activity className="w-4 h-4 md:w-5 md:h-5 text-brand"/> Height
                </label>
                {system === 'metric' ? (
                  <PremiumStepper value={cm} min={100} max={250} onChange={setCm} unit="cm" />
                ) : (
                  <div className="flex flex-col gap-2 min-w-0">
                    <PremiumStepper value={totalInches} min={36} max={96} onChange={setTotalInches} unit="in" />
                    <div className="text-center text-xs font-bold text-brand bg-brand/10 py-2 rounded-lg border border-brand/20">
                      Equals: {displayImperialHeight()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-line space-y-6 min-w-0">
              <div className="space-y-2 min-w-0">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block">Activity Level</label>
                <select 
                  value={activity} 
                  onChange={(e) => setActivity(e.target.value)} 
                  className="w-full text-sm md:text-base font-semibold px-4 py-3.5 bg-surface border border-line rounded-lg outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-ink cursor-pointer"
                >
                  <option value="1.2">Sedentary (Office job, no exercise)</option>
                  <option value="1.375">Lightly Active (Exercise 1-3 days/week)</option>
                  <option value="1.55">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="1.725">Very Active (Hard exercise 6-7 days/week)</option>
                  <option value="1.9">Extra Active (Physical job + Hard exercise)</option>
                </select>
              </div>

              <div className="space-y-2 min-w-0">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block">Primary Goal</label>
                <div className="grid grid-cols-3 gap-2.5 min-w-0">
                  {[
                    { id: 'lose', label: 'Cut', desc: 'Lose Fat' },
                    { id: 'maintain', label: 'Maintain', desc: 'Stay Same' },
                    { id: 'gain', label: 'Bulk', desc: 'Build Muscle' }
                  ].map((g) => {
                    const isActive = goal === g.id;
                    return (
                      <button 
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        className={`flex flex-col items-center justify-center p-3 md:p-3.5 rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-brand/10 border-brand/30 text-brand shadow-sm' 
                            : 'bg-surface border-line text-muted hover:text-ink hover:border-brand/30'
                        }`}
                      >
                        <span className="font-bold text-sm md:text-base">{g.label}</span>
                        <span className="text-[10px] md:text-xs uppercase font-semibold opacity-80 mt-0.5">{g.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* RESULT SIDEBAR PANEL */}
          <div className="flex flex-col gap-6 h-full min-w-0">
            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card text-center relative overflow-hidden min-w-0">
               
               <div className="flex items-center justify-between border-b border-line pb-4 mb-5 min-w-0">
                 <h3 className="text-base md:text-lg font-bold text-ink truncate">Calorie Target</h3>
                 <button
                   type="button"
                   onClick={copyResult}
                   className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-line bg-surface hover:bg-line text-ink text-xs font-semibold transition-colors shrink-0"
                 >
                   {copied ? <><Check className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-muted" /> Copy</>}
                 </button>
               </div>
               
               <div className="z-10 relative my-4 min-w-0">
                 <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink mb-2 truncate">
                   {isMounted && results.targetCalories > 0 ? results.targetCalories : "0"} <span className="text-lg md:text-xl font-sans font-semibold text-muted">kcal</span>
                 </div>
                 <div className="text-xs md:text-sm font-semibold text-brand flex items-center justify-center gap-1.5 truncate">
                   <Flame className="w-4 h-4 shrink-0"/> Maintenance (TDEE): {isMounted ? results.tdee : 0} kcal
                 </div>
               </div>

               {results.targetCalories > 0 && (
                 <div className="mt-6 pt-5 border-t border-line min-w-0">
                   <div className="flex items-center gap-1.5 mb-3.5 justify-center">
                       <PieChart className="w-4 h-4 text-muted shrink-0"/>
                       <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Recommended Macros</h4>
                   </div>
                   <div className="grid grid-cols-3 gap-2 min-w-0">
                       <div className="bg-[#fb7185]/10 border border-[#fb7185]/20 p-2.5 md:p-3 rounded-lg text-center min-w-0">
                           <span className="block text-xl md:text-2xl font-black text-[#e11d48] truncate">{results.macros.protein}g</span>
                           <span className="text-[10px] font-bold text-muted uppercase">Protein</span>
                       </div>
                       <div className="bg-[#38bdf8]/10 border border-[#38bdf8]/20 p-2.5 md:p-3 rounded-lg text-center min-w-0">
                           <span className="block text-xl md:text-2xl font-black text-[#0284c7] truncate">{results.macros.carbs}g</span>
                           <span className="text-[10px] font-bold text-muted uppercase">Carbs</span>
                       </div>
                       <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 md:p-3 rounded-lg text-center min-w-0">
                           <span className="block text-xl md:text-2xl font-black text-amber-600 truncate">{results.macros.fats}g</span>
                           <span className="text-[10px] font-bold text-muted uppercase">Fats</span>
                       </div>
                   </div>
                 </div>
               )}
            </div>

            {results.targetCalories > 0 && (
              <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card min-w-0">
                <div className="flex items-center gap-2 border-b border-line pb-3.5 mb-4 min-w-0">
                  <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0" />
                  <h3 className="text-sm md:text-base font-bold text-ink truncate">Zig-Zag Calorie Cycle</h3>
                </div>
                <p className="text-xs text-muted mb-4 font-medium leading-relaxed">
                  Break metabolism plateaus by cycling calories. This 7-day schedule averages exactly to your {results.targetCalories} daily target.
                </p>
                
                <div className="space-y-2 min-w-0">
                  {results.zigZag.map((day, idx) => (
                    <div key={idx} className={`flex justify-between items-center p-2.5 rounded-lg border border-line/50 hover:border-brand/30 transition-colors ${day.bg} min-w-0`}>
                      <span className="text-xs md:text-sm font-bold text-ink shrink-0 pr-2">{day.day}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${day.color} bg-surface shrink-0`}>{day.type}</span>
                      <span className="text-xs md:text-sm font-black text-ink shrink-0 pl-2">{Math.round(day.cals)} <span className="text-[10px] text-muted font-normal">kcal</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CalorieCalculator;
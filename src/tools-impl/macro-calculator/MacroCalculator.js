"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Utensils, Activity, Scale, Target, PieChart, Beef, Wheat, Droplet, Calculator, Minus, Plus } from "lucide-react";

// ✅ PRO CUSTOM STEPPER (Flawless input handling)
const PremiumStepper = ({ value, min, max, onChange, unit, step = 1 }) => {
  const handleDec = () => {
    let val = Number(value);
    if (isNaN(val)) val = min + step;
    if (val > min) onChange(val - step);
  };
  
  const handleInc = () => {
    let val = Number(value);
    if (isNaN(val)) val = min - step;
    if (val < max) onChange(val + step);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '') onChange('');
    else onChange(Number(val));
  };

  return (
    <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 transition-shadow">
      <button onClick={handleDec} className="p-4 text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Minus className="w-5 h-5" />
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={handleChange}
        className="w-full text-center text-xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
      />
      <button onClick={handleInc} className="p-4 text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Plus className="w-5 h-5" />
      </button>
      {unit && <span className="pr-4 font-black text-slate-400 select-none uppercase text-xs tracking-widest">{unit}</span>}
    </div>
  );
};

const MacroCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [system, setSystem] = useState("metric"); 
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(25);
  
  const [cm, setCm] = useState(175);
  const [kg, setKg] = useState(75);
  const [totalInches, setTotalInches] = useState(69); // 5'9"
  const [lbs, setLbs] = useState(165);
  
  // Advanced Features
  const [formula, setFormula] = useState("mifflin"); // mifflin or katch
  const [bodyFat, setBodyFat] = useState(15);
  const [activity, setActivity] = useState("1.55"); 
  const [goal, setGoal] = useState("maintain"); // lose, maintain, gain
  const [dietType, setDietType] = useState("balanced"); // balanced, lowcarb, keto, highprotein
  const [mealsPerDay, setMealsPerDay] = useState(4);

  const [results, setResults] = useState({
    tdee: 0,
    targetCalories: 0,
    macros: { p: 0, c: 0, f: 0, pCals: 0, cCals: 0, fCals: 0 },
    perMeal: { cals: 0, p: 0, c: 0, f: 0 }
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

  const calculateMacros = useCallback(() => {
    let weightInKg = system === "metric" ? (Number(kg) || 0) : (Number(lbs) || 0) * 0.453592;
    let heightInCm = system === "metric" ? (Number(cm) || 0) : (Number(totalInches) || 0) * 2.54;
    const currentAge = Number(age) || 0;
    const bf = Number(bodyFat) || 0;

    if (weightInKg <= 0 || heightInCm <= 0 || currentAge <= 0) return;

    let bmr = 0;
    if (formula === "katch" && bf > 0) {
      // Katch-McArdle Formula (Requires Body Fat %)
      const leanBodyMass = weightInKg * (1 - (bf / 100));
      bmr = 370 + (21.6 * leanBodyMass);
    } else {
      // Mifflin-St Jeor
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * currentAge);
      bmr = gender === "male" ? bmr + 5 : bmr - 161;
    }

    const tdee = bmr * parseFloat(activity);
    let targetCals = tdee;

    // Adjust Calories based on Goal
    if (goal === "lose") targetCals -= 500;
    else if (goal === "gain") targetCals += 500;

    // Minimum safe calories
    const minSafe = gender === "male" ? 1500 : 1200;
    if (targetCals < minSafe) targetCals = minSafe;

    // Macro Ratios Setup
    let split = { p: 0.3, c: 0.4, f: 0.3 }; // Balanced default
    if (dietType === "lowcarb") split = { p: 0.4, c: 0.2, f: 0.4 };
    else if (dietType === "keto") split = { p: 0.25, c: 0.05, f: 0.7 };
    else if (dietType === "highprotein") split = { p: 0.4, c: 0.35, f: 0.25 };

    // Calculate Grams (P: 4cals, C: 4cals, F: 9cals)
    const pCals = targetCals * split.p;
    const cCals = targetCals * split.c;
    const fCals = targetCals * split.f;

    const pGrams = pCals / 4;
    const cGrams = cCals / 4;
    const fGrams = fCals / 9;

    const meals = Number(mealsPerDay) || 1;

    setResults({
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCals),
      macros: {
        p: Math.round(pGrams), c: Math.round(cGrams), f: Math.round(fGrams),
        pCals: Math.round(pCals), cCals: Math.round(cCals), fCals: Math.round(fCals),
        pctP: Math.round(split.p * 100), pctC: Math.round(split.c * 100), pctF: Math.round(split.f * 100)
      },
      perMeal: {
        cals: Math.round(targetCals / meals),
        p: Math.round(pGrams / meals),
        c: Math.round(cGrams / meals),
        f: Math.round(fGrams / meals)
      }
    });
  }, [system, gender, age, cm, kg, totalInches, lbs, formula, bodyFat, activity, goal, dietType, mealsPerDay]);

  useEffect(() => {
    calculateMacros();
  }, [calculateMacros]);

  const displayImperialHeight = () => {
    const total = Number(totalInches) || 0;
    return `${Math.floor(total / 12)} ft ${total % 12} in`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Utensils className="w-6 h-6 text-rose-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Macro Architect</h2>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={() => handleSystemSwitch("metric")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'metric' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-500'}`}>Metric</button>
          <button onClick={() => handleSystemSwitch("imperial")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'imperial' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-500'}`}>Imperial</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* Input Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8">
            
            {/* Bio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Gender</label>
                <div className="flex gap-2 h-[60px]">
                  <button onClick={() => setGender("male")} className={`flex-1 rounded-lg font-bold border transition-all ${gender === 'male' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'}`}>Male</button>
                  <button onClick={() => setGender("female")} className={`flex-1 rounded-lg font-bold border transition-all ${gender === 'female' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'}`}>Female</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Age</label>
                <PremiumStepper value={age} min={15} max={100} onChange={setAge} unit="Yrs" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><Scale className="w-4 h-4 text-rose-500"/> Weight</label>
                {system === 'metric' ? (
                  <PremiumStepper value={kg} min={20} max={300} onChange={setKg} unit="kg" />
                ) : (
                  <PremiumStepper value={lbs} min={40} max={600} onChange={setLbs} unit="lbs" />
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><Activity className="w-4 h-4 text-rose-500"/> Height</label>
                {system === 'metric' ? (
                  <PremiumStepper value={cm} min={100} max={250} onChange={setCm} unit="cm" />
                ) : (
                  <div className="flex flex-col gap-2">
                    <PremiumStepper value={totalInches} min={36} max={96} onChange={setTotalInches} unit="inches" />
                    <div className="text-center text-[11px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-900/20 py-1.5 rounded-md border border-rose-100 dark:border-rose-800/50">
                      Equals: {displayImperialHeight()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Pro Algorithm Selector */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
              <div className="space-y-3">
                <label className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>Calculation Algorithm</span>
                  <span className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded">PRO</span>
                </label>
                <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg">
                  <button onClick={() => setFormula("mifflin")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formula === 'mifflin' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>Mifflin-St Jeor (Standard)</button>
                  <button onClick={() => setFormula("katch")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formula === 'katch' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>Katch-McArdle (LBM)</button>
                </div>
              </div>

              {formula === "katch" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Body Fat Percentage</label>
                  <PremiumStepper value={bodyFat} min={1} max={60} onChange={setBodyFat} unit="%" />
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Activity Level</label>
                <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full text-sm font-bold p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none">
                  <option value="1.2">Sedentary (Office job, no exercise)</option>
                  <option value="1.375">Lightly Active (Exercise 1-3 days/week)</option>
                  <option value="1.55">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="1.725">Very Active (Hard exercise 6-7 days/week)</option>
                  <option value="1.9">Extra Active (Physical job + Hard exercise)</option>
                </select>
              </div>
            </div>

            {/* Goals & Diet Prefs */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Fitness Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'lose', label: 'Cut', desc: 'Lose Fat' },
                    { id: 'maintain', label: 'Maintain', desc: 'Stay Same' },
                    { id: 'gain', label: 'Bulk', desc: 'Build Muscle' }
                  ].map((g) => (
                    <button key={g.id} onClick={() => setGoal(g.id)} className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${goal === g.id ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400 scale-[1.02] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 hover:border-rose-200'}`}>
                      <span className="font-black text-sm">{g.label}</span>
                      <span className="text-[10px] uppercase font-bold opacity-70 mt-1">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Diet Type (Macro Split)</label>
                <select value={dietType} onChange={(e) => setDietType(e.target.value)} className="w-full text-sm font-bold p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none">
                  <option value="balanced">Balanced (30% P / 40% C / 30% F)</option>
                  <option value="lowcarb">Low Carb (40% P / 20% C / 40% F)</option>
                  <option value="keto">Keto (25% P / 5% C / 70% F)</option>
                  <option value="highprotein">High Protein (40% P / 35% C / 25% F)</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Output Dashboard */}
        <div className="flex flex-col gap-6 h-full sticky top-6">
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
             <div className="z-10 relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Daily Target Calories</h3>
               <div className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-2">
                 {isMounted && results.targetCalories > 0 ? results.targetCalories : "0"}
               </div>
               <div className="text-xs font-semibold text-rose-500 flex items-center justify-center gap-1 uppercase tracking-wider">
                 <Calculator className="w-3.5 h-3.5"/> Maintenance (TDEE): {isMounted ? results.tdee : 0}
               </div>
             </div>

             {/* Macro Visual Bar */}
             {results.targetCalories > 0 && (
               <div className="mt-8 mb-4 max-w-2xl mx-auto space-y-2">
                 <div className="h-4 w-full bg-slate-800 rounded-full flex overflow-hidden border border-slate-700">
                   <div className="h-full bg-indigo-500 transition-all duration-700 ease-out" style={{ width: `${results.macros.pctP}%` }}></div>
                   <div className="h-full bg-amber-400 transition-all duration-700 ease-out" style={{ width: `${results.macros.pctC}%` }}></div>
                   <div className="h-full bg-rose-500 transition-all duration-700 ease-out" style={{ width: `${results.macros.pctF}%` }}></div>
                 </div>
               </div>
             )}

             {results.targetCalories > 0 && (
               <div className="mt-6">
                 <div className="grid grid-cols-3 gap-2">
                     <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-center flex flex-col items-center">
                         <Beef className="w-5 h-5 text-indigo-400 mb-1"/>
                         <span className="block text-2xl font-black text-indigo-400">{results.macros.p}g</span>
                         <span className="text-[10px] font-bold text-indigo-500/70 uppercase">Protein ({results.macros.pctP}%)</span>
                     </div>
                     <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-center flex flex-col items-center">
                         <Wheat className="w-5 h-5 text-amber-400 mb-1"/>
                         <span className="block text-2xl font-black text-amber-400">{results.macros.c}g</span>
                         <span className="text-[10px] font-bold text-amber-500/70 uppercase">Carbs ({results.macros.pctC}%)</span>
                     </div>
                     <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-center flex flex-col items-center">
                         <Droplet className="w-5 h-5 text-rose-400 mb-1"/>
                         <span className="block text-2xl font-black text-rose-400">{results.macros.f}g</span>
                         <span className="text-[10px] font-bold text-rose-500/70 uppercase">Fats ({results.macros.pctF}%)</span>
                     </div>
                 </div>
               </div>
             )}
          </div>

          {/* Meal Breakdown Pro Feature */}
          {results.targetCalories > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Per-Meal Breakdown</h3>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button onClick={() => setMealsPerDay(Math.max(1, mealsPerDay - 1))} className="px-2 py-1 bg-white dark:bg-slate-700 rounded shadow-sm font-bold text-slate-500 hover:text-indigo-600">-</button>
                    <span className="text-xs font-black px-2">{mealsPerDay} Meals</span>
                    <button onClick={() => setMealsPerDay(Math.min(8, mealsPerDay + 1))} className="px-2 py-1 bg-white dark:bg-slate-700 rounded shadow-sm font-bold text-slate-500 hover:text-indigo-600">+</button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 flex flex-col">
                     <span className="text-[10px] font-bold uppercase text-slate-500">Calories / Meal</span>
                     <span className="text-xl font-black text-slate-800 dark:text-slate-100">{results.perMeal.cals} <span className="text-xs font-medium text-slate-400">kcal</span></span>
                 </div>
                 <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex flex-col">
                     <span className="text-[10px] font-bold uppercase text-indigo-500">Protein / Meal</span>
                     <span className="text-xl font-black text-indigo-700 dark:text-indigo-400">{results.perMeal.p} <span className="text-xs font-medium opacity-60">g</span></span>
                 </div>
                 <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/50 flex flex-col">
                     <span className="text-[10px] font-bold uppercase text-amber-600">Carbs / Meal</span>
                     <span className="text-xl font-black text-amber-700 dark:text-amber-400">{results.perMeal.c} <span className="text-xs font-medium opacity-60">g</span></span>
                 </div>
                 <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/50 flex flex-col">
                     <span className="text-[10px] font-bold uppercase text-rose-500">Fats / Meal</span>
                     <span className="text-xl font-black text-rose-700 dark:text-rose-400">{results.perMeal.f} <span className="text-xs font-medium opacity-60">g</span></span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ BULLETPROOF ARROW EXPORT
export default MacroCalculator;
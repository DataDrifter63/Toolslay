"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Utensils, Activity, Scale, Target, Beef, 
  Wheat, Droplet, Calculator, Minus, Plus, 
  Copy, Check 
} from "lucide-react";

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

const MacroCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // States
  const [system, setSystem] = useState("metric"); 
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(25);
  
  const [cm, setCm] = useState(175);
  const [kg, setKg] = useState(75);
  const [totalInches, setTotalInches] = useState(69); 
  const [lbs, setLbs] = useState(165);
  
  // Advanced Features
  const [formula, setFormula] = useState("mifflin"); 
  const [bodyFat, setBodyFat] = useState(15);
  const [activity, setActivity] = useState("1.55"); 
  const [goal, setGoal] = useState("maintain"); 
  const [dietType, setDietType] = useState("balanced"); 
  const [mealsPerDay, setMealsPerDay] = useState(4);

  const [results, setResults] = useState({
    tdee: 0,
    targetCalories: 0,
    macros: { p: 0, c: 0, f: 0, pCals: 0, cCals: 0, fCals: 0, pctP: 30, pctC: 40, pctF: 30 },
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
      const leanBodyMass = weightInKg * (1 - (bf / 100));
      bmr = 370 + (21.6 * leanBodyMass);
    } else {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * currentAge);
      bmr = gender === "male" ? bmr + 5 : bmr - 161;
    }

    const tdee = bmr * parseFloat(activity);
    let targetCals = tdee;

    if (goal === "lose") targetCals -= 500;
    else if (goal === "gain") targetCals += 500;

    const minSafe = gender === "male" ? 1500 : 1200;
    if (targetCals < minSafe) targetCals = minSafe;

    let split = { p: 0.3, c: 0.4, f: 0.3 };
    if (dietType === "lowcarb") split = { p: 0.4, c: 0.2, f: 0.4 };
    else if (dietType === "keto") split = { p: 0.25, c: 0.05, f: 0.7 };
    else if (dietType === "highprotein") split = { p: 0.4, c: 0.35, f: 0.25 };

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

  const copyResult = async () => {
    if (results.targetCalories <= 0) return;
    const text = 
      `Macro Split & Target Summary (${goal.toUpperCase()} Goal, ${dietType.toUpperCase()})\n` +
      `Daily Target Calories: ${results.targetCalories} kcal (Maintenance TDEE: ${results.tdee} kcal)\n\n` +
      `Macros:\n` +
      `- Protein: ${results.macros.p}g (${results.macros.pctP}%)\n` +
      `- Carbs: ${results.macros.c}g (${results.macros.pctC}%)\n` +
      `- Fats: ${results.macros.f}g (${results.macros.pctF}%)\n\n` +
      `Per-Meal Breakdown (${mealsPerDay} meals/day):\n` +
      `- Calories: ${results.perMeal.cals} kcal\n` +
      `- Protein: ${results.perMeal.p}g | Carbs: ${results.perMeal.c}g | Fats: ${results.perMeal.f}g`;

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
    return `${Math.floor(total / 12)} ft ${total % 12} in`;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Utensils className="w-6 h-6 md:w-7 md:h-7 text-brand shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink truncate">
              Pro Macro Architect
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
            
            {/* Bio Stats */}
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

            {/* Advanced Pro Algorithm Selector */}
            <div className="pt-6 border-t border-line space-y-6 min-w-0">
              <div className="space-y-2 min-w-0">
                <label className="flex justify-between text-xs sm:text-sm font-bold uppercase tracking-wide text-muted">
                  <span>Calculation Algorithm</span>
                  <span className="text-[10px] text-brand bg-brand/10 px-2 py-0.5 rounded font-extrabold">PRO</span>
                </label>
                <div className="flex gap-2 bg-paper p-1 rounded-lg border border-line">
                  <button 
                    type="button" 
                    onClick={() => setFormula("mifflin")} 
                    className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-md transition-all ${formula === 'mifflin' ? 'bg-surface text-ink shadow-sm border border-line' : 'text-muted'}`}
                  >
                    Mifflin-St Jeor
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormula("katch")} 
                    className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-md transition-all ${formula === 'katch' ? 'bg-surface text-ink shadow-sm border border-line' : 'text-muted'}`}
                  >
                    Katch-McArdle
                  </button>
                </div>
              </div>

              {formula === "katch" && (
                <div className="space-y-2 min-w-0 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block">Body Fat Percentage</label>
                  <PremiumStepper value={bodyFat} min={1} max={60} onChange={setBodyFat} unit="%" />
                </div>
              )}

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
            </div>

            {/* Goals & Diet Prefs */}
            <div className="pt-6 border-t border-line space-y-6 min-w-0">
              <div className="space-y-2 min-w-0">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block">Fitness Goal</label>
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

              <div className="space-y-2 min-w-0">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted block">Diet Type (Macro Split)</label>
                <select 
                  value={dietType} 
                  onChange={(e) => setDietType(e.target.value)} 
                  className="w-full text-sm md:text-base font-semibold px-4 py-3.5 bg-surface border border-line rounded-lg outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-ink cursor-pointer"
                >
                  <option value="balanced">Balanced (30% P / 40% C / 30% F)</option>
                  <option value="lowcarb">Low Carb (40% P / 20% C / 40% F)</option>
                  <option value="keto">Keto (25% P / 5% C / 70% F)</option>
                  <option value="highprotein">High Protein (40% P / 35% C / 25% F)</option>
                </select>
              </div>
            </div>

          </div>

          {/* OUTPUT DASHBOARD PANEL */}
          <div className="flex flex-col gap-6 h-full min-w-0">
            
            <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card text-center relative overflow-hidden min-w-0">
               
               <div className="flex items-center justify-between border-b border-line pb-4 mb-5 min-w-0">
                 <h3 className="text-base md:text-lg font-bold text-ink truncate">Macro Split Result</h3>
                 <button
                   type="button"
                   onClick={copyResult}
                   className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-line bg-surface hover:bg-line text-ink text-xs font-semibold transition-colors shrink-0"
                 >
                   {copied ? <><Check className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-muted" /> Copy</>}
                 </button>
               </div>

               <div className="z-10 relative my-4 min-w-0">
                 <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5">Daily Target Calories</h4>
                 <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink mb-2 truncate">
                   {isMounted && results.targetCalories > 0 ? results.targetCalories : "0"} <span className="text-lg md:text-xl font-sans font-semibold text-muted">kcal</span>
                 </div>
                 <div className="text-xs md:text-sm font-semibold text-brand flex items-center justify-center gap-1.5 uppercase tracking-wider truncate">
                   <Calculator className="w-4 h-4 shrink-0"/> Maintenance (TDEE): {isMounted ? results.tdee : 0} kcal
                 </div>
               </div>

               {/* Macro Visual Bar */}
               {results.targetCalories > 0 && (
                 <div className="my-5 max-w-2xl mx-auto space-y-2 min-w-0">
                   <div className="h-3 w-full bg-line rounded-full flex overflow-hidden">
                     <div className="h-full bg-brand transition-all duration-700 ease-out" style={{ width: `${results.macros.pctP}%` }}></div>
                     <div className="h-full bg-amber-400 transition-all duration-700 ease-out" style={{ width: `${results.macros.pctC}%` }}></div>
                     <div className="h-full bg-[#fb7185] transition-all duration-700 ease-out" style={{ width: `${results.macros.pctF}%` }}></div>
                   </div>
                 </div>
               )}

               {results.targetCalories > 0 && (
                 <div className="mt-5 min-w-0">
                   <div className="grid grid-cols-3 gap-2 min-w-0">
                       <div className="bg-surface border border-line p-2.5 md:p-3 rounded-lg text-center flex flex-col items-center min-w-0">
                           <Beef className="w-4 h-4 md:w-5 md:h-5 text-brand mb-1 shrink-0"/>
                           <span className="block text-xl md:text-2xl font-black text-ink truncate">{results.macros.p}g</span>
                           <span className="text-[10px] font-bold text-muted uppercase truncate">Protein ({results.macros.pctP}%)</span>
                       </div>
                       <div className="bg-surface border border-line p-2.5 md:p-3 rounded-lg text-center flex flex-col items-center min-w-0">
                           <Wheat className="w-4 h-4 md:w-5 md:h-5 text-amber-500 mb-1 shrink-0"/>
                           <span className="block text-xl md:text-2xl font-black text-ink truncate">{results.macros.c}g</span>
                           <span className="text-[10px] font-bold text-muted uppercase truncate">Carbs ({results.macros.pctC}%)</span>
                       </div>
                       <div className="bg-surface border border-line p-2.5 md:p-3 rounded-lg text-center flex flex-col items-center min-w-0">
                           <Droplet className="w-4 h-4 md:w-5 md:h-5 text-[#fb7185] mb-1 shrink-0"/>
                           <span className="block text-xl md:text-2xl font-black text-ink truncate">{results.macros.f}g</span>
                           <span className="text-[10px] font-bold text-muted uppercase truncate">Fats ({results.macros.pctF}%)</span>
                       </div>
                   </div>
                 </div>
               )}
            </div>

            {/* Meal Breakdown Pro Feature */}
            {results.targetCalories > 0 && (
              <div className="bg-paper border border-line p-5 md:p-6 rounded-xl shadow-card min-w-0">
                <div className="flex items-center justify-between border-b border-line pb-3.5 mb-4 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                      <Target className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0" />
                      <h3 className="text-sm md:text-base font-bold text-ink truncate">Per-Meal Breakdown</h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface border border-line rounded-lg p-1 shrink-0">
                      <button 
                        type="button" 
                        onClick={() => setMealsPerDay(Math.max(1, mealsPerDay - 1))} 
                        className="w-7 h-7 bg-paper border border-line rounded flex items-center justify-center font-bold text-muted hover:text-ink transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-black px-2 text-ink whitespace-nowrap">{mealsPerDay} Meals</span>
                      <button 
                        type="button" 
                        onClick={() => setMealsPerDay(Math.min(8, mealsPerDay + 1))} 
                        className="w-7 h-7 bg-paper border border-line rounded flex items-center justify-center font-bold text-muted hover:text-ink transition-colors"
                      >
                        +
                      </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 min-w-0">
                   <div className="p-3 bg-surface border border-line rounded-lg flex flex-col min-w-0">
                       <span className="text-[10px] font-bold uppercase text-muted tracking-wider">Calories / Meal</span>
                       <span className="text-lg md:text-xl font-black text-ink truncate">{results.perMeal.cals} <span className="text-xs font-normal text-muted">kcal</span></span>
                   </div>
                   <div className="p-3 bg-surface border border-line rounded-lg flex flex-col min-w-0">
                       <span className="text-[10px] font-bold uppercase text-brand tracking-wider">Protein / Meal</span>
                       <span className="text-lg md:text-xl font-black text-ink truncate">{results.perMeal.p} <span className="text-xs font-normal text-muted">g</span></span>
                   </div>
                   <div className="p-3 bg-surface border border-line rounded-lg flex flex-col min-w-0">
                       <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Carbs / Meal</span>
                       <span className="text-lg md:text-xl font-black text-ink truncate">{results.perMeal.c} <span className="text-xs font-normal text-muted">g</span></span>
                   </div>
                   <div className="p-3 bg-surface border border-line rounded-lg flex flex-col min-w-0">
                       <span className="text-[10px] font-bold uppercase text-[#fb7185] tracking-wider">Fats / Meal</span>
                       <span className="text-lg md:text-xl font-black text-ink truncate">{results.perMeal.f} <span className="text-xs font-normal text-muted">g</span></span>
                   </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MacroCalculator;
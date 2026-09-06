"use client";

import React, { useState, useEffect } from "react";
import { Settings, Activity, ArrowRight, Info, CheckCircle2, AlertTriangle, Scale, Ruler, Plus, Minus } from "lucide-react";

// ✅ FIX: Robust Stepper Input handling numbers safely
const StepperInput = ({ value, min, max, onChange, unit }) => {
  const handleDecrement = () => {
    let val = Number(value);
    if (isNaN(val)) val = min + 1;
    if (val > min) onChange(val - 1);
  };
  
  const handleIncrement = () => {
    let val = Number(value);
    if (isNaN(val)) val = min - 1;
    if (val < max) onChange(val + 1);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onChange(''); 
    } else {
      onChange(Number(val));
    }
  };

  return (
    <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow">
      <button onClick={handleDecrement} className="p-4 text-slate-500 hover:text-emerald-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Minus className="w-5 h-5" />
      </button>
      {/* Hidden default arrows using Tailwind classes */}
      <input 
        type="number" 
        value={value} 
        onChange={handleChange}
        className="w-full text-center text-2xl font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
      />
      <button onClick={handleIncrement} className="p-4 text-slate-500 hover:text-emerald-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:bg-slate-300">
        <Plus className="w-5 h-5" />
      </button>
      {unit && <span className="pr-4 font-bold text-slate-400 select-none">{unit}</span>}
    </div>
  );
};

export default function BmiCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [system, setSystem] = useState("metric");
  
  const [cm, setCm] = useState(170);
  const [kg, setKg] = useState(70);
  
  const [ft, setFt] = useState(5);
  const [inch, setInch] = useState(7);
  const [lbs, setLbs] = useState(154);

  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSystemSwitch = (newSystem) => {
    if (newSystem === "imperial" && system === "metric") {
      const totalInches = (Number(cm) || 0) / 2.54;
      setFt(Math.floor(totalInches / 12));
      setInch(Math.round(totalInches % 12));
      setLbs(Math.round((Number(kg) || 0) * 2.20462));
    } else if (newSystem === "metric" && system === "imperial") {
      setCm(Math.round(((Number(ft) || 0) * 12 + (Number(inch) || 0)) * 2.54));
      setKg(Math.round((Number(lbs) || 0) / 2.20462));
    }
    setSystem(newSystem);
  };

  const getBmiData = () => {
    let bmi = 0;
    let heightInMeters = 0;
    let weightInKg = 0;

    const safeCm = Number(cm) || 0;
    const safeKg = Number(kg) || 0;
    const safeFt = Number(ft) || 0;
    const safeInch = Number(inch) || 0;
    const safeLbs = Number(lbs) || 0;

    if (system === "metric") {
      heightInMeters = safeCm / 100;
      weightInKg = safeKg;
      if (heightInMeters > 0) bmi = weightInKg / (heightInMeters * heightInMeters);
    } else {
      const totalInches = (safeFt * 12) + safeInch;
      heightInMeters = totalInches * 0.0254;
      weightInKg = safeLbs * 0.453592;
      if (totalInches > 0) bmi = 703 * safeLbs / (totalInches * totalInches);
    }

    let category = "";
    let color = "";
    let alertIcon = <Info className="w-5 h-5" />;
    
    if (bmi === 0) {
      category = "Enter details"; color = "text-slate-400"; alertIcon = <Info className="w-5 h-5 text-slate-400" />;
    } else if (bmi < 18.5) {
      category = "Underweight"; color = "text-sky-500"; alertIcon = <AlertTriangle className="w-5 h-5 text-sky-500" />;
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      category = "Normal Weight"; color = "text-emerald-500"; alertIcon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    } else if (bmi >= 25 && bmi <= 29.9) {
      category = "Overweight"; color = "text-amber-500"; alertIcon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
    } else {
      category = "Obese"; color = "text-red-500"; alertIcon = <AlertTriangle className="w-5 h-5 text-red-500" />;
    }

    const idealWeightMin = 18.5 * (heightInMeters * heightInMeters);
    const idealWeightMax = 24.9 * (heightInMeters * heightInMeters);
    
    let targetMsg = "";
    if (bmi === 0) {
       targetMsg = "Waiting for valid inputs...";
    } else if (bmi < 18.5) {
      const gain = idealWeightMin - weightInKg;
      targetMsg = `Gain ${system === 'metric' ? gain.toFixed(1) + ' kg' : (gain * 2.20462).toFixed(1) + ' lbs'} to reach normal weight.`;
    } else if (bmi > 24.9) {
      const lose = weightInKg - idealWeightMax;
      targetMsg = `Lose ${system === 'metric' ? lose.toFixed(1) + ' kg' : (lose * 2.20462).toFixed(1) + ' lbs'} to reach normal weight.`;
    } else {
      targetMsg = "You are at a healthy weight. Keep it up!";
    }

    return { 
      bmi: bmi > 0 ? bmi.toFixed(1) : "0.0", 
      category, 
      color, 
      targetMsg, 
      alertIcon,
      indicatorPos: Math.min(Math.max((bmi / 40) * 100, 0), 100)
    };
  };

  const data = getBmiData();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Advanced BMI Analyzer</h2>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
            <button onClick={() => handleSystemSwitch("metric")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'metric' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Metric</button>
            <button onClick={() => handleSystemSwitch("imperial")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${system === 'imperial' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Imperial</button>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all">
            <Settings className="w-4 h-4" /> {showSettings ? "Hide Insights" : "Insights"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        <div className="flex flex-col gap-6 flex-grow">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Ruler className="w-4 h-4 text-emerald-500"/> Height
              </label>
              {system === "metric" ? (
                <StepperInput value={cm} min={50} max={300} onChange={setCm} unit="cm" />
              ) : (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <StepperInput value={ft} min={1} max={9} onChange={setFt} unit="ft" />
                  </div>
                  <div className="flex-1">
                    <StepperInput value={inch} min={0} max={11} onChange={setInch} unit="in" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Scale className="w-4 h-4 text-emerald-500"/> Weight
              </label>
              {system === "metric" ? (
                <StepperInput value={kg} min={10} max={500} onChange={setKg} unit="kg" />
              ) : (
                <StepperInput value={lbs} min={10} max={1000} onChange={setLbs} unit="lbs" />
              )}
            </div>

          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-xl shadow-sm text-center relative overflow-hidden">
             <div className="z-10 relative">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Your Body Mass Index</h3>
               
               <div className={`text-7xl md:text-8xl font-black tracking-tighter mb-2 transition-colors ${data.color}`}>
                 {isMounted ? data.bmi : "0.0"}
               </div>
               
               <div className={`text-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${data.color}`}>
                 {data.alertIcon} {isMounted ? data.category : "-"}
               </div>

               <div className="mt-8 mb-4 max-w-2xl mx-auto">
                 <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
                   <div className="h-full bg-sky-400" style={{ width: '18.5%' }}></div>
                   <div className="h-full bg-emerald-400" style={{ width: '6.4%' }}></div>
                   <div className="h-full bg-amber-400" style={{ width: '5%' }}></div>
                   <div className="h-full bg-red-400" style={{ flexGrow: 1 }}></div>
                 </div>
                 <div className="relative w-full h-4 max-w-2xl mx-auto">
                    {isMounted && data.indicatorPos > 0 && (
                      <div 
                        className="absolute top-0 -ml-2 w-4 h-4 bg-slate-800 dark:bg-white rounded-full border-2 border-white dark:border-slate-900 shadow-md transition-all duration-500 ease-out"
                        style={{ left: `${data.indicatorPos}%` }}
                      ></div>
                    )}
                 </div>
                 <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1 uppercase">
                   <span>Under</span>
                   <span>Normal</span>
                   <span>Over</span>
                   <span>Obese</span>
                 </div>
               </div>
             </div>
          </div>

        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-80 lg:max-w-80 flex flex-col h-full animate-in fade-in slide-in-from-right-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ArrowRight className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Action Plan</h3>
              </div>
              
              <div className={`p-4 rounded-lg font-semibold text-sm leading-relaxed border transition-colors ${
                data.category === 'Normal Weight' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
              }`}>
                {isMounted ? data.targetMsg : "Calculate your BMI to get an action plan."}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Info className="w-5 h-5 text-slate-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">BMI Categories</h3>
              </div>
              
              {/* ✅ FIX: Real-Time Dynamic Highlighting based on current category */}
              <ul className="space-y-3 text-xs">
                <li className={`flex justify-between items-center p-2 rounded-lg transition-all duration-300 ${
                  data.category === 'Underweight' ? 'bg-sky-50 border border-sky-300 dark:bg-sky-900/30 dark:border-sky-700 scale-105 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border border-transparent'
                }`}>
                  <span className={`font-bold ${data.category === 'Underweight' ? 'text-sky-600 dark:text-sky-400' : 'text-sky-500'}`}>Underweight</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">&lt; 18.5</span>
                </li>
                
                <li className={`flex justify-between items-center p-2 rounded-lg transition-all duration-300 ${
                  data.category === 'Normal Weight' ? 'bg-emerald-50 border border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700 scale-105 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border border-transparent'
                }`}>
                  <span className={`font-bold ${data.category === 'Normal Weight' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500'}`}>Normal</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">18.5 - 24.9</span>
                </li>
                
                <li className={`flex justify-between items-center p-2 rounded-lg transition-all duration-300 ${
                  data.category === 'Overweight' ? 'bg-amber-50 border border-amber-300 dark:bg-amber-900/30 dark:border-amber-700 scale-105 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border border-transparent'
                }`}>
                  <span className={`font-bold ${data.category === 'Overweight' ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500'}`}>Overweight</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">25.0 - 29.9</span>
                </li>
                
                <li className={`flex justify-between items-center p-2 rounded-lg transition-all duration-300 ${
                  data.category === 'Obese' ? 'bg-red-50 border border-red-300 dark:bg-red-900/30 dark:border-red-700 scale-105 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border border-transparent'
                }`}>
                  <span className={`font-bold ${data.category === 'Obese' ? 'text-red-600 dark:text-red-400' : 'text-red-500'}`}>Obese</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">30.0 +</span>
                </li>
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
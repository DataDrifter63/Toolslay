"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Flame, Footprints, Pizza, Search, Scale, Activity,
  Timer, Bike, Waves, X, Info, CheckCircle2, Utensils
} from "lucide-react";

// Expanded 40+ Food Database (Including Local/Desi & Global Items)
const COMMON_FOODS = [
  // Fast Food & Global
  { id: "pizza_slice", name: "Slice of Pepperoni Pizza", calories: 285, icon: "🍕" },
  { id: "burger", name: "Cheeseburger", calories: 330, icon: "🍔" },
  { id: "fries_medium", name: "Medium French Fries", calories: 365, icon: "🍟" },
  { id: "fried_chicken", name: "Fried Chicken (1 Piece)", calories: 320, icon: "🍗" },
  { id: "shawarma", name: "Chicken Shawarma Wrap", calories: 450, icon: "🌯" },
  { id: "hotdog", name: "Hot Dog with Bun", calories: 290, icon: "🌭" },
  { id: "taco", name: "Beef Taco", calories: 210, icon: "🌮" },
  { id: "pasta", name: "Bowl of Pasta (Tomato Sauce)", calories: 400, icon: "🍝" },
  
  // Desi & Local Foods
  { id: "biryani", name: "Plate of Chicken Biryani", calories: 550, icon: "🍛" },
  { id: "samosa", name: "Aloo Samosa (1 Piece)", calories: 260, icon: "🥟" },
  { id: "paratha", name: "Plain Paratha", calories: 330, icon: "🫓" },
  { id: "gulab_jamun", name: "Gulab Jamun (2 Pieces)", calories: 300, icon: "🍯" },
  { id: "chai", name: "Cup of Chai (with Sugar)", calories: 120, icon: "☕" },
  { id: "naan", name: "Butter Naan", calories: 250, icon: "🫓" },
  
  // Snacks & Desserts
  { id: "chocolate_bar", name: "Milk Chocolate Bar", calories: 220, icon: "🍫" },
  { id: "ice_cream", name: "Ice Cream Scoop", calories: 137, icon: "🍦" },
  { id: "donut", name: "Glazed Donut", calories: 260, icon: "🍩" },
  { id: "cookie", name: "Chocolate Chip Cookie", calories: 148, icon: "🍪" },
  { id: "chips", name: "Potato Chips (Small Bag)", calories: 152, icon: "🥔" },
  { id: "cake", name: "Slice of Chocolate Cake", calories: 420, icon: "🍰" },
  { id: "popcorn", name: "Movie Popcorn (Medium)", calories: 600, icon: "🍿" },
  
  // Drinks
  { id: "soda_can", name: "Can of Soda (330ml)", calories: 140, icon: "🥤" },
  { id: "coffee_latte", name: "Latte (Whole Milk)", calories: 190, icon: "☕" },
  { id: "beer", name: "Pint of Beer", calories: 200, icon: "🍺" },
  { id: "orange_juice", name: "Glass of Orange Juice", calories: 110, icon: "🍹" },
  
  // Fruits & Healthy
  { id: "apple", name: "Medium Apple", calories: 95, icon: "🍎" },
  { id: "banana", name: "Medium Banana", calories: 105, icon: "🍌" },
  { id: "avocado", name: "Whole Avocado", calories: 322, icon: "🥑" },
  { id: "salad", name: "Chicken Salad (Light Dressing)", calories: 250, icon: "🥗" },
  { id: "almonds", name: "Handful of Almonds", calories: 160, icon: "🥜" },
  { id: "egg", name: "Boiled Egg", calories: 78, icon: "🥚" }
];

export default function FoodCalorieBurnCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [targetCalories, setTargetCalories] = useState(285);
  const [selectedFoodName, setSelectedFoodName] = useState("Slice of Pepperoni Pizza");
  const [weight, setWeight] = useState(70);
  const [unit, setUnit] = useState("kg");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtered Food Database (Shows up to 8 matching items)
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) {
      // Default: Show selected item first, then a few random popular ones
      const selectedItem = COMMON_FOODS.find(f => f.name === selectedFoodName);
      const others = COMMON_FOODS.filter(f => f.name !== selectedFoodName).slice(0, 5);
      return selectedItem ? [selectedItem, ...others] : COMMON_FOODS.slice(0, 6);
    }
    return COMMON_FOODS.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8);
  }, [searchQuery, selectedFoodName]);

  const selectFood = (food) => {
    setTargetCalories(food.calories);
    setSelectedFoodName(food.name);
    // UI Update Fix: Set search query to the selected food's name so it stays visibly selected
    setSearchQuery(food.name);
  };

  // Realistic Scientific Calorie Burn Engine (Using MET values)
  const calculations = useMemo(() => {
    const weightNum = parseFloat(weight) || 0;
    const cals = parseFloat(targetCalories) || 0;
    
    if (weightNum <= 0 || cals <= 0) {
      return { steps: 0, distanceKm: 0, distanceMi: 0, walkingMins: 0, runningMins: 0, cyclingMins: 0, swimmingMins: 0 };
    }

    const weightKg = unit === "lbs" ? weightNum / 2.20462 : weightNum;
    
    // Exact Scientific MET Formula: Calories = (MET * Weight(kg) * Time(mins)) / 60
    // Re-arranged for Time: Time(mins) = (Calories * 60) / (MET * Weight(kg))
    
    const MET_WALKING = 4.0;   // Brisk pace (~3.5 mph)
    const MET_RUNNING = 9.8;   // Jogging/Running (~6 mph)
    const MET_CYCLING = 8.0;   // Moderate cycling (12-14 mph)
    const MET_SWIMMING = 7.0;  // Freestyle, light-moderate effort

    const calcMinutes = (met) => Math.round((cals * 60) / (met * weightKg));

    const walkingMins = calcMinutes(MET_WALKING);
    
    // Assume average 100 steps per minute during brisk walking
    const requiredSteps = walkingMins * 100;

    // Average stride length is ~0.762 meters
    const distanceKm = (requiredSteps * 0.762) / 1000;
    const distanceMi = distanceKm * 0.621371;

    return {
      steps: requiredSteps.toLocaleString("en-US"),
      distanceKm: distanceKm.toFixed(1),
      distanceMi: distanceMi.toFixed(1),
      walkingMins,
      runningMins: calcMinutes(MET_RUNNING),
      cyclingMins: calcMinutes(MET_CYCLING),
      swimmingMins: calcMinutes(MET_SWIMMING)
    };
  }, [weight, unit, targetCalories]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-rose-100 dark:bg-rose-900/50 p-3 rounded-xl shadow-inner">
            <Footprints className="w-7 h-7 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Steps to Burn Food
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Scientific Calorie Burn Converter
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT PANEL ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Search & Food Database */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-1.5"><Utensils className="w-4 h-4 text-rose-500" /> Search Food Library</span>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">40+ Items</span>
              </h3>
              
              <div className="relative group mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search (e.g. Biryani, Burger, Apple)..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500 shadow-sm transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => {setSearchQuery(""); setTargetCalories(0); setSelectedFoodName("Custom Entry");}} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                {filteredFoods.map(food => {
                  const isSelected = selectedFoodName === food.name && targetCalories === food.calories;
                  return (
                    <div 
                      key={food.id}
                      onClick={() => selectFood(food)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-rose-50 border-rose-500 shadow-sm dark:bg-rose-900/20 ring-1 ring-rose-500"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-rose-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="text-xl">{food.icon}</span>
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {food.name}
                        </span>
                      </div>
                      <span className={`shrink-0 text-[10px] font-black font-mono px-2 py-1 rounded ${isSelected ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {food.calories}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Input Override */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-4">
                <Flame className="w-4 h-4 text-rose-500" /> Custom Calories
              </h3>
              
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  value={targetCalories}
                  onChange={(e) => {
                    setTargetCalories(Math.max(0, parseInt(e.target.value) || 0));
                    setSelectedFoodName("Custom Entry");
                    setSearchQuery("");
                  }}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500 transition-colors"
                />
                <span className="text-sm font-bold text-slate-400">kcal</span>
              </div>
            </div>

          </div>

          {/* User Body Profile */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <Scale className="w-4 h-4 text-teal-500" /> Your Body Metrics
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Weight</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  <button onClick={() => setUnit("kg")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${unit === "kg" ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm" : "text-slate-500"}`}>KG</button>
                  <button onClick={() => setUnit("lbs")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${unit === "lbs" ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm" : "text-slate-500"}`}>LBS</button>
                </div>
              </div>
              <input
                type="number"
                min="10"
                value={weight}
                onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 transition-colors"
              />
              <p className="text-[9px] font-medium text-slate-400 flex items-center gap-1 mt-2">
                <Info className="w-3 h-3" /> Heavier bodies naturally burn more calories per step.
              </p>
            </div>
          </div>

        </div>

        {/* ================= RIGHT: RESULT DASHBOARD ================= */}
        <div className="space-y-6 sticky top-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-inner text-center relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-400 to-orange-500`}></div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 shadow-sm max-w-[90%]">
              <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" /> <span className="truncate">{selectedFoodName}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-6">
              <span className="text-6xl lg:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                {calculations.steps}
              </span>
              <span className="text-lg font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                <Footprints className="w-5 h-5 text-rose-400" /> Steps to Burn
              </span>
            </div>

            {/* Distance Equivalents */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <span className="block text-lg font-black text-slate-700 dark:text-slate-200">{calculations.distanceKm} <span className="text-[10px] text-slate-400 uppercase tracking-widest">km</span></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Distance</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <span className="block text-lg font-black text-slate-700 dark:text-slate-200">{calculations.walkingMins} <span className="text-[10px] text-slate-400 uppercase tracking-widest">mins</span></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Brisk Walk</span>
              </div>
            </div>
          </div>

          {/* Alternative Activities Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-500" /> Faster Alternatives</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-emerald-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <Timer className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Running <span className="text-[9px] font-medium text-slate-400 block">6 mph pace</span></span>
                </div>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{calculations.runningMins} mins</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Bike className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Cycling <span className="text-[9px] font-medium text-slate-400 block">Moderate effort</span></span>
                </div>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">{calculations.cyclingMins} mins</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-cyan-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400">
                    <Waves className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Swimming <span className="text-[9px] font-medium text-slate-400 block">Freestyle</span></span>
                </div>
                <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">{calculations.swimmingMins} mins</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
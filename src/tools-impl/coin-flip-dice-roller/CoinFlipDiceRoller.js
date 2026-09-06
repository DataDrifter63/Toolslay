"use client";

import React, { useState, useCallback } from "react";
import { Circle, Dices, RotateCw, Trash2, History } from "lucide-react";

// Secure random helper
const getSecureRandom = (min, max) => {
  if (typeof window === "undefined") return min; // SSR safe
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % (max - min + 1));
};

const CoinFlipDiceRoller = () => {
  const [activeTab, setActiveTab] = useState("coin");
  
  // Coin State
  const [coinState, setCoinState] = useState("heads");
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinHistory, setCoinHistory] = useState([]);

  // Dice State
  const [diceCount, setDiceCount] = useState(2);
  const [diceValues, setDiceValues] = useState([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [diceHistory, setDiceHistory] = useState([]);

  const flipCoin = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);

    setTimeout(() => {
      const result = getSecureRandom(0, 1) === 0 ? "heads" : "tails";
      setCoinState(result);
      setCoinHistory((prev) => [{ id: Date.now(), result }, ...prev].slice(0, 20));
      setIsFlipping(false);
    }, 1000);
  }, [isFlipping]);

  const rollDice = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);

    let rollingInterval = setInterval(() => {
      setDiceValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
    }, 100);

    setTimeout(() => {
      clearInterval(rollingInterval);
      const newValues = Array.from({ length: diceCount }, () => getSecureRandom(1, 6));
      setDiceValues(newValues);
      
      const total = newValues.reduce((a, b) => a + b, 0);
      setDiceHistory((prev) => [{ id: Date.now(), values: newValues, total }, ...prev].slice(0, 20));
      setIsRolling(false);
    }, 1000);
  }, [isRolling, diceCount]);

  const renderDice = (value, index) => {
    const dots = {
      1: ["col-start-2 row-start-2"],
      2: ["col-start-1 row-start-1", "col-start-3 row-start-3"],
      3: ["col-start-1 row-start-1", "col-start-2 row-start-2", "col-start-3 row-start-3"],
      4: ["col-start-1 row-start-1", "col-start-3 row-start-1", "col-start-1 row-start-3", "col-start-3 row-start-3"],
      5: ["col-start-1 row-start-1", "col-start-3 row-start-1", "col-start-2 row-start-2", "col-start-1 row-start-3", "col-start-3 row-start-3"],
      6: ["col-start-1 row-start-1", "col-start-1 row-start-2", "col-start-1 row-start-3", "col-start-3 row-start-1", "col-start-3 row-start-2", "col-start-3 row-start-3"],
    };

    return (
      <div
        key={index}
        className={`w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 p-2 grid grid-cols-3 grid-rows-3 gap-1 transition-transform duration-300 ${
          isRolling ? "scale-95 -rotate-12" : "scale-100 rotate-0"
        }`}
      >
        {dots[value].map((pos, i) => (
          <div key={i} className={`w-full h-full bg-indigo-600 rounded-full ${pos}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("coin")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "coin"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Circle className="w-5 h-5" />
          Coin Flip
        </button>
        <button
          onClick={() => setActiveTab("dice")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "dice"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Dices className="w-5 h-5" />
          Dice Roller
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-800/30 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[400px]">
          {activeTab === "coin" && (
            <div className="flex flex-col items-center space-y-10">
              <div
                className={`relative w-48 h-48 rounded-full shadow-2xl flex items-center justify-center border-8 border-slate-200 dark:border-slate-600 transition-all duration-1000 transform-gpu ${
                  isFlipping ? "animate-spin scale-110" : ""
                } ${
                  coinState === "heads" ? "bg-amber-400 text-amber-900" : "bg-slate-300 text-slate-800"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipping ? "rotateY(1800deg)" : "rotateY(0deg)",
                }}
              >
                <span className="text-4xl font-bold uppercase tracking-widest select-none">
                  {coinState}
                </span>
              </div>

              <button
                onClick={flipCoin}
                disabled={isFlipping}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
              >
                <RotateCw className={`w-5 h-5 ${isFlipping ? "animate-spin" : ""}`} />
                {isFlipping ? "Flipping..." : "Flip Coin"}
              </button>
            </div>
          )}

          {activeTab === "dice" && (
            <div className="flex flex-col items-center space-y-8 w-full">
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 px-2">
                  Number of Dice:
                </span>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setDiceCount(num);
                      setDiceValues(Array.from({ length: num }, () => 1));
                    }}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                      diceCount === num
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-6 p-4">
                {diceValues.map((val, i) => renderDice(val, i))}
              </div>

              {!isRolling && diceHistory.length > 0 && (
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200 animate-fade-in">
                  Total: <span className="text-indigo-600 dark:text-indigo-400">{diceHistory[0].total}</span>
                </div>
              )}

              <button
                onClick={rollDice}
                disabled={isRolling}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
              >
                <Dices className={`w-5 h-5 ${isRolling ? "animate-bounce" : ""}`} />
                {isRolling ? "Rolling..." : "Roll Dice"}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
              <History className="w-5 h-5 text-indigo-500" />
              History
            </div>
            <button
              onClick={() => (activeTab === "coin" ? setCoinHistory([]) : setDiceHistory([]))}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === "coin" ? (
              coinHistory.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">No flips yet.</p>
              ) : (
                coinHistory.map((item, i) => (
                  <div key={item.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400">Flip {coinHistory.length - i}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{item.result}</span>
                  </div>
                ))
              )
            ) : (
              diceHistory.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">No rolls yet.</p>
              ) : (
                diceHistory.map((item, i) => (
                  <div key={item.id} className="flex flex-col text-sm p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Roll {diceHistory.length - i}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Total: {item.total}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Dice: {item.values.join(", ")}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinFlipDiceRoller;
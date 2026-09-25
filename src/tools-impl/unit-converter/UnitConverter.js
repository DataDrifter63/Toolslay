"use client";

import React, { useMemo, useState } from "react";
import { 
  ArrowRightLeft, Copy, Check, Trash2, 
  BookmarkPlus, Settings2, ShieldAlert, History
} from "lucide-react";

const CATEGORIES = {
  Length: {
    icon: "↔",
    units: {
      Meter: { symbol: "m", factor: 1 },
      Kilometer: { symbol: "km", factor: 1000 },
      Centimeter: { symbol: "cm", factor: 0.01 },
      Millimeter: { symbol: "mm", factor: 0.001 },
      Mile: { symbol: "mi", factor: 1609.344 },
      Yard: { symbol: "yd", factor: 0.9144 },
      Foot: { symbol: "ft", factor: 0.3048 },
      Inch: { symbol: "in", factor: 0.0254 },
      "Nautical Mile": { symbol: "nmi", factor: 1852 },
    },
  },

  Weight: {
    icon: "⚖",
    units: {
      Kilogram: { symbol: "kg", factor: 1 },
      Gram: { symbol: "g", factor: 0.001 },
      Milligram: { symbol: "mg", factor: 0.000001 },
      Tonne: { symbol: "t", factor: 1000 },
      Pound: { symbol: "lb", factor: 0.45359237 },
      Ounce: { symbol: "oz", factor: 0.028349523125 },
      Stone: { symbol: "st", factor: 6.35029318 },
    },
  },

  Temperature: {
    icon: "℃",
    units: {
      Celsius: { symbol: "°C" },
      Fahrenheit: { symbol: "°F" },
      Kelvin: { symbol: "K" },
    },
  },

  Area: {
    icon: "▧",
    units: {
      "Square Meter": { symbol: "m²", factor: 1 },
      "Square Kilometer": { symbol: "km²", factor: 1000000 },
      "Square Centimeter": { symbol: "cm²", factor: 0.0001 },
      "Square Foot": { symbol: "ft²", factor: 0.09290304 },
      "Square Yard": { symbol: "yd²", factor: 0.83612736 },
      "Square Mile": { symbol: "mi²", factor: 2589988.110336 },
      Acre: { symbol: "ac", factor: 4046.8564224 },
      Hectare: { symbol: "ha", factor: 10000 },
    },
  },

  Volume: {
    icon: "◉",
    units: {
      Liter: { symbol: "L", factor: 1 },
      Milliliter: { symbol: "mL", factor: 0.001 },
      "Cubic Meter": { symbol: "m³", factor: 1000 },
      "Cubic Centimeter": { symbol: "cm³", factor: 0.001 },
      Gallon: { symbol: "gal", factor: 3.785411784 },
      Quart: { symbol: "qt", factor: 0.946352946 },
      Pint: { symbol: "pt", factor: 0.473176473 },
      Cup: { symbol: "cup", factor: 0.2365882365 },
      "Fluid Ounce": { symbol: "fl oz", factor: 0.0295735295625 },
    },
  },

  Speed: {
    icon: "➤",
    units: {
      "Meter / Second": { symbol: "m/s", factor: 1 },
      "Kilometer / Hour": { symbol: "km/h", factor: 0.2777777778 },
      "Mile / Hour": { symbol: "mph", factor: 0.44704 },
      "Foot / Second": { symbol: "ft/s", factor: 0.3048 },
      Knot: { symbol: "kn", factor: 0.5144444444 },
    },
  },

  Time: {
    icon: "◷",
    units: {
      Second: { symbol: "s", factor: 1 },
      Millisecond: { symbol: "ms", factor: 0.001 },
      Minute: { symbol: "min", factor: 60 },
      Hour: { symbol: "hr", factor: 3600 },
      Day: { symbol: "day", factor: 86400 },
      Week: { symbol: "week", factor: 604800 },
      "30 Days": { symbol: "30d", factor: 2592000 },
      Year: { symbol: "year", factor: 31557600 },
    },
  },

  Data: {
    icon: "▣",
    units: {
      Bit: { symbol: "bit", factor: 1 },
      Byte: { symbol: "B", factor: 8 },
      Kilobyte: { symbol: "KB", factor: 8000 },
      Megabyte: { symbol: "MB", factor: 8000000 },
      Gigabyte: { symbol: "GB", factor: 8000000000 },
      Terabyte: { symbol: "TB", factor: 8000000000000 },
      Kibibyte: { symbol: "KiB", factor: 8192 },
      Mebibyte: { symbol: "MiB", factor: 8388608 },
      Gibibyte: { symbol: "GiB", factor: 8589934592 },
    },
  },

  Pressure: {
    icon: "◌",
    units: {
      Pascal: { symbol: "Pa", factor: 1 },
      Kilopascal: { symbol: "kPa", factor: 1000 },
      Bar: { symbol: "bar", factor: 100000 },
      Atmosphere: { symbol: "atm", factor: 101325 },
      PSI: { symbol: "psi", factor: 6894.757293168 },
      Torr: { symbol: "Torr", factor: 133.3223684211 },
    },
  },

  Energy: {
    icon: "ϟ",
    units: {
      Joule: { symbol: "J", factor: 1 },
      Kilojoule: { symbol: "kJ", factor: 1000 },
      Calorie: { symbol: "cal", factor: 4.184 },
      Kilocalorie: { symbol: "kcal", factor: 4184 },
      "Watt Hour": { symbol: "Wh", factor: 3600 },
      "Kilowatt Hour": { symbol: "kWh", factor: 3600000 },
      "BTU": { symbol: "BTU", factor: 1055.05585262 },
    },
  },

  Power: {
    icon: "⚡",
    units: {
      Watt: { symbol: "W", factor: 1 },
      Kilowatt: { symbol: "kW", factor: 1000 },
      Megawatt: { symbol: "MW", factor: 1000000 },
      Horsepower: { symbol: "hp", factor: 745.699871582 },
    },
  },
};

const PRESETS = {
  Length: [
    ["1 Kilometer", 1, "Kilometer", "Meter"],
    ["10 Feet", 10, "Foot", "Meter"],
    ["1 Mile", 1, "Mile", "Kilometer"],
  ],
  Weight: [
    ["1 Kilogram", 1, "Kilogram", "Pound"],
    ["10 Pounds", 10, "Pound", "Kilogram"],
    ["1 Ounce", 1, "Ounce", "Gram"],
  ],
  Temperature: [
    ["0 Celsius", 0, "Celsius", "Fahrenheit"],
    ["100 Celsius", 100, "Celsius", "Fahrenheit"],
    ["32 Fahrenheit", 32, "Fahrenheit", "Celsius"],
  ],
  Area: [
    ["1 Acre", 1, "Acre", "Square Meter"],
    ["1 Hectare", 1, "Hectare", "Acre"],
  ],
  Volume: [
    ["1 Gallon", 1, "Gallon", "Liter"],
    ["1 Liter", 1, "Liter", "Gallon"],
  ],
  Speed: [
    ["100 km/h", 100, "Kilometer / Hour", "Mile / Hour"],
    ["60 mph", 60, "Mile / Hour", "Kilometer / Hour"],
  ],
  Time: [
    ["1 Hour", 1, "Hour", "Minute"],
    ["1 Day", 1, "Day", "Hour"],
  ],
  Data: [
    ["1 GB", 1, "Gigabyte", "Megabyte"],
    ["1024 MB", 1024, "Megabyte", "Gigabyte"],
  ],
  Pressure: [
    ["1 Bar", 1, "Bar", "PSI"],
    ["1 Atmosphere", 1, "Atmosphere", "Pascal"],
  ],
  Energy: [
    ["1 kWh", 1, "Kilowatt Hour", "Joule"],
    ["1000 Calories", 1000, "Calorie", "Kilocalorie"],
  ],
  Power: [
    ["1 kW", 1, "Kilowatt", "Horsepower"],
    ["1 HP", 1, "Horsepower", "Watt"],
  ],
};

function convertTemperature(value, from, to) {
  if (from === to) return value;

  let celsius = value;

  if (from === "Fahrenheit") {
    celsius = (value - 32) * (5 / 9);
  } else if (from === "Kelvin") {
    celsius = value - 273.15;
  }

  if (to === "Celsius") return celsius;

  if (to === "Fahrenheit") {
    return celsius * (9 / 5) + 32;
  }

  if (to === "Kelvin") {
    return celsius + 273.15;
  }

  return value;
}

function convertValue(value, category, from, to) {
  if (!Number.isFinite(value)) return null;

  if (category === "Temperature") {
    return convertTemperature(value, from, to);
  }

  const units = CATEGORIES[category].units;

  if (!units[from] || !units[to]) return null;

  return (value * units[from].factor) / units[to].factor;
}

function formatNumber(value, precision) {
  if (!Number.isFinite(value)) return "—";

  if (value === 0) return "0";

  const abs = Math.abs(value);

  if (abs >= 1e12 || abs < 1e-8) {
    return value.toExponential(Math.min(precision, 10));
  }

  return Number(value.toFixed(precision)).toLocaleString(
    undefined,
    {
      maximumFractionDigits: precision,
    }
  );
}

export default function UnitConverter() {
  const categories = Object.keys(CATEGORIES);

  const [category, setCategory] = useState("Length");
  const [amount, setAmount] = useState("1");
  const [fromUnit, setFromUnit] = useState("Meter");
  const [toUnit, setToUnit] = useState("Kilometer");
  const [precision, setPrecision] = useState(6);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const units = Object.keys(CATEGORIES[category].units);

  const numericAmount = useMemo(() => {
    if (amount === "" || amount === "-" || amount === ".") {
      return NaN;
    }

    return Number(amount);
  }, [amount]);

  const converted = useMemo(() => {
    return convertValue(
      numericAmount,
      category,
      fromUnit,
      toUnit
    );
  }, [numericAmount, category, fromUnit, toUnit]);

  const fromSymbol = CATEGORIES[category].units[fromUnit]?.symbol || "";
  const toSymbol = CATEGORIES[category].units[toUnit]?.symbol || "";
  const formattedResult = formatNumber(converted, precision);

  function changeCategory(nextCategory) {
    const nextUnits = Object.keys(CATEGORIES[nextCategory].units);
    setCategory(nextCategory);
    setFromUnit(nextUnits[0]);
    setToUnit(nextUnits[1] || nextUnits[0]);
    setHistory([]);
  }

  function swapUnits() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  function applyPreset(item) {
    setAmount(String(item[1]));
    setFromUnit(item[2]);
    setToUnit(item[3]);
  }

  function addHistory() {
    if (!Number.isFinite(converted)) return;

    const entry = {
      id: Date.now(),
      category,
      amount: numericAmount,
      from: fromUnit,
      to: toUnit,
      result: converted,
    };

    setHistory((prev) => [
      entry,
      ...prev.filter(
        (item) =>
          !(
            item.category === category &&
            item.amount === numericAmount &&
            item.from === fromUnit &&
            item.to === toUnit
          )
      ),
    ].slice(0, 8));
  }

  async function copyResult() {
    if (!Number.isFinite(converted)) return;

    const text = `${numericAmount} ${fromSymbol} = ${formattedResult} ${toSymbol}`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch (error) {
      setCopied(false);
    }
  }

  function clearHistory() {
    setHistory([]);
  }

  const presetList = PRESETS[category] || [];

  const baseInputStyle = "w-full min-w-0 h-11 px-3.5 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-mono";
  const baseSelectStyle = "w-full min-w-0 h-11 pl-3.5 pr-8 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* TWO PANEL MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px,minmax(0,1fr)] items-start gap-4 sm:gap-6 min-w-0">
        
        {/* SIDEBAR (CATEGORIES) */}
        <aside className="rounded-xl border border-line bg-surface p-2 sm:p-3 shadow-card min-w-0 flex lg:flex-col gap-1.5 overflow-x-auto hide-scrollbar">
          <div className="hidden lg:block px-3 pt-2 pb-3 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted block">
              Categories
            </span>
          </div>
          
          {categories.map((item) => {
            const isActive = category === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => changeCategory(item)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all min-h-[44px] text-left shrink-0 lg:shrink min-w-0 ${
                  isActive
                    ? "bg-brand/10 text-brand border border-brand/20 shadow-sm"
                    : "text-muted hover:text-ink hover:bg-paper border border-transparent"
                }`}
              >
                <span className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 font-mono text-sm ${isActive ? "bg-surface shadow-sm" : "bg-paper border border-line"}`}>
                  {CATEGORIES[item].icon}
                </span>
                <span className="truncate">{item}</span>
              </button>
            );
          })}
        </aside>

        {/* MAIN CONVERTER PANEL */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          
          <section className="rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-card min-w-0 space-y-5">
            {/* HEADER BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Settings2 className="w-5 h-5 text-brand shrink-0" />
                <h2 className="text-base sm:text-lg font-display font-bold text-ink truncate">
                  Convert {category}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="uc-precision" className="text-[11px] font-bold text-muted uppercase tracking-wider">
                  Precision:
                </label>
                <select
                  id="uc-precision"
                  className="h-9 pl-3 pr-8 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold"
                  value={precision}
                  onChange={(e) => setPrecision(Number(e.target.value))}
                >
                  <option value="2">2 decimals</option>
                  <option value="4">4 decimals</option>
                  <option value="6">6 decimals</option>
                  <option value="8">8 decimals</option>
                  <option value="10">10 decimals</option>
                </select>
              </div>
            </div>

            {/* INPUT/OUTPUT FIELDS */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 min-w-0">
              
              {/* FROM UNIT */}
              <div className="w-full flex-1 space-y-2 min-w-0">
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="uc-amount">
                  Amount
                </label>
                <input
                  id="uc-amount"
                  className={baseInputStyle}
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter value"
                />
                <select
                  className={baseSelectStyle}
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  aria-label="From unit"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit} ({CATEGORIES[category].units[unit].symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* SWAP BUTTON */}
              <button
                type="button"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-line bg-surface hover:bg-paper text-brand flex items-center justify-center shrink-0 transition-transform hover:rotate-180 shadow-sm sm:mt-[22px]"
                onClick={swapUnits}
                title="Swap units"
                aria-label="Swap units"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>

              {/* TO UNIT */}
              <div className="w-full flex-1 space-y-2 min-w-0">
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="uc-to">
                  Convert To
                </label>
                <div className={`${baseInputStyle} bg-paper flex items-center overflow-hidden`}>
                  <span className="truncate text-muted">{formattedResult}</span>
                </div>
                <select
                  id="uc-to"
                  className={baseSelectStyle}
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  aria-label="To unit"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit} ({CATEGORIES[category].units[unit].symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* HERO RESULT CARD */}
            <div className="rounded-xl border border-line bg-paper p-1.5 min-w-0 mt-2">
              <div className="bg-surface rounded-lg w-full p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="min-w-0 text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand block mb-1">
                    Converted Result
                  </span>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tighter text-ink font-mono truncate">
                    {formattedResult}
                    <span className="text-muted text-xl sm:text-2xl align-baseline ml-2 font-sans font-semibold">
                      {toSymbol}
                    </span>
                  </div>
                  <div className="text-xs text-muted mt-2 font-mono truncate">
                    <strong className="text-ink font-sans">Formula:</strong> {numericAmount} {fromSymbol} = {formattedResult} {toSymbol}
                  </div>
                </div>

                <div className="shrink-0 flex justify-center sm:justify-end">
                  <button
                    type="button"
                    onClick={copyResult}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-line bg-paper hover:bg-line text-ink text-xs font-bold transition-colors min-h-[40px] shadow-sm w-full sm:w-auto justify-center"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-teal" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-muted" /> Copy Result
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* PRESETS SECTION */}
            {presetList.length > 0 && (
              <div className="pt-2 min-w-0">
                <div className="flex items-center justify-between mb-3 min-w-0">
                  <strong className="text-xs font-bold text-ink">Quick conversions</strong>
                  <span className="text-[10px] text-muted">One-click presets</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 min-w-0">
                  {presetList.map((item) => (
                    <button
                      key={item[0]}
                      type="button"
                      onClick={() => applyPreset(item)}
                      className="min-h-[44px] px-3.5 rounded-lg border border-line bg-paper hover:bg-brand/10 hover:border-brand/30 hover:text-brand text-ink text-xs font-semibold text-left transition-all truncate min-w-0 shadow-sm"
                    >
                      {item[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-line min-w-0">
              <button
                type="button"
                onClick={addHistory}
                disabled={!Number.isFinite(converted)}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-line bg-surface hover:bg-paper disabled:opacity-50 text-ink text-xs font-bold transition-colors min-h-[40px]"
              >
                <BookmarkPlus className="w-4 h-4 text-brand" /> Save to history
              </button>
            </div>
          </section>

          {/* HISTORY CARD */}
          <section className="rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-card min-w-0 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <History className="w-4 h-4 text-brand shrink-0" />
                <h3 className="text-sm sm:text-base font-display font-bold text-ink truncate">
                  Recent conversions
                </h3>
              </div>
              
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-6 border border-dashed border-line rounded-xl text-center space-y-1 min-w-0">
                <p className="text-xs font-semibold text-ink">No history yet</p>
                <p className="text-[11px] text-muted">Your saved conversions will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                {history.map((item) => {
                  const fromSym = CATEGORIES[item.category]?.units[item.from]?.symbol || "";
                  const toSym = CATEGORIES[item.category]?.units[item.to]?.symbol || "";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCategory(item.category);
                        setAmount(String(item.amount));
                        setFromUnit(item.from);
                        setToUnit(item.to);
                      }}
                      className="p-3.5 border border-line rounded-xl bg-paper hover:bg-surface hover:border-brand/30 flex items-center justify-between gap-3 text-left transition-colors min-w-0 group"
                      title="Load conversion"
                    >
                      <div className="min-w-0 text-xs font-mono truncate">
                        <span className="font-bold text-ink">{item.amount}</span>
                        <span className="text-muted ml-1 mr-2">{fromSym}</span>
                        <span className="text-muted opacity-50 group-hover:opacity-100 transition-opacity">→</span>
                        <span className="text-muted ml-2">{toSym}</span>
                      </div>
                      <div className="text-xs font-black font-mono text-brand shrink-0">
                        {formatNumber(item.result, precision)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 text-[11px] text-muted min-w-0">
              <ShieldAlert className="w-3.5 h-3.5 text-teal shrink-0" />
              <span className="truncate">All calculations run locally in your browser.</span>
            </div>
          </section>

        </div>
      </div>

    </div>
  );
}
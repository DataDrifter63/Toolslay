"use client";

import React, { useMemo, useState } from "react";

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

  const fromSymbol =
    CATEGORIES[category].units[fromUnit]?.symbol || "";

  const toSymbol =
    CATEGORIES[category].units[toUnit]?.symbol || "";

  const formattedResult = formatNumber(
    converted,
    precision
  );

  function changeCategory(nextCategory) {
    const nextUnits = Object.keys(
      CATEGORIES[nextCategory].units
    );

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

    const text =
      `${numericAmount} ${fromSymbol} = ` +
      `${formattedResult} ${toSymbol}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      setCopied(false);
    }
  }

  function clearHistory() {
    setHistory([]);
  }

  const presetList = PRESETS[category] || [];

  return (
    <>
      <style jsx>{`
        .unit-tool {
          --uc-text: #172033;
          --uc-muted: #667085;
          --uc-border: #e4e7ec;
          --uc-card: #ffffff;
          --uc-soft: #f7f8fb;
          --uc-primary: #635bff;
          --uc-primary-soft: rgba(99, 91, 255, 0.09);

          width: 100%;
          color: var(--uc-text);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .unit-tool * {
          box-sizing: border-box;
        }

        .unit-wrapper {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .unit-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .unit-eyebrow {
          color: var(--uc-primary);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .unit-header h1 {
          margin: 6px 0 0;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.05;
          letter-spacing: -0.045em;
        }

        .unit-header p {
          max-width: 700px;
          margin: 9px 0 0;
          color: var(--uc-muted);
          font-size: 13px;
          line-height: 1.65;
        }

        .unit-layout {
          display: grid;
          grid-template-columns: 230px minmax(0, 1fr);
          gap: 18px;
        }

        .unit-sidebar,
        .unit-card,
        .unit-history {
          border: 1px solid var(--uc-border);
          border-radius: 16px;
          background: var(--uc-card);
          box-shadow: 0 8px 30px rgba(16, 24, 40, 0.035);
        }

        .unit-sidebar {
          padding: 10px;
          height: fit-content;
        }

        .unit-sidebar-title {
          padding: 9px 10px 10px;
          color: var(--uc-muted);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .category-button {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 10px;
          padding: 10px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--uc-text);
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 650;
          text-align: left;
          transition:
            background 0.15s ease,
            transform 0.15s ease;
        }

        .category-button:hover {
          background: var(--uc-soft);
        }

        .category-button.active {
          background: var(--uc-primary-soft);
          color: var(--uc-primary);
        }

        .category-icon {
          display: grid;
          width: 27px;
          height: 27px;
          flex: 0 0 27px;
          place-items: center;
          border-radius: 7px;
          background: var(--uc-soft);
          font-size: 13px;
        }

        .category-button.active .category-icon {
          background: var(--uc-primary-soft);
        }

        .unit-main {
          min-width: 0;
        }

        .unit-card {
          padding: 22px;
        }

        .unit-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .unit-card-title {
          font-size: 17px;
          font-weight: 750;
          letter-spacing: -0.025em;
        }

        .unit-card-subtitle {
          margin-top: 5px;
          color: var(--uc-muted);
          font-size: 11px;
          line-height: 1.55;
        }

        .precision-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }

        .precision-wrap label {
          color: var(--uc-muted);
          font-size: 9px;
          font-weight: 700;
        }

        .precision-select {
          height: 32px;
          padding: 0 8px;
          border: 1px solid var(--uc-border);
          border-radius: 7px;
          outline: none;
          background: var(--uc-card);
          color: var(--uc-text);
          font: inherit;
          font-size: 10px;
        }

        .conversion-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
          align-items: end;
          gap: 12px;
        }

        .field-label {
          display: block;
          margin-bottom: 7px;
          color: var(--uc-muted);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .amount-input {
          width: 100%;
          height: 48px;
          padding: 0 13px;
          border: 1px solid var(--uc-border);
          border-radius: 9px;
          outline: none;
          background: var(--uc-card);
          color: var(--uc-text);
          font: inherit;
          font-size: 15px;
          font-weight: 650;
        }

        .amount-input:focus,
        .unit-select:focus,
        .precision-select:focus {
          border-color: var(--uc-primary);
          box-shadow: 0 0 0 3px var(--uc-primary-soft);
        }

        .unit-select {
          width: 100%;
          height: 42px;
          margin-top: 7px;
          padding: 0 10px;
          border: 1px solid var(--uc-border);
          border-radius: 8px;
          outline: none;
          background: var(--uc-card);
          color: var(--uc-text);
          font: inherit;
          font-size: 11px;
          font-weight: 600;
        }

        .swap-button {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          margin-bottom: 0;
          border: 1px solid var(--uc-border);
          border-radius: 50%;
          background: var(--uc-card);
          color: var(--uc-primary);
          cursor: pointer;
          font-size: 17px;
          transition:
            transform 0.18s ease,
            background 0.18s ease;
        }

        .swap-button:hover {
          background: var(--uc-soft);
          transform: rotate(180deg);
        }

        .result-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 20px;
          padding: 18px;
          border: 1px solid var(--uc-border);
          border-radius: 12px;
          background:
            radial-gradient(
              circle at 100% 0%,
              var(--uc-primary-soft),
              transparent 45%
            ),
            var(--uc-soft);
        }

        .result-label {
          color: var(--uc-muted);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .result-value {
          margin-top: 5px;
          overflow-wrap: anywhere;
          font-size: clamp(25px, 4vw, 37px);
          font-weight: 800;
          letter-spacing: -0.045em;
        }

        .result-unit {
          margin-left: 7px;
          color: var(--uc-muted);
          font-size: 12px;
          font-weight: 600;
        }

        .copy-button {
          min-width: 90px;
          height: 38px;
          padding: 0 12px;
          border: 1px solid var(--uc-border);
          border-radius: 8px;
          background: var(--uc-card);
          color: var(--uc-text);
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 750;
        }

        .copy-button:hover {
          border-color: var(--uc-primary);
          color: var(--uc-primary);
        }

        .formula {
          margin-top: 11px;
          color: var(--uc-muted);
          font-size: 10px;
          line-height: 1.6;
        }

        .formula strong {
          color: var(--uc-text);
        }

        .quick-section {
          margin-top: 18px;
        }

        .quick-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 9px;
        }

        .quick-title strong {
          font-size: 11px;
        }

        .quick-title span {
          color: var(--uc-muted);
          font-size: 9px;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .preset-button {
          min-height: 44px;
          padding: 8px 10px;
          border: 1px solid var(--uc-border);
          border-radius: 8px;
          background: var(--uc-card);
          color: var(--uc-text);
          cursor: pointer;
          font: inherit;
          font-size: 9px;
          font-weight: 650;
          text-align: left;
        }

        .preset-button:hover {
          border-color: var(--uc-primary);
          color: var(--uc-primary);
          background: var(--uc-primary-soft);
        }

        .history-card {
          margin-top: 18px;
          padding: 18px;
        }

        .history-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .history-head strong {
          font-size: 13px;
        }

        .clear-button {
          border: 0;
          background: transparent;
          color: var(--uc-muted);
          cursor: pointer;
          font: inherit;
          font-size: 9px;
          font-weight: 700;
        }

        .history-list {
          display: grid;
          gap: 7px;
        }

        .history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px;
          border: 1px solid var(--uc-border);
          border-radius: 8px;
          background: var(--uc-soft);
        }

        .history-main {
          min-width: 0;
          font-size: 10px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .history-main span {
          color: var(--uc-muted);
          font-weight: 500;
        }

        .history-result {
          flex: 0 0 auto;
          color: var(--uc-primary);
          font-size: 10px;
          font-weight: 800;
        }

        .save-history {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .save-button {
          height: 34px;
          padding: 0 12px;
          border: 1px solid var(--uc-border);
          border-radius: 8px;
          background: var(--uc-card);
          color: var(--uc-text);
          cursor: pointer;
          font: inherit;
          font-size: 9px;
          font-weight: 750;
        }

        .save-button:hover {
          border-color: var(--uc-primary);
          color: var(--uc-primary);
        }

        .empty-history {
          padding: 16px;
          border: 1px dashed var(--uc-border);
          border-radius: 8px;
          color: var(--uc-muted);
          font-size: 10px;
          text-align: center;
        }

        .privacy-note {
          margin-top: 12px;
          color: var(--uc-muted);
          font-size: 9px;
          line-height: 1.5;
        }

        .privacy-note b {
          color: #12b76a;
        }

        @media (max-width: 900px) {
          .unit-layout {
            grid-template-columns: 1fr;
          }

          .unit-sidebar {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
            overflow-x: auto;
          }

          .unit-sidebar-title {
            display: none;
          }

          .category-button {
            justify-content: center;
            padding: 8px 5px;
          }

          .category-button span:last-child {
            display: none;
          }

          .category-icon {
            width: 32px;
            height: 32px;
            flex-basis: 32px;
          }
        }

        @media (max-width: 650px) {
          .unit-header {
            align-items: stretch;
          }

          .unit-card {
            padding: 16px;
          }

          .unit-card-head {
            flex-direction: column;
          }

          .precision-wrap {
            justify-content: space-between;
          }

          .conversion-grid {
            grid-template-columns: 1fr;
          }

          .swap-button {
            margin: 2px auto;
          }

          .result-box {
            align-items: flex-start;
            flex-direction: column;
          }

          .copy-button {
            width: 100%;
          }

          .preset-grid {
            grid-template-columns: 1fr;
          }

          .unit-sidebar {
            grid-template-columns: repeat(6, minmax(55px, 1fr));
          }
        }

        @media (prefers-color-scheme: dark) {
          .unit-tool {
            --uc-text: #f2f4f7;
            --uc-muted: #98a2b3;
            --uc-border: #2d3442;
            --uc-card: #151922;
            --uc-soft: #10141c;
            --uc-primary: #8078ff;
            --uc-primary-soft: rgba(128, 120, 255, 0.12);
          }
        }

        html.dark .unit-tool,
        body.dark .unit-tool,
        .dark .unit-tool {
          --uc-text: #f2f4f7;
          --uc-muted: #98a2b3;
          --uc-border: #2d3442;
          --uc-card: #151922;
          --uc-soft: #10141c;
          --uc-primary: #8078ff;
          --uc-primary-soft: rgba(128, 120, 255, 0.12);
        }
      `}</style>

      <div className="unit-tool">
        <div className="unit-wrapper">

          <div className="unit-header">
            <div>
              <div className="unit-eyebrow">
                PRECISION CONVERSION TOOL
              </div>

              <h1>Unit Converter</h1>

              <p>
                Convert measurements instantly across everyday,
                technical and digital units with precision controls,
                smart presets and conversion history.
              </p>
            </div>
          </div>

          <div className="unit-layout">

            <aside className="unit-sidebar">
              <div className="unit-sidebar-title">
                Categories
              </div>

              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    category === item
                      ? "category-button active"
                      : "category-button"
                  }
                  onClick={() =>
                    changeCategory(item)
                  }
                >
                  <span className="category-icon">
                    {CATEGORIES[item].icon}
                  </span>

                  <span>{item}</span>
                </button>
              ))}
            </aside>

            <main className="unit-main">

              <section className="unit-card">

                <div className="unit-card-head">
                  <div>
                    <div className="unit-card-title">
                      Convert {category}
                    </div>

                    <div className="unit-card-subtitle">
                      Choose your units and get an instant,
                      high-precision result.
                    </div>
                  </div>

                  <div className="precision-wrap">
                    <label htmlFor="uc-precision">
                      Precision
                    </label>

                    <select
                      id="uc-precision"
                      className="precision-select"
                      value={precision}
                      onChange={(e) =>
                        setPrecision(
                          Number(e.target.value)
                        )
                      }
                    >
                      <option value="2">
                        2 decimals
                      </option>
                      <option value="4">
                        4 decimals
                      </option>
                      <option value="6">
                        6 decimals
                      </option>
                      <option value="8">
                        8 decimals
                      </option>
                      <option value="10">
                        10 decimals
                      </option>
                    </select>
                  </div>
                </div>

                <div className="conversion-grid">

                  <div>
                    <label
                      className="field-label"
                      htmlFor="uc-amount"
                    >
                      Amount
                    </label>

                    <input
                      id="uc-amount"
                      className="amount-input"
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) =>
                        setAmount(
                          e.target.value
                        )
                      }
                      placeholder="Enter value"
                    />

                    <select
                      className="unit-select"
                      value={fromUnit}
                      onChange={(e) =>
                        setFromUnit(
                          e.target.value
                        )
                      }
                      aria-label="From unit"
                    >
                      {units.map((unit) => (
                        <option
                          key={unit}
                          value={unit}
                        >
                          {unit} (
                          {
                            CATEGORIES[
                              category
                            ].units[unit].symbol
                          }
                          )
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="swap-button"
                    onClick={swapUnits}
                    title="Swap units"
                    aria-label="Swap units"
                  >
                    ⇄
                  </button>

                  <div>
                    <label
                      className="field-label"
                      htmlFor="uc-to"
                    >
                      Convert to
                    </label>

                    <div
                      className="amount-input"
                      aria-live="polite"
                    >
                      {formattedResult}
                    </div>

                    <select
                      id="uc-to"
                      className="unit-select"
                      value={toUnit}
                      onChange={(e) =>
                        setToUnit(
                          e.target.value
                        )
                      }
                      aria-label="To unit"
                    >
                      {units.map((unit) => (
                        <option
                          key={unit}
                          value={unit}
                        >
                          {unit} (
                          {
                            CATEGORIES[
                              category
                            ].units[unit].symbol
                          }
                          )
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="result-box">

                  <div>
                    <div className="result-label">
                      Converted result
                    </div>

                    <div className="result-value">
                      {formattedResult}

                      <span className="result-unit">
                        {toSymbol}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="copy-button"
                    onClick={copyResult}
                  >
                    {copied
                      ? "✓ Copied"
                      : "Copy Result"}
                  </button>

                </div>

                <div className="formula">
                  <strong>
                    Conversion:
                  </strong>{" "}
                  {numericAmount} {fromSymbol} =
                  {" "}
                  {formattedResult} {toSymbol}
                </div>

                <div className="quick-section">

                  <div className="quick-title">
                    <strong>
                      Quick conversions
                    </strong>

                    <span>
                      One-click presets
                    </span>
                  </div>

                  <div className="preset-grid">
                    {presetList.map(
                      (item) => (
                        <button
                          key={item[0]}
                          type="button"
                          className="preset-button"
                          onClick={() =>
                            applyPreset(item)
                          }
                        >
                          {item[0]}
                        </button>
                      )
                    )}
                  </div>

                </div>

                <div className="save-history">
                  <button
                    type="button"
                    className="save-button"
                    onClick={addHistory}
                    disabled={
                      !Number.isFinite(
                        converted
                      )
                    }
                  >
                    + Save to history
                  </button>
                </div>

              </section>

              <section className="unit-card history-card">

                <div className="history-head">
                  <strong>
                    Recent conversions
                  </strong>

                  {history.length > 0 && (
                    <button
                      type="button"
                      className="clear-button"
                      onClick={clearHistory}
                    >
                      Clear history
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="empty-history">
                    Your saved conversions will appear
                    here. Nothing is stored on a server.
                  </div>
                ) : (
                  <div className="history-list">
                    {history.map(
                      (item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="history-item"
                          onClick={() => {
                            setCategory(
                              item.category
                            );
                            setAmount(
                              String(
                                item.amount
                              )
                            );
                            setFromUnit(
                              item.from
                            );
                            setToUnit(
                              item.to
                            );
                          }}
                          title="Load conversion"
                        >
                          <div className="history-main">
                            {item.amount}{" "}
                            {
                              CATEGORIES[
                                item.category
                              ].units[
                                item.from
                              ].symbol
                            }{" "}
                            <span>
                              →
                            </span>{" "}
                            {
                              CATEGORIES[
                                item.category
                              ].units[
                                item.to
                              ].symbol
                            }
                          </div>

                          <div className="history-result">
                            {formatNumber(
                              item.result,
                              precision
                            )}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}

                <div className="privacy-note">
                  <b>✓</b> All calculations run
                  locally in your browser. No values
                  are uploaded or stored.
                </div>

              </section>

            </main>

          </div>

        </div>
      </div>
    </>
  );
}
"use client";

import { useMemo, useState } from "react";

const CATEGORIES = [
  { max: 18.5, label: "Underweight", color: "#0891B2" },
  { max: 25, label: "Healthy weight", color: "#0D9488" },
  { max: 30, label: "Overweight", color: "#F59E0B" },
  { max: Infinity, label: "Obesity", color: "#E11D48" },
];

function classify(bmi) {
  return CATEGORIES.find((c) => bmi < c.max) || CATEGORIES[CATEGORIES.length - 1];
}

export default function BmiCalculator() {
  const [unit, setUnit] = useState("metric");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("65");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weightLb, setWeightLb] = useState("143");

  const bmi = useMemo(() => {
    if (unit === "metric") {
      const h = parseFloat(heightCm) / 100;
      const w = parseFloat(weightKg);
      if (!h || !w) return null;
      return w / (h * h);
    }
    const totalInches = parseFloat(heightFt) * 12 + parseFloat(heightIn || 0);
    const w = parseFloat(weightLb);
    if (!totalInches || !w) return null;
    return (w / (totalInches * totalInches)) * 703;
  }, [unit, heightCm, weightKg, heightFt, heightIn, weightLb]);

  const category = bmi ? classify(bmi) : null;

  return (
    <div>
      <div className="mb-6 inline-flex rounded-lg border border-line bg-paper p-1">
        {["metric", "imperial"].map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium capitalize transition ${
              unit === u ? "bg-surface text-ink shadow-card" : "text-muted"
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {unit === "metric" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Height (cm)" value={heightCm} onChange={setHeightCm} />
          <Field label="Weight (kg)" value={weightKg} onChange={setWeightKg} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Height (ft)" value={heightFt} onChange={setHeightFt} />
          <Field label="Height (in)" value={heightIn} onChange={setHeightIn} />
          <Field label="Weight (lb)" value={weightLb} onChange={setWeightLb} />
        </div>
      )}

      {bmi ? (
        <div className="mt-8 rounded-lg bg-paper p-6 text-center">
          <div className="font-display text-4xl font-bold text-ink">{bmi.toFixed(1)}</div>
          <div
            className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ color: category.color, backgroundColor: `${category.color}1A` }}
          >
            {category.label}
          </div>
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-muted">Enter your height and weight to see your BMI.</p>
      )}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
      />
    </label>
  );
}

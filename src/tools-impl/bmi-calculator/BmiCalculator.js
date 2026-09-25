"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Activity,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
} from "lucide-react";
import StepperInput from "@/components/tools/ui/Stepper";

const CATEGORY_STYLES = {
  "Enter details": { text: "text-muted" },
  Underweight: {
    text: "text-sky-500",
    chipBg: "bg-sky-50 dark:bg-sky-900/30",
    chipBorder: "border-sky-300 dark:border-sky-700",
    chipText: "text-sky-600 dark:text-sky-400",
  },
  "Normal Weight": {
    text: "text-teal",
    chipBg: "bg-teal-light",
    chipBorder: "border-teal/40",
    chipText: "text-teal",
  },
  Overweight: {
    text: "text-amber",
    chipBg: "bg-amber-light",
    chipBorder: "border-amber/40",
    chipText: "text-amber",
  },
  Obese: {
    text: "text-red-500",
    chipBg: "bg-red-50 dark:bg-red-900/30",
    chipBorder: "border-red-300 dark:border-red-700",
    chipText: "text-red-600 dark:text-red-400",
  },
};

// Styling + icon for the Action Plan card, keyed by category.
const PLAN_STYLES = {
  "Enter details": { box: "border-line bg-paper text-muted", icon: Info },
  Underweight: {
    box: "border-sky-300/50 bg-sky-50 text-sky-700 dark:border-sky-700/60 dark:bg-sky-900/20 dark:text-sky-400",
    icon: TrendingUp,
  },
  "Normal Weight": {
    box: "border-teal/30 bg-teal-light text-teal",
    icon: CheckCircle2,
  },
  Overweight: {
    box: "border-amber/30 bg-amber-light text-amber",
    icon: TrendingDown,
  },
  Obese: {
    box: "border-red-300/50 bg-red-50 text-red-700 dark:border-red-700/60 dark:bg-red-900/20 dark:text-red-400",
    icon: TrendingDown,
  },
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
    // Keep the first mobile view focused on the inputs + result — the
    // Action Plan / Categories panel is one tap away via "Insights".
    // Desktop/tablet keep it open by default (unaffected).
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setShowSettings(false);
    }
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
      if (heightInMeters > 0)
        bmi = weightInKg / (heightInMeters * heightInMeters);
    } else {
      const totalInches = safeFt * 12 + safeInch;
      heightInMeters = totalInches * 0.0254;
      weightInKg = safeLbs * 0.453592;
      if (totalInches > 0) bmi = (703 * safeLbs) / (totalInches * totalInches);
    }

    let category = "";
    let alertIcon = <Info className="h-5 w-5" />;

    if (bmi === 0) {
      category = "Enter details";
      alertIcon = <Info className="h-5 w-5 text-muted" />;
    } else if (bmi < 18.5) {
      category = "Underweight";
      alertIcon = <AlertTriangle className="h-5 w-5 text-sky-500" />;
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      category = "Normal Weight";
      alertIcon = <CheckCircle2 className="h-5 w-5 text-teal" />;
    } else if (bmi >= 25 && bmi <= 29.9) {
      category = "Overweight";
      alertIcon = <AlertTriangle className="h-5 w-5 text-amber" />;
    } else {
      category = "Obese";
      alertIcon = <AlertTriangle className="h-5 w-5 text-red-500" />;
    }

    const idealWeightMin = 18.5 * (heightInMeters * heightInMeters);
    const idealWeightMax = 24.9 * (heightInMeters * heightInMeters);

    let targetMsg = "";
    if (bmi === 0) {
      targetMsg = "Waiting for valid inputs...";
    } else if (bmi < 18.5) {
      const gain = idealWeightMin - weightInKg;
      targetMsg = `Gain ${system === "metric" ? gain.toFixed(1) + " kg" : (gain * 2.20462).toFixed(1) + " lbs"} to reach a normal weight.`;
    } else if (bmi > 24.9) {
      const lose = weightInKg - idealWeightMax;
      targetMsg = `Lose ${system === "metric" ? lose.toFixed(1) + " kg" : (lose * 2.20462).toFixed(1) + " lbs"} to reach a normal weight.`;
    } else {
      targetMsg = "You're at a healthy weight for your height. Keep it up!";
    }

    const idealRangeText =
      heightInMeters > 0
        ? system === "metric"
          ? `${idealWeightMin.toFixed(1)} - ${idealWeightMax.toFixed(1)} kg`
          : `${(idealWeightMin * 2.20462).toFixed(1)} - ${(idealWeightMax * 2.20462).toFixed(1)} lbs`
        : null;

    return {
      bmi: bmi > 0 ? bmi.toFixed(1) : "0.0",
      category,
      style: CATEGORY_STYLES[category],
      planStyle: PLAN_STYLES[category],
      targetMsg,
      idealRangeText,
      alertIcon,
      indicatorPos: Math.min(Math.max((bmi / 40) * 100, 0), 100),
    };
  };

  const data = getBmiData();
  const PlanIcon = data.planStyle.icon;

  return (
    // On mobile, ToolPageShell's Container (px-5) + its card wrapper (p-5) already
    // add 40px of gutter on each side before this component even starts. Rather than
    // touching those shared, site-wide components (which every other tool also uses),
    // we cancel that gutter here so only this tool goes edge-to-edge on small screens.
    // Desktop/tablet (sm+) are untouched.
    <div className="-mx-10 sm:mx-0">
      <div className="mx-auto w-full max-w-7xl space-y-4 overflow-x-hidden px-3 sm:space-y-6 sm:px-6 lg:px-0">
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="hidden items-center gap-3 sm:flex">
            <Activity className="h-6 w-6 shrink-0 text-brand" />
            <h2 className="font-display text-lg font-extrabold text-ink sm:text-xl">
              Advanced BMI Analyzer
            </h2>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-start">
            <div className="flex rounded-lg bg-paper p-1">
              <button
                onClick={() => handleSystemSwitch("metric")}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${system === "metric" ? "bg-surface text-brand shadow-card" : "text-muted"}`}
              >
                Metric
              </button>
              <button
                onClick={() => handleSystemSwitch("imperial")}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${system === "imperial" ? "bg-surface text-brand shadow-card" : "text-muted"}`}
              >
                Imperial
              </button>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted transition-all hover:border-brand hover:text-brand"
            >
              <Settings className="h-4 w-4" />{" "}
              {showSettings ? "Hide Insights" : "Insights"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr,auto]">
          <div className="flex min-w-0 flex-grow flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 rounded-xl border border-line bg-surface p-4 shadow-card sm:gap-8 sm:p-6 md:grid-cols-2">
              <div className="min-w-0 space-y-3 sm:space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-ink">
                  <Ruler className="h-4 w-4 shrink-0 text-brand" /> Height
                </label>
                {system === "metric" ? (
                  <StepperInput
                    value={cm}
                    min={50}
                    max={300}
                    onChange={setCm}
                    unit="cm"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <StepperInput
                      value={ft}
                      min={1}
                      max={9}
                      onChange={setFt}
                      unit="ft"
                    />
                    <StepperInput
                      value={inch}
                      min={0}
                      max={11}
                      onChange={setInch}
                      unit="in"
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-3 sm:space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-ink">
                  <Scale className="h-4 w-4 shrink-0 text-brand" /> Weight
                </label>
                {system === "metric" ? (
                  <StepperInput
                    value={kg}
                    min={10}
                    max={500}
                    onChange={setKg}
                    unit="kg"
                  />
                ) : (
                  <StepperInput
                    value={lbs}
                    min={10}
                    max={1000}
                    onChange={setLbs}
                    unit="lbs"
                  />
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-5 text-center shadow-card sm:p-8">
              <div className="relative z-10">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted sm:text-sm">
                  Your Body Mass Index
                </h3>

                <div
                  className={`mb-2 font-display text-6xl font-black tracking-tighter transition-colors sm:text-7xl md:text-8xl ${data.style.text}`}
                >
                  {isMounted ? data.bmi : "0.0"}
                </div>

                <div
                  className={`flex flex-wrap items-center justify-center gap-2 text-base font-bold uppercase tracking-wide transition-colors sm:text-xl ${data.style.text}`}
                >
                  {data.alertIcon} {isMounted ? data.category : "-"}
                </div>

                <div className="mx-auto mb-4 mt-6 max-w-2xl sm:mt-8">
                  <div className="flex h-4 w-full overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full bg-sky-400"
                      style={{ width: "18.5%" }}
                    ></div>
                    <div
                      className="h-full bg-teal"
                      style={{ width: "6.4%" }}
                    ></div>
                    <div
                      className="h-full bg-amber"
                      style={{ width: "5%" }}
                    ></div>
                    <div
                      className="h-full bg-red-400"
                      style={{ flexGrow: 1 }}
                    ></div>
                  </div>
                  <div className="relative mx-auto h-4 w-full max-w-2xl">
                    {isMounted && data.indicatorPos > 0 && (
                      <div
                        className="absolute top-0 -ml-2 h-4 w-4 rounded-full border-2 border-surface bg-ink shadow-card transition-all duration-500 ease-out"
                        style={{ left: `${data.indicatorPos}%` }}
                      ></div>
                    )}
                  </div>
                  <div className="mt-2 flex justify-between px-1 text-[9px] font-bold uppercase text-muted sm:text-[10px]">
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
            <div className="flex h-full min-w-0 flex-col space-y-6 animate-in fade-in slide-in-from-right-4 lg:w-80 lg:max-w-80">
              <div className="space-y-4 rounded-xl border border-line bg-surface p-5 shadow-card">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <ArrowRight className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold text-ink">Action Plan</h3>
                </div>

                <div
                  className={`flex items-start gap-3 rounded-lg border p-4 text-sm font-semibold leading-relaxed transition-colors ${data.planStyle.box}`}
                >
                  <PlanIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                    {isMounted
                      ? data.targetMsg
                      : "Calculate your BMI to get an action plan."}
                  </span>
                </div>

                {isMounted && data.idealRangeText && (
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-paper px-4 py-3 text-xs">
                    <span className="font-semibold text-muted">
                      Healthy range for you
                    </span>
                    <span className="font-mono font-bold text-ink">
                      {data.idealRangeText}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-xl border border-line bg-surface p-5 shadow-card">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <Info className="h-5 w-5 text-muted" />
                  <h3 className="font-semibold text-ink">BMI Categories</h3>
                </div>

                <ul className="space-y-3 text-xs">
                  {[
                    {
                      label: "Underweight",
                      key: "Underweight",
                      range: "< 18.5",
                    },
                    {
                      label: "Normal",
                      key: "Normal Weight",
                      range: "18.5 - 24.9",
                    },
                    {
                      label: "Overweight",
                      key: "Overweight",
                      range: "25.0 - 29.9",
                    },
                    { label: "Obese", key: "Obese", range: "30.0 +" },
                  ].map((row) => {
                    const active = data.category === row.key;
                    const style = CATEGORY_STYLES[row.key];
                    return (
                      <li
                        key={row.key}
                        className={`flex items-center justify-between rounded-lg border p-2 transition-all duration-300 ${
                          active
                            ? `${style.chipBg} ${style.chipBorder} scale-105 shadow-card`
                            : "border-transparent bg-paper"
                        }`}
                      >
                        <span
                          className={`font-bold ${active ? style.chipText : style.text}`}
                        >
                          {row.label}
                        </span>
                        <span className="font-mono text-muted">
                          {row.range}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
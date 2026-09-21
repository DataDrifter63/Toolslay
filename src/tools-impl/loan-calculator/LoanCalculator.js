"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings, Landmark, DollarSign, Percent, Calendar, TrendingDown, PiggyBank, FileText, Sparkles } from "lucide-react";

const CURRENCIES = [
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "EUR", symbol: "€", locale: "de-DE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "PKR", symbol: "₨", locale: "en-PK" },
  { code: "INR", symbol: "₹", locale: "en-IN" },
  { code: "AUD", symbol: "A$", locale: "en-AU" },
  { code: "CAD", symbol: "C$", locale: "en-CA" },
];

const formatCurrency = (val, currencyCode, locale) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const LoanCalculator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  const [principal, setPrincipal] = useState("300000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [extraPayment, setExtraPayment] = useState("0");

  const [showSettings, setShowSettings] = useState(true);

  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalPayment: 0,
    savedInterest: 0,
    savedMonths: 0,
    payoffYears: 0,
    yearlySchedule: [],
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateLoan = useCallback(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const y = parseFloat(years) || 0;
    const extra = parseFloat(extraPayment) || 0;

    if (p <= 0 || y <= 0) {
      setResults({ monthlyPayment: 0, totalInterest: 0, totalPayment: 0, savedInterest: 0, savedMonths: 0, payoffYears: 0, yearlySchedule: [] });
      return;
    }

    const monthlyRate = r / 100 / 12;
    const totalMonths = Math.floor(y * 12);
    let standardPayment = 0;

    if (monthlyRate === 0) {
      standardPayment = p / totalMonths;
    } else {
      standardPayment = (p * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const standardTotalPayment = standardPayment * totalMonths;
    const standardTotalInterest = standardTotalPayment - p;

    let balance = p;
    let actualInterest = 0;
    let actualMonths = 0;
    let yearlyData = [];
    let currentYearInterest = 0;
    let currentYearPrincipal = 0;

    for (let i = 1; i <= totalMonths; i++) {
      let interestPayment = balance * monthlyRate;
      let principalPayment = standardPayment - interestPayment + extra;

      if (balance < principalPayment) {
        principalPayment = balance;
        interestPayment = balance * monthlyRate;
      }

      balance -= principalPayment;
      actualInterest += interestPayment;
      currentYearInterest += interestPayment;
      currentYearPrincipal += principalPayment;
      actualMonths++;

      if (i % 12 === 0 || balance <= 0) {
        yearlyData.push({
          year: Math.ceil(i / 12),
          interest: currentYearInterest,
          principal: currentYearPrincipal,
          balance: Math.max(0, balance),
        });
        currentYearInterest = 0;
        currentYearPrincipal = 0;
      }

      if (balance <= 0) break;
    }

    const calcSavedInterest = Math.max(0, standardTotalInterest - actualInterest);
    const finalSavedInterest = calcSavedInterest < 1 ? 0 : calcSavedInterest;

    setResults({
      monthlyPayment: standardPayment,
      totalInterest: actualInterest,
      totalPayment: p + actualInterest,
      savedInterest: finalSavedInterest,
      savedMonths: totalMonths - actualMonths,
      payoffYears: (actualMonths / 12).toFixed(1),
      yearlySchedule: yearlyData,
    });
  }, [principal, rate, years, extraPayment]);

  useEffect(() => {
    calculateLoan();
  }, [calculateLoan]);

  const pNum = parseFloat(principal) || 0;
  const principalPercent = results.totalPayment > 0 ? (pNum / results.totalPayment) * 100 : 100;
  const interestPercent = results.totalPayment > 0 ? (results.totalInterest / results.totalPayment) * 100 : 0;
  const hasExtraPayment = parseFloat(extraPayment) > 0 && results.savedMonths > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface px-6 py-4 shadow-card">
        <div className="flex items-center gap-3">
          <Landmark className="h-6 w-6 text-brand" />
          <h2 className="font-display text-xl font-extrabold text-ink">Advanced Loan Calculator</h2>
        </div>
        <div className="flex gap-2">
          <select
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value))}
            className="cursor-pointer rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted transition-all hover:border-brand hover:text-brand"
          >
            <Settings className="h-4 w-4" /> {showSettings ? "Hide Amortization" : "Amortization"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr,auto]">
        <div className="flex flex-grow flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 rounded-xl border border-line bg-surface p-6 shadow-card md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-ink">
                <DollarSign className="h-4 w-4 text-brand" /> Loan Amount
              </label>
              <div className="group relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted transition-colors group-focus-within:text-brand">{currency.symbol}</span>
                <input
                  type="number"
                  min="0"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full rounded-lg border border-line bg-paper py-3 pl-10 pr-4 text-xl font-bold text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-ink">
                <Percent className="h-4 w-4 text-brand" /> Interest Rate
              </label>
              <div className="group relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full rounded-lg border border-line bg-paper py-3 pl-4 pr-8 text-xl font-bold text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted transition-colors group-focus-within:text-brand">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-ink">
                <Calendar className="h-4 w-4 text-brand" /> Loan Term
              </label>
              <div className="group relative">
                <input
                  type="number"
                  min="1"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full rounded-lg border border-line bg-paper py-3 pl-4 pr-16 text-xl font-bold text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted transition-colors group-focus-within:text-brand">Years</span>
              </div>
            </div>

            <div className="relative space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-ink">
                <TrendingDown className="h-4 w-4 text-teal" /> Extra Monthly Payment
              </label>
              <div className="group relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-teal">{currency.symbol}</span>
                <input
                  type="number"
                  min="0"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(e.target.value)}
                  className="w-full rounded-lg border border-teal/30 bg-teal-light py-3 pl-10 pr-4 text-xl font-bold text-teal placeholder-teal/40 transition-shadow focus:outline-none focus:ring-2 focus:ring-teal/40"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-line bg-ink p-8 text-center text-paper shadow-card">
            <div className="relative z-10">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-paper/60">Base Monthly Payment</h3>

              <div className="mb-6 font-display text-5xl font-black tracking-tighter md:text-6xl">
                {isMounted ? formatCurrency(results.monthlyPayment, currency.code, currency.locale) : `${currency.symbol}0`}
                {hasExtraPayment && (
                  <span className="mt-2 block animate-in fade-in slide-in-from-bottom-2 text-2xl text-teal">
                    + {formatCurrency(extraPayment, currency.code, currency.locale)} Extra
                  </span>
                )}
              </div>

              <div className="mx-auto mb-4 mt-8 max-w-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span className="text-brand-light">Principal (Total Loan)</span>
                  <span className="text-amber">Total Interest</span>
                </div>
                <div className="flex h-4 w-full overflow-hidden rounded-full border border-paper/10 bg-paper/10">
                  <div className="h-full bg-brand-light transition-all duration-1000 ease-out" style={{ width: `${principalPercent}%` }}></div>
                  <div className="h-full bg-amber transition-all duration-1000 ease-out" style={{ width: `${interestPercent}%` }}></div>
                </div>
                <div className="flex justify-between font-mono text-sm font-bold">
                  <span>{isMounted ? formatCurrency(pNum, currency.code, currency.locale) : `${currency.symbol}0`}</span>
                  <span>{isMounted ? formatCurrency(results.totalInterest, currency.code, currency.locale) : `${currency.symbol}0`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="flex h-full flex-col space-y-6 animate-in fade-in slide-in-from-right-4 lg:w-[350px] lg:max-w-[350px]">
            <div className="space-y-4 rounded-xl border border-line bg-surface p-5 shadow-card">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <PiggyBank className="h-5 w-5 text-teal" />
                <h3 className="font-semibold text-ink">Extra Payment Impact</h3>
              </div>

              {hasExtraPayment ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
                  <div className="rounded-lg border border-teal/30 bg-teal-light p-4">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-teal">Interest Saved</span>
                    <span className="block font-display text-3xl font-black tracking-tight text-teal">
                      {formatCurrency(results.savedInterest, currency.code, currency.locale)}
                    </span>
                  </div>
                  <div className="rounded-lg border border-brand/30 bg-brand-light p-4">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-brand">Time Saved</span>
                    <span className="block font-display text-xl font-black tracking-tight text-brand">
                      {Math.floor(results.savedMonths / 12)} Yrs, {results.savedMonths % 12} Mos
                    </span>
                    <span className="mt-2 flex items-center gap-1 text-xs font-bold text-brand">
                      <Sparkles className="h-3.5 w-3.5" /> New Payoff: {results.payoffYears} Years
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-line bg-paper p-6 text-center text-sm font-medium text-muted">
                  <TrendingDown className="mb-3 h-8 w-8 text-muted/60" />
                  Enter an extra monthly payment to see how much time and interest you can save!
                </div>
              )}
            </div>

            <div className="flex max-h-[500px] flex-col rounded-xl border border-line bg-surface p-5 shadow-card">
              <div className="mb-3 flex items-center gap-2 border-b border-line pb-3">
                <FileText className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-ink">Yearly Amortization</h3>
              </div>

              <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                {results.yearlySchedule.length > 0 ? (
                  results.yearlySchedule.map((data) => (
                    <div key={data.year} className="rounded-lg border border-line bg-paper p-3 transition-colors hover:border-brand/40">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-black text-ink">Year {data.year}</span>
                        <span className="font-mono text-xs font-bold text-muted">Bal: {formatCurrency(data.balance, currency.code, currency.locale)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-brand">Prin: {formatCurrency(data.principal, currency.code, currency.locale)}</span>
                        <span className="text-amber">Int: {formatCurrency(data.interest, currency.code, currency.locale)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs font-bold text-muted">Enter valid loan details to generate schedule.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;

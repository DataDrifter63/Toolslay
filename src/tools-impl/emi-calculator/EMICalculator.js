"use client";

import { useMemo, useState } from "react";
import {
  Percent,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
  PiggyBank,
  Zap,
  Info,
  TrendingDown,
} from "lucide-react";

const CURRENCIES = [
  { id: "usd", symbol: "$" },
  { id: "inr", symbol: "₹" },
  { id: "gbp", symbol: "£" },
  { id: "eur", symbol: "€" },
  { id: "pkr", symbol: "Rs " },
];

function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "0";
  return Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// Standard reducing-balance EMI formula.
function calcEMI(principal, annualRatePct, months) {
  const r = annualRatePct / 12 / 100;
  if (!principal || !months) return 0;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

// Builds a month-by-month amortization schedule. Supports optional
// prepayments (one-time lump sum or a recurring extra amount every month)
// and an optional "step-up" EMI that auto-increases every 12 months — both
// of which are rarely offered together in free calculators, but are the
// two things that actually change how fast a loan gets paid off.
function buildSchedule({ principal, annualRatePct, months, prepayment, stepUp }) {
  const r = annualRatePct / 12 / 100;
  const baseEMI = calcEMI(principal, annualRatePct, months);
  let currentEMI = baseEMI;
  let balance = principal;
  const schedule = [];
  const maxMonths = months + 12; // safety cap in case of edge-case inputs

  for (let month = 1; month <= maxMonths && balance > 0.5; month += 1) {
    if (stepUp?.enabled && month > 1 && (month - 1) % 12 === 0) {
      currentEMI *= 1 + stepUp.percent / 100;
    }

    const interestPortion = balance * r;
    let principalPortion = currentEMI - interestPortion;
    if (principalPortion < 0) principalPortion = 0;

    let extra = 0;
    if (prepayment?.enabled) {
      if (prepayment.type === "monthly") extra = prepayment.amount || 0;
      else if (prepayment.type === "lumpsum" && month === prepayment.startMonth) {
        extra = prepayment.amount || 0;
      }
    }

    let totalPrincipal = principalPortion + extra;
    if (totalPrincipal > balance) totalPrincipal = balance;
    balance -= totalPrincipal;

    schedule.push({
      month,
      emiPaid: interestPortion + totalPrincipal,
      interest: interestPortion,
      principal: totalPrincipal,
      prepayment: extra,
      balance: Math.max(balance, 0),
    });
  }

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPaid = schedule.reduce((sum, row) => sum + row.emiPaid, 0);

  return { schedule, totalInterest, totalPaid, months: schedule.length, baseEMI };
}

function groupByYear(schedule) {
  const years = [];
  for (let i = 0; i < schedule.length; i += 12) {
    years.push(schedule.slice(i, i + 12));
  }
  return years;
}

function NumberField({ label, value, onChange, suffix, prefix }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2.5 focus-within:border-brand">
        {prefix && <span className="shrink-0 text-xs text-muted">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-sm text-ink focus:outline-none"
        />
        {suffix && <span className="shrink-0 text-xs text-muted">{suffix}</span>}
      </div>
    </label>
  );
}

export default function EMICalculator({ compact = false }) {
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [amount, setAmount] = useState("20000");
  const [rate, setRate] = useState("8.5");
  const [tenureValue, setTenureValue] = useState("5");
  const [tenureUnit, setTenureUnit] = useState("years");

  const [prepayEnabled, setPrepayEnabled] = useState(false);
  const [prepayType, setPrepayType] = useState("monthly");
  const [prepayAmount, setPrepayAmount] = useState("100");
  const [prepayStartMonth, setPrepayStartMonth] = useState("12");

  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpPercent, setStepUpPercent] = useState("10");

  const [showSchedule, setShowSchedule] = useState(false);
  const [yearlyView, setYearlyView] = useState(true);
  const [openYear, setOpenYear] = useState(0);
  const [copied, setCopied] = useState(false);

  const months = useMemo(() => {
    const v = parseFloat(tenureValue) || 0;
    return Math.round(tenureUnit === "years" ? v * 12 : v);
  }, [tenureValue, tenureUnit]);

  const principal = parseFloat(amount) || 0;
  const annualRatePct = parseFloat(rate) || 0;

  const baseline = useMemo(
    () => buildSchedule({ principal, annualRatePct, months, prepayment: null, stepUp: null }),
    [principal, annualRatePct, months]
  );

  const adjusted = useMemo(() => {
    const hasChanges = prepayEnabled || stepUpEnabled;
    if (!hasChanges) return baseline;
    return buildSchedule({
      principal,
      annualRatePct,
      months,
      prepayment: prepayEnabled
        ? { enabled: true, type: prepayType, amount: parseFloat(prepayAmount) || 0, startMonth: parseInt(prepayStartMonth, 10) || 1 }
        : null,
      stepUp: stepUpEnabled ? { enabled: true, percent: parseFloat(stepUpPercent) || 0 } : null,
    });
  }, [baseline, principal, annualRatePct, months, prepayEnabled, prepayType, prepayAmount, prepayStartMonth, stepUpEnabled, stepUpPercent]);

  const hasChanges = prepayEnabled || stepUpEnabled;
  const monthsSaved = hasChanges ? baseline.months - adjusted.months : 0;
  const interestSaved = hasChanges ? baseline.totalInterest - adjusted.totalInterest : 0;

  const principalPct = principal > 0 ? (principal / (principal + adjusted.totalInterest)) * 100 : 0;

  const years = useMemo(() => groupByYear(adjusted.schedule), [adjusted.schedule]);

  function handleDownloadCSV() {
    const header = "Month,EMI Paid,Principal,Interest,Prepayment,Remaining Balance\n";
    const rows = adjusted.schedule
      .map((r) => `${r.month},${r.emiPaid.toFixed(2)},${r.principal.toFixed(2)},${r.interest.toFixed(2)},${r.prepayment.toFixed(2)},${r.balance.toFixed(2)}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amortization-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopySummary() {
    const text = [
      `Loan amount: ${currency.symbol}${fmt(principal)}`,
      `Interest rate: ${annualRatePct}% per year`,
      `Tenure: ${months} months`,
      `Monthly EMI: ${currency.symbol}${fmt(adjusted.baseEMI)}`,
      `Total interest: ${currency.symbol}${fmt(adjusted.totalInterest)}`,
      `Total payment: ${currency.symbol}${fmt(principal + adjusted.totalInterest)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div>
      {/* Loan inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Currency</span>
          <select
            value={currency.id}
            onChange={(e) => setCurrency(CURRENCIES.find((c) => c.id === e.target.value))}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol.trim()}
              </option>
            ))}
          </select>
        </div>
        <NumberField label="Loan amount" prefix={currency.symbol} value={amount} onChange={setAmount} />
        <NumberField label="Interest rate (annual)" suffix="%" value={rate} onChange={setRate} />
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Loan tenure</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={tenureValue}
              onChange={(e) => setTenureValue(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
            <select
              value={tenureUnit}
              onChange={(e) => setTenureUnit(e.target.value)}
              className="shrink-0 rounded-lg border border-line bg-paper px-2 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>
      </div>

      {!compact && (
        <>
          {/* Prepayment */}
          <div className="mt-6 rounded-xl border border-line bg-surface p-4">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <PiggyBank size={16} className="text-brand" aria-hidden="true" />
                Extra prepayment
              </span>
              <input type="checkbox" checked={prepayEnabled} onChange={(e) => setPrepayEnabled(e.target.checked)} className="h-4 w-4 accent-brand" />
            </label>
            {prepayEnabled && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-muted">Type</span>
                  <select
                    value={prepayType}
                    onChange={(e) => setPrepayType(e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
                  >
                    <option value="monthly">Extra amount every month</option>
                    <option value="lumpsum">One-time lump sum</option>
                  </select>
                </div>
                <NumberField label="Amount" prefix={currency.symbol} value={prepayAmount} onChange={setPrepayAmount} />
                {prepayType === "lumpsum" && (
                  <NumberField label="Starting from month" value={prepayStartMonth} onChange={setPrepayStartMonth} />
                )}
              </div>
            )}
          </div>

          {/* Step-up EMI */}
          <div className="mt-3 rounded-xl border border-line bg-surface p-4">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Zap size={16} className="text-amber" aria-hidden="true" />
                Step-up EMI
              </span>
              <input type="checkbox" checked={stepUpEnabled} onChange={(e) => setStepUpEnabled(e.target.checked)} className="h-4 w-4 accent-brand" />
            </label>
            <p className="mt-1 text-xs text-muted">Automatically increase your EMI every year as your income grows, so you pay off faster without a bigger bite upfront.</p>
            {stepUpEnabled && (
              <div className="mt-3 max-w-xs">
                <NumberField label="Increase EMI by, each year" suffix="%" value={stepUpPercent} onChange={setStepUpPercent} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Results */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ResultCard label={hasChanges && stepUpEnabled ? "Starting EMI" : "Monthly EMI"} value={`${currency.symbol}${fmt(adjusted.baseEMI)}`} highlight />
        <ResultCard label="Total interest" value={`${currency.symbol}${fmt(adjusted.totalInterest)}`} />
        <ResultCard label="Total payment" value={`${currency.symbol}${fmt(principal + adjusted.totalInterest)}`} />
      </div>

      {/* Principal vs interest bar */}
      <div className="mt-4">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full bg-brand" style={{ width: `${principalPct}%` }} />
          <div className="h-full bg-amber" style={{ width: `${100 - principalPct}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand" /> Principal ({fmt(principalPct)}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber" /> Interest ({fmt(100 - principalPct)}%)
          </span>
        </div>
      </div>

      {/* Savings summary when prepayment/step-up active */}
      {!compact && hasChanges && (interestSaved > 1 || monthsSaved > 0) && (
        <div className="mt-5 rounded-xl border border-teal/30 bg-teal-light p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <TrendingDown size={15} className="text-teal" aria-hidden="true" />
            With these changes you save {currency.symbol}{fmt(interestSaved)} in interest and finish {monthsSaved} month{monthsSaved !== 1 ? "s" : ""} early.
          </p>
          <p className="mt-1 text-xs text-muted">
            Without changes: {baseline.months} months, {currency.symbol}{fmt(baseline.totalInterest)} interest. With changes: {adjusted.months} months, {currency.symbol}{fmt(adjusted.totalInterest)} interest.
          </p>
        </div>
      )}

      {!compact && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-brand hover:text-brand"
          >
            {copied ? <Check size={13} className="text-teal" aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
            {copied ? "Copied!" : "Copy summary"}
          </button>
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-brand hover:text-brand"
          >
            <Download size={13} aria-hidden="true" />
            Download schedule (.csv)
          </button>
          <button
            type="button"
            onClick={() => setShowSchedule((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand"
          >
            {showSchedule ? "Hide" : "Show"} amortization schedule
            {showSchedule ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
          </button>
        </div>
      )}

      {!compact && showSchedule && (
        <div className="mt-4 rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-xs font-semibold text-ink">Amortization schedule</p>
            <div className="inline-flex rounded-lg border border-line bg-paper p-1">
              <button
                type="button"
                onClick={() => setYearlyView(true)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${yearlyView ? "bg-surface text-ink shadow-card" : "text-muted"}`}
              >
                Yearly
              </button>
              <button
                type="button"
                onClick={() => setYearlyView(false)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${!yearlyView ? "bg-surface text-ink shadow-card" : "text-muted"}`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface text-muted">
                <tr className="border-b border-line">
                  <th className="px-3 py-2 text-left font-medium">Month</th>
                  <th className="px-3 py-2 text-right font-medium">Principal</th>
                  <th className="px-3 py-2 text-right font-medium">Interest</th>
                  <th className="px-3 py-2 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearlyView
                  ? years.map((yearRows, yIdx) => {
                      const yPrincipal = yearRows.reduce((s, r) => s + r.principal, 0);
                      const yInterest = yearRows.reduce((s, r) => s + r.interest, 0);
                      const isOpen = openYear === yIdx;
                      return (
                        <YearGroup
                          key={yIdx}
                          yearIndex={yIdx}
                          rows={yearRows}
                          yPrincipal={yPrincipal}
                          yInterest={yInterest}
                          isOpen={isOpen}
                          onToggle={() => setOpenYear(isOpen ? -1 : yIdx)}
                          currency={currency.symbol}
                        />
                      );
                    })
                  : adjusted.schedule.map((row) => (
                      <tr key={row.month} className="border-b border-line/60">
                        <td className="px-3 py-1.5 text-ink">{row.month}</td>
                        <td className="px-3 py-1.5 text-right text-ink">{currency.symbol}{fmt(row.principal)}</td>
                        <td className="px-3 py-1.5 text-right text-muted">{currency.symbol}{fmt(row.interest)}</td>
                        <td className="px-3 py-1.5 text-right text-ink">{currency.symbol}{fmt(row.balance)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!compact && (
        <p className="mt-4 flex items-start gap-1.5 text-xs text-muted">
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          Uses the standard reducing-balance EMI formula. Actual figures from your lender may vary slightly due to processing fees, rounding, or a flat-rate interest method.
        </p>
      )}
    </div>
  );
}

function ResultCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-brand bg-brand-light" : "border-line bg-paper"}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${highlight ? "text-brand" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function YearGroup({ yearIndex, rows, yPrincipal, yInterest, isOpen, onToggle, currency }) {
  return (
    <>
      <tr className="cursor-pointer border-b border-line bg-paper" onClick={onToggle}>
        <td className="px-3 py-2 font-semibold text-ink">
          <span className="inline-flex items-center gap-1.5">
            {isOpen ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}
            Year {yearIndex + 1}
          </span>
        </td>
        <td className="px-3 py-2 text-right font-semibold text-ink">{currency}{fmt(yPrincipal)}</td>
        <td className="px-3 py-2 text-right font-semibold text-muted">{currency}{fmt(yInterest)}</td>
        <td className="px-3 py-2 text-right text-ink">{currency}{fmt(rows[rows.length - 1]?.balance ?? 0)}</td>
      </tr>
      {isOpen &&
        rows.map((row) => (
          <tr key={row.month} className="border-b border-line/60">
            <td className="px-3 py-1.5 pl-8 text-ink">Month {row.month}</td>
            <td className="px-3 py-1.5 text-right text-ink">{currency}{fmt(row.principal)}</td>
            <td className="px-3 py-1.5 text-right text-muted">{currency}{fmt(row.interest)}</td>
            <td className="px-3 py-1.5 text-right text-ink">{currency}{fmt(row.balance)}</td>
          </tr>
        ))}
    </>
  );
}
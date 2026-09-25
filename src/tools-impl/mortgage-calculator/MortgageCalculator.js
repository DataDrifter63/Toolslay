"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Home, DollarSign, Percent, Calendar, 
  Shield, Landmark, PieChart, Check, Copy, SlidersHorizontal
} from "lucide-react";

const CURRENCIES = [
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'PKR', symbol: '₨', locale: 'en-PK' },
  { code: 'INR', symbol: '₹', locale: 'en-IN' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA' }
];

const formatCurrency = (val, currencyCode, locale) => {
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currencyCode, 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(val || 0);
};

export default function MortgageCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [copied, setCopied] = useState(false);

  const [homePrice, setHomePrice] = useState("400000");
  const [downPayment, setDownPayment] = useState("80000");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [rate, setRate] = useState("7.0");
  const [years, setYears] = useState("30");

  const [propTaxRate, setPropTaxRate] = useState("1.2");
  const [homeInsurance, setHomeInsurance] = useState("1200");
  const [hoa, setHoa] = useState("0");

  const [results, setResults] = useState({
    monthlyPI: 0,
    monthlyTax: 0,
    monthlyIns: 0,
    monthlyPMI: 0,
    monthlyHOA: 0,
    totalMonthly: 0,
    totalLoan: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleHomePriceChange = (val) => {
    setHomePrice(val);
    const hp = parseFloat(val) || 0;
    const dpPercent = parseFloat(downPaymentPercent) || 0;
    setDownPayment((hp * (dpPercent / 100)).toFixed(0));
  };

  const handleDownPaymentChange = (val) => {
    setDownPayment(val);
    const dp = parseFloat(val) || 0;
    const hp = parseFloat(homePrice) || 0;
    if (hp > 0) {
      setDownPaymentPercent(((dp / hp) * 100).toFixed(1));
    }
  };

  const handleDownPaymentPercentChange = (val) => {
    setDownPaymentPercent(val);
    const percent = parseFloat(val) || 0;
    const hp = parseFloat(homePrice) || 0;
    setDownPayment((hp * (percent / 100)).toFixed(0));
  };

  const calculateMortgage = useCallback(() => {
    const hp = parseFloat(homePrice) || 0;
    const dp = parseFloat(downPayment) || 0;
    const r = parseFloat(rate) || 0;
    const y = parseFloat(years) || 0;
    
    // Only apply escrow values if advanced mode is shown, otherwise treat as 0
    const taxRate = showAdvanced ? parseFloat(propTaxRate) || 0 : 0;
    const ins = showAdvanced ? parseFloat(homeInsurance) || 0 : 0;
    const hoaFee = showAdvanced ? parseFloat(hoa) || 0 : 0;

    const loanAmount = Math.max(0, hp - dp);
    
    if (loanAmount <= 0 || y <= 0) {
      setResults({ monthlyPI: 0, monthlyTax: 0, monthlyIns: 0, monthlyPMI: 0, monthlyHOA: hoaFee, totalMonthly: hoaFee, totalLoan: 0 });
      return;
    }

    const monthlyRate = r / 100 / 12;
    const totalMonths = y * 12;
    let pi = 0;
    
    if (monthlyRate === 0) {
      pi = loanAmount / totalMonths;
    } else {
      pi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const monthlyTax = (hp * (taxRate / 100)) / 12;
    const monthlyIns = ins / 12;

    const dpPercent = hp > 0 ? (dp / hp) * 100 : 0;
    const pmi = dpPercent < 20 ? (loanAmount * 0.005) / 12 : 0;

    const total = pi + monthlyTax + monthlyIns + pmi + hoaFee;

    setResults({
      monthlyPI: pi,
      monthlyTax: monthlyTax,
      monthlyIns: monthlyIns,
      monthlyPMI: pmi,
      monthlyHOA: hoaFee,
      totalMonthly: total,
      totalLoan: loanAmount
    });
  }, [homePrice, downPayment, rate, years, propTaxRate, homeInsurance, hoa, showAdvanced]);

  useEffect(() => {
    calculateMortgage();
  }, [calculateMortgage]);

  const copyResult = async () => {
    if (results.totalMonthly <= 0) return;
    
    const text = 
      `Mortgage Summary\n` +
      `Home Price: ${formatCurrency(homePrice, currency.code, currency.locale)}\n` +
      `Down Payment: ${formatCurrency(downPayment, currency.code, currency.locale)} (${downPaymentPercent}%)\n` +
      `Loan Amount: ${formatCurrency(results.totalLoan, currency.code, currency.locale)}\n\n` +
      `Total Monthly Payment: ${formatCurrency(results.totalMonthly, currency.code, currency.locale)}\n` +
      `- Principal & Interest: ${formatCurrency(results.monthlyPI, currency.code, currency.locale)}\n` +
      (results.monthlyTax > 0 ? `- Property Tax: ${formatCurrency(results.monthlyTax, currency.code, currency.locale)}\n` : '') +
      (results.monthlyIns > 0 ? `- Home Insurance: ${formatCurrency(results.monthlyIns, currency.code, currency.locale)}\n` : '') +
      (results.monthlyPMI > 0 ? `- PMI: ${formatCurrency(results.monthlyPMI, currency.code, currency.locale)}\n` : '') +
      (results.monthlyHOA > 0 ? `- HOA Fees: ${formatCurrency(results.monthlyHOA, currency.code, currency.locale)}\n` : '');

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

  const getPercent = (value) => results.totalMonthly > 0 ? (value / results.totalMonthly) * 100 : 0;
  const piPct = getPercent(results.monthlyPI);
  const taxPct = getPercent(results.monthlyTax);
  const insPct = getPercent(results.monthlyIns);
  const pmiPct = getPercent(results.monthlyPMI);
  const hoaPct = getPercent(results.monthlyHOA);

  const baseInputStyle = "w-full min-w-0 h-10 px-3 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-mono";
  const baseSelectStyle = "w-full min-w-0 h-10 pl-3 pr-8 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 space-y-6 min-w-0">
        
        {/* HEADER BAR WITH ACTION BUTTONS ALIGNED RIGHT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Home className="w-5 h-5 text-brand shrink-0" />
            <h2 className="text-base sm:text-lg font-display font-bold text-ink truncate">
              Mortgage Calculator
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            <select 
              value={currency.code}
              onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
              className="h-9 pl-3 pr-8 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold cursor-pointer min-w-[90px]"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-line bg-surface hover:bg-paper text-ink text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
              {showAdvanced ? "Hide Escrow Info" : "Taxes & Insurance"}
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[1.3fr,1fr] min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="space-y-5 min-w-0">
            
            <div className="space-y-2 min-w-0">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="mortgage-home-price">
                <DollarSign className="w-3.5 h-3.5 text-brand" /> Home Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted">{currency.symbol}</span>
                <input 
                  id="mortgage-home-price"
                  type="number" 
                  min="0" 
                  value={homePrice} 
                  onChange={(e) => handleHomePriceChange(e.target.value)} 
                  className={`${baseInputStyle} pl-8 text-sm`} 
                />
              </div>
            </div>

            <div className="p-4 bg-paper border border-line rounded-xl space-y-3 min-w-0">
              <div className="flex items-center justify-between min-w-0">
                <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                  <Landmark className="w-3.5 h-3.5 text-brand" /> Down Payment
                </label>
                {results.monthlyPMI > 0 && (
                  <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                    PMI Required (&lt;20%)
                  </span>
                )}
              </div>
              <div className="flex gap-3 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted">{currency.symbol}</span>
                  <input 
                    type="number" 
                    min="0" 
                    value={downPayment} 
                    onChange={(e) => handleDownPaymentChange(e.target.value)} 
                    className={`${baseInputStyle} pl-8 text-sm`} 
                  />
                </div>
                <div className="relative w-[110px] shrink-0">
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.1" 
                    value={downPaymentPercent} 
                    onChange={(e) => handleDownPaymentPercentChange(e.target.value)} 
                    className={`${baseInputStyle} pr-7 text-sm`} 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted">%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0">
                <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="mortgage-rate">
                  <Percent className="w-3.5 h-3.5 text-brand" /> Interest Rate
                </label>
                <div className="relative">
                  <input 
                    id="mortgage-rate"
                    type="number" 
                    step="0.1" 
                    min="0" 
                    value={rate} 
                    onChange={(e) => setRate(e.target.value)} 
                    className={`${baseInputStyle} pr-7 text-sm`} 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted">%</span>
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted" htmlFor="mortgage-years">
                  <Calendar className="w-3.5 h-3.5 text-brand" /> Loan Term
                </label>
                <select 
                  id="mortgage-years"
                  value={years} 
                  onChange={(e) => setYears(e.target.value)} 
                  className={baseSelectStyle}
                >
                  <option value="30">30 Years Fixed</option>
                  <option value="20">20 Years Fixed</option>
                  <option value="15">15 Years Fixed</option>
                  <option value="10">10 Years Fixed</option>
                </select>
              </div>
            </div>

            {/* ADVANCED ESCROW SETTINGS */}
            {showAdvanced && (
              <div className="pt-4 border-t border-line min-w-0 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-1.5 mb-3">
                  <Shield className="w-3.5 h-3.5 text-brand" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink">Escrow Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <label className="block text-[10px] font-bold text-muted tracking-wide truncate">Property Tax (%)</label>
                    <input type="number" step="0.1" value={propTaxRate} onChange={(e) => setPropTaxRate(e.target.value)} className={baseInputStyle} />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <label className="block text-[10px] font-bold text-muted tracking-wide truncate">Insurance ({currency.symbol}/Yr)</label>
                    <input type="number" value={homeInsurance} onChange={(e) => setHomeInsurance(e.target.value)} className={baseInputStyle} />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <label className="block text-[10px] font-bold text-muted tracking-wide truncate">HOA ({currency.symbol}/Mo)</label>
                    <input type="number" value={hoa} onChange={(e) => setHoa(e.target.value)} className={baseInputStyle} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RESULT CARD (Grey Background Style) */}
          <div className="rounded-xl border border-line bg-paper p-1.5 min-w-0 h-full">
            <div className="bg-surface rounded-lg w-full h-full p-4 sm:p-6 flex flex-col relative overflow-hidden min-h-[400px]">
              
              <div className="flex items-center justify-between border-b border-line pb-3 mb-5 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <PieChart className="w-4 h-4 text-brand shrink-0" />
                  <h3 className="text-sm font-bold text-ink truncate">Monthly Payment</h3>
                </div>
                
                <button
                  type="button"
                  onClick={copyResult}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md border border-line bg-paper hover:bg-line text-ink text-[11px] font-bold transition-colors shrink-0"
                >
                  {copied ? <><Check className="w-3 h-3 text-teal" /> Copied</> : <><Copy className="w-3 h-3 text-muted" /> Copy</>}
                </button>
              </div>
              
              <div className="text-center mb-6 min-w-0">
                <span className="block text-4xl sm:text-5xl font-black font-mono text-ink tracking-tighter truncate pb-1">
                  {isMounted ? formatCurrency(results.totalMonthly, currency.code, currency.locale) : `${currency.symbol}0`}
                </span>
                <span className="text-[11px] font-bold text-muted mt-1 block uppercase tracking-widest">
                  Total Loan: {isMounted ? formatCurrency(results.totalLoan, currency.code, currency.locale) : `${currency.symbol}0`}
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="h-4 w-full bg-line rounded-full flex overflow-hidden mb-5 shrink-0">
                <div className="h-full bg-brand transition-all duration-700 ease-out" style={{ width: `${piPct}%` }}></div>
                <div className="h-full bg-[#38bdf8] transition-all duration-700 ease-out" style={{ width: `${taxPct}%` }}></div>
                <div className="h-full bg-[#34d399] transition-all duration-700 ease-out" style={{ width: `${insPct}%` }}></div>
                <div className="h-full bg-[#fb7185] transition-all duration-700 ease-out" style={{ width: `${pmiPct}%` }}></div>
                <div className="h-full bg-[#fbbf24] transition-all duration-700 ease-out" style={{ width: `${hoaPct}%` }}></div>
              </div>

              {/* BREAKDOWN LIST */}
              <div className="space-y-1.5 flex-grow min-w-0">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-paper transition-colors min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0"></span>
                    <span className="text-xs text-muted font-medium truncate">Principal & Interest</span>
                  </div>
                  <span className="font-bold text-ink font-mono shrink-0 pl-2">
                    {isMounted ? formatCurrency(results.monthlyPI, currency.code, currency.locale) : `${currency.symbol}0`}
                  </span>
                </div>
                
                {results.monthlyTax > 0 && (
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-paper transition-colors min-w-0 animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shrink-0"></span>
                      <span className="text-xs text-muted font-medium truncate">Property Taxes</span>
                    </div>
                    <span className="font-bold text-ink font-mono shrink-0 pl-2">
                      {isMounted ? formatCurrency(results.monthlyTax, currency.code, currency.locale) : `${currency.symbol}0`}
                    </span>
                  </div>
                )}
                
                {results.monthlyIns > 0 && (
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-paper transition-colors min-w-0 animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] shrink-0"></span>
                      <span className="text-xs text-muted font-medium truncate">Home Insurance</span>
                    </div>
                    <span className="font-bold text-ink font-mono shrink-0 pl-2">
                      {isMounted ? formatCurrency(results.monthlyIns, currency.code, currency.locale) : `${currency.symbol}0`}
                    </span>
                  </div>
                )}

                {results.monthlyPMI > 0 && (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 min-w-0 animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fb7185] shrink-0"></span>
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-bold truncate">PMI (Under 20% Down)</span>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono shrink-0 pl-2">
                      {isMounted ? formatCurrency(results.monthlyPMI, currency.code, currency.locale) : `${currency.symbol}0`}
                    </span>
                  </div>
                )}

                {results.monthlyHOA > 0 && (
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-paper transition-colors min-w-0 animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] shrink-0"></span>
                      <span className="text-xs text-muted font-medium truncate">HOA Fees</span>
                    </div>
                    <span className="font-bold text-ink font-mono shrink-0 pl-2">
                      {isMounted ? formatCurrency(results.monthlyHOA, currency.code, currency.locale) : `${currency.symbol}0`}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
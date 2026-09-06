"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Globe, ArrowRightLeft, RefreshCw, Settings, CreditCard, TrendingUp, AlertCircle, Wallet } from "lucide-react";

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
];

const CurrencyConverter = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [rates, setRates] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const [amount, setAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PKR");
  const [bankFee, setBankFee] = useState("0");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchRates = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data = await res.json();
      
      setRates(data.rates);
      
      const date = new Date(data.time_last_update_unix * 1000);
      const formattedDate = new Intl.DateTimeFormat('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }).format(date);
      setLastUpdated(formattedDate);

      if (typeof window !== "undefined") {
        localStorage.setItem("toolsLayCurrencyCache", JSON.stringify({ rates: data.rates, date: formattedDate }));
      }
    } catch (err) {
      setError("Live fetching failed. Using cached rates if available.");
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("toolsLayCurrencyCache");
        if (cached) {
          const parsed = JSON.parse(cached);
          setRates(parsed.rates);
          setLastUpdated(parsed.date + " (Offline Cache)");
        } else {
           setRates({ USD: 1, EUR: 0.92, GBP: 0.79, PKR: 278.50, INR: 83.20, AED: 3.67, CAD: 1.36, AUD: 1.52, SAR: 3.75, JPY: 151.20 });
           setLastUpdated("Emergency Fallback Rates");
        }
      }
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchRates();
  }, [fetchRates]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const convert = (amt, from, to, applyFee = true) => {
    if (!rates || !rates[from] || !rates[to]) return 0;
    const baseAmt = parseFloat(amt) || 0;
    const feePercent = applyFee ? (parseFloat(bankFee) || 0) : 0;
    
    const usdAmount = baseAmt / rates[from];
    let targetAmount = usdAmount * rates[to];
    
    targetAmount = targetAmount - (targetAmount * (feePercent / 100));
    return targetAmount;
  };

  const formattedResult = convert(amount, fromCurrency, toCurrency, true).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const actualRate = convert(1, fromCurrency, toCurrency, false).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const feeLost = (convert(amount, fromCurrency, toCurrency, false) - convert(amount, fromCurrency, toCurrency, true)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Global Exchange Dashboard</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Market Rates</span>
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">{isMounted ? lastUpdated : "Loading..."}</span>
          </div>
          <button onClick={fetchRates} disabled={isFetching} className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50" title="Refresh Rates">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Settings className="w-4 h-4" /> {showAdvanced ? "Hide Fees" : "Bank Fees"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-xl shadow-sm space-y-8 relative overflow-hidden">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-slate-500">Amount to Convert</label>
              <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full text-4xl md:text-5xl font-black bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 pb-2 outline-none text-slate-800 dark:text-slate-100 transition-colors placeholder-slate-300 dark:placeholder-slate-700" placeholder="0.00" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 relative">
              <div className="w-full space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">From</label>
                <div className="relative">
                  <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="w-full text-xl font-bold p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none">
                    {POPULAR_CURRENCIES.map(c => <option key={`from-${c.code}`} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={handleSwap} className="md:mt-6 p-4 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-full hover:scale-110 hover:bg-blue-200 transition-all shadow-sm active:scale-95 z-10">
                <ArrowRightLeft className="w-5 h-5" />
              </button>

              <div className="w-full space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">To</label>
                <div className="relative">
                  <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="w-full text-xl font-bold p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none">
                    {POPULAR_CURRENCIES.map(c => <option key={`to-${c.code}`} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {showAdvanced && (
              <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-500">
                    <CreditCard className="w-4 h-4"/> Hidden Bank/Platform Fee
                  </label>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">{bankFee}%</span>
                </div>
                <input type="range" min="0" max="10" step="0.5" value={bankFee} onChange={(e) => setBankFee(e.target.value)} className="w-full accent-amber-500" />
                <div className="flex justify-between text-[10px] font-bold text-amber-600/70 dark:text-amber-500/50 mt-2">
                  <span>0% (Mid-Market)</span>
                  <span>PayPal (~4%)</span>
                  <span>10% Max</span>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Converted Amount</span>
              <div className="text-5xl md:text-7xl font-black tracking-tighter text-blue-600 dark:text-blue-400 mb-2">
                {isMounted && rates ? formattedResult : "0.00"}
              </div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                 1 {fromCurrency} = {isMounted && rates ? actualRate : "0.0000"} {toCurrency}
                 <TrendingUp className="w-4 h-4 text-emerald-500"/>
              </div>
              
              {parseFloat(bankFee) > 0 && (
                <div className="mt-4 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-100 dark:border-rose-900">
                  Fee Deducted: You lose {feeLost} {toCurrency} in conversion.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col h-full sticky top-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Live Watchlist</h3>
          </div>
          
          <div className="text-xs font-medium text-slate-400 mb-4 leading-relaxed">
            Instantly converting <span className="font-black text-white">{amount || 0} {fromCurrency}</span> into popular global currencies.
          </div>

          <div className="space-y-3 flex-grow custom-scrollbar">
            {POPULAR_CURRENCIES.map((currObj) => {
              if (currObj.code === fromCurrency) return null; 
              
              const val = convert(amount, fromCurrency, currObj.code, false);
              
              return (
                <div key={currObj.code} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{currObj.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-200">{currObj.code}</span>
                    </div>
                  </div>
                  <span className="font-black text-white font-mono">
                    {isMounted && rates ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "..."}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ STRICT EXPORT TO PREVENT "GOT: OBJECT" ERROR
export default CurrencyConverter;
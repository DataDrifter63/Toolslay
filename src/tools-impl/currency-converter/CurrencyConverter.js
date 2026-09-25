"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Globe, ArrowRightLeft, RefreshCw, Settings, 
  CreditCard, TrendingUp, AlertCircle, Wallet, 
  Copy, Check 
} from "lucide-react";

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
  const [copied, setCopied] = useState(false);

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

  const copyResult = async () => {
    if (!rates) return;
    const text = `Currency Conversion:\n${amount} ${fromCurrency} = ${formattedResult} ${toCurrency}\nRate: 1 ${fromCurrency} = ${actualRate} ${toCurrency}\n(Rates as of ${lastUpdated})`;
    
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

  const baseInputStyle = "w-full min-w-0 h-11 md:h-12 px-3 sm:px-4 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
  const baseSelectStyle = "w-full min-w-0 h-11 md:h-12 pl-3 sm:pl-4 pr-10 bg-surface border border-line rounded-lg text-ink text-sm md:text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold cursor-pointer appearance-none";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 space-y-5 md:space-y-6 min-w-0">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Globe className="w-5 h-5 md:w-6 md:h-6 text-brand shrink-0" />
            <h2 className="text-lg md:text-xl font-bold text-ink truncate">
              Global Exchange Dashboard
            </h2>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 md:gap-3 shrink-0">
            <div className="text-right hidden sm:block mr-2">
              <span className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted">Live Market Rates</span>
              <span className="block text-xs md:text-sm font-semibold text-ink">{isMounted ? lastUpdated : "Loading..."}</span>
            </div>
            
            <button 
              onClick={fetchRates} 
              disabled={isFetching} 
              className="flex items-center justify-center h-9 md:h-10 w-9 md:w-10 rounded-lg border border-line bg-surface hover:bg-paper text-brand transition-all disabled:opacity-50 shrink-0" 
              title="Refresh Rates"
            >
              <RefreshCw className={`w-4 h-4 md:w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>

            <button 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 h-9 md:h-10 px-3 md:px-4 rounded-lg border border-line bg-surface hover:bg-paper text-ink text-xs md:text-sm font-semibold transition-colors"
            >
              <Settings className="w-4 h-4 text-brand" /> {showAdvanced ? "Hide Fees" : "Bank Fees"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-[#fb7185]/10 border border-[#fb7185]/20 p-3 md:p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-[#e11d48] shrink-0" />
            <p className="text-sm font-semibold text-[#e11d48]">{error}</p>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] items-start gap-6 min-w-0">
          
          {/* CONVERTER PANEL */}
          <div className="flex flex-col gap-5 md:gap-6 min-w-0">
            
            <div className="space-y-2 md:space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-muted block">Amount to Convert</label>
              <input 
                type="number" 
                min="0" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full text-3xl sm:text-4xl font-black bg-transparent border-b-2 border-line focus:border-brand pb-2 md:pb-3 outline-none text-ink transition-colors placeholder-muted/50" 
                placeholder="0.00" 
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 relative min-w-0">
              <div className="w-full space-y-1.5 md:space-y-2 min-w-0">
                <label className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-muted">From</label>
                <div className="relative">
                  <select 
                    value={fromCurrency} 
                    onChange={(e) => setFromCurrency(e.target.value)} 
                    className={baseSelectStyle}
                  >
                    {POPULAR_CURRENCIES.map(c => <option key={`from-${c.code}`} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSwap} 
                className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-line bg-paper hover:bg-brand/10 hover:border-brand/30 text-brand flex items-center justify-center transition-all shrink-0 sm:mt-6 shadow-sm hover:rotate-180"
                title="Swap Currencies"
              >
                <ArrowRightLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <div className="w-full space-y-1.5 md:space-y-2 min-w-0">
                <label className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-muted">To</label>
                <div className="relative">
                  <select 
                    value={toCurrency} 
                    onChange={(e) => setToCurrency(e.target.value)} 
                    className={baseSelectStyle}
                  >
                    {POPULAR_CURRENCIES.map(c => <option key={`to-${c.code}`} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {showAdvanced && (
              <div className="p-4 bg-paper border border-line rounded-xl animate-in fade-in slide-in-from-top-2 min-w-0">
                <div className="flex justify-between items-center mb-3 min-w-0">
                  <label className="flex items-center gap-2 text-sm font-bold text-ink">
                    <CreditCard className="w-4 h-4 text-brand"/> Hidden Bank/Platform Fee
                  </label>
                  <span className="text-base md:text-lg font-black text-brand">{bankFee}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.5" 
                  value={bankFee} 
                  onChange={(e) => setBankFee(e.target.value)} 
                  className="w-full accent-brand cursor-pointer" 
                />
                <div className="flex justify-between text-[10px] font-bold text-muted mt-2">
                  <span>0% (Mid-Market)</span>
                  <span>PayPal (~4%)</span>
                  <span>10% Max</span>
                </div>
              </div>
            )}

            {/* HERO RESULT SECTION */}
            <div className="pt-6 border-t border-line flex flex-col items-center justify-center text-center min-w-0">
              <div className="flex items-center justify-between w-full mb-3 min-w-0">
                <span className="text-xs font-bold text-muted uppercase tracking-widest">Converted Amount</span>
                <button
                  type="button"
                  onClick={copyResult}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-line bg-paper hover:bg-line text-ink text-xs font-semibold transition-colors shrink-0"
                >
                  {copied ? <><Check className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5 text-muted" /> Copy</>}
                </button>
              </div>
              
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-ink mb-3 w-full truncate">
                {isMounted && rates ? formattedResult : "0.00"}
              </div>
              
              <div className="text-sm font-semibold text-muted flex items-center justify-center gap-2 w-full truncate">
                 1 {fromCurrency} = {isMounted && rates ? actualRate : "0.0000"} {toCurrency}
                 <TrendingUp className="w-4 h-4 text-[#34d399] shrink-0"/>
              </div>
              
              {parseFloat(bankFee) > 0 && (
                <div className="mt-4 px-3.5 py-2.5 bg-[#fb7185]/10 text-[#e11d48] text-xs font-bold rounded-lg border border-[#fb7185]/20 w-full md:w-auto text-left md:text-center">
                  Fee Deducted: You lose {feeLost} {toCurrency} in conversion.
                </div>
              )}
            </div>

          </div>

          {/* WATCHLIST SIDEBAR */}
          <div className="bg-paper border border-line p-4 md:p-5 rounded-xl shadow-sm flex flex-col h-full min-w-0">
            <div className="flex items-center gap-2 border-b border-line pb-3.5 mb-4 min-w-0">
              <Wallet className="w-4 h-4 md:w-5 md:h-5 text-brand shrink-0" />
              <h3 className="text-sm md:text-base font-bold text-ink">Live Watchlist</h3>
            </div>
            
            <div className="text-xs font-medium text-muted mb-4 leading-relaxed min-w-0">
              Instantly converting <span className="font-black text-ink">{amount || 0} {fromCurrency}</span> into popular global currencies.
            </div>

            <div className="space-y-2 flex-grow min-w-0">
              {POPULAR_CURRENCIES.map((currObj) => {
                if (currObj.code === fromCurrency) return null; 
                
                const val = convert(amount, fromCurrency, currObj.code, false);
                
                return (
                  <div key={currObj.code} className="flex justify-between items-center p-3 rounded-lg bg-surface border border-line hover:border-brand/30 transition-colors min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg md:text-xl shrink-0">{currObj.flag}</span>
                      <span className="text-xs md:text-sm font-bold text-ink truncate">{currObj.code}</span>
                    </div>
                    <span className="font-black text-ink text-sm shrink-0 pl-2">
                      {isMounted && rates ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "..."}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
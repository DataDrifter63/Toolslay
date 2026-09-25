"use client";

import React, { useState } from "react";
import { 
  Percent, Tag, ArrowRight, RotateCcw, 
  Check, Info, ShieldCheck, ArrowLeftRight, 
  Calculator, Sparkles, AlertCircle 
} from "lucide-react";

export default function DiscountCalculator() {
  const [mode, setMode] = useState("standard");

  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [discount2, setDiscount2] = useState("");
  const [discount3, setDiscount3] = useState("");

  const [finalPrice, setFinalPrice] = useState("");
  const [reverseDiscount, setReverseDiscount] = useState("");

  const [comparePrice, setComparePrice] = useState("");
  const [copied, setCopied] = useState(false);

  function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function clampPercent(value) {
    return Math.min(100, Math.max(0, num(value)));
  }

  function money(value) {
    return Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function integer(value) {
    return Math.max(0, Math.floor(num(value)));
  }

  function getCurrencySymbol() {
    return "$";
  }

  function calculateStandard() {
    const original = Math.max(0, num(price));
    const firstDiscount = clampPercent(discount);
    const taxRate = Math.max(0, num(tax));
    const qty = Math.max(1, integer(quantity) || 1);

    const discountAmount = original * (firstDiscount / 100);
    const discounted = Math.max(0, original - discountAmount);
    const taxAmount = discounted * (taxRate / 100);
    const finalUnit = discounted + taxAmount;

    const totalOriginal = original * qty;
    const totalDiscount = discountAmount * qty;
    const totalTax = taxAmount * qty;
    const totalFinal = finalUnit * qty;

    const effectiveSaving =
      original > 0 ? ((original - finalUnit) / original) * 100 : 0;

    return {
      original,
      firstDiscount,
      taxRate,
      qty,
      discountAmount,
      discounted,
      taxAmount,
      finalUnit,
      totalOriginal,
      totalDiscount,
      totalTax,
      totalFinal,
      effectiveSaving,
    };
  }

  function calculateStacked() {
    const original = Math.max(0, num(price));
    const d1 = clampPercent(discount);
    const d2 = clampPercent(discount2);
    const d3 = clampPercent(discount3);
    const taxRate = Math.max(0, num(tax));
    const qty = Math.max(1, integer(quantity) || 1);

    const afterFirst = original * (1 - d1 / 100);
    const afterSecond = afterFirst * (1 - d2 / 100);
    const afterThird = afterSecond * (1 - d3 / 100);

    const totalDiscount = original - afterThird;
    const effectiveDiscount =
      original > 0 ? (totalDiscount / original) * 100 : 0;

    const taxAmount = afterThird * (taxRate / 100);
    const finalUnit = afterThird + taxAmount;

    return {
      original,
      d1,
      d2,
      d3,
      taxRate,
      qty,
      afterFirst,
      afterSecond,
      afterThird,
      totalDiscount,
      effectiveDiscount,
      taxAmount,
      finalUnit,
      totalFinal: finalUnit * qty,
      totalOriginal: original * qty,
      totalSavings: totalDiscount * qty,
    };
  }

  function calculateReverse() {
    const desiredFinal = Math.max(0, num(finalPrice));
    const discountRate = clampPercent(reverseDiscount);

    if (discountRate >= 100) {
      return {
        valid: false,
        original: 0,
        savings: 0,
      };
    }

    const original = desiredFinal / (1 - discountRate / 100);
    const savings = original - desiredFinal;

    return {
      valid: true,
      original,
      savings,
      desiredFinal,
      discountRate,
    };
  }

  const standard = calculateStandard();
  const stacked = calculateStacked();
  const reverse = calculateReverse();

  const activeResult = mode === "stacked" ? stacked : standard;

  function applyPreset(percent) {
    setDiscount(String(percent));
    setMode("standard");
  }

  function resetAll() {
    setPrice("");
    setDiscount("");
    setTax("");
    setQuantity("1");
    setDiscount2("");
    setDiscount3("");
    setFinalPrice("");
    setReverseDiscount("");
    setComparePrice("");
    setCopied(false);
  }

  function copySummary() {
    let text = "";

    if (mode === "reverse") {
      if (!reverse.valid || !reverse.desiredFinal) return;
      text =
        "Discount Calculator\n" +
        "Mode: Reverse Discount\n" +
        "Desired final price: " + getCurrencySymbol() + money(reverse.desiredFinal) +
        "\nDiscount: " + reverse.discountRate + "%\nOriginal price needed: " + getCurrencySymbol() + money(reverse.original) +
        "\nYou save: " + getCurrencySymbol() + money(reverse.savings);
    } else if (mode === "stacked") {
      if (!stacked.original) return;
      text =
        "Discount Calculator\n" +
        "Mode: Stacked Discounts\n" +
        "Original price: " + getCurrencySymbol() + money(stacked.original) +
        "\nDiscounts: " + stacked.d1 + "% + " + stacked.d2 + "% + " + stacked.d3 + "%\nEffective discount: " + stacked.effectiveDiscount.toFixed(2) + "%\nSavings: " + getCurrencySymbol() + money(stacked.totalDiscount) +
        "\nFinal price: " + getCurrencySymbol() + money(stacked.finalUnit);
    } else {
      if (!standard.original) return;
      text =
        "Discount Calculator\n" +
        "Original price: " + getCurrencySymbol() + money(standard.original) +
        "\nDiscount: " + standard.firstDiscount + "%\nDiscount amount: " + getCurrencySymbol() + money(standard.discountAmount) +
        "\nTax: " + standard.taxRate + "%\nTax amount: " + getCurrencySymbol() + money(standard.taxAmount) +
        "\nFinal price: " + getCurrencySymbol() + money(standard.finalUnit) +
        "\nTotal savings: " + getCurrencySymbol() + money(standard.discountAmount);
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }).catch(() => {});
    }
  }

  const compareDifference = standard.finalUnit - num(comparePrice);
  const hasStandard = standard.original > 0;
  const hasStacked = stacked.original > 0;
  const hasReverse = reverse.valid && reverse.desiredFinal > 0 && reverse.discountRate < 100;

  const baseInputStyle = "w-full min-w-0 h-10 px-3 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-mono";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* TOOLBAR / MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface border border-line p-2 sm:p-3 rounded-xl shadow-card">
        <div className="inline-flex p-1 border border-line rounded-lg bg-paper">
          {[
            { id: "standard", label: "Standard" },
            { id: "stacked", label: "Stacked" },
            { id: "reverse", label: "Reverse" }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                mode === m.id
                  ? "bg-surface text-ink shadow-sm border border-line/50"
                  : "text-muted hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-line rounded-lg bg-surface hover:bg-paper text-muted hover:text-ink text-xs font-semibold transition-colors min-h-[40px]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-muted" /> Reset
        </button>
      </div>

      {/* MAIN TWO-COLUMN PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.15fr] gap-4 sm:gap-6 items-start min-w-0">
        
        {/* INPUT CARD */}
        <section className="rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-card min-w-0 space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Percent className="w-4 h-4 text-brand shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">
                {mode === "standard" ? "QUICK CALCULATION" : mode === "stacked" ? "MULTI-DISCOUNT" : "REVERSE PRICING"}
              </span>
              <h2 className="text-base sm:text-lg font-display font-bold text-ink truncate">
                {mode === "standard" ? "Calculate your discount" : mode === "stacked" ? "Apply multiple discounts" : "Find the original price"}
              </h2>
            </div>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            {mode === "standard" && "Enter a price and discount to instantly see your savings."}
            {mode === "stacked" && "See the real effective discount when discounts are applied one after another."}
            {mode === "reverse" && "Work backwards from a target sale price to find the price before discount."}
          </p>

          {mode !== "reverse" && (
            <div className="space-y-4">
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-muted mb-1.5">Original price</label>
                <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <span className="px-3 text-muted text-xs font-mono select-none bg-paper/50 border-r border-line h-10 flex items-center">$</span>
                  <input
                    className="w-full h-10 px-3 bg-transparent border-0 text-ink text-xs focus:outline-none font-mono"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="100.00"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  {mode === "stacked" ? "First discount" : "Discount percentage"}
                </label>
                <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <input
                    className="w-full h-10 px-3 bg-transparent border-0 text-ink text-xs focus:outline-none font-mono"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="20"
                  />
                  <span className="px-3 text-muted text-xs font-mono select-none bg-paper/50 border-l border-line h-10 flex items-center">%</span>
                </div>
              </div>

              {mode === "standard" && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[5, 10, 15, 20, 25, 30, 50].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => applyPreset(item)}
                      className={`h-7 px-2.5 rounded-md text-[11px] font-semibold font-mono transition-all min-h-[32px] ${
                        Number(discount) === item
                          ? "bg-brand/15 text-brand border border-brand/40"
                          : "bg-paper border border-line text-muted hover:text-ink"
                      }`}
                    >
                      {item}%
                    </button>
                  ))}
                </div>
              )}

              {mode === "stacked" && (
                <div className="grid grid-cols-2 gap-3 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-muted mb-1.5">Second discount</label>
                    <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                      <input
                        className="w-full h-10 px-2.5 bg-transparent border-0 text-ink text-xs focus:outline-none font-mono"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="100"
                        step="0.01"
                        value={discount2}
                        onChange={(e) => setDiscount2(e.target.value)}
                        placeholder="10"
                      />
                      <span className="px-2.5 text-muted text-xs font-mono select-none bg-paper/50 border-l border-line h-10 flex items-center">%</span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-muted mb-1.5">Third discount</label>
                    <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                      <input
                        className="w-full h-10 px-2.5 bg-transparent border-0 text-ink text-xs focus:outline-none font-mono"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="100"
                        step="0.01"
                        value={discount3}
                        onChange={(e) => setDiscount3(e.target.value)}
                        placeholder="5"
                      />
                      <span className="px-2.5 text-muted text-xs font-mono select-none bg-paper/50 border-l border-line h-10 flex items-center">%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 min-w-0 pt-1">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-muted mb-1.5">Tax after discount</label>
                  <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                    <input
                      className="w-full h-10 px-2.5 bg-transparent border-0 text-ink text-xs focus:outline-none font-mono"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      placeholder="0"
                    />
                    <span className="px-2.5 text-muted text-xs font-mono select-none bg-paper/50 border-l border-line h-10 flex items-center">%</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-muted mb-1.5">Quantity</label>
                  <input
                    className={baseInputStyle}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === "reverse" && (
            <div className="space-y-4">
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-muted mb-1.5">Desired final price</label>
                <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <span className="px-3 text-muted text-xs font-mono select-none bg-paper/50 border-r border-line h-10 flex items-center">$</span>
                  <input
                    className="w-full h-10 px-3 bg-transparent border-0 text-ink text-xs focus:outline-none font-mono"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    placeholder="80.00"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-muted mb-1.5">Discount percentage</label>
                <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <input
                    className="w-full h-10 px-3 bg-transparent border-0 text-ink text-xs focus:outline-none font-mono"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="99.99"
                    step="0.01"
                    value={reverseDiscount}
                    onChange={(e) => setReverseDiscount(e.target.value)}
                    placeholder="20"
                  />
                  <span className="px-3 text-muted text-xs font-mono select-none bg-paper/50 border-l border-line h-10 flex items-center">%</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-paper border border-line text-xs">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-ink font-semibold">Reverse discount</strong>
                  <p className="text-muted text-[11px] mt-0.5 leading-relaxed">
                    Useful when you know the sale price and want to know what the original price should have been.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 text-[11px] text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0" />
            <span>Calculations happen locally in your browser.</span>
          </div>
        </section>

        {/* RESULTS CARD */}
        <section className="rounded-xl border border-line bg-surface p-5 sm:p-8 shadow-card min-w-0 flex flex-col justify-between relative overflow-hidden bg-gradient-to-bl from-brand/10 via-transparent to-transparent">
          
          <div className="space-y-6 min-w-0">
            {mode === "standard" && (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand block mb-1">FINAL PRICE</span>
                  <div className="flex items-baseline gap-1 text-ink font-mono min-w-0 overflow-hidden">
                    <span className="text-xl sm:text-2xl font-semibold text-muted">$</span>
                    <strong className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tight truncate">
                      {hasStandard ? money(standard.finalUnit) : "0.00"}
                    </strong>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal text-xs font-bold font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Save {hasStandard ? standard.firstDiscount : 0}%
                </div>

                <div className="grid grid-cols-2 gap-3 min-w-0">
                  <div className="p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[11px] text-muted block">Original price</span>
                    <strong className="text-sm sm:text-base font-semibold font-mono text-ink block mt-1 truncate">
                      ${money(standard.original)}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[11px] text-muted block">Discount</span>
                    <strong className="text-sm sm:text-base font-semibold font-mono text-teal block mt-1 truncate">
                      -${money(standard.discountAmount)}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[11px] text-muted block">Tax</span>
                    <strong className="text-sm sm:text-base font-semibold font-mono text-amber block mt-1 truncate">
                      +${money(standard.taxAmount)}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-brand/40 bg-brand/5 min-w-0">
                    <span className="text-[11px] text-brand font-medium block">You save</span>
                    <strong className="text-sm sm:text-base font-bold font-mono text-brand block mt-1 truncate">
                      ${money(standard.discountAmount)}
                    </strong>
                  </div>
                </div>

                {standard.qty > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <div>
                      <span className="text-[11px] text-muted block">Total for {standard.qty} items</span>
                      <strong className="text-base sm:text-lg font-bold font-mono text-ink">
                        ${money(standard.totalFinal)}
                      </strong>
                    </div>
                    <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-line">
                      <span className="text-[10px] text-muted block">Before discount</span>
                      <b className="text-xs sm:text-sm font-semibold font-mono text-ink">
                        ${money(standard.totalOriginal)}
                      </b>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, standard.firstDiscount))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted font-mono">
                    <span>Discount proportion</span>
                    <span>{standard.firstDiscount}% off</span>
                  </div>
                </div>
              </>
            )}

            {mode === "stacked" && (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand block mb-1">EFFECTIVE RESULT</span>
                  <div className="flex items-baseline gap-1 text-ink font-mono min-w-0 overflow-hidden">
                    <span className="text-xl sm:text-2xl font-semibold text-muted">$</span>
                    <strong className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tight truncate">
                      {hasStacked ? money(stacked.finalUnit) : "0.00"}
                    </strong>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal text-xs font-bold font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Effective {stacked.effectiveDiscount.toFixed(2)}% off
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 min-w-0">
                  <div className="p-3 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[10px] text-muted block truncate">Original</span>
                    <strong className="text-xs sm:text-sm font-semibold font-mono text-ink block mt-1 truncate">
                      ${money(stacked.original)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[10px] text-muted block truncate">After {stacked.d1}%</span>
                    <strong className="text-xs sm:text-sm font-semibold font-mono text-ink block mt-1 truncate">
                      ${money(stacked.afterFirst)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[10px] text-muted block truncate">After {stacked.d2}%</span>
                    <strong className="text-xs sm:text-sm font-semibold font-mono text-ink block mt-1 truncate">
                      ${money(stacked.afterSecond)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[10px] text-muted block truncate">Final tier ({stacked.d3}%)</span>
                    <strong className="text-xs sm:text-sm font-semibold font-mono text-teal block mt-1 truncate">
                      ${money(stacked.afterThird)}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 min-w-0">
                  <div className="p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[11px] text-muted block">Combined discount</span>
                    <strong className="text-sm sm:text-base font-semibold font-mono text-ink block mt-1 truncate">
                      {stacked.effectiveDiscount.toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[11px] text-muted block">Total savings</span>
                    <strong className="text-sm sm:text-base font-semibold font-mono text-teal block mt-1 truncate">
                      ${money(stacked.totalDiscount)}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[11px] text-muted block">Tax</span>
                    <strong className="text-sm sm:text-base font-semibold font-mono text-amber block mt-1 truncate">
                      +${money(stacked.taxAmount)}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-brand/40 bg-brand/5 min-w-0">
                    <span className="text-[11px] text-brand font-medium block">Final price</span>
                    <strong className="text-sm sm:text-base font-bold font-mono text-brand block mt-1 truncate">
                      ${money(stacked.finalUnit)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-light border border-amber/30 text-xs text-amber-900 dark:text-amber-200">
                  <Info className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Multiple discounts are applied sequentially. 20% + 10% is not exactly 30%; the effective discount is 28%.
                  </p>
                </div>
              </>
            )}

            {mode === "reverse" && (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand block mb-1">ORIGINAL PRICE NEEDED</span>
                  <div className="flex items-baseline gap-1 text-ink font-mono min-w-0 overflow-hidden">
                    <span className="text-xl sm:text-2xl font-semibold text-muted">$</span>
                    <strong className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tight truncate">
                      {hasReverse ? money(reverse.original) : "0.00"}
                    </strong>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal text-xs font-bold font-mono">
                  Customer pays ${hasReverse ? money(reverse.desiredFinal) : "0.00"}
                </div>

                <div className="grid grid-cols-2 gap-3 min-w-0">
                  <div className="p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[11px] text-muted block">Sale price</span>
                    <strong className="text-sm sm:text-base font-semibold font-mono text-ink block mt-1 truncate">
                      ${hasReverse ? money(reverse.desiredFinal) : "0.00"}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[11px] text-muted block">Discount</span>
                    <strong className="text-sm sm:text-base font-semibold font-mono text-ink block mt-1 truncate">
                      {hasReverse ? reverse.discountRate : 0}%
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-brand/40 bg-brand/5 min-w-0">
                    <span className="text-[11px] text-brand font-medium block">Customer saves</span>
                    <strong className="text-sm sm:text-base font-bold font-mono text-brand block mt-1 truncate">
                      ${hasReverse ? money(reverse.savings) : "0.00"}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-line bg-paper min-w-0">
                    <span className="text-[11px] text-muted block">Original price</span>
                    <strong className="text-sm sm:text-base font-semibold font-mono text-ink block mt-1 truncate">
                      ${hasReverse ? money(reverse.original) : "0.00"}
                    </strong>
                  </div>
                </div>

                {num(reverseDiscount) >= 100 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-500 border border-red-200 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Discount must be below 100%.</span>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={copySummary}
            className="w-full mt-6 py-3 px-4 border border-line rounded-lg bg-surface hover:bg-paper text-ink text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-teal" /> Summary copied
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 text-brand" /> Copy calculation summary
              </>
            )}
          </button>
        </section>
      </div>

      {/* QUICK COMPARISON SECTION */}
      {mode !== "reverse" && (
        <section className="rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-card min-w-0 space-y-4">
          <div className="border-b border-line pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">QUICK COMPARISON</span>
            <h3 className="text-sm sm:text-base font-display font-bold text-ink">Compare another final price</h3>
            <p className="text-xs text-muted mt-0.5">Quickly see how much more or less another price would cost.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[220px,1fr] gap-3 items-center min-w-0">
            <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 min-w-0">
              <span className="px-3 text-muted text-xs font-mono select-none bg-paper/50 border-r border-line h-10 flex items-center">$</span>
              <input
                className="w-full h-10 px-3 bg-transparent border-0 text-ink text-xs focus:outline-none font-mono"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="Enter another price"
              />
            </div>

            <div className="min-h-[40px] px-3.5 py-2.5 rounded-lg border border-line bg-paper flex flex-wrap items-center justify-between gap-2 min-w-0">
              {comparePrice !== "" ? (
                <>
                  <span className="text-xs text-muted">Difference</span>
                  <div className="flex items-center gap-2">
                    <strong
                      className={`text-sm font-bold font-mono ${
                        compareDifference > 0
                          ? "text-red-500"
                          : compareDifference < 0
                          ? "text-teal"
                          : "text-ink"
                      }`}
                    >
                      {compareDifference > 0 ? "+" : ""}${money(Math.abs(compareDifference))}
                    </strong>
                    <small className="text-[11px] text-muted">
                      {compareDifference > 0
                        ? "Your calculated price is higher."
                        : compareDifference < 0
                        ? "Your calculated price is lower."
                        : "Prices are identical."}
                    </small>
                  </div>
                </>
              ) : (
                <span className="text-xs text-muted">Enter a price to compare</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES / TRUST GRID */}
      <section className="rounded-xl border border-line bg-surface shadow-card overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line min-w-0">
        {[
          { num: "01", title: "Instant calculation", desc: "Results update while you type." },
          { num: "02", title: "Stacked discounts", desc: "Calculate real combined savings." },
          { num: "03", title: "Reverse pricing", desc: "Find original prices from sale prices." },
          { num: "04", title: "Private by default", desc: "No prices are sent to a server." }
        ].map((f) => (
          <div key={f.num} className="p-4 sm:p-5 flex items-start gap-3 min-w-0">
            <span className="text-[10px] font-black text-brand font-mono shrink-0 mt-0.5">{f.num}</span>
            <div className="min-w-0">
              <strong className="text-xs font-bold text-ink block truncate">{f.title}</strong>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}
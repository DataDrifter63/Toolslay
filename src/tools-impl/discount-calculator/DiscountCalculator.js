"use client";

import React from "react";

export default function DiscountCalculator() {
  const [mode, setMode] = React.useState("standard");

  const [price, setPrice] = React.useState("");
  const [discount, setDiscount] = React.useState("");
  const [tax, setTax] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");

  const [discount2, setDiscount2] = React.useState("");
  const [discount3, setDiscount3] = React.useState("");

  const [finalPrice, setFinalPrice] = React.useState("");
  const [reverseDiscount, setReverseDiscount] = React.useState("");

  const [comparePrice, setComparePrice] = React.useState("");

  const [copied, setCopied] = React.useState(false);

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

    const discountAmount =
      original * (firstDiscount / 100);

    const discounted =
      Math.max(0, original - discountAmount);

    const taxAmount =
      discounted * (taxRate / 100);

    const finalUnit =
      discounted + taxAmount;

    const totalOriginal =
      original * qty;

    const totalDiscount =
      discountAmount * qty;

    const totalTax =
      taxAmount * qty;

    const totalFinal =
      finalUnit * qty;

    const effectiveSaving =
      original > 0
        ? ((original - finalUnit) / original) * 100
        : 0;

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

    const afterFirst =
      original * (1 - d1 / 100);

    const afterSecond =
      afterFirst * (1 - d2 / 100);

    const afterThird =
      afterSecond * (1 - d3 / 100);

    const totalDiscount =
      original - afterThird;

    const effectiveDiscount =
      original > 0
        ? (totalDiscount / original) * 100
        : 0;

    const taxAmount =
      afterThird * (taxRate / 100);

    const finalUnit =
      afterThird + taxAmount;

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

    const original =
      desiredFinal /
      (1 - discountRate / 100);

    const savings =
      original - desiredFinal;

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

  const activeResult =
    mode === "stacked"
      ? stacked
      : standard;

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
      if (!reverse.valid || !reverse.desiredFinal) {
        return;
      }

      text =
        "Discount Calculator\n" +
        "Mode: Reverse Discount\n" +
        "Desired final price: " +
        getCurrencySymbol() +
        money(reverse.desiredFinal) +
        "\nDiscount: " +
        reverse.discountRate +
        "%\nOriginal price needed: " +
        getCurrencySymbol() +
        money(reverse.original) +
        "\nYou save: " +
        getCurrencySymbol() +
        money(reverse.savings);
    } else if (mode === "stacked") {
      if (!stacked.original) {
        return;
      }

      text =
        "Discount Calculator\n" +
        "Mode: Stacked Discounts\n" +
        "Original price: " +
        getCurrencySymbol() +
        money(stacked.original) +
        "\nDiscounts: " +
        stacked.d1 +
        "% + " +
        stacked.d2 +
        "% + " +
        stacked.d3 +
        "%\nEffective discount: " +
        stacked.effectiveDiscount.toFixed(2) +
        "%\nSavings: " +
        getCurrencySymbol() +
        money(stacked.totalDiscount) +
        "\nFinal price: " +
        getCurrencySymbol() +
        money(stacked.finalUnit);
    } else {
      if (!standard.original) {
        return;
      }

      text =
        "Discount Calculator\n" +
        "Original price: " +
        getCurrencySymbol() +
        money(standard.original) +
        "\nDiscount: " +
        standard.firstDiscount +
        "%\nDiscount amount: " +
        getCurrencySymbol() +
        money(standard.discountAmount) +
        "\nTax: " +
        standard.taxRate +
        "%\nTax amount: " +
        getCurrencySymbol() +
        money(standard.taxAmount) +
        "\nFinal price: " +
        getCurrencySymbol() +
        money(standard.finalUnit) +
        "\nTotal savings: " +
        getCurrencySymbol() +
        money(standard.discountAmount);
    }

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          setCopied(true);

          window.setTimeout(function () {
            setCopied(false);
          }, 1500);
        })
        .catch(function () {});
    }
  }

  const compareDifference =
    standard.finalUnit - num(comparePrice);

  const hasStandard =
    standard.original > 0;

  const hasStacked =
    stacked.original > 0;

  const hasReverse =
    reverse.valid &&
    reverse.desiredFinal > 0 &&
    reverse.discountRate < 100;

  const inputStyle =
    "dc-input";

  return (
    <>
      <div className="discount-calculator-tool">
        <div className="dc-wrapper">

          <div className="dc-toolbar">
            <div className="dc-mode-switch">

              <button
                type="button"
                className={
                  mode === "standard"
                    ? "dc-mode active"
                    : "dc-mode"
                }
                onClick={() => setMode("standard")}
              >
                Standard
              </button>

              <button
                type="button"
                className={
                  mode === "stacked"
                    ? "dc-mode active"
                    : "dc-mode"
                }
                onClick={() => setMode("stacked")}
              >
                Stacked
              </button>

              <button
                type="button"
                className={
                  mode === "reverse"
                    ? "dc-mode active"
                    : "dc-mode"
                }
                onClick={() => setMode("reverse")}
              >
                Reverse
              </button>

            </div>

            <button
              type="button"
              className="dc-reset"
              onClick={resetAll}
            >
              Reset
            </button>
          </div>

          <div className="dc-main">

            <section className="dc-card dc-input-card">

              <div className="dc-card-head">
                <div>
                  <div className="dc-kicker">
                    {mode === "standard"
                      ? "QUICK CALCULATION"
                      : mode === "stacked"
                      ? "MULTI-DISCOUNT"
                      : "REVERSE PRICING"}
                  </div>

                  <h2>
                    {mode === "standard"
                      ? "Calculate your discount"
                      : mode === "stacked"
                      ? "Apply multiple discounts"
                      : "Find the original price"}
                  </h2>

                  <p>
                    {mode === "standard"
                      ? "Enter a price and discount to instantly see your savings."
                      : mode === "stacked"
                      ? "See the real effective discount when discounts are applied one after another."
                      : "Work backwards from a target sale price to find the price before discount."}
                  </p>
                </div>
              </div>

              {mode !== "reverse" && (
                <>
                  <label className="dc-label">
                    Original price
                  </label>

                  <div className="dc-money-input">
                    <span>$</span>
                    <input
                      className={inputStyle}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value)
                      }
                      placeholder="100.00"
                    />
                  </div>

                  <label className="dc-label">
                    {mode === "stacked"
                      ? "First discount"
                      : "Discount percentage"}
                  </label>

                  <div className="dc-percent-input">
                    <input
                      className={inputStyle}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(e.target.value)
                      }
                      placeholder="20"
                    />
                    <span>%</span>
                  </div>

                  {mode === "standard" && (
                    <>
                      <div className="dc-presets">
                        {[5, 10, 15, 20, 25, 30, 50].map(
                          function (item) {
                            return (
                              <button
                                type="button"
                                key={item}
                                onClick={() =>
                                  applyPreset(item)
                                }
                                className={
                                  Number(discount) === item
                                    ? "selected"
                                    : ""
                                }
                              >
                                {item}%
                              </button>
                            );
                          }
                        )}
                      </div>
                    </>
                  )}

                  {mode === "stacked" && (
                    <div className="dc-stack-grid">

                      <div>
                        <label className="dc-label">
                          Second discount
                        </label>

                        <div className="dc-percent-input">
                          <input
                            className={inputStyle}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            max="100"
                            step="0.01"
                            value={discount2}
                            onChange={(e) =>
                              setDiscount2(e.target.value)
                            }
                            placeholder="10"
                          />
                          <span>%</span>
                        </div>
                      </div>

                      <div>
                        <label className="dc-label">
                          Third discount
                        </label>

                        <div className="dc-percent-input">
                          <input
                            className={inputStyle}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            max="100"
                            step="0.01"
                            value={discount3}
                            onChange={(e) =>
                              setDiscount3(e.target.value)
                            }
                            placeholder="5"
                          />
                          <span>%</span>
                        </div>
                      </div>

                    </div>
                  )}

                  <div className="dc-two-inputs">

                    <div>
                      <label className="dc-label">
                        Tax after discount
                      </label>

                      <div className="dc-percent-input">
                        <input
                          className={inputStyle}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={tax}
                          onChange={(e) =>
                            setTax(e.target.value)
                          }
                          placeholder="0"
                        />
                        <span>%</span>
                      </div>
                    </div>

                    <div>
                      <label className="dc-label">
                        Quantity
                      </label>

                      <input
                        className={inputStyle}
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(e.target.value)
                        }
                        placeholder="1"
                      />
                    </div>

                  </div>
                </>
              )}

              {mode === "reverse" && (
                <>
                  <label className="dc-label">
                    Desired final price
                  </label>

                  <div className="dc-money-input">
                    <span>$</span>
                    <input
                      className={inputStyle}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={finalPrice}
                      onChange={(e) =>
                        setFinalPrice(e.target.value)
                      }
                      placeholder="80.00"
                    />
                  </div>

                  <label className="dc-label">
                    Discount percentage
                  </label>

                  <div className="dc-percent-input">
                    <input
                      className={inputStyle}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="99.99"
                      step="0.01"
                      value={reverseDiscount}
                      onChange={(e) =>
                        setReverseDiscount(e.target.value)
                      }
                      placeholder="20"
                    />
                    <span>%</span>
                  </div>

                  <div className="dc-info-box">
                    <span>↩</span>
                    <div>
                      <strong>
                        Reverse discount
                      </strong>
                      <p>
                        Useful when you know the sale
                        price and want to know what the
                        original price should have been.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="dc-local-note">
                <span>✓</span>
                Calculations happen locally in your browser.
              </div>

            </section>

            <section className="dc-card dc-result-card">

              {mode === "standard" && (
                <>
                  <div className="dc-result-kicker">
                    FINAL PRICE
                  </div>

                  <div className="dc-final-price">
                    <span>$</span>
                    <strong>
                      {hasStandard
                        ? money(standard.finalUnit)
                        : "0.00"}
                    </strong>
                  </div>

                  <div className="dc-saving-badge">
                    Save{" "}
                    {hasStandard
                      ? standard.firstDiscount
                      : 0}
                    %
                  </div>

                  <div className="dc-result-grid">

                    <div className="dc-result-item">
                      <span>Original price</span>
                      <strong>
                        ${money(standard.original)}
                      </strong>
                    </div>

                    <div className="dc-result-item">
                      <span>Discount</span>
                      <strong>
                        -${money(standard.discountAmount)}
                      </strong>
                    </div>

                    <div className="dc-result-item">
                      <span>Tax</span>
                      <strong>
                        +${money(standard.taxAmount)}
                      </strong>
                    </div>

                    <div className="dc-result-item highlight">
                      <span>You save</span>
                      <strong>
                        ${money(standard.discountAmount)}
                      </strong>
                    </div>

                  </div>

                  {standard.qty > 1 && (
                    <div className="dc-total-box">
                      <div>
                        <span>Total for {standard.qty} items</span>
                        <strong>
                          ${money(standard.totalFinal)}
                        </strong>
                      </div>

                      <div>
                        <small>
                          Before discount
                        </small>
                        <b>
                          ${money(standard.totalOriginal)}
                        </b>
                      </div>
                    </div>
                  )}

                  <div className="dc-visual-bar">
                    <div
                      style={{
                        width:
                          Math.min(
                            100,
                            Math.max(
                              0,
                              standard.firstDiscount
                            )
                          ) + "%",
                      }}
                    />
                  </div>

                  <div className="dc-bar-labels">
                    <span>
                      Discount
                    </span>
                    <span>
                      {standard.firstDiscount}%
                    </span>
                  </div>
                </>
              )}

              {mode === "stacked" && (
                <>
                  <div className="dc-result-kicker">
                    EFFECTIVE RESULT
                  </div>

                  <div className="dc-final-price">
                    <span>$</span>
                    <strong>
                      {hasStacked
                        ? money(stacked.finalUnit)
                        : "0.00"}
                    </strong>
                  </div>

                  <div className="dc-saving-badge">
                    Effective{" "}
                    {stacked.effectiveDiscount.toFixed(2)}%
                    off
                  </div>

                  <div className="dc-stack-flow">

                    <div>
                      <span>Original</span>
                      <strong>
                        ${money(stacked.original)}
                      </strong>
                    </div>

                    <i>→</i>

                    <div>
                      <span>
                        After {stacked.d1}%
                      </span>
                      <strong>
                        ${money(stacked.afterFirst)}
                      </strong>
                    </div>

                    <i>→</i>

                    <div>
                      <span>
                        After {stacked.d2}%
                      </span>
                      <strong>
                        ${money(stacked.afterSecond)}
                      </strong>
                    </div>

                    <i>→</i>

                    <div>
                      <span>
                        After {stacked.d3}%
                      </span>
                      <strong>
                        ${money(stacked.afterThird)}
                      </strong>
                    </div>

                  </div>

                  <div className="dc-result-grid">

                    <div className="dc-result-item">
                      <span>Combined discount</span>
                      <strong>
                        {stacked.effectiveDiscount.toFixed(2)}%
                      </strong>
                    </div>

                    <div className="dc-result-item">
                      <span>Total savings</span>
                      <strong>
                        ${money(stacked.totalDiscount)}
                      </strong>
                    </div>

                    <div className="dc-result-item">
                      <span>Tax</span>
                      <strong>
                        +${money(stacked.taxAmount)}
                      </strong>
                    </div>

                    <div className="dc-result-item highlight">
                      <span>Final price</span>
                      <strong>
                        ${money(stacked.finalUnit)}
                      </strong>
                    </div>

                  </div>

                  <div className="dc-tip">
                    <span>💡</span>
                    <p>
                      Multiple discounts are applied
                      sequentially. 20% + 10% is not
                      exactly 30%; the effective discount
                      is 28%.
                    </p>
                  </div>
                </>
              )}

              {mode === "reverse" && (
                <>
                  <div className="dc-result-kicker">
                    ORIGINAL PRICE NEEDED
                  </div>

                  <div className="dc-final-price">
                    <span>$</span>
                    <strong>
                      {hasReverse
                        ? money(reverse.original)
                        : "0.00"}
                    </strong>
                  </div>

                  <div className="dc-saving-badge">
                    Customer pays $
                    {hasReverse
                      ? money(reverse.desiredFinal)
                      : "0.00"}
                  </div>

                  <div className="dc-result-grid">

                    <div className="dc-result-item">
                      <span>Sale price</span>
                      <strong>
                        $
                        {hasReverse
                          ? money(reverse.desiredFinal)
                          : "0.00"}
                      </strong>
                    </div>

                    <div className="dc-result-item">
                      <span>Discount</span>
                      <strong>
                        {hasReverse
                          ? reverse.discountRate
                          : 0}
                        %
                      </strong>
                    </div>

                    <div className="dc-result-item highlight">
                      <span>Customer saves</span>
                      <strong>
                        $
                        {hasReverse
                          ? money(reverse.savings)
                          : "0.00"}
                      </strong>
                    </div>

                    <div className="dc-result-item">
                      <span>Original price</span>
                      <strong>
                        $
                        {hasReverse
                          ? money(reverse.original)
                          : "0.00"}
                      </strong>
                    </div>

                  </div>

                  {num(reverseDiscount) >= 100 && (
                    <div className="dc-error">
                      Discount must be below 100%.
                    </div>
                  )}
                </>
              )}

              <button
                type="button"
                className="dc-copy"
                onClick={copySummary}
              >
                {copied
                  ? "✓ Summary copied"
                  : "Copy calculation summary"}
              </button>

            </section>
          </div>

          {mode !== "reverse" && (
            <section className="dc-card dc-compare">

              <div className="dc-section-head">
                <div>
                  <div className="dc-kicker">
                    QUICK COMPARISON
                  </div>

                  <h3>
                    Compare another final price
                  </h3>

                  <p>
                    Quickly see how much more or less
                    another price would cost.
                  </p>
                </div>
              </div>

              <div className="dc-compare-row">

                <div className="dc-money-input">
                  <span>$</span>
                  <input
                    className={inputStyle}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={comparePrice}
                    onChange={(e) =>
                      setComparePrice(e.target.value)
                    }
                    placeholder="Enter another price"
                  />
                </div>

                <div className="dc-comparison-result">
                  {comparePrice !== "" ? (
                    <>
                      <span>
                        Difference
                      </span>

                      <strong
                        className={
                          compareDifference > 0
                            ? "higher"
                            : compareDifference < 0
                            ? "lower"
                            : ""
                        }
                      >
                        {compareDifference > 0
                          ? "+"
                          : ""}
                        $
                        {money(
                          Math.abs(compareDifference)
                        )}
                      </strong>

                      <small>
                        {compareDifference > 0
                          ? "Your calculated price is higher."
                          : compareDifference < 0
                          ? "Your calculated price is lower."
                          : "Prices are identical."}
                      </small>
                    </>
                  ) : (
                    <span className="dc-muted">
                      Enter a price to compare
                    </span>
                  )}
                </div>

              </div>

            </section>
          )}

          <section className="dc-card dc-features">

            <div className="dc-feature">
              <span>01</span>
              <div>
                <strong>
                  Instant calculation
                </strong>
                <p>
                  Results update while you type.
                </p>
              </div>
            </div>

            <div className="dc-feature">
              <span>02</span>
              <div>
                <strong>
                  Stacked discounts
                </strong>
                <p>
                  Calculate real combined savings.
                </p>
              </div>
            </div>

            <div className="dc-feature">
              <span>03</span>
              <div>
                <strong>
                  Reverse pricing
                </strong>
                <p>
                  Find original prices from sale prices.
                </p>
              </div>
            </div>

            <div className="dc-feature">
              <span>04</span>
              <div>
                <strong>
                  Private by default
                </strong>
                <p>
                  No prices are sent to a server.
                </p>
              </div>
            </div>

          </section>

        </div>
      </div>

      <style jsx>{`
        .discount-calculator-tool {
          --dc-text: #172033;
          --dc-muted: #667085;
          --dc-border: #e4e7ec;
          --dc-card: #ffffff;
          --dc-soft: #f7f8fb;
          --dc-primary: #635bff;
          --dc-primary-soft: rgba(99, 91, 255, 0.09);
          width: 100%;
          color: var(--dc-text);
        }

        .discount-calculator-tool,
        .discount-calculator-tool * {
          box-sizing: border-box;
        }

        .dc-wrapper {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .dc-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .dc-mode-switch {
          display: inline-flex;
          padding: 4px;
          border: 1px solid var(--dc-border);
          border-radius: 10px;
          background: var(--dc-soft);
        }

        .dc-mode {
          border: 0;
          background: transparent;
          color: var(--dc-muted);
          border-radius: 7px;
          padding: 8px 13px;
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 750;
        }

        .dc-mode.active {
          background: var(--dc-card);
          color: var(--dc-text);
          box-shadow: 0 2px 8px rgba(16, 24, 40, 0.07);
        }

        .dc-reset {
          min-height: 34px;
          padding: 0 13px;
          border: 1px solid var(--dc-border);
          border-radius: 8px;
          background: var(--dc-card);
          color: var(--dc-muted);
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 700;
        }

        .dc-main {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          gap: 18px;
        }

        .dc-card {
          border: 1px solid var(--dc-border);
          border-radius: 16px;
          background: var(--dc-card);
          box-shadow: 0 8px 30px rgba(16, 24, 40, 0.035);
        }

        .dc-input-card {
          padding: 23px;
        }

        .dc-result-card {
          min-height: 480px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(99, 91, 255, 0.12),
              transparent 42%
            ),
            var(--dc-card);
        }

        .dc-card-head h2 {
          margin: 5px 0 0;
          font-size: 20px;
          line-height: 1.2;
          letter-spacing: -0.035em;
        }

        .dc-card-head p,
        .dc-section-head p {
          margin: 7px 0 0;
          color: var(--dc-muted);
          font-size: 11px;
          line-height: 1.65;
        }

        .dc-kicker,
        .dc-result-kicker {
          color: var(--dc-primary);
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.14em;
        }

        .dc-label {
          display: block;
          margin: 17px 0 7px;
          font-size: 10px;
          font-weight: 750;
        }

        .dc-input {
          width: 100%;
          min-width: 0;
          height: 43px;
          padding: 0 11px;
          border: 1px solid var(--dc-border);
          border-radius: 9px;
          outline: none;
          background: var(--dc-card);
          color: var(--dc-text);
          font: inherit;
          font-size: 12px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .dc-input:focus {
          border-color: var(--dc-primary);
          box-shadow: 0 0 0 3px var(--dc-primary-soft);
        }

        .dc-money-input,
        .dc-percent-input {
          display: flex;
          align-items: center;
          min-width: 0;
          border: 1px solid var(--dc-border);
          border-radius: 9px;
          background: var(--dc-card);
          overflow: hidden;
        }

        .dc-money-input:focus-within,
        .dc-percent-input:focus-within {
          border-color: var(--dc-primary);
          box-shadow: 0 0 0 3px var(--dc-primary-soft);
        }

        .dc-money-input span,
        .dc-percent-input span {
          flex: 0 0 auto;
          padding: 0 11px;
          color: var(--dc-muted);
          font-size: 11px;
          font-weight: 750;
        }

        .dc-money-input .dc-input,
        .dc-percent-input .dc-input {
          border: 0;
          border-radius: 0;
          box-shadow: none;
        }

        .dc-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .dc-presets button {
          min-width: 42px;
          height: 28px;
          padding: 0 9px;
          border: 1px solid var(--dc-border);
          border-radius: 7px;
          background: var(--dc-soft);
          color: var(--dc-muted);
          cursor: pointer;
          font: inherit;
          font-size: 9px;
          font-weight: 700;
        }

        .dc-presets button.selected {
          border-color: var(--dc-primary);
          background: var(--dc-primary-soft);
          color: var(--dc-primary);
        }

        .dc-two-inputs,
        .dc-stack-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .dc-stack-grid {
          margin-top: 2px;
        }

        .dc-stack-grid .dc-label {
          margin-top: 12px;
        }

        .dc-info-box,
        .dc-tip {
          display: flex;
          gap: 10px;
          margin-top: 19px;
          padding: 12px;
          border: 1px solid var(--dc-border);
          border-radius: 10px;
          background: var(--dc-soft);
        }

        .dc-info-box > span,
        .dc-tip > span {
          flex: 0 0 auto;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: var(--dc-primary-soft);
          color: var(--dc-primary);
        }

        .dc-info-box strong {
          display: block;
          font-size: 10px;
        }

        .dc-info-box p,
        .dc-tip p {
          margin: 3px 0 0;
          color: var(--dc-muted);
          font-size: 9px;
          line-height: 1.55;
        }

        .dc-local-note {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 18px;
          color: var(--dc-muted);
          font-size: 9px;
        }

        .dc-local-note span {
          color: #12b76a;
          font-weight: 900;
        }

        .dc-result-kicker {
          margin-bottom: 7px;
        }

        .dc-final-price {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .dc-final-price span {
          color: var(--dc-muted);
          font-size: 20px;
          font-weight: 600;
        }

        .dc-final-price strong {
          font-size: clamp(46px, 7vw, 70px);
          line-height: 1;
          letter-spacing: -0.065em;
        }

        .dc-saving-badge {
          width: fit-content;
          margin-top: 12px;
          padding: 6px 9px;
          border-radius: 7px;
          background: var(--dc-primary-soft);
          color: var(--dc-primary);
          font-size: 9px;
          font-weight: 800;
        }

        .dc-result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 25px;
        }

        .dc-result-item {
          padding: 12px;
          border: 1px solid var(--dc-border);
          border-radius: 9px;
          background: var(--dc-soft);
        }

        .dc-result-item span {
          display: block;
          color: var(--dc-muted);
          font-size: 9px;
        }

        .dc-result-item strong {
          display: block;
          margin-top: 5px;
          font-size: 15px;
          letter-spacing: -0.025em;
        }

        .dc-result-item.highlight {
          border-color: rgba(99, 91, 255, 0.25);
        }

        .dc-result-item.highlight strong {
          color: var(--dc-primary);
        }

        .dc-total-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 10px;
          padding: 13px;
          border: 1px solid var(--dc-border);
          border-radius: 10px;
        }

        .dc-total-box span,
        .dc-total-box small {
          display: block;
          color: var(--dc-muted);
          font-size: 8px;
        }

        .dc-total-box strong {
          display: block;
          margin-top: 3px;
          font-size: 17px;
        }

        .dc-total-box b {
          display: block;
          margin-top: 3px;
          font-size: 11px;
        }

        .dc-visual-bar {
          height: 7px;
          margin-top: 24px;
          border-radius: 99px;
          background: var(--dc-border);
          overflow: hidden;
        }

        .dc-visual-bar div {
          height: 100%;
          border-radius: inherit;
          background: var(--dc-primary);
          transition: width 0.2s ease;
        }

        .dc-bar-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          color: var(--dc-muted);
          font-size: 8px;
        }

        .dc-copy {
          width: 100%;
          height: 40px;
          margin-top: 18px;
          border: 1px solid var(--dc-border);
          border-radius: 9px;
          background: var(--dc-card);
          color: var(--dc-text);
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 750;
        }

        .dc-stack-flow {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          align-items: center;
          gap: 7px;
          margin-top: 25px;
        }

        .dc-stack-flow > div {
          min-width: 0;
          padding: 10px;
          border: 1px solid var(--dc-border);
          border-radius: 9px;
          background: var(--dc-soft);
        }

        .dc-stack-flow span {
          display: block;
          color: var(--dc-muted);
          font-size: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dc-stack-flow strong {
          display: block;
          margin-top: 4px;
          font-size: 12px;
        }

        .dc-stack-flow i {
          color: var(--dc-primary);
          font-style: normal;
          font-weight: 800;
        }

        .dc-tip {
          margin-top: 12px;
        }

        .dc-compare {
          margin-top: 18px;
          padding: 21px;
        }

        .dc-section-head h3 {
          margin: 4px 0 0;
          font-size: 16px;
          letter-spacing: -0.025em;
        }

        .dc-compare-row {
          display: grid;
          grid-template-columns: minmax(200px, 0.6fr) minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          margin-top: 17px;
        }

        .dc-comparison-result {
          min-height: 43px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 13px;
          border: 1px solid var(--dc-border);
          border-radius: 9px;
          background: var(--dc-soft);
        }

        .dc-comparison-result span {
          color: var(--dc-muted);
          font-size: 9px;
        }

        .dc-comparison-result strong {
          font-size: 14px;
        }

        .dc-comparison-result strong.higher {
          color: #d92d20;
        }

        .dc-comparison-result strong.lower {
          color: #12b76a;
        }

        .dc-comparison-result small {
          color: var(--dc-muted);
          font-size: 8px;
        }

        .dc-muted {
          color: var(--dc-muted);
          font-size: 9px;
        }

        .dc-error {
          margin-top: 12px;
          padding: 9px;
          border-radius: 8px;
          background: #fff1f3;
          color: #c01048;
          font-size: 9px;
        }

        .dc-features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-top: 18px;
          overflow: hidden;
        }

        .dc-feature {
          display: flex;
          gap: 10px;
          padding: 18px;
          border-right: 1px solid var(--dc-border);
        }

        .dc-feature:last-child {
          border-right: 0;
        }

        .dc-feature > span {
          color: var(--dc-primary);
          font-size: 8px;
          font-weight: 850;
        }

        .dc-feature strong {
          display: block;
          font-size: 10px;
        }

        .dc-feature p {
          margin: 4px 0 0;
          color: var(--dc-muted);
          font-size: 8px;
          line-height: 1.45;
        }

        @media (max-width: 900px) {
          .dc-main {
            grid-template-columns: 1fr;
          }

          .dc-result-card {
            min-height: auto;
          }

          .dc-features {
            grid-template-columns: 1fr 1fr;
          }

          .dc-feature:nth-child(2) {
            border-right: 0;
          }

          .dc-feature:nth-child(-n + 2) {
            border-bottom: 1px solid var(--dc-border);
          }
        }

        @media (max-width: 650px) {
          .dc-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .dc-mode-switch {
            width: 100%;
          }

          .dc-mode {
            flex: 1;
          }

          .dc-reset {
            width: 100%;
          }

          .dc-input-card,
          .dc-result-card,
          .dc-compare {
            padding: 17px;
          }

          .dc-two-inputs,
          .dc-stack-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .dc-result-grid {
            grid-template-columns: 1fr 1fr;
          }

          .dc-stack-flow {
            grid-template-columns: 1fr;
          }

          .dc-stack-flow i {
            display: none;
          }

          .dc-compare-row {
            grid-template-columns: 1fr;
          }

          .dc-comparison-result {
            min-height: 43px;
          }

          .dc-features {
            grid-template-columns: 1fr;
          }

          .dc-feature {
            border-right: 0;
            border-bottom: 1px solid var(--dc-border);
          }

          .dc-feature:last-child {
            border-bottom: 0;
          }
        }

        @media (max-width: 400px) {
          .dc-result-grid {
            grid-template-columns: 1fr;
          }

          .dc-final-price strong {
            font-size: 48px;
          }

          .dc-presets button {
            flex: 1;
          }
        }

        body.dark .discount-calculator-tool,
        html.dark .discount-calculator-tool,
        .dark .discount-calculator-tool {
          --dc-text: #f2f4f7;
          --dc-muted: #98a2b3;
          --dc-border: #2d3442;
          --dc-card: #151922;
          --dc-soft: #10141c;
          --dc-primary: #8078ff;
          --dc-primary-soft: rgba(128, 120, 255, 0.13);
        }
      `}</style>
    </>
  );
}
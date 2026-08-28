"use client";

import React, { useMemo, useState } from "react";

function normalizeName(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function cleanName(value) {
  return normalizeName(value).replace(/[^a-z]/g, "");
}

function hashString(value) {
  var hash = 0;

  for (var i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000000007;
  }

  return Math.abs(hash);
}

function calculateLoveScore(first, second) {
  var a = cleanName(first);
  var b = cleanName(second);

  if (!a || !b) return null;

  var combined = a + "|" + b;

  var forwardHash = hashString(combined);
  var reverseHash = hashString(b + "|" + a);

  var lettersA = {};
  var lettersB = {};

  for (var i = 0; i < a.length; i++) {
    lettersA[a[i]] = (lettersA[a[i]] || 0) + 1;
  }

  for (var j = 0; j < b.length; j++) {
    lettersB[b[j]] = (lettersB[b[j]] || 0) + 1;
  }

  var shared = 0;
  var uniqueA = 0;
  var uniqueB = 0;

  Object.keys(lettersA).forEach(function (letter) {
    if (lettersB[letter]) {
      shared += Math.min(lettersA[letter], lettersB[letter]);
    }
  });

  Object.keys(lettersA).forEach(function (letter) {
    uniqueA += lettersA[letter];
  });

  Object.keys(lettersB).forEach(function (letter) {
    uniqueB += lettersB[letter];
  });

  var lengthFactor =
    Math.max(1, Math.min(20, a.length + b.length));

  var sharedRatio =
    shared / Math.max(1, Math.min(uniqueA, uniqueB));

  var base =
    (forwardHash % 61) +
    (reverseHash % 31) +
    Math.round(sharedRatio * 25) +
    lengthFactor;

  var score = 35 + (base % 66);

  return Math.max(1, Math.min(100, score));
}

function getLevel(score) {
  if (score >= 90) {
    return {
      title: "Exceptional Match",
      description:
        "Your names create an unusually strong compatibility pattern.",
      emoji: "💖",
    };
  }

  if (score >= 80) {
    return {
      title: "Very Strong Connection",
      description:
        "There is a strong harmony between both names with excellent potential.",
      emoji: "💕",
    };
  }

  if (score >= 70) {
    return {
      title: "Strong Potential",
      description:
        "Your compatibility looks promising with plenty of positive energy.",
      emoji: "💗",
    };
  }

  if (score >= 60) {
    return {
      title: "Good Connection",
      description:
        "There is a nice balance between both personalities and energies.",
      emoji: "💞",
    };
  }

  if (score >= 45) {
    return {
      title: "Interesting Match",
      description:
        "Your connection has potential and could become stronger with understanding.",
      emoji: "✨",
    };
  }

  return {
    title: "Opposites Attract",
    description:
      "Your names show a more contrasting pattern. Differences can create interesting chemistry.",
    emoji: "💫",
  };
}

function getCompatibility(score) {
  return {
    communication: Math.min(
      98,
      Math.max(30, 48 + ((score * 7) % 45))
    ),
    trust: Math.min(
      97,
      Math.max(32, 42 + ((score * 11) % 48))
    ),
    chemistry: Math.min(
      99,
      Math.max(35, 50 + ((score * 13) % 47))
    ),
    fun: Math.min(
      98,
      Math.max(38, 45 + ((score * 17) % 50))
    ),
  };
}

function getAdvice(score) {
  if (score >= 85) {
    return "Keep communication honest and protect the little moments that make the relationship special.";
  }

  if (score >= 70) {
    return "Make time for each other, communicate openly and celebrate your differences.";
  }

  if (score >= 55) {
    return "Patience and clear communication can turn your natural differences into strengths.";
  }

  return "Focus on understanding each other instead of trying to be identical. Differences can be valuable.";
}

function getLuckyNumber(first, second) {
  var hash = hashString(
    cleanName(first) + cleanName(second)
  );

  return (hash % 9) + 1;
}

function getInitials(first, second) {
  var a = normalizeName(first);
  var b = normalizeName(second);

  return (
    (a ? a.charAt(0).toUpperCase() : "?") +
    (b ? b.charAt(0).toUpperCase() : "?")
  );
}

function getScoreLabel(value) {
  if (value >= 90) return "Exceptional";
  if (value >= 80) return "Excellent";
  if (value >= 70) return "Very Good";
  if (value >= 60) return "Good";
  if (value >= 45) return "Moderate";
  return "Challenging";
}

export default function LoveCalculator() {
  var [nameOne, setNameOne] = useState("");
  var [nameTwo, setNameTwo] = useState("");
  var [relationship, setRelationship] = useState("Romantic");
  var [showDetails, setShowDetails] = useState(true);
  var [copied, setCopied] = useState(false);

  var result = useMemo(
    function () {
      if (
        !cleanName(nameOne) ||
        !cleanName(nameTwo)
      ) {
        return null;
      }

      var score = calculateLoveScore(
        nameOne,
        nameTwo
      );

      var level = getLevel(score);
      var compatibility = getCompatibility(score);

      return {
        score: score,
        level: level,
        compatibility: compatibility,
        advice: getAdvice(score),
        luckyNumber: getLuckyNumber(
          nameOne,
          nameTwo
        ),
        initials: getInitials(
          nameOne,
          nameTwo
        ),
      };
    },
    [nameOne, nameTwo]
  );

  function calculateRandomExample() {
    var examples = [
      ["Alex", "Taylor"],
      ["Emma", "Noah"],
      ["Sophia", "Liam"],
      ["Olivia", "James"],
      ["Mia", "Ethan"],
    ];

    var item =
      examples[
        Math.floor(
          Math.random() * examples.length
        )
      ];

    setNameOne(item[0]);
    setNameTwo(item[1]);
  }

  function resetTool() {
    setNameOne("");
    setNameTwo("");
    setRelationship("Romantic");
    setCopied(false);
  }

  function copyResult() {
    if (!result) return;

    var text =
      "Love Compatibility Result\n\n" +
      nameOne +
      " + " +
      nameTwo +
      "\n" +
      "Compatibility: " +
      result.score +
      "%\n" +
      "Match: " +
      result.level.title +
      "\n" +
      "Communication: " +
      result.compatibility.communication +
      "%\n" +
      "Trust: " +
      result.compatibility.trust +
      "%\n" +
      "Chemistry: " +
      result.compatibility.chemistry +
      "%\n" +
      "Fun & Energy: " +
      result.compatibility.fun +
      "%\n\n" +
      "Advice: " +
      result.advice;

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard
    ) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          setCopied(true);

          setTimeout(function () {
            setCopied(false);
          }, 1800);
        })
        .catch(function () {
          setCopied(false);
        });
    }
  }

  var styles = `
    .love-tool {
      --love-text: #171923;
      --love-muted: #697386;
      --love-border: #e7e8ee;
      --love-card: #ffffff;
      --love-soft: #f8f8fb;
      --love-primary: #e94b83;
      --love-primary-soft: rgba(233,75,131,.10);

      width: 100%;
      color: var(--love-text);
      font-family: inherit;
      box-sizing: border-box;
    }

    .love-tool *,
    .love-tool *::before,
    .love-tool *::after {
      box-sizing: border-box;
    }

    .love-wrapper {
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;
    }

    .love-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      margin-bottom: 20px;
    }

    .love-eyebrow {
      color: var(--love-primary);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .14em;
    }

    .love-title {
      margin: 6px 0 0;
      font-size: clamp(28px, 4vw, 42px);
      line-height: 1.05;
      letter-spacing: -.045em;
    }

    .love-description {
      margin: 8px 0 0;
      max-width: 650px;
      color: var(--love-muted);
      font-size: 12px;
      line-height: 1.65;
    }

    .love-example {
      height: 40px;
      padding: 0 13px;
      border: 1px solid var(--love-border);
      border-radius: 9px;
      background: var(--love-card);
      color: var(--love-text);
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      font-weight: 700;
      white-space: nowrap;
    }

    .love-main {
      display: grid;
      grid-template-columns: .9fr 1.1fr;
      gap: 18px;
    }

    .love-card {
      border: 1px solid var(--love-border);
      border-radius: 16px;
      background: var(--love-card);
      box-shadow: 0 8px 30px rgba(16,24,40,.035);
    }

    .love-form {
      padding: 22px;
    }

    .love-form-title {
      font-size: 17px;
      font-weight: 750;
      letter-spacing: -.025em;
    }

    .love-form-subtitle {
      margin-top: 5px;
      color: var(--love-muted);
      font-size: 11px;
      line-height: 1.6;
    }

    .love-label {
      display: block;
      margin: 17px 0 7px;
      font-size: 10px;
      font-weight: 800;
    }

    .love-input {
      width: 100%;
      height: 46px;
      padding: 0 12px;
      border: 1px solid var(--love-border);
      border-radius: 9px;
      outline: none;
      background: var(--love-card);
      color: var(--love-text);
      font: inherit;
      font-size: 12px;
      transition: border-color .18s, box-shadow .18s;
    }

    .love-input:focus {
      border-color: var(--love-primary);
      box-shadow: 0 0 0 3px var(--love-primary-soft);
    }

    .love-select {
      width: 100%;
      height: 44px;
      padding: 0 11px;
      border: 1px solid var(--love-border);
      border-radius: 9px;
      background: var(--love-card);
      color: var(--love-text);
      font: inherit;
      font-size: 11px;
      outline: none;
    }

    .love-button-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 18px;
    }

    .love-primary-button,
    .love-secondary-button {
      height: 43px;
      border-radius: 9px;
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      font-weight: 800;
    }

    .love-primary-button {
      border: 1px solid var(--love-primary);
      background: var(--love-primary);
      color: white;
    }

    .love-secondary-button {
      border: 1px solid var(--love-border);
      background: var(--love-soft);
      color: var(--love-text);
    }

    .love-result {
      min-height: 400px;
      padding: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
      background:
        radial-gradient(
          circle at 85% 5%,
          rgba(233,75,131,.13),
          transparent 42%
        ),
        var(--love-card);
    }

    .love-empty {
      text-align: center;
      max-width: 330px;
    }

    .love-empty-icon {
      width: 58px;
      height: 58px;
      margin: 0 auto 14px;
      display: grid;
      place-items: center;
      border-radius: 17px;
      background: var(--love-primary-soft);
      color: var(--love-primary);
      font-size: 25px;
    }

    .love-empty h2 {
      margin: 0;
      font-size: 21px;
    }

    .love-empty p {
      margin: 8px 0 0;
      color: var(--love-muted);
      font-size: 11px;
      line-height: 1.7;
    }

    .love-result-content {
      width: 100%;
      text-align: center;
    }

    .love-couple {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 18px;
    }

    .love-avatar {
      width: 47px;
      height: 47px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--love-primary-soft);
      color: var(--love-primary);
      font-size: 13px;
      font-weight: 900;
    }

    .love-heart {
      color: var(--love-primary);
      font-size: 19px;
      animation: lovePulse 1.6s infinite ease-in-out;
    }

    @keyframes lovePulse {
      0%,100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    .love-result-label {
      color: var(--love-primary);
      font-size: 9px;
      font-weight: 900;
      letter-spacing: .16em;
    }

    .love-score {
      margin-top: 5px;
      font-size: clamp(64px, 9vw, 88px);
      line-height: .95;
      letter-spacing: -.08em;
      font-weight: 850;
    }

    .love-score span {
      font-size: 28px;
      color: var(--love-primary);
      letter-spacing: -.04em;
    }

    .love-level {
      margin-top: 9px;
      font-size: 18px;
      font-weight: 800;
    }

    .love-level-description {
      max-width: 480px;
      margin: 7px auto 0;
      color: var(--love-muted);
      font-size: 10px;
      line-height: 1.65;
    }

    .love-meter {
      max-width: 470px;
      height: 8px;
      margin: 20px auto 0;
      overflow: hidden;
      border-radius: 20px;
      background: var(--love-soft);
    }

    .love-meter-fill {
      height: 100%;
      border-radius: inherit;
      background: var(--love-primary);
      transition: width .5s ease;
    }

    .love-mini-grid {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      gap: 7px;
      max-width: 540px;
      margin: 17px auto 0;
    }

    .love-mini {
      padding: 10px 7px;
      border: 1px solid var(--love-border);
      border-radius: 9px;
      background: var(--love-soft);
    }

    .love-mini strong {
      display: block;
      font-size: 15px;
    }

    .love-mini span {
      display: block;
      margin-top: 3px;
      color: var(--love-muted);
      font-size: 7px;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    .love-actions {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 18px;
    }

    .love-copy {
      height: 36px;
      padding: 0 12px;
      border: 1px solid var(--love-border);
      border-radius: 8px;
      background: var(--love-card);
      color: var(--love-text);
      cursor: pointer;
      font: inherit;
      font-size: 9px;
      font-weight: 800;
    }

    .love-section {
      margin-top: 18px;
      padding: 22px;
    }

    .love-section-title {
      margin: 0;
      font-size: 17px;
      letter-spacing: -.025em;
    }

    .love-section-description {
      margin: 5px 0 18px;
      color: var(--love-muted);
      font-size: 10px;
      line-height: 1.6;
    }

    .love-compatibility-grid {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      gap: 10px;
    }

    .love-compatibility {
      padding: 14px;
      border: 1px solid var(--love-border);
      border-radius: 10px;
      background: var(--love-soft);
    }

    .love-compatibility-top {
      display: flex;
      justify-content: space-between;
      gap: 5px;
    }

    .love-compatibility-top span {
      color: var(--love-muted);
      font-size: 9px;
    }

    .love-compatibility-top strong {
      font-size: 10px;
    }

    .love-progress {
      height: 5px;
      margin-top: 10px;
      border-radius: 20px;
      overflow: hidden;
      background: var(--love-border);
    }

    .love-progress div {
      height: 100%;
      border-radius: inherit;
      background: var(--love-primary);
    }

    .love-insight {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 12px;
      margin-top: 18px;
      padding: 16px;
      border: 1px solid var(--love-border);
      border-radius: 11px;
      background: var(--love-soft);
    }

    .love-insight-icon {
      width: 39px;
      height: 39px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: var(--love-primary-soft);
      font-size: 17px;
    }

    .love-insight span {
      display: block;
      color: var(--love-muted);
      font-size: 8px;
      font-weight: 800;
      letter-spacing: .08em;
    }

    .love-insight strong {
      display: block;
      margin-top: 4px;
      font-size: 11px;
      line-height: 1.5;
    }

    .love-lucky {
      text-align: center;
      min-width: 60px;
    }

    .love-lucky strong {
      color: var(--love-primary);
      font-size: 25px;
    }

    .love-lucky span {
      font-size: 7px;
    }

    .love-disclaimer {
      margin-top: 14px;
      color: var(--love-muted);
      text-align: center;
      font-size: 8px;
      line-height: 1.6;
    }

    @media (max-width: 850px) {
      .love-main {
        grid-template-columns: 1fr;
      }

      .love-compatibility-grid {
        grid-template-columns: repeat(2,1fr);
      }
    }

    @media (max-width: 600px) {
      .love-top {
        flex-direction: column;
        align-items: stretch;
      }

      .love-example {
        width: 100%;
      }

      .love-form,
      .love-result,
      .love-section {
        padding: 16px;
      }

      .love-result {
        min-height: 360px;
      }

      .love-mini-grid {
        grid-template-columns: repeat(2,1fr);
      }

      .love-insight {
        grid-template-columns: auto 1fr;
      }

      .love-lucky {
        display: none;
      }
    }

    @media (max-width: 400px) {
      .love-compatibility-grid {
        grid-template-columns: 1fr;
      }

      .love-button-row {
        grid-template-columns: 1fr;
      }

      .love-score {
        font-size: 62px;
      }
    }

    .dark .love-tool,
    body.dark .love-tool,
    html.dark .love-tool {
      --love-text: #f2f4f7;
      --love-muted: #98a2b3;
      --love-border: #2d3442;
      --love-card: #151922;
      --love-soft: #10141c;
      --love-primary: #ff6699;
      --love-primary-soft: rgba(255,102,153,.13);
    }
  `;

  return (
    <>
      <div className="love-tool">
        <div className="love-wrapper">

          <div className="love-top">
            <div>
              <div className="love-eyebrow">
                FUN & RELATIONSHIP TOOL
              </div>

              <h1 className="love-title">
                Love Calculator
              </h1>

              <p className="love-description">
                Discover a fun compatibility score with
                detailed chemistry, communication, trust
                and relationship insights.
              </p>
            </div>

            <button
              type="button"
              className="love-example"
              onClick={calculateRandomExample}
            >
              Try Example
            </button>
          </div>

          <div className="love-main">

            <div className="love-card love-form">
              <div className="love-form-title">
                Check your compatibility
              </div>

              <div className="love-form-subtitle">
                Enter two names and let the calculator
                generate a unique compatibility reading.
              </div>

              <label
                className="love-label"
                htmlFor="love-name-one"
              >
                YOUR NAME
              </label>

              <input
                id="love-name-one"
                className="love-input"
                type="text"
                value={nameOne}
                placeholder="e.g. Alex"
                autoComplete="off"
                onChange={function (event) {
                  setNameOne(event.target.value);
                }}
              />

              <label
                className="love-label"
                htmlFor="love-name-two"
              >
                THEIR NAME
              </label>

              <input
                id="love-name-two"
                className="love-input"
                type="text"
                value={nameTwo}
                placeholder="e.g. Taylor"
                autoComplete="off"
                onChange={function (event) {
                  setNameTwo(event.target.value);
                }}
              />

              <label
                className="love-label"
                htmlFor="love-relationship"
              >
                CONNECTION TYPE
              </label>

              <select
                id="love-relationship"
                className="love-select"
                value={relationship}
                onChange={function (event) {
                  setRelationship(event.target.value);
                }}
              >
                <option>Romantic</option>
                <option>Dating</option>
                <option>Marriage</option>
                <option>Friendship</option>
                <option>Crush</option>
                <option>Just Curious</option>
              </select>

              <div className="love-button-row">
                <button
                  type="button"
                  className="love-primary-button"
                  onClick={function () {
                    if (nameOne && nameTwo) {
                      setShowDetails(true);
                    }
                  }}
                >
                  Calculate Match
                </button>

                <button
                  type="button"
                  className="love-secondary-button"
                  onClick={resetTool}
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="love-card love-result">

              {!result ? (
                <div className="love-empty">
                  <div className="love-empty-icon">
                    ♡
                  </div>

                  <h2>
                    Your match is waiting
                  </h2>

                  <p>
                    Enter both names to reveal your
                    compatibility score and detailed
                    relationship insights.
                  </p>
                </div>
              ) : (
                <div className="love-result-content">

                  <div className="love-couple">
                    <div className="love-avatar">
                      {result.initials.charAt(0)}
                    </div>

                    <div className="love-heart">
                      ♥
                    </div>

                    <div className="love-avatar">
                      {result.initials.charAt(1)}
                    </div>
                  </div>

                  <div className="love-result-label">
                    {relationship.toUpperCase()} COMPATIBILITY
                  </div>

                  <div className="love-score">
                    {result.score}
                    <span>%</span>
                  </div>

                  <div className="love-level">
                    {result.level.emoji}{" "}
                    {result.level.title}
                  </div>

                  <p className="love-level-description">
                    {result.level.description}
                  </p>

                  <div className="love-meter">
                    <div
                      className="love-meter-fill"
                      style={{
                        width:
                          result.score + "%",
                      }}
                    />
                  </div>

                  <div className="love-mini-grid">
                    <div className="love-mini">
                      <strong>
                        {result.compatibility.communication}%
                      </strong>
                      <span>
                        Communication
                      </span>
                    </div>

                    <div className="love-mini">
                      <strong>
                        {result.compatibility.trust}%
                      </strong>
                      <span>
                        Trust
                      </span>
                    </div>

                    <div className="love-mini">
                      <strong>
                        {result.compatibility.chemistry}%
                      </strong>
                      <span>
                        Chemistry
                      </span>
                    </div>

                    <div className="love-mini">
                      <strong>
                        {result.compatibility.fun}%
                      </strong>
                      <span>
                        Fun
                      </span>
                    </div>
                  </div>

                  <div className="love-actions">
                    <button
                      type="button"
                      className="love-copy"
                      onClick={copyResult}
                    >
                      {copied
                        ? "✓ Copied"
                        : "Copy Result"}
                    </button>

                    <button
                      type="button"
                      className="love-copy"
                      onClick={function () {
                        setShowDetails(
                          function (current) {
                            return !current;
                          }
                        );
                      }}
                    >
                      {showDetails
                        ? "Hide Details"
                        : "Show Details"}
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

          {result && showDetails && (
            <>
              <div className="love-card love-section">

                <h2 className="love-section-title">
                  Compatibility breakdown
                </h2>

                <p className="love-section-description">
                  A detailed look at the different
                  dimensions behind your overall score.
                </p>

                <div className="love-compatibility-grid">

                  <div className="love-compatibility">
                    <div className="love-compatibility-top">
                      <span>Communication</span>
                      <strong>
                        {result.compatibility.communication}%
                      </strong>
                    </div>

                    <div className="love-progress">
                      <div
                        style={{
                          width:
                            result.compatibility.communication +
                            "%",
                        }}
                      />
                    </div>
                  </div>

                  <div className="love-compatibility">
                    <div className="love-compatibility-top">
                      <span>Trust</span>
                      <strong>
                        {result.compatibility.trust}%
                      </strong>
                    </div>

                    <div className="love-progress">
                      <div
                        style={{
                          width:
                            result.compatibility.trust +
                            "%",
                        }}
                      />
                    </div>
                  </div>

                  <div className="love-compatibility">
                    <div className="love-compatibility-top">
                      <span>Chemistry</span>
                      <strong>
                        {result.compatibility.chemistry}%
                      </strong>
                    </div>

                    <div className="love-progress">
                      <div
                        style={{
                          width:
                            result.compatibility.chemistry +
                            "%",
                        }}
                      />
                    </div>
                  </div>

                  <div className="love-compatibility">
                    <div className="love-compatibility-top">
                      <span>Fun & Energy</span>
                      <strong>
                        {result.compatibility.fun}%
                      </strong>
                    </div>

                    <div className="love-progress">
                      <div
                        style={{
                          width:
                            result.compatibility.fun +
                            "%",
                        }}
                      />
                    </div>
                  </div>

                </div>

                <div className="love-insight">

                  <div className="love-insight-icon">
                    💡
                  </div>

                  <div>
                    <span>
                      PERSONALIZED INSIGHT
                    </span>

                    <strong>
                      {result.advice}
                    </strong>
                  </div>

                  <div className="love-lucky">
                    <strong>
                      {result.luckyNumber}
                    </strong>

                    <span>
                      LUCKY
                    </span>
                  </div>

                </div>

                <div className="love-disclaimer">
                  This calculator is designed for
                  entertainment. Compatibility cannot
                  scientifically be determined from names.
                </div>

              </div>
            </>
          )}

        </div>
      </div>

      <style>{styles}</style>
    </>
  );
}
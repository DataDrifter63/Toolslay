"use client";

import React, { useEffect, useMemo, useState } from "react";

const PLATFORMS = {
  Instagram: { rec: 15, max: 30 },
  TikTok: { rec: 8, max: 10 },
  LinkedIn: { rec: 5, max: 5 },
  YouTube: { rec: 8, max: 15 },
  X: { rec: 3, max: 10 },
  Facebook: { rec: 5, max: 10 },
  Pinterest: { rec: 8, max: 15 },
};

const STOP_WORDS = new Set(
  (
    "the and for with from this that your you are was have has how why what when where into about our their they them will just more than then also very can not but all new get use using best top make made like learn tips guide post video today here a an of to in on at by is it as be or we i me my"
  ).split(" ")
);

const GENERIC_TAGS = [
  "trending",
  "viral",
  "explore",
  "explorepage",
  "contentcreator",
  "digitalcreator",
  "socialmedia",
  "marketing",
  "business",
  "entrepreneur",
  "smallbusiness",
  "growth",
  "tips",
  "ideas",
  "strategy",
  "branding",
  "creator",
];

const NICHES = {
  marketing: [
    "digitalmarketing",
    "marketingstrategy",
    "marketingtips",
    "contentmarketing",
    "performancemarketing",
    "growthmarketing",
  ],

  seo: [
    "seo",
    "seotips",
    "seostrategy",
    "searchengineoptimization",
    "googlerankings",
    "organictraffic",
  ],

  ads: [
    "googleads",
    "ppc",
    "paidads",
    "adstrategy",
    "performanceads",
    "digitaladvertising",
  ],

  wordpress: [
    "wordpress",
    "wordpresstips",
    "webdesign",
    "wordpressdeveloper",
    "elementor",
    "websitebuilding",
  ],

  design: [
    "graphicdesign",
    "uidesign",
    "uxdesign",
    "webdesign",
    "designinspiration",
    "creativedesign",
  ],

  fitness: [
    "fitness",
    "fitnesstips",
    "workout",
    "fitnessmotivation",
    "healthylifestyle",
    "gymmotivation",
  ],

  fashion: [
    "fashion",
    "fashionstyle",
    "styleinspo",
    "streetstyle",
    "fashioninspiration",
    "outfitideas",
  ],

  food: [
    "food",
    "foodie",
    "foodlover",
    "foodinspiration",
    "recipeideas",
    "homecooking",
  ],

  realestate: [
    "realestate",
    "realestateinvesting",
    "property",
    "realestateagent",
    "propertyinvestment",
    "realestatemarketing",
  ],

  ecommerce: [
    "ecommerce",
    "ecommercetips",
    "onlinestore",
    "ecommercebusiness",
    "shopifystore",
    "onlineshopping",
  ],

  education: [
    "education",
    "edtech",
    "learning",
    "studytips",
    "onlinelearning",
    "studentlife",
  ],

  photography: [
    "photography",
    "photographytips",
    "photooftheday",
    "portraitphotography",
    "mobilephotography",
    "creativephotography",
  ],

  ai: [
    "ai",
    "artificialintelligence",
    "aitools",
    "generativeai",
    "futureofai",
    "aiautomation",
  ],
};

const PLATFORM_TAGS = {
  Instagram: ["instagram", "reels", "instareels"],
  TikTok: ["tiktok", "fyp", "foryou", "viral"],
  LinkedIn: ["linkedin", "professional", "careergrowth"],
  YouTube: ["youtube", "shorts", "youtubeshorts", "creator"],
  X: ["twitter", "x"],
  Facebook: ["facebook", "facebookmarketing"],
  Pinterest: ["pinterest", "inspiration", "pinterestideas"],
};

function cleanTag(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function extractWords(value) {
  return (
    String(value || "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || []
  );
}

function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) {
    if (/[\u0679\u0686\u06D2\u06BE\u06D1]/.test(text)) {
      return "Urdu";
    }

    return "Arabic";
  }

  if (/[\u0900-\u097F]/.test(text)) {
    return "Hindi";
  }

  return "English";
}

function generateHashtags(text, platform, strategy, language) {
  const rawWords = extractWords(text);

  const words = [
    ...new Set(
      rawWords.filter(
        (word) => word.length >= 3 && !STOP_WORDS.has(word)
      )
    ),
  ];

  const joinedText = words.join(" ");

  let nicheTags = [];

  Object.entries(NICHES).forEach(([key, tags]) => {
    if (
      joinedText.includes(key) ||
      tags.some((tag) =>
        joinedText.includes(tag.replace("tips", ""))
      )
    ) {
      nicheTags.push(...tags);
    }
  });

  const keywordTags = words
    .map(cleanTag)
    .filter(Boolean);

  const longTailTags = [];

  for (let i = 0; i < words.length - 1; i++) {
    const first = cleanTag(words[i]);
    const second = cleanTag(words[i + 1]);

    if (
      first.length > 2 &&
      second.length > 2
    ) {
      longTailTags.push(first + second);
    }
  }

  const platformTags =
    PLATFORM_TAGS[platform] || [];

  const languageTags =
    language === "Urdu"
      ? ["urdu", "urducontent", "pakistan"]
      : language === "Hindi"
      ? ["hindi", "hindicontent", "india"]
      : language === "Arabic"
      ? ["arabic", "arabiccontent"]
      : [];

  let pool = [];

  if (strategy === "Niche") {
    pool = [
      ...nicheTags,
      ...keywordTags,
      ...longTailTags,
    ];
  } else if (strategy === "Reach") {
    pool = [
      ...platformTags,
      ...GENERIC_TAGS,
      ...nicheTags,
      ...keywordTags,
    ];
  } else if (strategy === "Long-tail") {
    pool = [
      ...longTailTags,
      ...keywordTags,
      ...nicheTags,
      ...platformTags,
    ];
  } else {
    pool = [
      ...nicheTags,
      ...keywordTags,
      ...longTailTags,
      ...platformTags,
      ...GENERIC_TAGS,
    ];
  }

  pool.push(...languageTags);

  const seen = new Set();

  return pool
    .map((tag) => cleanTag(tag))
    .filter((tag) => {
      if (!tag) return false;
      if (seen.has(tag)) return false;

      seen.add(tag);
      return true;
    })
    .map((tag, index) => {
      let score = 50;

      if (keywordTags.includes(tag)) {
        score += 25;
      }

      if (nicheTags.includes(tag)) {
        score += 18;
      }

      if (longTailTags.includes(tag)) {
        score += 12;
      }

      if (platformTags.includes(tag)) {
        score += 8;
      }

      if (GENERIC_TAGS.includes(tag)) {
        score -= 10;
      }

      if (tag.length <= 12) {
        score += 4;
      }

      if (tag.length > 22) {
        score -= 12;
      }

      score -= index * 0.15;

      return {
        tag,
        score: Math.max(
          20,
          Math.min(99, Math.round(score))
        ),
      };
    })
    .sort((a, b) => b.score - a.score);
}

function getSiteDarkMode() {
  if (typeof document === "undefined") {
    return false;
  }

  const html = document.documentElement;
  const body = document.body;

  return (
    html.classList.contains("dark") ||
    body.classList.contains("dark") ||
    html.getAttribute("data-theme") === "dark" ||
    body.getAttribute("data-theme") === "dark"
  );
}

export default function HashtagGenerator() {
  const [text, setText] = useState(
    "digital marketing SEO Google Ads content strategy social media marketing"
  );

  const [platform, setPlatform] =
    useState("Instagram");

  const [language, setLanguage] =
    useState("Auto");

  const [strategy, setStrategy] =
    useState("Balanced");

  const [count, setCount] =
    useState(15);

  const [include, setInclude] =
    useState("");

  const [exclude, setExclude] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("results");

  const [dark, setDark] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    setDark(getSiteDarkMode());

    const observer = new MutationObserver(() => {
      setDark(getSiteDarkMode());
    });

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "data-theme",
        ],
      }
    );

    observer.observe(
      document.body,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "data-theme",
        ],
      }
    );

    return () => observer.disconnect();
  }, []);

  const detectedLanguage = useMemo(
    () => detectLanguage(text),
    [text]
  );

  const selectedLanguage =
    language === "Auto"
      ? detectedLanguage
      : language;

  const candidates = useMemo(
    () =>
      generateHashtags(
        text,
        platform,
        strategy,
        selectedLanguage
      ),
    [
      text,
      platform,
      strategy,
      selectedLanguage,
    ]
  );

  const excludedTags = useMemo(
    () =>
      new Set(
        extractWords(exclude)
          .map(cleanTag)
          .filter(Boolean)
      ),
    [exclude]
  );

  const forcedTags = useMemo(
    () =>
      extractWords(include)
        .map(cleanTag)
        .filter(Boolean),
    [include]
  );

  const hashtags = useMemo(() => {
    const result = [];
    const seen = new Set();

    [
      ...forcedTags.map((tag) => ({
        tag,
        score: 90,
      })),
      ...candidates,
    ].forEach((item) => {
      if (!item.tag) return;

      if (excludedTags.has(item.tag)) {
        return;
      }

      if (seen.has(item.tag)) {
        return;
      }

      seen.add(item.tag);
      result.push(item);
    });

    return result.slice(0, count);
  }, [
    forcedTags,
    candidates,
    excludedTags,
    count,
  ]);

  const hashtagText = hashtags
    .map((item) => "#" + item.tag)
    .join(" ");

  const relevanceScore = hashtags.length
    ? Math.round(
        hashtags.reduce(
          (total, item) =>
            total + item.score,
          0
        ) / hashtags.length
      )
    : 0;

  async function copyText(value = hashtagText) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea =
        document.createElement("textarea");

      textarea.value = value;

      document.body.appendChild(textarea);

      textarea.select();

      document.execCommand("copy");

      textarea.remove();
    }

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  function downloadFile(csv = false) {
    const content = csv
      ? "Hashtag,Score\n" +
        hashtags
          .map(
            (item) =>
              `"${item.tag}",${item.score}`
          )
          .join("\n")
      : hashtagText;

    const blob = new Blob(
      [content],
      {
        type: csv
          ? "text/csv"
          : "text/plain",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download = csv
      ? "hashtags.csv"
      : "hashtags.txt";

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function randomize() {
    const platformNames =
      Object.keys(PLATFORMS);

    const strategies = [
      "Balanced",
      "Niche",
      "Reach",
      "Long-tail",
    ];

    const randomPlatform =
      platformNames[
        Math.floor(
          Math.random() *
            platformNames.length
        )
      ];

    const randomStrategy =
      strategies[
        Math.floor(
          Math.random() *
            strategies.length
        )
      ];

    setPlatform(randomPlatform);

    setStrategy(randomStrategy);

    setCount(
      PLATFORMS[randomPlatform].rec
    );
  }

  function resetTool() {
    setText(
      "digital marketing SEO Google Ads content strategy social media marketing"
    );

    setPlatform("Instagram");
    setLanguage("Auto");
    setStrategy("Balanced");
    setCount(15);
    setInclude("");
    setExclude("");
    setActiveTab("results");
  }

  const colors = {
    page: dark
      ? "#090d16"
      : "#f5f7fb",

    panel: dark
      ? "#111827"
      : "#ffffff",

    input: dark
      ? "#0f172a"
      : "#ffffff",

    border: dark
      ? "#263449"
      : "#e2e8f0",

    text: dark
      ? "#f8fafc"
      : "#172033",

    muted: "#64748b",
  };

  return (
    <div
      className="hashtag-generator"
      style={{
        background:
          colors.page,
        color: colors.text,
      }}
    >
      <div className="hg-shell">

        {/* HEADER */}

        <div className="hg-header">

          <div>
            <div className="hg-kicker">
              SMART SOCIAL TOOL
            </div>

            <div className="hg-title">
              Hashtag Generator
            </div>

            <div className="hg-subtitle">
              Create platform-aware,
              topic-relevant hashtag
              sets with niche and
              long-tail discovery.
            </div>
          </div>

          <div className="hg-header-actions">

            <button
              onClick={randomize}
              className="hg-random"
            >
              ✨ Smart Random
            </button>

            <button
              onClick={resetTool}
              className="hg-reset"
            >
              Reset
            </button>

          </div>
        </div>

        {/* MAIN GRID */}

        <div className="hg-grid">

          {/* LEFT PANEL */}

          <aside
            className="hg-panel"
            style={{
              background:
                colors.panel,
              borderColor:
                colors.border,
            }}
          >

            <h3>
              1. Describe your content
            </h3>

            <textarea
              value={text}
              onChange={(event) =>
                setText(
                  event.target.value
                )
              }
              placeholder="Paste a caption, topic, product description or keywords..."
              style={{
                background:
                  colors.input,
                color:
                  colors.text,
                borderColor:
                  colors.border,
              }}
            />

            <div className="hg-detected">
              <span>
                Detected language
              </span>

              <b>
                {detectedLanguage}
              </b>
            </div>

            <h3>
              2. Target platform
            </h3>

            <div className="hg-platforms">

              {Object.keys(
                PLATFORMS
              ).map((name) => (
                <button
                  key={name}
                  className={
                    platform === name
                      ? "selected"
                      : ""
                  }
                  onClick={() => {
                    setPlatform(name);

                    setCount(
                      Math.min(
                        count,
                        PLATFORMS[
                          name
                        ].max
                      )
                    );
                  }}
                >
                  {name}
                </button>
              ))}

            </div>

            <div className="hg-two">

              <label>
                Language

                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(
                      event.target.value
                    )
                  }
                  style={{
                    background:
                      colors.input,
                    color:
                      colors.text,
                    borderColor:
                      colors.border,
                  }}
                >
                  <option>
                    Auto
                  </option>

                  <option>
                    English
                  </option>

                  <option>
                    Urdu
                  </option>

                  <option>
                    Hindi
                  </option>

                  <option>
                    Arabic
                  </option>
                </select>
              </label>

              <label>
                Strategy

                <select
                  value={strategy}
                  onChange={(event) =>
                    setStrategy(
                      event.target.value
                    )
                  }
                  style={{
                    background:
                      colors.input,
                    color:
                      colors.text,
                    borderColor:
                      colors.border,
                  }}
                >
                  <option>
                    Balanced
                  </option>

                  <option>
                    Niche
                  </option>

                  <option>
                    Reach
                  </option>

                  <option>
                    Long-tail
                  </option>
                </select>
              </label>

            </div>

            <label className="hg-range-label">
              Number of hashtags:{" "}
              <b>{count}</b>
            </label>

            <input
              className="hg-range"
              type="range"
              min="3"
              max={
                PLATFORMS[
                  platform
                ].max
              }
              value={count}
              onChange={(event) =>
                setCount(
                  Number(
                    event.target.value
                  )
                )
              }
            />

            <div className="hg-limit">
              Recommended:{" "}
              <b>
                {
                  PLATFORMS[
                    platform
                  ].rec
                }
              </b>

              {" · "}

              Max:{" "}
              <b>
                {
                  PLATFORMS[
                    platform
                  ].max
                }
              </b>
            </div>

            <h3>
              3. Fine-tune
            </h3>

            <label>
              Must include

              <input
                value={include}
                onChange={(event) =>
                  setInclude(
                    event.target.value
                  )
                }
                placeholder="brandname campaign keyword"
                style={{
                  background:
                    colors.input,
                  color:
                    colors.text,
                  borderColor:
                    colors.border,
                }}
              />
            </label>

            <label>
              Exclude / avoid

              <input
                value={exclude}
                onChange={(event) =>
                  setExclude(
                    event.target.value
                  )
                }
                placeholder="spammy irrelevant tags"
                style={{
                  background:
                    colors.input,
                  color:
                    colors.text,
                  borderColor:
                    colors.border,
                }}
              />
            </label>

            <div className="hg-tip">
              <b>
                Low-competition
                discovery:
              </b>

              {" "}

              Long-tail combinations
              are added so the result
              is not just a list of
              obvious generic tags.
            </div>

          </aside>

          {/* RIGHT PANEL */}

          <main
            className="hg-panel hg-results"
            style={{
              background:
                colors.panel,
              borderColor:
                colors.border,
            }}
          >

            <div className="hg-result-header">

              <div>
                <h3>
                  Generated set
                </h3>

                <small>
                  {hashtags.length} hashtags
                  {" · "}
                  {platform}
                  {" · "}
                  {strategy}
                </small>
              </div>

              <div className="hg-score">
                <small>
                  Relevance
                </small>

                <b>
                  {relevanceScore}%
                </b>
              </div>

            </div>

            <div className="hg-tabs">

              <button
                className={
                  activeTab === "results"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "results"
                  )
                }
              >
                Hashtags
              </button>

              <button
                className={
                  activeTab === "analysis"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "analysis"
                  )
                }
              >
                Smart Analysis
              </button>

            </div>

            {activeTab ===
            "results" ? (
              <>

                <div className="hg-tags">

                  {hashtags.map(
                    (item, index) => (
                      <button
                        key={
                          item.tag +
                          index
                        }
                        className="hg-tag"
                        onClick={() =>
                          copyText(
                            "#" +
                              item.tag
                          )
                        }
                        title={
                          "Heuristic relevance: " +
                          item.score +
                          "/100"
                        }
                      >
                        #
                        {item.tag}

                        <small>
                          {item.score}
                        </small>
                      </button>
                    )
                  )}

                </div>

                <div
                  className="hg-copy-box"
                  style={{
                    background:
                      dark
                        ? "#182235"
                        : "#f8fafc",
                    borderColor:
                      colors.border,
                  }}
                >
                  {hashtagText ||
                    "No hashtags generated yet."}
                </div>

                <div className="hg-exports">

                  <button
                    className="primary"
                    onClick={() =>
                      copyText()
                    }
                  >
                    {copied
                      ? "✓ Copied"
                      : "Copy All Hashtags"}
                  </button>

                  <button
                    onClick={() =>
                      downloadFile(false)
                    }
                  >
                    Download TXT
                  </button>

                  <button
                    onClick={() =>
                      downloadFile(true)
                    }
                  >
                    Export CSV
                  </button>

                </div>

                <div className="hg-smart-box">

                  <span>
                    ◈
                  </span>

                  <div>
                    <b>
                      Smart mix engine
                    </b>

                    <p>
                      Combines content
                      keywords, niche
                      signals, long-tail
                      combinations and
                      platform-specific
                      discovery terms.
                    </p>
                  </div>

                </div>

              </>
            ) : (

              <div className="hg-analysis">

                <div className="hg-analysis-cards">

                  <div>
                    <small>
                      Content words
                    </small>

                    <b>
                      {
                        new Set(
                          extractWords(
                            text
                          )
                        ).size
                      }
                    </b>
                  </div>

                  <div>
                    <small>
                      Candidates
                    </small>

                    <b>
                      {candidates.length}
                    </b>
                  </div>

                  <div>
                    <small>
                      Selected
                    </small>

                    <b>
                      {hashtags.length}
                    </b>
                  </div>

                  <div>
                    <small>
                      Language
                    </small>

                    <b>
                      {detectedLanguage}
                    </b>
                  </div>

                </div>

                <div className="hg-analysis-rows">

                  <p>
                    <span>
                      Platform
                    </span>

                    <b>
                      {platform}
                    </b>
                  </p>

                  <p>
                    <span>
                      Strategy
                    </span>

                    <b>
                      {strategy}
                    </b>
                  </p>

                  <p>
                    <span>
                      Recommended
                      density
                    </span>

                    <b>
                      {
                        PLATFORMS[
                          platform
                        ].rec
                      }{" "}
                      tags
                    </b>
                  </p>

                  <p>
                    <span>
                      Excluded tags
                    </span>

                    <b>
                      {
                        excludedTags.size
                      }
                    </b>
                  </p>

                </div>

                <div className="hg-note">
                  Scores are heuristic
                  relevance scores based
                  on your content. They
                  are not live popularity
                  or real-time trend
                  measurements.
                </div>

              </div>
            )}

          </main>

        </div>
      </div>

      <style jsx>{`

        .hashtag-generator {
          width: 100%;
          min-height: 100%;
          padding: 20px;
          box-sizing: border-box;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .hg-shell {
          max-width: 1450px;
          margin: 0 auto;
        }

        .hg-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 18px;
        }

        .hg-kicker {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #6366f1;
          margin-bottom: 5px;
        }

        .hg-title {
          font-size: 27px;
          font-weight: 850;
          line-height: 1.1;
        }

        .hg-subtitle {
          margin-top: 6px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }

        .hg-header-actions {
          display: flex;
          gap: 8px;
        }

        .hg-header-actions button,
        .hg-exports button {
          border: 0;
          border-radius: 9px;
          padding: 10px 14px;
          cursor: pointer;
          font-weight: 750;
          font-size: 12px;
        }

        .hg-random {
          background: #eef2ff;
          color: #4338ca;
        }

        .hg-reset {
          background: #fff1f2;
          color: #be123c;
        }

        .hg-grid {
          display: grid;
          grid-template-columns:
            minmax(280px, 360px)
            minmax(0, 1fr);
          gap: 18px;
        }

        .hg-panel {
          border: 1px solid;
          border-radius: 16px;
          padding: 18px;
          box-sizing: border-box;
        }

        .hg-panel h3 {
          font-size: 14px;
          margin: 0 0 9px;
          font-weight: 850;
        }

        .hg-panel textarea {
          width: 100%;
          min-height: 155px;
          resize: vertical;
          border: 1px solid;
          border-radius: 10px;
          padding: 11px;
          box-sizing: border-box;
          font: 13px inherit;
          line-height: 1.55;
          outline: none;
        }

        .hg-detected {
          display: flex;
          justify-content: space-between;
          padding: 9px 10px;
          margin: 8px 0 18px;
          border-radius: 8px;
          background: #6366f114;
          color: #6366f1;
          font-size: 11px;
        }

        .hg-platforms {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 7px;
          margin-bottom: 15px;
        }

        .hg-platforms button {
          border: 1px solid #dbe1ea;
          background: transparent;
          color: inherit;
          padding: 9px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .hg-platforms button.selected {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #fff;
        }

        .hg-two {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 9px;
        }

        .hg-panel label {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 750;
          margin: 11px 0 6px;
        }

        .hg-panel select,
        .hg-panel input {
          width: 100%;
          height: 39px;
          box-sizing: border-box;
          border: 1px solid;
          border-radius: 8px;
          padding: 8px;
          font: 12px inherit;
          outline: none;
          margin-top: 5px;
        }

        .hg-range {
          width: 100%;
          accent-color: #4f46e5;
          cursor: pointer;
        }

        .hg-range-label {
          margin-bottom: 0 !important;
        }

        .hg-limit {
          font-size: 10px;
          color: #64748b;
          margin: 3px 0 15px;
        }

        .hg-tip {
          margin-top: 15px;
          padding: 11px;
          border-radius: 9px;
          background: #10b98114;
          color: #047857;
          font-size: 11px;
          line-height: 1.5;
        }

        .hg-result-header {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .hg-result-header h3 {
          margin: 0;
          font-size: 14px;
        }

        .hg-result-header small {
          color: #64748b;
          font-size: 11px;
        }

        .hg-score {
          text-align: right;
        }

        .hg-score b {
          display: block;
          font-size: 25px;
          color: #10b981;
          line-height: 1.1;
          margin-top: 2px;
        }

        .hg-tabs {
          display: flex;
          gap: 18px;
          border-bottom: 1px solid #e2e8f0;
          margin-top: 15px;
        }

        .hg-tabs button {
          border: 0;
          background: transparent;
          color: #64748b;
          padding: 9px 2px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 750;
          border-bottom: 2px solid transparent;
        }

        .hg-tabs button.active {
          color: #4f46e5;
          border-color: #4f46e5;
        }

        .hg-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 18px 0;
          min-height: 130px;
          align-content: flex-start;
        }

        .hg-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #dbe1ea;
          background: transparent;
          color: #4f46e5;
          border-radius: 999px;
          padding: 8px 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .hg-tag:hover {
          background: #6366f10d;
          border-color: #818cf8;
        }

        .hg-tag small {
          color: #94a3b8;
          font-size: 9px;
        }

        .hg-copy-box {
          border: 1px solid;
          border-radius: 10px;
          padding: 12px;
          font-size: 12px;
          line-height: 1.65;
          word-break: break-word;
          min-height: 60px;
        }

        .hg-exports {
          display: grid;
          grid-template-columns:
            1.4fr 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }

        .hg-exports button {
          background: #eef2ff;
          color: #4338ca;
        }

        .hg-exports .primary {
          background: #4f46e5;
          color: #fff;
        }

        .hg-smart-box {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          padding: 12px;
          border-radius: 10px;
          background: #f59e0b17;
        }

        .hg-smart-box > span {
          font-size: 20px;
          color: #d97706;
        }

        .hg-smart-box p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .hg-analysis-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
        }

        .hg-analysis-cards div {
          min-width: 120px;
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .hg-analysis-cards small {
          display: block;
          color: #64748b;
          font-size: 10px;
        }

        .hg-analysis-cards b {
          font-size: 19px;
        }

        .hg-analysis-rows {
          margin-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .hg-analysis-rows p {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 2px;
          margin: 0;
          font-size: 12px;
        }

        .hg-analysis-rows span {
          color: #64748b;
        }

        .hg-note {
          margin-top: 14px;
          padding: 11px;
          border-radius: 9px;
          background: #3b82f614;
          color: #2563eb;
          font-size: 11px;
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .hg-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .hashtag-generator {
            padding: 10px;
          }

          .hg-header {
            flex-direction: column;
            align-items: stretch;
          }

          .hg-header-actions {
            width: 100%;
          }

          .hg-header-actions button {
            flex: 1;
          }

          .hg-panel {
            padding: 13px;
            border-radius: 12px;
          }

          .hg-two,
          .hg-exports {
            grid-template-columns: 1fr;
          }

          .hg-title {
            font-size: 23px;
          }

          .hg-subtitle {
            font-size: 12px;
          }

          .hg-platforms {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

      `}</style>
    </div>
  );
}
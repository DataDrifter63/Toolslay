"use client";

import React from "react";

const INDUSTRIES = {
  General: {
    roots: ["nova", "forge", "peak", "origin", "bright", "vertex", "craft", "north", "prime", "pulse"],
    suffixes: ["Co", "Works", "Group", "Studio", "Labs", "House", "Collective", "Hub"],
  },
  Technology: {
    roots: ["byte", "cloud", "logic", "pixel", "quant", "cyber", "data", "stack", "sync", "code"],
    suffixes: ["Labs", "Systems", "Tech", "Works", "Logic", "Cloud", "Digital", "AI"],
  },
  Marketing: {
    roots: ["brand", "spark", "reach", "social", "growth", "viral", "signal", "media", "impact", "story"],
    suffixes: ["Media", "Studio", "Agency", "Works", "Creative", "Digital", "House", "Collective"],
  },
  Fashion: {
    roots: ["mode", "velvet", "luxe", "silk", "atelier", "vogue", "urban", "chic", "aura", "couture"],
    suffixes: ["Studio", "House", "Atelier", "Label", "Wear", "Collective", "Co", "London"],
  },
  Food: {
    roots: ["taste", "harvest", "spice", "bloom", "crumb", "feast", "fresh", "basil", "roast", "savory"],
    suffixes: ["Kitchen", "House", "Cafe", "Foods", "Table", "Co", "Market", "Bites"],
  },
  Finance: {
    roots: ["capital", "wealth", "ledger", "trust", "prime", "vault", "fund", "asset", "crest", "yield"],
    suffixes: ["Capital", "Partners", "Advisors", "Group", "Financial", "Wealth", "Holdings", "Fund"],
  },
  Health: {
    roots: ["vital", "well", "care", "pulse", "pure", "heal", "life", "med", "balance", "renew"],
    suffixes: ["Health", "Care", "Wellness", "Clinic", "Labs", "Medical", "Life", "Center"],
  },
  RealEstate: {
    roots: ["estate", "urban", "stone", "oak", "crest", "prime", "haven", "brick", "metro", "harbor"],
    suffixes: ["Properties", "Realty", "Estates", "Homes", "Group", "Living", "Developments", "Partners"],
  },
  Education: {
    roots: ["learn", "bright", "mind", "skill", "academy", "scholar", "wisdom", "mentor", "future", "study"],
    suffixes: ["Academy", "Learning", "Institute", "Labs", "School", "Education", "Hub", "Works"],
  },
  Beauty: {
    roots: ["glow", "pure", "luxe", "bloom", "skin", "silk", "rose", "aura", "velvet", "bliss"],
    suffixes: ["Beauty", "Studio", "Skin", "Wellness", "Salon", "House", "Care", "Co"],
  },
  Construction: {
    roots: ["build", "stone", "iron", "solid", "brick", "forge", "craft", "summit", "urban", "terra"],
    suffixes: ["Build", "Construction", "Works", "Developments", "Group", "Builders", "Projects", "Co"],
  },
};

const STYLE_WORDS = {
  Modern: ["nova", "vanta", "nexa", "vero", "luma", "zento", "aero", "vexa", "nivo", "orbi"],
  Premium: ["prime", "royal", "velvet", "sterling", "grand", "elite", "crest", "monarch", "luxe", "regal"],
  Professional: ["summit", "apex", "north", "vertex", "anchor", "clear", "core", "united", "global", "capital"],
  Creative: ["spark", "mosaic", "canvas", "bloom", "orbit", "echo", "ember", "pixel", "story", "wild"],
  Playful: ["poppy", "buzzy", "zippy", "mango", "peppy", "jolly", "happy", "bingo", "doodle", "berry"],
  Minimalist: ["one", "mono", "pure", "line", "form", "base", "arc", "mark", "core", "plain"],
};

const STRATEGIES = [
  "Compound",
  "Portmanteau",
  "Invented",
  "Premium",
  "Alliteration",
  "Founder",
  "Minimal",
];

function cleanWord(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function titleCase(value) {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function hashString(text) {
  var hash = 0;
  for (var i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededIndex(seed, length) {
  if (!length) return 0;
  return hashString(seed) % length;
}

function uniquePush(list, value) {
  if (!value) return;
  var normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  var exists = list.some(function (item) {
    return item.normalized === normalized;
  });

  if (!exists) {
    list.push({
      value: value,
      normalized: normalized,
    });
  }
}

function randomFrom(list, seed) {
  if (!list || !list.length) return "";
  return list[seededIndex(seed, list.length)];
}

function pronounceability(name) {
  var word = name.toLowerCase().replace(/[^a-z]/g, "");

  if (!word) return 0;

  var score = 100;

  if (word.length < 4) score -= 8;
  if (word.length > 14) score -= 18;

  var consonantRuns = word.match(/[^aeiouy]{4,}/g);
  var vowelRuns = word.match(/[aeiouy]{4,}/g);

  if (consonantRuns) score -= consonantRuns.length * 12;
  if (vowelRuns) score -= vowelRuns.length * 7;

  if (/(.)\1\1/.test(word)) score -= 15;

  return Math.max(45, Math.min(99, score));
}

function brandScore(name, strategy, keywords) {
  var clean = name.replace(/[^a-zA-Z]/g, "");
  var score = 62;

  if (clean.length >= 5 && clean.length <= 11) score += 15;
  else if (clean.length >= 4 && clean.length <= 14) score += 8;
  else score -= 5;

  score += Math.round(pronounceability(clean) * 0.18);

  if (strategy === "Invented") score += 5;
  if (strategy === "Minimal") score += 6;
  if (strategy === "Premium") score += 4;

  var keywordList = keywords
    .split(",")
    .map(cleanWord)
    .filter(Boolean);

  keywordList.forEach(function (keyword) {
    if (clean.toLowerCase().indexOf(keyword) !== -1) {
      score += 5;
    }
  });

  return Math.max(50, Math.min(99, score));
}

function makeDomain(name, extension) {
  var slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 50);

  return slug + extension;
}

function makeName(options, index) {
  var industry = INDUSTRIES[options.industry] || INDUSTRIES.General;
  var stylePool = STYLE_WORDS[options.style] || STYLE_WORDS.Modern;

  var keywordList = options.keywords
    .split(",")
    .map(cleanWord)
    .filter(Boolean);

  var founder = cleanWord(options.founder);
  var seed = [
    options.keywords,
    options.industry,
    options.style,
    options.tone,
    index,
    Date.now(),
  ].join("|");

  var root = randomFrom(
    industry.roots.concat(stylePool),
    seed + "root"
  );

  var root2 = randomFrom(
    industry.roots.concat(stylePool),
    seed + "root2"
  );

  var suffix = randomFrom(
    industry.suffixes,
    seed + "suffix"
  );

  var keyword =
    keywordList.length > 0
      ? randomFrom(keywordList, seed + "keyword")
      : root;

  var strategy =
    STRATEGIES[index % STRATEGIES.length];

  var name = "";

  if (strategy === "Compound") {
    name =
      titleCase(keyword) +
      titleCase(
        randomFrom(
          stylePool.concat(industry.roots),
          seed + "compound"
        )
      );
  }

  if (strategy === "Portmanteau") {
    var first = keyword.slice(0, Math.max(3, Math.ceil(keyword.length * 0.55)));
    var second = root2.slice(Math.max(1, Math.floor(root2.length * 0.35)));
    name = titleCase(first + second);
  }

  if (strategy === "Invented") {
    var a = randomFrom(stylePool, seed + "a");
    var b = randomFrom(stylePool.concat(industry.roots), seed + "b");
    name = titleCase(
      a.slice(0, Math.ceil(a.length / 2)) +
        b.slice(Math.floor(b.length / 3))
    );
  }

  if (strategy === "Premium") {
    var premiumWord = randomFrom(
      ["Prime", "Sterling", "Crest", "Monarch", "Velvet", "Aurex", "Grand", "Luxe"],
      seed + "premium"
    );

    name =
      premiumWord +
      " " +
      titleCase(
        keyword || randomFrom(industry.roots, seed + "premiumroot")
      );
  }

  if (strategy === "Alliteration") {
    var allRoot = randomFrom(
      industry.roots.concat(stylePool),
      seed + "all"
    );

    var firstLetter = allRoot.charAt(0);

    var matching = industry.roots
      .concat(stylePool)
      .filter(function (word) {
        return word.charAt(0) === firstLetter;
      });

    var secondWord = randomFrom(
      matching.length ? matching : industry.roots,
      seed + "all2"
    );

    name =
      titleCase(allRoot) +
      " " +
      titleCase(secondWord);
  }

  if (strategy === "Founder") {
    if (founder) {
      name =
        titleCase(founder) +
        " " +
        titleCase(
          randomFrom(
            industry.suffixes,
            seed + "founder"
          )
        );
    } else {
      name =
        titleCase(keyword) +
        " " +
        titleCase(suffix);
    }
  }

  if (strategy === "Minimal") {
    var minimal =
      keyword ||
      randomFrom(stylePool, seed + "minimal");

    name = titleCase(
      minimal.slice(0, 3) +
        randomFrom(
          ["a", "o", "i", "x", "y", "e"],
          seed + "vowel"
        ) +
        randomFrom(
          ["ra", "vo", "na", "ly", "zen", "xo", "va"],
          seed + "ending"
        )
    );
  }

  if (options.structure === "One Word") {
    name = name.replace(/\s+/g, "");
  }

  if (options.structure === "Two Words") {
    var parts = name.split(" ");

    if (parts.length === 1) {
      name =
        titleCase(parts[0]) +
        " " +
        titleCase(
          randomFrom(
            industry.suffixes,
            seed + "twoword"
          )
        );
    } else {
      name = parts.slice(0, 2).join(" ");
    }
  }

  if (options.location) {
    name += " " + titleCase(options.location.trim());
  }

  return {
    name: name,
    strategy: strategy,
  };
}

function generateNames(options) {
  var results = [];
  var attempts = 0;

  while (
    results.length < options.count &&
    attempts < options.count * 15
  ) {
    var generated = makeName(
      options,
      attempts
    );

    var value = generated.name
      .replace(/\s+/g, " ")
      .trim();

    var normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    var avoidList = options.avoid
      .split(",")
      .map(cleanWord)
      .filter(Boolean);

    var blocked = avoidList.some(function (word) {
      return normalized.indexOf(word) !== -1;
    });

    if (
      normalized.length >= 3 &&
      !blocked &&
      !results.some(function (item) {
        return item.normalized === normalized;
      })
    ) {
      var score = brandScore(
        value,
        generated.strategy,
        options.keywords
      );

      results.push({
        id: normalized + "-" + attempts,
        name: value,
        normalized: normalized,
        strategy: generated.strategy,
        score: score,
        pronounceability: pronounceability(normalized),
        domainCom: makeDomain(value, ".com"),
        domainCo: makeDomain(value, ".co"),
        domainAi: makeDomain(value, ".ai"),
        domainIo: makeDomain(value, ".io"),
      });
    }

    attempts += 1;
  }

  return results.sort(function (a, b) {
    return b.score - a.score;
  });
}

class BusinessNameGenerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      keywords: "",
      industry: "Technology",
      style: "Modern",
      tone: "Balanced",
      structure: "Any",
      founder: "",
      location: "",
      avoid: "",
      count: 24,
      extension: ".com",
      results: [],
      favorites: [],
      generated: false,
      copied: false,
      filter: "All",
    };

    this.generate = this.generate.bind(this);
    this.reset = this.reset.bind(this);
    this.copyAll = this.copyAll.bind(this);
    this.toggleFavorite = this.toggleFavorite.bind(this);
  }

  generate() {
    var options = {
      keywords: this.state.keywords,
      industry: this.state.industry,
      style: this.state.style,
      tone: this.state.tone,
      structure: this.state.structure,
      founder: this.state.founder,
      location: this.state.location,
      avoid: this.state.avoid,
      count: Number(this.state.count),
    };

    var results = generateNames(options);

    this.setState({
      results: results,
      generated: true,
      copied: false,
    });
  }

  reset() {
    this.setState({
      keywords: "",
      industry: "Technology",
      style: "Modern",
      tone: "Balanced",
      structure: "Any",
      founder: "",
      location: "",
      avoid: "",
      count: 24,
      extension: ".com",
      results: [],
      favorites: [],
      generated: false,
      copied: false,
      filter: "All",
    });
  }

  toggleFavorite(id) {
    var current = this.state.favorites;
    var exists = current.indexOf(id) !== -1;

    this.setState({
      favorites: exists
        ? current.filter(function (item) {
            return item !== id;
          })
        : current.concat(id),
    });
  }

  copyAll() {
    var source =
      this.state.favorites.length > 0
        ? this.state.results.filter(
            function (item) {
              return this.state.favorites.indexOf(item.id) !== -1;
            }.bind(this)
          )
        : this.state.results;

    var text = source
      .map(function (item) {
        return (
          item.name +
          " — " +
          item.score +
          "/100 — " +
          makeDomain(item.name, this.state.extension)
        );
      }.bind(this))
      .join("\n");

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard
    ) {
      navigator.clipboard.writeText(text).then(
        function () {
          this.setState({ copied: true });

          setTimeout(
            function () {
              this.setState({ copied: false });
            }.bind(this),
            1500
          );
        }.bind(this)
      );
    }
  }

  render() {
    var self = this;

    var filtered =
      this.state.filter === "All"
        ? this.state.results
        : this.state.results.filter(
            function (item) {
              return item.strategy === self.state.filter;
            }
          );

    var favoriteResults =
      this.state.results.filter(function (item) {
        return self.state.favorites.indexOf(item.id) !== -1;
      });

    var styles = `
      .bng-tool {
        --bng-text:#111827;
        --bng-muted:#667085;
        --bng-border:#e4e7ec;
        --bng-card:#ffffff;
        --bng-soft:#f7f8fa;
        --bng-primary:#635bff;
        --bng-primary-soft:#efedff;
        width:100%;
        color:var(--bng-text);
        font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }

      .bng-tool * {
        box-sizing:border-box;
      }

      .bng-wrap {
        width:100%;
        max-width:1180px;
        margin:0 auto;
      }

      .bng-hero {
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        gap:25px;
        margin-bottom:22px;
      }

      .bng-kicker {
        color:var(--bng-primary);
        font-size:10px;
        font-weight:800;
        letter-spacing:.15em;
        text-transform:uppercase;
      }

      .bng-hero h1 {
        margin:7px 0 0;
        font-size:clamp(30px,4vw,44px);
        line-height:1;
        letter-spacing:-.055em;
      }

      .bng-hero p {
        max-width:690px;
        margin:10px 0 0;
        color:var(--bng-muted);
        font-size:13px;
        line-height:1.65;
      }

      .bng-badge {
        flex:none;
        padding:9px 12px;
        border:1px solid var(--bng-border);
        border-radius:999px;
        background:var(--bng-card);
        color:var(--bng-muted);
        font-size:10px;
        font-weight:700;
      }

      .bng-layout {
        display:grid;
        grid-template-columns:330px minmax(0,1fr);
        gap:18px;
        align-items:start;
      }

      .bng-panel {
        border:1px solid var(--bng-border);
        border-radius:17px;
        background:var(--bng-card);
        box-shadow:0 8px 30px rgba(16,24,40,.035);
      }

      .bng-controls {
        padding:20px;
        position:sticky;
        top:20px;
      }

      .bng-control-title {
        font-size:17px;
        font-weight:800;
        letter-spacing:-.03em;
      }

      .bng-control-subtitle {
        margin-top:5px;
        color:var(--bng-muted);
        font-size:10px;
        line-height:1.6;
      }

      .bng-label {
        display:block;
        margin:16px 0 7px;
        font-size:10px;
        font-weight:800;
      }

      .bng-input,
      .bng-select {
        width:100%;
        height:42px;
        padding:0 11px;
        border:1px solid var(--bng-border);
        border-radius:9px;
        outline:none;
        background:#fff;
        color:var(--bng-text);
        font:inherit;
        font-size:11px;
      }

      .bng-input:focus,
      .bng-select:focus {
        border-color:var(--bng-primary);
        box-shadow:0 0 0 3px rgba(99,91,255,.1);
      }

      .bng-textarea {
        min-height:76px;
        padding-top:11px;
        resize:vertical;
      }

      .bng-grid-two {
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:8px;
      }

      .bng-range-row {
        display:flex;
        align-items:center;
        gap:10px;
      }

      .bng-range {
        width:100%;
        accent-color:var(--bng-primary);
      }

      .bng-range-value {
        min-width:32px;
        color:var(--bng-primary);
        font-size:11px;
        font-weight:800;
        text-align:right;
      }

      .bng-generate {
        width:100%;
        height:44px;
        margin-top:18px;
        border:0;
        border-radius:10px;
        background:var(--bng-primary);
        color:#fff;
        cursor:pointer;
        font:inherit;
        font-size:11px;
        font-weight:800;
      }

      .bng-generate:hover {
        filter:brightness(.96);
      }

      .bng-reset {
        width:100%;
        height:38px;
        margin-top:8px;
        border:1px solid var(--bng-border);
        border-radius:9px;
        background:transparent;
        color:var(--bng-muted);
        cursor:pointer;
        font:inherit;
        font-size:10px;
        font-weight:700;
      }

      .bng-main {
        min-width:0;
      }

      .bng-toolbar {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        margin-bottom:12px;
      }

      .bng-result-count {
        color:var(--bng-muted);
        font-size:10px;
      }

      .bng-toolbar-actions {
        display:flex;
        gap:7px;
      }

      .bng-small-btn {
        height:34px;
        padding:0 11px;
        border:1px solid var(--bng-border);
        border-radius:8px;
        background:#fff;
        color:var(--bng-text);
        cursor:pointer;
        font:inherit;
        font-size:9px;
        font-weight:800;
      }

      .bng-filter {
        display:flex;
        gap:6px;
        overflow:auto;
        padding-bottom:9px;
        margin-bottom:3px;
      }

      .bng-filter button {
        flex:none;
        padding:7px 10px;
        border:1px solid var(--bng-border);
        border-radius:999px;
        background:#fff;
        color:var(--bng-muted);
        cursor:pointer;
        font:inherit;
        font-size:9px;
        font-weight:700;
      }

      .bng-filter button.active {
        border-color:var(--bng-primary);
        background:var(--bng-primary-soft);
        color:var(--bng-primary);
      }

      .bng-results {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px;
      }

      .bng-card {
        position:relative;
        padding:17px;
        border:1px solid var(--bng-border);
        border-radius:13px;
        background:var(--bng-card);
        transition:.18s ease;
      }

      .bng-card:hover {
        transform:translateY(-1px);
        box-shadow:0 8px 25px rgba(16,24,40,.06);
      }

      .bng-card-top {
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:10px;
      }

      .bng-name {
        font-size:20px;
        font-weight:850;
        letter-spacing:-.045em;
        word-break:break-word;
      }

      .bng-heart {
        flex:none;
        width:30px;
        height:30px;
        border:1px solid var(--bng-border);
        border-radius:8px;
        background:#fff;
        color:#98a2b3;
        cursor:pointer;
        font-size:14px;
      }

      .bng-heart.active {
        border-color:#ffc2ce;
        background:#fff2f4;
        color:#e11d48;
      }

      .bng-meta {
        display:flex;
        flex-wrap:wrap;
        gap:5px;
        margin-top:10px;
      }

      .bng-tag {
        padding:5px 7px;
        border-radius:5px;
        background:var(--bng-soft);
        color:var(--bng-muted);
        font-size:8px;
        font-weight:800;
        text-transform:uppercase;
        letter-spacing:.04em;
      }

      .bng-score {
        color:var(--bng-primary);
      }

      .bng-domain-box {
        margin-top:14px;
        padding:9px 10px;
        border:1px solid var(--bng-border);
        border-radius:8px;
        background:var(--bng-soft);
      }

      .bng-domain-label {
        display:block;
        color:var(--bng-muted);
        font-size:7px;
        font-weight:800;
        letter-spacing:.1em;
        text-transform:uppercase;
      }

      .bng-domain {
        display:block;
        margin-top:4px;
        font-size:10px;
        font-weight:750;
        word-break:break-all;
      }

      .bng-domain-note {
        display:block;
        margin-top:3px;
        color:var(--bng-muted);
        font-size:7px;
      }

      .bng-card-footer {
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-top:12px;
      }

      .bng-pronounce {
        color:var(--bng-muted);
        font-size:8px;
      }

      .bng-copy {
        padding:0;
        border:0;
        background:transparent;
        color:var(--bng-primary);
        cursor:pointer;
        font:inherit;
        font-size:9px;
        font-weight:800;
      }

      .bng-empty {
        padding:65px 25px;
        border:1px dashed var(--bng-border);
        border-radius:15px;
        background:var(--bng-card);
        text-align:center;
      }

      .bng-empty-icon {
        display:grid;
        place-items:center;
        width:52px;
        height:52px;
        margin:0 auto 13px;
        border-radius:14px;
        background:var(--bng-primary-soft);
        color:var(--bng-primary);
        font-size:21px;
      }

      .bng-empty h2 {
        margin:0;
        font-size:19px;
      }

      .bng-empty p {
        max-width:400px;
        margin:7px auto 0;
        color:var(--bng-muted);
        font-size:10px;
        line-height:1.65;
      }

      .bng-shortlist {
        margin-top:14px;
        padding:14px;
        border:1px solid var(--bng-border);
        border-radius:12px;
        background:var(--bng-soft);
      }

      .bng-shortlist-head {
        display:flex;
        justify-content:space-between;
        gap:10px;
        align-items:center;
      }

      .bng-shortlist-title {
        font-size:11px;
        font-weight:800;
      }

      .bng-shortlist-list {
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin-top:9px;
      }

      .bng-short-name {
        padding:6px 8px;
        border:1px solid var(--bng-border);
        border-radius:7px;
        background:#fff;
        font-size:8px;
        font-weight:700;
      }

      .bng-disclaimer {
        margin-top:12px;
        color:var(--bng-muted);
        font-size:8px;
        line-height:1.6;
      }

      @media(max-width:900px) {
        .bng-layout {
          grid-template-columns:1fr;
        }

        .bng-controls {
          position:static;
        }

        .bng-results {
          grid-template-columns:1fr 1fr;
        }
      }

      @media(max-width:600px) {
        .bng-hero {
          flex-direction:column;
          align-items:flex-start;
        }

        .bng-badge {
          display:none;
        }

        .bng-results {
          grid-template-columns:1fr;
        }

        .bng-grid-two {
          grid-template-columns:1fr;
        }

        .bng-toolbar {
          align-items:flex-start;
          flex-direction:column;
        }

        .bng-toolbar-actions {
          width:100%;
        }

        .bng-small-btn {
          flex:1;
        }
      }

      .dark .bng-tool,
      body.dark .bng-tool,
      html.dark .bng-tool {
        --bng-text:#f2f4f7;
        --bng-muted:#98a2b3;
        --bng-border:#2d3442;
        --bng-card:#151922;
        --bng-soft:#10141c;
        --bng-primary:#8078ff;
        --bng-primary-soft:#211e45;
      }

      .dark .bng-input,
      .dark .bng-select,
      .dark .bng-small-btn,
      .dark .bng-filter button,
      .dark .bng-heart,
      .dark .bng-short-name,
      body.dark .bng-input,
      body.dark .bng-select,
      body.dark .bng-small-btn,
      body.dark .bng-filter button,
      body.dark .bng-heart,
      body.dark .bng-short-name,
      html.dark .bng-input,
      html.dark .bng-select,
      html.dark .bng-small-btn,
      html.dark .bng-filter button,
      html.dark .bng-heart,
      html.dark .bng-short-name {
        background:var(--bng-card);
        color:var(--bng-text);
      }
    `;

    var filterButtons = ["All"].concat(STRATEGIES);

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "div",
        { className: "bng-tool" },
        React.createElement(
          "div",
          { className: "bng-wrap" },

          React.createElement(
            "div",
            { className: "bng-hero" },
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { className: "bng-kicker" },
                "BRAND NAMING TOOL"
              ),
              React.createElement(
                "h1",
                null,
                "Business Name Generator"
              ),
              React.createElement(
                "p",
                null,
                "Create memorable, brandable business names using multiple naming strategies — then score, shortlist and compare your strongest ideas."
              )
            ),
            React.createElement(
              "div",
              { className: "bng-badge" },
              "100% Browser-Based"
            )
          ),

          React.createElement(
            "div",
            { className: "bng-layout" },

            React.createElement(
              "div",
              { className: "bng-panel bng-controls" },

              React.createElement(
                "div",
                { className: "bng-control-title" },
                "Build your naming brief"
              ),

              React.createElement(
                "div",
                { className: "bng-control-subtitle" },
                "The more specific your inputs, the more targeted your names become."
              ),

              React.createElement(
                "label",
                { className: "bng-label" },
                "Keywords / ideas"
              ),

              React.createElement("textarea", {
                className: "bng-input bng-textarea",
                placeholder: "e.g. cloud, speed, security",
                value: this.state.keywords,
                onChange: function (e) {
                  self.setState({
                    keywords: e.target.value,
                  });
                },
              }),

              React.createElement(
                "div",
                { className: "bng-grid-two" },

                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "label",
                    { className: "bng-label" },
                    "Industry"
                  ),
                  React.createElement(
                    "select",
                    {
                      className: "bng-select",
                      value: this.state.industry,
                      onChange: function (e) {
                        self.setState({
                          industry: e.target.value,
                        });
                      },
                    },
                    Object.keys(INDUSTRIES).map(function (item) {
                      return React.createElement(
                        "option",
                        {
                          value: item,
                          key: item,
                        },
                        item
                      );
                    })
                  )
                ),

                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "label",
                    { className: "bng-label" },
                    "Style"
                  ),
                  React.createElement(
                    "select",
                    {
                      className: "bng-select",
                      value: this.state.style,
                      onChange: function (e) {
                        self.setState({
                          style: e.target.value,
                        });
                      },
                    },
                    Object.keys(STYLE_WORDS).map(function (item) {
                      return React.createElement(
                        "option",
                        {
                          value: item,
                          key: item,
                        },
                        item
                      );
                    })
                  )
                )
              ),

              React.createElement(
                "div",
                { className: "bng-grid-two" },

                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "label",
                    { className: "bng-label" },
                    "Tone"
                  ),
                  React.createElement(
                    "select",
                    {
                      className: "bng-select",
                      value: this.state.tone,
                      onChange: function (e) {
                        self.setState({
                          tone: e.target.value,
                        });
                      },
                    },
                    ["Balanced", "Bold", "Friendly", "Trustworthy", "Luxury"].map(function (item) {
                      return React.createElement(
                        "option",
                        {
                          value: item,
                          key: item,
                        },
                        item
                      );
                    })
                  )
                ),

                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "label",
                    { className: "bng-label" },
                    "Structure"
                  ),
                  React.createElement(
                    "select",
                    {
                      className: "bng-select",
                      value: this.state.structure,
                      onChange: function (e) {
                        self.setState({
                          structure: e.target.value,
                        });
                      },
                    },
                    ["Any", "One Word", "Two Words"].map(function (item) {
                      return React.createElement(
                        "option",
                        {
                          value: item,
                          key: item,
                        },
                        item
                      );
                    })
                  )
                )
              ),

              React.createElement(
                "label",
                { className: "bng-label" },
                "Founder name (optional)"
              ),

              React.createElement("input", {
                className: "bng-input",
                placeholder: "e.g. Alex",
                value: this.state.founder,
                onChange: function (e) {
                  self.setState({
                    founder: e.target.value,
                  });
                },
              }),

              React.createElement(
                "div",
                { className: "bng-grid-two" },

                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "label",
                    { className: "bng-label" },
                    "Location cue"
                  ),
                  React.createElement("input", {
                    className: "bng-input",
                    placeholder: "e.g. London",
                    value: this.state.location,
                    onChange: function (e) {
                      self.setState({
                        location: e.target.value,
                      });
                    },
                  })
                ),

                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "label",
                    { className: "bng-label" },
                    "Avoid words"
                  ),
                  React.createElement("input", {
                    className: "bng-input",
                    placeholder: "e.g. shop, online",
                    value: this.state.avoid,
                    onChange: function (e) {
                      self.setState({
                        avoid: e.target.value,
                      });
                    },
                  })
                )
              ),

              React.createElement(
                "label",
                { className: "bng-label" },
                "Names per generation"
              ),

              React.createElement(
                "div",
                { className: "bng-range-row" },
                React.createElement("input", {
                  className: "bng-range",
                  type: "range",
                  min: "8",
                  max: "60",
                  step: "4",
                  value: this.state.count,
                  onChange: function (e) {
                    self.setState({
                      count: Number(e.target.value),
                    });
                  },
                }),
                React.createElement(
                  "span",
                  { className: "bng-range-value" },
                  this.state.count
                )
              ),

              React.createElement(
                "label",
                { className: "bng-label" },
                "Domain hint"
              ),

              React.createElement(
                "select",
                {
                  className: "bng-select",
                  value: this.state.extension,
                  onChange: function (e) {
                    self.setState({
                      extension: e.target.value,
                    });
                  },
                },
                [".com", ".co", ".ai", ".io", ".app"].map(function (item) {
                  return React.createElement(
                    "option",
                    {
                      value: item,
                      key: item,
                    },
                    item
                  );
                })
              ),

              React.createElement(
                "button",
                {
                  type: "button",
                  className: "bng-generate",
                  onClick: this.generate,
                },
                "✦ Generate Business Names"
              ),

              React.createElement(
                "button",
                {
                  type: "button",
                  className: "bng-reset",
                  onClick: this.reset,
                },
                "Reset Generator"
              )
            ),

            React.createElement(
              "div",
              { className: "bng-main" },

              !this.state.generated
                ? React.createElement(
                    "div",
                    { className: "bng-empty" },
                    React.createElement(
                      "div",
                      { className: "bng-empty-icon" },
                      "✦"
                    ),
                    React.createElement(
                      "h2",
                      null,
                      "Your brand names will appear here"
                    ),
                    React.createElement(
                      "p",
                      null,
                      "Add a few keywords, select your industry and style, then generate a batch of names. Each idea gets a brand score and naming strategy."
                    )
                  )
                : React.createElement(
                    React.Fragment,
                    null,

                    React.createElement(
                      "div",
                      { className: "bng-toolbar" },
                      React.createElement(
                        "div",
                        { className: "bng-result-count" },
                        filtered.length +
                          " names · " +
                          this.state.favorites.length +
                          " shortlisted"
                      ),

                      React.createElement(
                        "div",
                        { className: "bng-toolbar-actions" },
                        React.createElement(
                          "button",
                          {
                            className: "bng-small-btn",
                            type: "button",
                            onClick: this.copyAll,
                          },
                          this.state.copied
                            ? "✓ Copied"
                            : this.state.favorites.length
                            ? "Copy Shortlist"
                            : "Copy All"
                        ),
                        React.createElement(
                          "button",
                          {
                            className: "bng-small-btn",
                            type: "button",
                            onClick: this.generate,
                          },
                          "↻ Generate More"
                        )
                      )
                    ),

                    React.createElement(
                      "div",
                      { className: "bng-filter" },
                      filterButtons.map(function (filter) {
                        return React.createElement(
                          "button",
                          {
                            type: "button",
                            key: filter,
                            className:
                              self.state.filter === filter
                                ? "active"
                                : "",
                            onClick: function () {
                              self.setState({
                                filter: filter,
                              });
                            },
                          },
                          filter
                        );
                      })
                    ),

                    filtered.length
                      ? React.createElement(
                          "div",
                          { className: "bng-results" },
                          filtered.map(function (item) {
                            var favorite =
                              self.state.favorites.indexOf(item.id) !== -1;

                            return React.createElement(
                              "div",
                              {
                                className: "bng-card",
                                key: item.id,
                              },

                              React.createElement(
                                "div",
                                { className: "bng-card-top" },
                                React.createElement(
                                  "div",
                                  { className: "bng-name" },
                                  item.name
                                ),

                                React.createElement(
                                  "button",
                                  {
                                    type: "button",
                                    className:
                                      favorite
                                        ? "bng-heart active"
                                        : "bng-heart",
                                    onClick: function () {
                                      self.toggleFavorite(item.id);
                                    },
                                    title: "Add to shortlist",
                                  },
                                  favorite ? "♥" : "♡"
                                )
                              ),

                              React.createElement(
                                "div",
                                { className: "bng-meta" },
                                React.createElement(
                                  "span",
                                  { className: "bng-tag" },
                                  item.strategy
                                ),
                                React.createElement(
                                  "span",
                                  { className: "bng-tag bng-score" },
                                  item.score + "/100"
                                )
                              ),

                              React.createElement(
                                "div",
                                { className: "bng-domain-box" },
                                React.createElement(
                                  "span",
                                  { className: "bng-domain-label" },
                                  "Domain hint"
                                ),
                                React.createElement(
                                  "span",
                                  { className: "bng-domain" },
                                  makeDomain(
                                    item.name,
                                    self.state.extension
                                  )
                                ),
                                React.createElement(
                                  "span",
                                  { className: "bng-domain-note" },
                                  "Hint only — availability is not checked."
                                )
                              ),

                              React.createElement(
                                "div",
                                { className: "bng-card-footer" },
                                React.createElement(
                                  "span",
                                  { className: "bng-pronounce" },
                                  "Pronounceability " +
                                    item.pronounceability +
                                    "/100"
                                ),

                                React.createElement(
                                  "button",
                                  {
                                    type: "button",
                                    className: "bng-copy",
                                    onClick: function () {
                                      if (
                                        typeof navigator !== "undefined" &&
                                        navigator.clipboard
                                      ) {
                                        navigator.clipboard.writeText(
                                          item.name
                                        );
                                      }
                                    },
                                  },
                                  "Copy name"
                                )
                              )
                            );
                          })
                        )
                      : React.createElement(
                          "div",
                          { className: "bng-empty" },
                          React.createElement(
                            "h2",
                            null,
                            "No names matched this filter"
                          ),
                          React.createElement(
                            "p",
                            null,
                            "Try another naming strategy or generate another batch."
                          )
                        ),

                    favoriteResults.length
                      ? React.createElement(
                          "div",
                          { className: "bng-shortlist" },
                          React.createElement(
                            "div",
                            { className: "bng-shortlist-head" },
                            React.createElement(
                              "div",
                              { className: "bng-shortlist-title" },
                              "♥ Your shortlist"
                            ),
                            React.createElement(
                              "span",
                              { className: "bng-result-count" },
                              favoriteResults.length + " saved"
                            )
                          ),

                          React.createElement(
                            "div",
                            { className: "bng-shortlist-list" },
                            favoriteResults.map(function (item) {
                              return React.createElement(
                                "span",
                                {
                                  className: "bng-short-name",
                                  key: item.id,
                                },
                                item.name
                              );
                            })
                          )
                        )
                      : null,

                    React.createElement(
                      "div",
                      { className: "bng-disclaimer" },
                      "Naming suggestions are generated locally. Domain hints are not availability results. Before registering or trademarking a name, verify the domain, social handles and relevant trademark databases."
                    )
                  )
            )
          )
        )
      ),
      React.createElement("style", null, styles)
    );
  }
}

export default BusinessNameGenerator;
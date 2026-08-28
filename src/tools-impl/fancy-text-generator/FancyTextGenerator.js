"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Search, Star, Shuffle } from "lucide-react";

// ---------- Core Unicode Mathematical Alphanumeric helper ----------
// The Unicode "Mathematical Alphanumeric Symbols" block is almost entirely
// contiguous per style, but a handful of styles have "holes" — a few letters
// were already assigned code points elsewhere (Letterlike Symbols block) long
// before this block existed, so Unicode reuses those instead of duplicating.
// This helper does the base arithmetic and checks the hole table first.
function makeMathStyle(upperBase, lowerBase, digitBase, upperHoles = {}, lowerHoles = {}) {
  return function convert(str) {
    let out = "";
    for (const ch of str) {
      const code = ch.codePointAt(0);
      if (code >= 65 && code <= 90) {
        out += upperHoles[ch] || (upperBase != null ? String.fromCodePoint(upperBase + (code - 65)) : ch);
      } else if (code >= 97 && code <= 122) {
        out += lowerHoles[ch] || (lowerBase != null ? String.fromCodePoint(lowerBase + (code - 97)) : ch);
      } else if (code >= 48 && code <= 57 && digitBase != null) {
        out += String.fromCodePoint(digitBase + (code - 48));
      } else {
        out += ch;
      }
    }
    return out;
  };
}

const toBoldSerif = makeMathStyle(0x1d400, 0x1d41a, 0x1d7ce);
const toBoldSans = makeMathStyle(0x1d5d4, 0x1d5ee, 0x1d7ec);
const toItalicSans = makeMathStyle(0x1d608, 0x1d622, null);
const toBoldItalicSans = makeMathStyle(0x1d63c, 0x1d656, null);
const toScript = makeMathStyle(0x1d49c, 0x1d4b6, null,
  { B: "\u212C", E: "\u2130", F: "\u2131", H: "\u210B", I: "\u2110", L: "\u2112", M: "\u2133", R: "\u211B" },
  { e: "\u212F", g: "\u210A", o: "\u2134" }
);
const toBoldScript = makeMathStyle(0x1d4d0, 0x1d4ea, null);
const toFraktur = makeMathStyle(0x1d504, 0x1d51e, null,
  { C: "\u212D", H: "\u210C", I: "\u2111", R: "\u211C", Z: "\u2128" }
);
const toBoldFraktur = makeMathStyle(0x1d56c, 0x1d586, null);
const toDoubleStruck = makeMathStyle(0x1d538, 0x1d552, 0x1d7d8,
  { C: "\u2102", H: "\u210D", N: "\u2115", P: "\u2119", Q: "\u211A", R: "\u211D", Z: "\u2124" }
);
const toMonospace = makeMathStyle(0x1d670, 0x1d68a, 0x1d7f6);

// ---------- Enclosed alphanumerics (circled / squared) ----------
function toCircled(str) {
  return [...str].map((ch) => {
    const code = ch.codePointAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x24b6 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x24d0 + (code - 97));
    if (ch === "0") return "\u24ea";
    if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + (code - 49));
    return ch;
  }).join("");
}

function toBubbleFilled(str) {
  // Letters only — Unicode has no lowercase glyphs for this style, so both
  // cases render as the (uppercase-shaped) filled bubble glyph.
  return [...str].map((ch) => {
    const code = ch.toUpperCase().codePointAt(0);
    return code >= 65 && code <= 90 ? String.fromCodePoint(0x1f150 + (code - 65)) : ch;
  }).join("");
}

function toSquared(str) {
  return [...str].map((ch) => {
    const code = ch.toUpperCase().codePointAt(0);
    return code >= 65 && code <= 90 ? String.fromCodePoint(0x1f130 + (code - 65)) : ch;
  }).join("");
}

function toSquaredFilled(str) {
  return [...str].map((ch) => {
    const code = ch.toUpperCase().codePointAt(0);
    return code >= 65 && code <= 90 ? String.fromCodePoint(0x1f170 + (code - 65)) : ch;
  }).join("");
}

function toFullwidth(str) {
  return [...str].map((ch) => {
    if (ch === " ") return "\u3000";
    const code = ch.codePointAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0xff21 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0xff41 + (code - 97));
    if (code >= 48 && code <= 57) return String.fromCodePoint(0xff10 + (code - 48));
    return ch;
  }).join("");
}

// ---------- Lookup-table styles ----------
const SMALL_CAPS_MAP = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ",
  k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "ꜱ", t: "ᴛ",
  u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ",
};
function toSmallCaps(str) {
  return [...str].map((ch) => SMALL_CAPS_MAP[ch.toLowerCase()] || ch).join("");
}

const UPSIDE_DOWN_MAP = {
  a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "ɾ",
  k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ",
  u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
  0: "0", 1: "1", 2: "ᄅ", 3: "Ɛ", 4: "ᔭ", 5: "5", 6: "9", 7: "ㄥ", 8: "8", 9: "6",
  ".": "˙", ",": "'", "?": "¿", "!": "¡", "'": ",", '"': "„",
  "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<",
  "&": "⅋", "_": "‾",
};
function toUpsideDown(str) {
  return [...str].map((ch) => UPSIDE_DOWN_MAP[ch.toLowerCase()] ?? ch).reverse().join("");
}

function toReversed(str) {
  return [...str].reverse().join("");
}

function toSpacedOut(str) {
  return [...str].join(" ");
}

function toStrikethrough(str) {
  return [...str].map((ch) => (ch === " " ? ch : ch + "\u0336")).join("");
}

function toUnderline(str) {
  return [...str].map((ch) => (ch === " " ? ch : ch + "\u0332")).join("");
}

// ---------- Zalgo / glitch text (randomized combining marks) ----------
const ZALGO_UP = ["\u030d","\u030e","\u0304","\u0305","\u033f","\u0311","\u0306","\u0310","\u0352","\u0357","\u0351","\u0307","\u0308","\u030a","\u0342","\u0343","\u0344","\u034a","\u034b","\u034c","\u0303","\u0302","\u030c","\u0350","\u0300","\u0301","\u030b","\u030f","\u0312","\u0313","\u0314"];
const ZALGO_MID = ["\u0315","\u031b","\u0340","\u0341","\u0358","\u0321","\u0322","\u0327","\u0328","\u0334","\u0335","\u0336","\u035c","\u035d","\u035e","\u035f","\u0360","\u0362"];
const ZALGO_DOWN = ["\u0316","\u0317","\u0318","\u0319","\u031c","\u031d","\u031e","\u031f","\u0320","\u0324","\u0325","\u0326","\u0329","\u032a","\u032b","\u032c","\u032d","\u032e","\u032f","\u0330","\u0331","\u0332","\u0333"];

function pick(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function toZalgo(str, intensity = 2) {
  return [...str].map((ch) => {
    if (ch === " ") return ch;
    let out = ch;
    for (let i = 0; i < intensity; i++) out += pick(ZALGO_UP);
    for (let i = 0; i < Math.max(1, intensity - 1); i++) out += pick(ZALGO_MID);
    for (let i = 0; i < intensity; i++) out += pick(ZALGO_DOWN);
    return out;
  }).join("");
}

// ---------- Decorative wraps ----------
const DECORATIONS = [
  { key: "none", label: "None", left: "", right: "" },
  { key: "sparkles", label: "Sparkles", left: "✦ ", right: " ✦" },
  { key: "stars", label: "Stars", left: "☆ ", right: " ☆" },
  { key: "hearts", label: "Hearts", left: "♡ ", right: " ♡" },
  { key: "arrows", label: "Arrows", left: "»» ", right: " ««" },
  { key: "flowers", label: "Flowers", left: "❀ ", right: " ❀" },
  { key: "snow", label: "Snowflakes", left: "❅ ", right: " ❅" },
];

// ---------- Style registry ----------
const STYLES = [
  { key: "bold-serif", label: "Bold", group: "Classic", convert: toBoldSerif },
  { key: "italic-sans", label: "Italic", group: "Classic", convert: toItalicSans },
  { key: "bold-italic-sans", label: "Bold Italic", group: "Classic", convert: toBoldItalicSans },
  { key: "bold-sans", label: "Bold Sans", group: "Classic", convert: toBoldSans },
  { key: "small-caps", label: "Small Caps", group: "Classic", convert: toSmallCaps },
  { key: "script", label: "Script", group: "Decorative", convert: toScript },
  { key: "bold-script", label: "Bold Script", group: "Decorative", convert: toBoldScript },
  { key: "fraktur", label: "Gothic (Fraktur)", group: "Decorative", convert: toFraktur },
  { key: "bold-fraktur", label: "Bold Gothic", group: "Decorative", convert: toBoldFraktur },
  { key: "double-struck", label: "Double-Struck", group: "Decorative", convert: toDoubleStruck },
  { key: "monospace", label: "Monospace", group: "Decorative", convert: toMonospace },
  { key: "fullwidth", label: "Wide (Vaporwave)", group: "Decorative", convert: toFullwidth },
  { key: "circled", label: "Circled", group: "Boxed", convert: toCircled },
  { key: "bubble-filled", label: "Bubble (Filled)", group: "Boxed", convert: toBubbleFilled },
  { key: "squared", label: "Squared", group: "Boxed", convert: toSquared },
  { key: "squared-filled", label: "Squared (Filled)", group: "Boxed", convert: toSquaredFilled },
  { key: "upside-down", label: "Upside Down", group: "Playful", convert: toUpsideDown },
  { key: "reversed", label: "Reversed", group: "Playful", convert: toReversed },
  { key: "spaced-out", label: "S p a c e d   O u t", group: "Playful", convert: toSpacedOut },
  { key: "strikethrough", label: "Strikethrough", group: "Playful", convert: toStrikethrough },
  { key: "underline", label: "Underline", group: "Playful", convert: toUnderline },
];

const FAVORITES_KEY = "toolslay-fancy-text-favorites";
const SAMPLE_TEXT = "Fancy Text";

export default function FancyTextGenerator() {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [decoration, setDecoration] = useState("none");
  const [copiedKey, setCopiedKey] = useState(null);
  const [zalgoIntensity, setZalgoIntensity] = useState(2);
  const [zalgoSeed, setZalgoSeed] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      if (Array.isArray(saved)) setFavorites(saved);
    } catch {
      // localStorage unavailable — favorites just won't persist
    }
  }, []);

  function toggleFavorite(key) {
    setFavorites((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // ignore — non-critical
      }
      return next;
    });
  }

  const decorationConfig = DECORATIONS.find((d) => d.key === decoration) || DECORATIONS[0];
  const source = text.trim() ? text : SAMPLE_TEXT;
  const hasRealInput = Boolean(text.trim());

  const zalgoResult = useMemo(
    () => toZalgo(source, zalgoIntensity),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source, zalgoIntensity, zalgoSeed]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = STYLES.filter((s) => !q || s.label.toLowerCase().includes(q));
    return base
      .map((s) => ({ ...s, preview: decorationConfig.left + s.convert(source) + decorationConfig.right }))
      .sort((a, b) => {
        const aFav = favorites.includes(a.key) ? 0 : 1;
        const bFav = favorites.includes(b.key) ? 0 : 1;
        return aFav - bFav;
      });
  }, [search, source, decorationConfig, favorites]);

  async function handleCopy(key, value) {
    if (!hasRealInput) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      // Clipboard API blocked — text remains manually selectable
    }
  }

  const showZalgoCard = !search.trim() || "glitch zalgo creepy".includes(search.trim().toLowerCase());

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your text here — try a name, a bio, or a caption..."
        aria-label="Text to style"
        rows={3}
        className="w-full resize-none rounded-lg border border-line bg-paper p-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
          <Search size={15} className="text-muted" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search styles..."
            aria-label="Search styles"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>

        <select
          value={decoration}
          onChange={(e) => setDecoration(e.target.value)}
          aria-label="Decorative border"
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
        >
          {DECORATIONS.map((d) => (
            <option key={d.key} value={d.key}>
              {d.key === "none" ? "No decoration" : `Decoration: ${d.label}`}
            </option>
          ))}
        </select>
      </div>

      {!hasRealInput && (
        <p className="mt-3 text-xs text-muted">
          Showing a sample preview — type your own text above, then use the copy button on any style.
        </p>
      )}

      {/* Zalgo — special card with its own intensity control and regenerate button */}
      {showZalgoCard && (
        <div className="mt-6 rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink">Glitch / Zalgo</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-muted">
                Intensity
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={zalgoIntensity}
                  onChange={(e) => setZalgoIntensity(Number(e.target.value))}
                  className="accent-brand"
                />
              </label>
              <button
                type="button"
                onClick={() => setZalgoSeed((s) => s + 1)}
                className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:border-brand hover:text-brand"
              >
                <Shuffle size={12} aria-hidden="true" />
                Regenerate
              </button>
              <button
                type="button"
                onClick={() => handleCopy("zalgo", decorationConfig.left + zalgoResult + decorationConfig.right)}
                disabled={!hasRealInput}
                className="flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1 text-xs font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copiedKey === "zalgo" ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                {copiedKey === "zalgo" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <p className="mt-3 break-all text-lg leading-loose text-ink">
            {decorationConfig.left + zalgoResult + decorationConfig.right}
          </p>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {rows.map((style) => (
          <div
            key={style.key}
            className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3"
          >
            <button
              type="button"
              onClick={() => toggleFavorite(style.key)}
              aria-label={favorites.includes(style.key) ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={favorites.includes(style.key)}
              className="shrink-0 text-muted transition hover:text-amber"
            >
              <Star
                size={16}
                aria-hidden="true"
                fill={favorites.includes(style.key) ? "currentColor" : "none"}
                className={favorites.includes(style.key) ? "text-amber" : ""}
              />
            </button>

            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                {style.label}
              </p>
              <p className="truncate text-base text-ink" title={style.preview}>
                {style.preview}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(style.key, style.preview)}
              disabled={!hasRealInput}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copiedKey === style.key ? (
                <Check size={13} aria-hidden="true" />
              ) : (
                <Copy size={13} aria-hidden="true" />
              )}
              {copiedKey === style.key ? "Copied" : "Copy"}
            </button>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No styles match &quot;{search}&quot;.</p>
        )}
      </div>

      <p className="mt-4 text-xs text-muted">
        Note: some styles (Gothic, Double-Struck, Boxed) use special Unicode characters that may not
        render on every device or app — preview before posting somewhere important.
      </p>
    </div>
  );
}

// Pure text-transform + heuristic "issue checker" helpers for the Word Counter
// tool. Kept separate from the component so the logic is easy to unit-test
// and reason about on its own.

export function countStats(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed]).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim()).length : 0;
  const readMinutes = words.length / 200; // average adult reading speed
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z0-9']/gi, ""))).size;
  const longestWord = words.reduce(
    (longest, w) => (w.replace(/[^a-zA-Z0-9']/g, "").length > longest.length ? w.replace(/[^a-zA-Z0-9']/g, "") : longest),
    ""
  );
  return {
    words: words.length,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readMinutes,
    uniqueWords,
    longestWord,
  };
}

export function formatReadTime(minutes) {
  if (minutes < 1) return `${Math.max(1, Math.round(minutes * 60))}s`;
  return `${Math.round(minutes)} min`;
}

const SMALL_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to",
  "for", "nor", "as", "by", "with", "from", "into", "over", "vs",
]);

export const CASE_TRANSFORMS = [
  { id: "upper", label: "UPPERCASE", fn: (t) => t.toUpperCase() },
  { id: "lower", label: "lowercase", fn: (t) => t.toLowerCase() },
  {
    id: "sentence",
    label: "Sentence case",
    fn: (t) =>
      t
        .toLowerCase()
        .replace(/(^\s*[a-z])|([.!?]\s+[a-z])|(\n\s*[a-z])/g, (m) => m.toUpperCase()),
  },
  {
    id: "title",
    label: "Title Case",
    fn: (t) =>
      t.toLowerCase().replace(/[a-zA-Z0-9'’]+/g, (word, offset, full) => {
        const isFirst = offset === 0;
        const isLast = offset + word.length === full.length;
        if (!isFirst && !isLast && SMALL_WORDS.has(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      }),
  },
];

function matchCase(sample, target) {
  if (sample === sample.toUpperCase()) return target.toUpperCase();
  if (sample[0] === sample[0]?.toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

const COMMON_TYPOS = {
  teh: "the",
  recieve: "receive",
  adress: "address",
  seperate: "separate",
  occured: "occurred",
  definately: "definitely",
  untill: "until",
  wich: "which",
  thier: "their",
  becuase: "because",
  alot: "a lot",
  accomodate: "accommodate",
  wierd: "weird",
  freind: "friend",
  goverment: "government",
  enviroment: "environment",
  neccessary: "necessary",
  publically: "publicly",
  arguement: "argument",
  begining: "beginning",
  concious: "conscious",
  dosent: "doesn't",
  wont: "won't",
  cant: "can't",
  im: "I'm",
};

// Runs a set of lightweight, regex-based heuristics over the text and returns
// a list of issues grouped by rule. This is not a real grammar engine — it
// catches common mechanical slips (spacing, repeated words, stray
// punctuation, common typos, missing capitals) without needing a server.
export function analyzeText(text) {
  const issues = [];

  if (/ {2,}/.test(text)) {
    const count = (text.match(/ {2,}/g) || []).length;
    issues.push({
      id: "double-space",
      type: "spacing",
      title: "Extra spaces",
      description: `${count} place${count > 1 ? "s" : ""} with two or more spaces in a row.`,
      fix: (t) => t.replace(/ {2,}/g, " "),
    });
  }

  const repeatedWordRegex = /\b([A-Za-z]+)([ \t]+)\1\b/gi;
  const seenRepeats = new Set();
  let rm;
  while ((rm = repeatedWordRegex.exec(text))) {
    const key = rm[1].toLowerCase();
    if (seenRepeats.has(key)) continue;
    seenRepeats.add(key);
    issues.push({
      id: `repeat-${key}`,
      type: "repetition",
      title: `Repeated word "${rm[1]}"`,
      description: `"${rm[1]} ${rm[1]}" looks like an accidental duplicate.`,
      fix: (t) => t.replace(new RegExp(`\\b(${rm[1]})([ \\t]+)\\1\\b`, "gi"), "$1"),
    });
  }

  if (/ +[,.!?;:]/.test(text)) {
    issues.push({
      id: "space-before-punct",
      type: "punctuation",
      title: "Space before punctuation",
      description: "There's a space before a comma, period, or other punctuation mark.",
      fix: (t) => t.replace(/ +([,.!?;:])/g, "$1"),
    });
  }

  if (/[a-zA-Z][,.!?;:][A-Za-z]/.test(text)) {
    issues.push({
      id: "missing-space-after-punct",
      type: "punctuation",
      title: "Missing space after punctuation",
      description: "A word starts right after a comma or period with no space.",
      fix: (t) => t.replace(/([a-zA-Z][,.!?;:])([A-Za-z])/g, "$1 $2"),
    });
  }

  if (/([!?])\1{1,}/.test(text)) {
    issues.push({
      id: "repeated-punct",
      type: "punctuation",
      title: "Repeated punctuation",
      description: "Multiple exclamation or question marks in a row.",
      fix: (t) => t.replace(/([!?])\1+/g, "$1"),
    });
  }

  if (/(^|[.!?]\s+)[a-z]/.test(text)) {
    issues.push({
      id: "missing-capital",
      type: "capitalization",
      title: "Sentence starts with a lowercase letter",
      description: "One or more sentences begin with a lowercase letter.",
      fix: (t) => t.replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase()),
    });
  }

  Object.entries(COMMON_TYPOS).forEach(([wrong, right]) => {
    const testRe = new RegExp(`\\b${wrong}\\b`, "i");
    if (testRe.test(text)) {
      issues.push({
        id: `typo-${wrong}`,
        type: "spelling",
        title: `Possible typo: "${wrong}"`,
        description: `Did you mean "${right}"?`,
        fix: (t) =>
          t.replace(new RegExp(`\\b${wrong}\\b`, "gi"), (match) => matchCase(match, right)),
      });
    }
  });

  if (/\t/.test(text)) {
    issues.push({
      id: "tab-character",
      type: "spacing",
      title: "Tab character found",
      description: "Tabs can render inconsistently — consider using spaces instead.",
      fix: (t) => t.replace(/\t/g, "  "),
    });
  }

  return issues;
}

export const ISSUE_TYPE_META = {
  spacing: { label: "Spacing", icon: "AlignLeft" },
  repetition: { label: "Repetition", icon: "Repeat" },
  punctuation: { label: "Punctuation", icon: "Asterisk" },
  capitalization: { label: "Capitalization", icon: "CaseSensitive" },
  spelling: { label: "Spelling", icon: "SpellCheck2" },
};

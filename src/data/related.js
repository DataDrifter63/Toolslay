// Hand-curated "Related tools" for every tool page.
//
// How it works
// - GROUPS: each row is a set of tools people use together. A tool's related list
//   is built from the groups it belongs to: we walk each group starting at the tool
//   right AFTER it, so neighbouring pages link to different tools and every tool
//   gets internal links.
// - MANUAL: exact lists for a specific tool (checked first, wins over GROUPS).
// - If a tool is in no group, we fall back to the keyword-scoring engine in
//   tools.js (so a brand-new tool still gets sensible links on day one).
//
// The result is the same on every load and every build (no randomness).
// Edit or reorder the rows freely: unknown slugs are ignored.
import { getToolBySlug, getRelatedTools as scoredRelated } from "./tools";

const GROUPS = [
  // image editing
  ["image-resizer", "bulk-image-resizer", "image-compressor", "image-crop-tool", "image-converter", "svg-to-png-converter", "background-remover", "image-watermark-adder", "photo-collage-maker", "meme-generator", "favicon-generator"],
  // pdf and ocr
  ["pdf-to-image", "image-to-pdf", "text-to-pdf", "image-to-text-ocr", "screenshot-to-text", "image-compressor"],
  // video
  ["video-compressor", "gif-maker", "screen-recorder", "audio-trimmer"],
  // speech
  ["text-to-speech", "speech-to-text", "audio-trimmer", "screen-recorder"],
  // text stats
  ["word-counter", "character-counter", "reading-time-calculator", "readability-score-checker", "letter-frequency-counter", "keyword-density-checker", "invitation-word-counter"],
  // text cleanup
  ["case-converter", "text-reverser", "text-sorter", "duplicate-line-remover", "whitespace-remover", "text-repeater", "text-diff-checker", "slug-generator"],
  // social text
  ["fancy-text-generator", "instagram-bio-generator", "hashtag-generator", "twitter-thread-splitter", "text-to-handwriting"],
  // text codes
  ["morse-code-translator", "nato-phonetic-alphabet-converter", "pig-latin-translator", "text-binary-converter", "anagram-solver", "roman-numeral-converter"],
  // data formats
  ["json-formatter-validator", "json-diff-checker", "json-to-csv", "csv-to-json-converter", "yaml-to-json-converter", "xml-formatter-validator", "fake-data-generator", "sql-formatter-minifier"],
  // code formatters
  ["html-formatter-beautifier", "css-formatter-minifier", "js-formatter-minifier", "markdown-to-html-converter", "html-to-markdown-converter", "markdown-editor-previewer"],
  // encoding
  ["base64-encoder-decoder", "url-encoder-decoder", "hash-generator", "jwt-decoder", "uuid-guid-generator", "text-binary-converter", "number-base-converter"],
  // css and color
  ["css-gradient-generator", "css-box-shadow-generator", "css-clamp-calculator", "color-contrast-checker", "color-picker", "palette-generator", "hex-rgb-converter", "color-name-finder"],
  // web and seo files
  ["meta-tags-generator", "open-graph-preview-generator", "robots-txt-generator", "xml-sitemap-generator", "htaccess-generator", "meta-description-length-checker", "utm-link-builder"],
  // dev time
  ["timestamp-converter", "cron-expression-generator", "timezone-meeting-planner", "date-difference-calculator"],
  // dev text
  ["regex-tester", "text-diff-checker", "duplicate-line-remover", "whitespace-remover"],
  // loans
  ["loan-calculator", "mortgage-calculator", "emi-calculator", "car-loan-calculator", "simple-interest-calculator", "compound-interest-calculator", "debt-payoff-calculator", "lease-vs-buy-car-calculator", "car-depreciation-calculator", "property-tax-estimator"],
  // investing
  ["investment-return-calculator", "compound-interest-calculator", "retirement-savings-calculator", "401k-contribution-calculator", "social-security-fra-calculator", "college-savings-calculator"],
  // pay and business
  ["salary-take-home-calculator", "hourly-to-salary-converter", "overtime-pay-calculator", "freelance-hourly-rate-calculator", "invoice-generator", "profit-margin-calculator", "break-even-calculator"],
  // everyday money
  ["discount-calculator", "tip-calculator", "bill-splitter-calculator", "percentage-calculator", "currency-converter", "profit-margin-calculator"],
  // health numbers
  ["bmi-calculator", "calorie-calculator-tdee", "macro-calculator", "water-intake-calculator", "heart-rate-zone-calculator", "food-calorie-burn-calculator", "sleep-cycle-calculator"],
  // dates
  ["age-calculator", "date-difference-calculator", "work-days-calculator", "time-duration-calculator", "us-holiday-countdown", "daylight-saving-countdown", "countdown-timer-generator", "timezone-meeting-planner"],
  // unit conversion
  ["unit-converter", "shoe-size-converter", "clothing-size-converter", "ring-size-converter", "oven-temperature-converter", "baking-conversion-calculator", "data-storage-converter", "number-base-converter"],
  // school math
  ["scientific-calculator", "percentage-calculator", "gpa-calculator", "grade-percentage-calculator", "gpa-to-percentage-converter", "study-time-calculator", "roman-numeral-converter"],
  // fun
  ["love-calculator", "nickname-generator", "gamertag-generator", "coin-flip-dice-roller"],
  // passwords
  ["password-generator", "passphrase-generator", "password-strength-checker", "hash-generator", "uuid-guid-generator", "jwt-decoder"],
  // codes
  ["qr-code-generator", "barcode-generator", "utm-link-builder", "favicon-generator"],
  // random picks
  ["random-number-generator", "coin-flip-dice-roller", "gamertag-generator", "random-team-generator", "tournament-bracket-generator", "fantasy-points-calculator", "gaming-session-time-calculator"],
  // names
  ["business-name-generator", "nickname-generator", "fantasy-name-generator", "baby-name-generator", "pet-name-generator", "instagram-bio-generator"],
  // speed tests
  ["typing-speed-test", "reaction-time-test", "gaming-session-time-calculator"],
  // cars
  ["vin-decoder", "license-plate-generator", "car-loan-calculator", "car-depreciation-calculator", "ev-vs-petrol-calculator", "lease-vs-buy-car-calculator"],
  // holidays and weather
  ["snow-day-predictor", "us-holiday-countdown", "daylight-saving-countdown"],
  // seo marketing
  ["keyword-density-checker", "meta-description-length-checker", "open-graph-preview-generator", "meta-tags-generator", "utm-link-builder", "twitter-thread-splitter", "hashtag-generator"],
  // pets
  ["dog-age-calculator", "cat-age-calculator", "pet-calorie-calculator", "dog-food-safety-checker", "dog-walking-time-calculator", "pet-name-generator"],
  // fitness
  ["running-pace-calculator", "cycling-speed-calculator", "heart-rate-zone-calculator", "food-calorie-burn-calculator", "stretching-routine-generator", "standing-vs-sitting-calculator", "sleep-cycle-calculator", "water-intake-calculator"],
  // study
  ["study-time-calculator", "reading-time-calculator", "grade-percentage-calculator", "gpa-to-percentage-converter", "gpa-calculator", "scholarship-eligibility-checker", "college-savings-calculator"],
  // kitchen
  ["recipe-scaler", "baking-conversion-calculator", "coffee-water-ratio-calculator", "cooking-time-calculator", "freezing-time-estimator", "oven-temperature-converter", "party-food-calculator"],
  // travel
  ["flight-co2-calculator", "road-trip-cost-calculator", "luggage-weight-checker", "travel-budget-planner", "timezone-meeting-planner", "carbon-footprint-calculator"],
  // home
  ["paint-quantity-calculator", "carpet-area-calculator", "moving-box-calculator", "electricity-bill-estimator", "garden-soil-calculator"],
  // events
  ["wedding-budget-calculator", "party-food-calculator", "event-seating-planner", "invitation-word-counter", "bill-splitter-calculator"],
  // baby
  ["pregnancy-due-date-calculator", "baby-feeding-schedule-generator", "diaper-changes-estimator", "child-growth-percentile-checker", "baby-name-generator"],
  // eco
  ["carbon-footprint-calculator", "plastic-usage-estimator", "tree-planting-impact-calculator", "recycling-savings-calculator", "flight-co2-calculator", "ev-vs-petrol-calculator", "electricity-bill-estimator"],
];

const MANUAL = {
  "placeholder-image-generator": ["image-resizer", "favicon-generator", "css-gradient-generator", "lorem-ipsum-generator"],
  "regex-tester": ["text-diff-checker", "json-formatter-validator", "url-encoder-decoder", "duplicate-line-remover"],
};

export function getRelated(tool, limit = 4) {
  const picked = [];
  const add = (slug) => {
    if (picked.length >= limit || slug === tool.slug || picked.includes(slug)) return;
    if (getToolBySlug(slug)) picked.push(slug);
  };

  (MANUAL[tool.slug] || []).forEach(add);

  const mine = GROUPS.filter((g) => g.includes(tool.slug));
  for (let step = 1; picked.length < limit && step < 12; step++) {
    for (const g of mine) {
      const i = g.indexOf(tool.slug);
      add(g[(i + step) % g.length]);
    }
  }

  if (picked.length < limit) scoredRelated(tool, limit * 2).forEach((t) => add(t.slug));

  return picked.map((slug) => getToolBySlug(slug));
}

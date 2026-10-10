// Rewrites the `description` (the excerpt shown on every tool card) in src/data/tools.js.
// Only the description string of each listed slug changes. Nothing else in the file is touched.
//
//   node scripts/apply-card-descriptions.mjs      (run from the project root)
import fs from "node:fs";

const FILE = "src/data/tools.js";

const D = {
  // Image & PDF
  "pdf-to-image": "Convert PDF pages to JPG or PNG images and download them in seconds, no account needed.",
  "image-to-pdf": "Combine one or more images into a single PDF. Set the layout and reorder pages before you download.",
  "text-to-pdf": "Turn plain text into a clean PDF with headers, watermarks and ready-made templates.",
  "image-converter": "Convert images between JPG, PNG and WebP and keep transparent backgrounds intact.",
  "image-resizer": "Resize an image by exact pixels or percentage, with the aspect ratio locked if you want.",
  "bulk-image-resizer": "Resize many images at once and download them together as a ZIP file.",
  "image-compressor": "Compress images with lossy or lossless settings and shrink a whole batch in one go.",
  "image-crop-tool": "Crop an image freehand or to a fixed ratio, and rotate it before you save.",
  "image-to-text-ocr": "Extract text from any image with OCR that runs on your device, then copy the result.",
  "screenshot-to-text": "Paste a screenshot from your clipboard and pull the text out of it right away.",
  "meme-generator": "Add top and bottom caption text to any image and make a classic meme.",
  "background-remover": "Remove the background from a photo automatically, right in your browser.",
  "image-watermark-adder": "Add a text or logo watermark to a single image or a whole batch.",
  "photo-collage-maker": "Make a photo collage by dropping your pictures into ready-made grid layouts.",
  "favicon-generator": "Generate a full favicon set in every size browsers and devices need.",
  "svg-to-png-converter": "Convert an SVG file to PNG at any resolution you choose.",

  // Video & Audio
  "video-compressor": "Reduce video file size in your browser with simple presets, and check the estimated size first.",
  "gif-maker": "Trim a video clip and turn it into a short looping animation with speed and play order controls.",
  "audio-trimmer": "Trim an audio file to the exact section you need, add fades and download it as WAV.",
  "screen-recorder": "Record your screen, a window or a browser tab, add mic audio if you like, and download the video.",

  // Text & Writing
  "word-counter": "Count words, characters and paragraphs, and see how long your text takes to read.",
  "case-converter": "Change text to uppercase, lowercase, title case and other cases with one click.",
  "fancy-text-generator": "Turn plain text into stylish fonts you can paste into social media bios and posts.",
  "text-to-handwriting": "Turn typed text into realistic handwriting on paper style backgrounds.",
  "hashtag-generator": "Generate relevant hashtags for your post, with reach and engagement estimates.",
  "lorem-ipsum-generator": "Generate placeholder paragraphs, sentences or words for mockups and page layouts.",
  "text-diff-checker": "Compare two blocks of text side by side and see exactly what changed.",
  "text-to-speech": "Convert typed text into natural sounding speech you can play or download.",
  "speech-to-text": "Dictate into your microphone and get editable text as you speak.",
  "duplicate-line-remover": "Paste a list and remove duplicate or blank lines in one click.",
  "text-sorter": "Sort lines of text alphabetically, by length or in reverse order.",
  "slug-generator": "Turn any title into a clean, URL friendly slug for blog posts and pages.",
  "text-reverser": "Reverse text by character, by word or by line.",
  "readability-score-checker": "Check the Flesch-Kincaid grade level of your writing and see how easy it is to read.",
  "instagram-bio-generator": "Get catchy Instagram bio ideas from a few keywords about you.",

  // Developer
  "json-formatter-validator": "Format, minify and validate JSON with syntax highlighting and clear error messages.",
  "json-to-csv": "Convert JSON to CSV, flatten nested objects and preview the result as you go.",
  "regex-tester": "Test regular expressions with live match highlighting and a quick reference sheet.",
  "url-encoder-decoder": "Encode or decode URLs in strict or loose mode.",
  "base64-encoder-decoder": "Encode or decode text and files to and from Base64.",
  "meta-tags-generator": "Generate SEO meta tags and preview how they look on Google, Facebook and Twitter.",
  "robots-txt-generator": "Build and validate a robots.txt file with a visual rule builder.",
  "fake-data-generator": "Generate fake users, emails, JSON and CSV for development and testing.",
  "markdown-editor-previewer": "Write Markdown on one side and watch the rendered preview update on the other.",
  "html-formatter-beautifier": "Clean up messy, minified or badly indented HTML in one click.",
  "css-formatter-minifier": "Beautify or minify CSS, with indentation you can set yourself.",
  "js-formatter-minifier": "Format JavaScript for readability or minify it to cut file size.",
  "xml-formatter-validator": "Pretty print and validate XML, with error line numbers when something is wrong.",
  "yaml-to-json-converter": "Convert YAML config files to JSON and back again.",
  "cron-expression-generator": "Build a cron expression and read it back as a plain English schedule.",
  "uuid-guid-generator": "Generate v4 UUIDs or GUIDs in bulk, in the format you prefer.",
  "hash-generator": "Generate MD5, SHA-1 and SHA-256 hashes from text or files on your device.",
  "jwt-decoder": "Decode a JWT to read its header, payload, claims and expiry.",
  "timestamp-converter": "Convert Unix timestamps to readable dates and back, in any timezone.",
  "color-contrast-checker": "Check text and background color contrast against WCAG AA and AAA.",

  // Calculators
  "percentage-calculator": "Work out percentages and see the formula behind each answer.",
  "scientific-calculator": "Use trigonometry, logarithms and memory functions in a full scientific calculator.",
  "gpa-calculator": "Calculate your GPA or CGPA with weighted credits and your own grading scale.",
  "emi-calculator": "Calculate loan EMIs and see the amortization schedule, including prepayments.",
  "age-calculator": "Find your exact age in years, months and days from a date of birth.",
  "bmi-calculator": "Calculate your BMI and see which healthy weight range you fall in.",
  "discount-calculator": "Work out sale prices, tax and BOGO deals in one step.",
  "unit-converter": "Convert length, weight, temperature and more with high precision.",
  "love-calculator": "Try a fun love compatibility calculator with a simple breakdown chart.",
  "loan-calculator": "Find your monthly payment and the total interest on any loan.",
  "mortgage-calculator": "Estimate monthly mortgage payments, including taxes and insurance.",
  "salary-take-home-calculator": "Estimate your take home pay after common deductions.",
  "tip-calculator": "Calculate the tip and split the bill between friends in seconds.",
  "currency-converter": "Convert between world currencies using live exchange rates.",
  "calorie-calculator-tdee": "Estimate your daily calorie needs from your activity level and goal.",
  "macro-calculator": "Turn your calorie goal into daily protein, carb and fat targets.",
  "retirement-savings-calculator": "Project how your retirement savings grow with your contributions and returns.",
  "car-loan-calculator": "Calculate monthly car loan payments with a trade-in and down payment.",
  "investment-return-calculator": "See how an investment grows over time with regular contributions.",
  "water-intake-calculator": "Estimate how much water to drink each day from your weight and activity.",
  "heart-rate-zone-calculator": "Calculate your training heart rate zones from your age and resting heart rate.",
  "break-even-calculator": "Find the sales volume where your business starts to make a profit.",
  "compound-interest-calculator": "See how savings or investments grow with compound interest over time.",
  "roman-numeral-converter": "Convert numbers to Roman numerals and back.",
  "invoice-generator": "Create a professional PDF invoice with your logo, line items and totals.",
  "profit-margin-calculator": "Calculate gross profit margin and markup from cost and sale price.",

  // Generators & Security
  "password-generator": "Generate strong, random passwords and check their strength with an entropy meter.",
  "passphrase-generator": "Generate memorable, secure passphrases using Diceware style word lists.",
  "qr-code-generator": "Create custom QR codes with your logo, colors and several data types.",
  "random-number-generator": "Generate random numbers, pick from a list or roll custom dice.",
  "business-name-generator": "Get brandable business name ideas with taglines and domain suggestions.",
  "password-strength-checker": "Check how strong a password is and roughly how long it would take to crack.",
  "barcode-generator": "Generate scannable barcodes in common formats like Code128 and EAN.",
  "gamertag-generator": "Generate unique gamertags and usernames for Xbox, PlayStation, Steam and more.",
  "coin-flip-dice-roller": "Flip a coin or roll one or more dice with a fair random result.",
  "random-team-generator": "Split a list of names into random, evenly sized teams.",
  "nickname-generator": "Get fun nickname ideas based on a name or personality trait.",
  "countdown-timer-generator": "Create a countdown to any date and time that you can share.",

  // Design & Color
  "color-picker": "Pick colors from an image with an eyedropper and check contrast ratios.",
  "hex-rgb-converter": "Convert colors between HEX, RGB, HSL and CMYK.",
  "palette-generator": "Extract a color palette from any image and export it in one click.",

  // SEO & Marketing
  "utm-link-builder": "Build UTM links so your campaign traffic shows up correctly in analytics.",
  "open-graph-preview-generator": "Preview how a link looks when shared on Facebook, X or LinkedIn.",
  "keyword-density-checker": "Check how often a keyword or phrase appears in your content.",
  "meta-description-length-checker": "Check whether your title or meta description will get cut off in search results.",

  // Text batch 2
  "character-counter": "Count characters against live limits for X (Twitter), SMS and meta descriptions.",
  "morse-code-translator": "Translate text to Morse code and back, and play it as audio.",
  "nato-phonetic-alphabet-converter": "Convert any text into the NATO phonetic alphabet, like Alpha, Bravo and Charlie.",
  "pig-latin-translator": "Translate English into Pig Latin in one click.",
  "anagram-solver": "Find real words you can make from a set of letters.",
  "text-repeater": "Repeat a word, sentence or emoji as many times as you need.",
  "whitespace-remover": "Strip extra spaces, tabs and blank lines from pasted text.",
  "letter-frequency-counter": "Count how often each letter appears in a block of text.",

  // Developer batch 2
  "data-storage-converter": "Convert between bytes, KB, MB, GB and TB.",
  "number-base-converter": "Convert numbers between binary, decimal, hexadecimal and octal.",
  "text-binary-converter": "Convert plain text to binary code and back.",
  "csv-to-json-converter": "Convert CSV data into clean flat or nested JSON.",
  "json-diff-checker": "Compare two JSON objects and see exactly what changed.",
  "markdown-to-html-converter": "Convert Markdown into clean HTML you can paste straight into your page.",
  "html-to-markdown-converter": "Convert HTML into clean Markdown for docs, notes or blog posts.",
  "css-gradient-generator": "Design linear or radial gradients and copy the CSS.",
  "css-box-shadow-generator": "Build a box shadow visually and copy the CSS.",
  "css-clamp-calculator": "Generate a responsive CSS clamp() value from a minimum and maximum size.",
  "htaccess-generator": "Generate common .htaccess rules for redirects, caching and rewrites.",
  "xml-sitemap-generator": "Generate a valid XML sitemap from a list of page URLs.",
  "sql-formatter-minifier": "Format messy SQL so it is easy to read, or minify it for production.",
  "placeholder-image-generator": "Generate placeholder images at any size for mockups and layouts.",

  // Calculators batch 2
  "date-difference-calculator": "Calculate the exact days, months or years between two dates.",
  "work-days-calculator": "Count business days between two dates, with weekends left out.",
  "time-duration-calculator": "Add or subtract hours, minutes and seconds between two times.",
  "hourly-to-salary-converter": "Convert an hourly wage into daily, weekly, monthly and yearly pay.",
  "bill-splitter-calculator": "Split a shared bill evenly or by custom shares.",
  "simple-interest-calculator": "Calculate simple interest on a loan or deposit over time.",
  "debt-payoff-calculator": "Compare the snowball and avalanche methods to pay off debt faster.",
  "freelance-hourly-rate-calculator": "Work out the hourly rate you need to charge to hit your income goal.",
  "overtime-pay-calculator": "Calculate overtime pay at 1.5x or 2x your regular hourly rate.",
  "401k-contribution-calculator": "Estimate how your 401(k) contributions could grow by retirement.",
  "car-depreciation-calculator": "Estimate how much a car's value drops over the years you own it.",
  "lease-vs-buy-car-calculator": "Compare the total cost of leasing a car with buying one.",
  "property-tax-estimator": "Get a rough property tax estimate from your home's value and local rate.",
  "college-savings-calculator": "Project how a 529 college savings plan grows with regular contributions.",
  "social-security-fra-calculator": "Find your full retirement age and how it affects your benefit, based on birth year.",
  "shoe-size-converter": "Convert shoe sizes between US, UK, EU and CM.",
  "clothing-size-converter": "Convert clothing sizes between US, UK, EU and international charts.",
  "ring-size-converter": "Convert ring sizes between US, UK and EU systems.",
  "oven-temperature-converter": "Convert oven temperatures between Fahrenheit, Celsius and gas mark.",

  // Generators batch 2
  "fantasy-name-generator": "Generate RPG and fantasy character names for games and stories.",
  "baby-name-generator": "Get baby name ideas filtered by origin, meaning or style.",
  "pet-name-generator": "Get cute, funny or unique name ideas for a new pet.",
  "license-plate-generator": "Generate random, fictional license plate styles for design or fun.",
  "typing-speed-test": "Test your typing speed and accuracy in words per minute.",
  "reaction-time-test": "Test how fast your reflexes are with a simple click challenge.",
  "vin-decoder": "Decode a VIN to see a vehicle's make, model, year and specs.",
  "snow-day-predictor": "Get a fun, weather based guess at tomorrow's snow day odds.",
  "us-holiday-countdown": "Count down to the next US public holiday.",
  "daylight-saving-countdown": "Count down to the next daylight saving clock change in the US, Europe or Australia.",
  "fantasy-points-calculator": "Calculate fantasy sports points from a player's stat line.",
  "gaming-session-time-calculator": "Estimate total playtime from your levels, missions and the average time for each.",
  "tournament-bracket-generator": "Generate a printable single elimination bracket for any number of teams.",

  // Design & SEO batch 2
  "color-name-finder": "Find the closest named color for any HEX or RGB value.",
  "twitter-thread-splitter": "Split long text into numbered, tweet sized posts for an X thread.",

  // Life & Everyday
  "dog-food-safety-checker": "Check whether a food is safe, unsafe or toxic for dogs.",
  "dog-age-calculator": "Convert your dog's age to human years, based on its size.",
  "cat-age-calculator": "Convert your cat's age to human years and see its life stage.",
  "pet-calorie-calculator": "Estimate your pet's daily calorie needs from its weight and activity level.",
  "dog-walking-time-calculator": "Get a recommended daily walk time for your dog's breed and age.",
  "food-calorie-burn-calculator": "See roughly how many steps it takes to burn off the calories in a food.",
  "sleep-cycle-calculator": "Find the best time to go to bed using 90 minute sleep cycles and your wake time.",
  "standing-vs-sitting-calculator": "Compare the calories you burn standing versus sitting over a set time.",
  "stretching-routine-generator": "Generate a stretching routine for a body part and the time you have.",
  "study-time-calculator": "Build a study plan by splitting your topics across the days before an exam.",
  "reading-time-calculator": "Estimate how long a piece of text takes to read at any pace.",
  "grade-percentage-calculator": "Calculate a percentage and letter grade from marks obtained and total marks.",
  "gpa-to-percentage-converter": "Convert a GPA on any common scale into a percentage.",
  "scholarship-eligibility-checker": "Check which scholarships you may qualify for by country, field of study and grades.",
  "recipe-scaler": "Scale ingredient amounts up or down for any number of servings.",
  "baking-conversion-calculator": "Convert baking measurements between cups, grams, tablespoons and ml.",
  "coffee-water-ratio-calculator": "Get the right coffee to water ratio for your cup count and strength.",
  "cooking-time-calculator": "Estimate cooking time for meat from its type and weight.",
  "freezing-time-estimator": "Estimate how long a food takes to freeze solid.",
  "flight-co2-calculator": "Estimate the CO2 emissions of a flight by distance and travel class.",
  "road-trip-cost-calculator": "Calculate the fuel cost of a road trip from distance and mileage.",
  "luggage-weight-checker": "Add up your item weights and check them against airline luggage limits.",
  "travel-budget-planner": "Plan your trip budget from daily accommodation, food and transport costs.",
  "timezone-meeting-planner": "Find overlapping meeting times across two or three time zones.",
  "paint-quantity-calculator": "Calculate how much paint a room needs from its dimensions.",
  "carpet-area-calculator": "Calculate room area and estimated carpet cost from length and width.",
  "moving-box-calculator": "Estimate how many boxes of each size you need for a move.",
  "electricity-bill-estimator": "Estimate your monthly electricity cost from appliance usage.",
  "garden-soil-calculator": "Calculate how much soil a garden bed needs from its dimensions.",
  "wedding-budget-calculator": "Break down a wedding budget by guest count and spending category.",
  "party-food-calculator": "Estimate how much food to prepare from your guest count and event type.",
  "event-seating-planner": "Work out table counts and a seating layout from your guest list.",
  "invitation-word-counter": "Count words and characters in your invitation text to plan print sizing.",
  "running-pace-calculator": "Calculate running pace per kilometer or mile from distance and time.",
  "cycling-speed-calculator": "Calculate cycling speed, distance or time from any two of the three.",
  "pregnancy-due-date-calculator": "Estimate your due date and trimester timeline from the first day of your last period.",
  "baby-feeding-schedule-generator": "Generate a baby feeding schedule template based on your baby's age.",
  "diaper-changes-estimator": "Estimate how many diapers your baby uses each day and plan how much to stock.",
  "child-growth-percentile-checker": "Check your child's height and weight percentile from birth to age 5.",
  "carbon-footprint-calculator": "Get a rough yearly CO2 estimate from your driving, flights, diet and home energy.",
  "plastic-usage-estimator": "Estimate your household's yearly single use plastic from everyday habits.",
  "tree-planting-impact-calculator": "Estimate the CO2 offset from the number of trees you plant.",
  "recycling-savings-calculator": "Estimate the money and CO2 you save from the items you recycle.",
  "ev-vs-petrol-calculator": "Compare running costs and payback time between an electric and a petrol car.",
};

let src = fs.readFileSync(FILE, "utf8");
const done = [], missing = [];

for (const [slug, text] of Object.entries(D)) {
  const re = new RegExp(`(slug: "${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}",[^\\n]*?description: )"((?:[^"\\\\]|\\\\.)*)"`);
  if (!re.test(src)) { missing.push(slug); continue; }
  src = src.replace(re, (_, pre) => `${pre}${JSON.stringify(text)}`);
  done.push(slug);
}

fs.writeFileSync(FILE, src);
console.log(`Updated descriptions for ${done.length} of ${Object.keys(D).length} tools.`);
if (missing.length) console.log("Not found:", missing.join(", "));

// Slugs in tools.js that this script does not cover
const all = [...src.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
const skipped = all.filter((s) => !(s in D));
if (skipped.length) console.log("Not covered by this script:", skipped.join(", "));

const bad = [...src.matchAll(/description: "([^"]*)"/g)].filter((m) => /[\u2014\u2013]/.test(m[1]));
console.log(bad.length ? `Still has dashes in ${bad.length} descriptions` : "No em/en dashes left in descriptions.");

// Central tools registry. Adding a new tool = add one object here.
// `implemented: true` tools have a real component in /src/tools-impl and are wired
// in /src/tools-impl/registry.js. Everything else renders <ToolComingSoon /> until built —
// the route, SEO metadata, sitemap entry and card all work from day one either way.
export const TOOLS = [
  // Image & PDF Tools
  { slug: "pdf-to-image", name: "PDF to Image Converter", category: "image-pdf-tools", icon: "FileImage", description: "Convert PDF pages into JPG or PNG images in seconds — no account required.", popular: true, implemented: false },
  { slug: "image-to-pdf", name: "Image to PDF", category: "image-pdf-tools", icon: "FileText", description: "Combine one or more images into a single PDF with custom layout and ordering.", implemented: false },
  { slug: "text-to-pdf", name: "Text to PDF", category: "image-pdf-tools", icon: "FileText", description: "Turn plain text into a formatted PDF with headers, watermarks and templates.", implemented: false },
  { slug: "image-converter", name: "Image Converter", category: "image-pdf-tools", icon: "RefreshCw", description: "Convert between JPG, PNG and WebP with transparent background handling.", implemented: false },
  { slug: "image-resizer", name: "Image Resizer", category: "image-pdf-tools", icon: "Maximize", description: "Resize images by pixels or percentage with aspect ratio lock.", implemented: false },
  { slug: "bulk-image-resizer", name: "Bulk Image Resizer", category: "image-pdf-tools", icon: "Images", description: "Resize multiple images at once and download them as a ZIP file.", implemented: false },
  { slug: "image-compressor", name: "Image Compressor", category: "image-pdf-tools", icon: "Minimize2", description: "Compress images with lossy or lossless options and bulk support.", popular: true, implemented: false },
  { slug: "image-crop-tool", name: "Image Crop Tool", category: "image-pdf-tools", icon: "Crop", description: "Crop images freeform or to fixed ratios, with rotation support.", implemented: false },
  { slug: "image-to-text-ocr", name: "Image to Text (OCR)", category: "image-pdf-tools", icon: "ScanText", description: "Extract text from any image using on-device optical character recognition.", popular: true, implemented: false },
  { slug: "screenshot-to-text", name: "Screenshot to Text", category: "image-pdf-tools", icon: "Camera", description: "Paste a screenshot straight from your clipboard to extract its text instantly.", implemented: false },
  { slug: "meme-generator", name: "Meme Generator", category: "image-pdf-tools", icon: "Laugh", description: "Add top/bottom caption text to any image in the classic meme style.", implemented: false },
  { slug: "background-remover", name: "Background Remover", category: "image-pdf-tools", icon: "ImageOff", description: "Remove the background from a photo automatically, right in your browser.", implemented: false },
  { slug: "image-watermark-adder", name: "Image Watermark Adder", category: "image-pdf-tools", icon: "Stamp", description: "Add a text or logo watermark to one image or a whole batch at once.", implemented: false },
  { slug: "photo-collage-maker", name: "Photo Collage Maker", category: "image-pdf-tools", icon: "LayoutGrid", description: "Arrange multiple photos into a collage using ready-made grid layouts.", implemented: false },
  { slug: "favicon-generator", name: "Favicon Generator", category: "image-pdf-tools", icon: "Image", description: "Generate a full favicon set in every size a browser or device needs.", implemented: false },
  { slug: "svg-to-png-converter", name: "SVG to PNG Converter", category: "image-pdf-tools", icon: "FileType2", description: "Convert an SVG file to a PNG at any resolution you choose.", implemented: false },

  // Video & Audio Tools
  { slug: "video-compressor", name: "Video Compressor", category: "video-audio-tools", icon: "FileVideo", description: "Shrink video file size in your browser while keeping the quality watchable.", implemented: false },
  { slug: "gif-maker", name: "GIF Maker (Video to GIF)", category: "video-audio-tools", icon: "Clapperboard", description: "Turn a short video clip into a looping GIF, trimmed to the part you want.", implemented: false },
  { slug: "audio-trimmer", name: "Audio Trimmer", category: "video-audio-tools", icon: "AudioLines", description: "Cut an audio clip down to the exact section you need and export it.", implemented: false },
  { slug: "screen-recorder", name: "Screen Recorder", category: "video-audio-tools", icon: "MonitorPlay", description: "Record your own screen and download the clip — nothing is uploaded.", implemented: false },

  // Text & Writing Tools
  { slug: "word-counter", name: "Word Counter", category: "text-writing-tools", icon: "Type", description: "Count words, characters and paragraphs with reading-time analysis.", popular: true, implemented: true },
  { slug: "case-converter", name: "Case Converter", category: "text-writing-tools", icon: "CaseSensitive", description: "Convert text to uppercase, lowercase, title case and more.", implemented: false },
  { slug: "fancy-text-generator", name: "Fancy Text Generator", category: "text-writing-tools", icon: "Sparkles", description: "Turn plain text into stylish fonts for social media bios and posts.", implemented: false },
  { slug: "text-to-handwriting", name: "Text to Handwriting", category: "text-writing-tools", icon: "PenLine", description: "Convert typed text into realistic handwriting on paper-style backgrounds.", implemented: false },
  { slug: "hashtag-generator", name: "Hashtag Generator", category: "text-writing-tools", icon: "Hash", description: "Generate relevant hashtags with reach and engagement estimates.", implemented: false },
  { slug: "lorem-ipsum-generator", name: "Lorem Ipsum Generator", category: "text-writing-tools", icon: "AlignLeft", description: "Generate placeholder paragraphs, sentences or word counts for mockups and layouts.", implemented: false },
  { slug: "text-diff-checker", name: "Text Diff Checker", category: "text-writing-tools", icon: "GitCompare", description: "Compare two blocks of text and highlight exactly what changed.", implemented: false },
  { slug: "text-to-speech", name: "Text to Speech", category: "text-writing-tools", icon: "Volume2", description: "Convert typed text into natural-sounding speech you can play or download.", implemented: false },
  { slug: "speech-to-text", name: "Speech to Text", category: "text-writing-tools", icon: "Mic", description: "Dictate into your microphone and get live, editable text.", implemented: false },
  { slug: "duplicate-line-remover", name: "Duplicate Line Remover", category: "text-writing-tools", icon: "Eraser", description: "Paste a list and instantly remove duplicate or blank lines.", implemented: false },
  { slug: "text-sorter", name: "Text Sorter (A-Z)", category: "text-writing-tools", icon: "ArrowDownAZ", description: "Sort lines of text alphabetically, by length, or in reverse order.", implemented: false },
  { slug: "slug-generator", name: "Slug Generator", category: "text-writing-tools", icon: "Link2", description: "Turn any title into a clean, URL-safe slug for blog posts and pages.", implemented: false },
  { slug: "text-reverser", name: "Text Reverser", category: "text-writing-tools", icon: "FlipHorizontal", description: "Reverse text character by character, word by word, or line by line.", implemented: false },
  { slug: "readability-score-checker", name: "Readability Score Checker", category: "text-writing-tools", icon: "BookOpenCheck", description: "Check the Flesch-Kincaid readability grade of your writing instantly.", implemented: false },
  { slug: "instagram-bio-generator", name: "Instagram Bio Generator", category: "text-writing-tools", icon: "AtSign", description: "Generate catchy Instagram bio ideas from a few keywords about you.", implemented: false },

  // Developer Tools
  { slug: "json-formatter-validator", name: "JSON Formatter & Validator", category: "developer-tools", icon: "Braces", description: "Format, minify and validate JSON with syntax highlighting and error detection.", popular: true, implemented: false },
  { slug: "json-to-csv", name: "JSON to CSV", category: "developer-tools", icon: "Table", description: "Convert JSON data to CSV with nested object flattening and a live preview.", implemented: false },
  { slug: "regex-tester", name: "Regex Tester", category: "developer-tools", icon: "Regex", description: "Test regular expressions with live match highlighting and a quick-reference sheet.", implemented: false },
  { slug: "url-encoder-decoder", name: "URL Encoder/Decoder", category: "developer-tools", icon: "Link", description: "Encode and decode URLs with strict and loose modes.", implemented: false },
  { slug: "base64-encoder-decoder", name: "Base64 Encoder/Decoder", category: "developer-tools", icon: "Binary", description: "Encode or decode text and files to and from Base64.", implemented: false },
  { slug: "meta-tags-generator", name: "Meta Tags Generator", category: "developer-tools", icon: "Tags", description: "Generate SEO meta tags with live Google, Facebook and Twitter previews.", implemented: false },
  { slug: "robots-txt-generator", name: "Robots.txt Generator", category: "developer-tools", icon: "Bot", description: "Create and validate robots.txt files with a visual rule builder.", implemented: false },
  { slug: "fake-data-generator", name: "Fake Data Generator", category: "developer-tools", icon: "Database", description: "Generate fake users, emails, JSON and CSV for development and testing.", implemented: false },
  { slug: "markdown-editor-previewer", name: "Markdown Editor & Previewer", category: "developer-tools", icon: "FileCode", description: "Write Markdown on one side and see the live-rendered preview on the other.", implemented: false },
  { slug: "html-formatter-beautifier", name: "HTML Formatter/Beautifier", category: "developer-tools", icon: "Code", description: "Clean up messy, minified or inconsistently indented HTML in one click.", implemented: false },
  { slug: "css-formatter-minifier", name: "CSS Formatter/Minifier", category: "developer-tools", icon: "Paintbrush", description: "Beautify or minify CSS with configurable indentation.", implemented: false },
  { slug: "js-formatter-minifier", name: "JS Formatter/Minifier", category: "developer-tools", icon: "FileJson", description: "Format or minify JavaScript for readability or production size.", implemented: false },
  { slug: "xml-formatter-validator", name: "XML Formatter & Validator", category: "developer-tools", icon: "FileCode2", description: "Pretty-print and validate XML documents with error line numbers.", implemented: false },
  { slug: "yaml-to-json-converter", name: "YAML to JSON Converter", category: "developer-tools", icon: "FileInput", description: "Convert YAML configuration files to JSON and back, instantly.", implemented: false },
  { slug: "cron-expression-generator", name: "Cron Expression Generator", category: "developer-tools", icon: "Clock", description: "Build and explain cron expressions with a plain-English breakdown.", implemented: false },
  { slug: "uuid-guid-generator", name: "UUID/GUID Generator", category: "developer-tools", icon: "Fingerprint", description: "Generate bulk v4 UUIDs/GUIDs in your preferred format.", implemented: false },
  { slug: "hash-generator", name: "Hash Generator (MD5/SHA-256)", category: "developer-tools", icon: "KeyRound", description: "Generate MD5, SHA-1 and SHA-256 hashes from text or files, on-device.", implemented: false },
  { slug: "jwt-decoder", name: "JWT Decoder", category: "developer-tools", icon: "KeySquare", description: "Decode a JWT's header and payload and inspect its claims and expiry.", implemented: false },
  { slug: "timestamp-converter", name: "Timestamp Converter (Unix ↔ Date)", category: "developer-tools", icon: "Timer", description: "Convert Unix timestamps to human-readable dates and back, in any timezone.", implemented: false },
  { slug: "color-contrast-checker", name: "Color Contrast Checker (WCAG)", category: "developer-tools", icon: "Contrast", description: "Check foreground/background color contrast against WCAG AA and AAA.", implemented: false },

  // Calculators & Converters
  { slug: "percentage-calculator", name: "Percentage Calculator", category: "calculators", icon: "Percent", description: "Calculate percentages with a visual breakdown of the formula used.", implemented: false },
  { slug: "scientific-calculator", name: "Scientific Calculator", category: "calculators", icon: "Sigma", description: "Advanced calculator with trigonometry, logarithms and memory functions.", implemented: true },
  { slug: "gpa-calculator", name: "GPA Calculator", category: "calculators", icon: "GraduationCap", description: "Calculate GPA or CGPA with weighted credits and custom grading scales.", implemented: false },
  { slug: "emi-calculator", name: "EMI Calculator", category: "calculators", icon: "Landmark", description: "Calculate loan installments with a prepayment and amortization schedule.", implemented: false },
  { slug: "age-calculator", name: "Age Calculator", category: "calculators", icon: "Cake", description: "Calculate exact age in years, months and days from a date of birth.", implemented: false },
  { slug: "bmi-calculator", name: "BMI Calculator", category: "calculators", icon: "Activity", description: "Calculate BMI and see which healthy-weight range you fall in.", popular: true, implemented: true },
  { slug: "discount-calculator", name: "Discount Calculator", category: "calculators", icon: "Tag", description: "Work out sale prices, tax and BOGO deals in one step.", implemented: false },
  { slug: "unit-converter", name: "Unit Converter", category: "calculators", icon: "ArrowLeftRight", description: "Convert length, weight, temperature and more with high precision.", implemented: false },
  { slug: "love-calculator", name: "Love Calculator", category: "calculators", icon: "Heart", description: "A fun compatibility calculator with a simple breakdown chart.", implemented: false },
  { slug: "loan-calculator", name: "Loan Calculator", category: "calculators", icon: "HandCoins", description: "Work out monthly payments and total interest on any loan.", implemented: false },
  { slug: "mortgage-calculator", name: "Mortgage Calculator", category: "calculators", icon: "Home", description: "Estimate monthly mortgage payments including taxes and insurance.", implemented: false },
  { slug: "salary-take-home-calculator", name: "Salary / Take-Home Pay Calculator", category: "calculators", icon: "Wallet", description: "Estimate your take-home pay after common deductions.", implemented: false },
  { slug: "tip-calculator", name: "Tip Calculator", category: "calculators", icon: "Receipt", description: "Split a bill and calculate the tip in seconds.", implemented: false },
  { slug: "currency-converter", name: "Currency Converter", category: "calculators", icon: "Coins", description: "Convert between world currencies using live exchange rates.", implemented: false },
  { slug: "calorie-calculator-tdee", name: "Calorie Calculator (TDEE)", category: "calculators", icon: "Flame", description: "Estimate your daily calorie needs based on activity level and goals.", implemented: false },
  { slug: "macro-calculator", name: "Macro Calculator", category: "calculators", icon: "PieChart", description: "Calculate a daily protein, carb and fat target from your calorie goal.", implemented: false },
  { slug: "retirement-savings-calculator", name: "Retirement Savings Calculator", category: "calculators", icon: "PiggyBank", description: "Project retirement savings growth based on contributions and returns.", implemented: false },
  { slug: "car-loan-calculator", name: "Car Loan Calculator", category: "calculators", icon: "Car", description: "Calculate monthly car loan payments including trade-in and down payment.", implemented: false },
  { slug: "investment-return-calculator", name: "Investment Return Calculator", category: "calculators", icon: "LineChart", description: "Project investment growth with regular contributions over time.", implemented: false },
  { slug: "water-intake-calculator", name: "Water Intake Calculator", category: "calculators", icon: "Droplets", description: "Estimate your recommended daily water intake based on weight and activity.", implemented: false },
  { slug: "heart-rate-zone-calculator", name: "Heart Rate Zone Calculator", category: "calculators", icon: "HeartPulse", description: "Calculate your training heart rate zones from age and resting heart rate.", implemented: false },
  { slug: "break-even-calculator", name: "Break-Even Calculator", category: "calculators", icon: "Scale", description: "Find the sales volume where your business starts turning a profit.", implemented: false },
  { slug: "compound-interest-calculator", name: "Compound Interest Calculator", category: "calculators", icon: "BadgePercent", description: "See how savings or investments grow with compound interest over time.", implemented: false },
  { slug: "roman-numeral-converter", name: "Roman Numeral Converter", category: "calculators", icon: "Repeat", description: "Convert numbers to Roman numerals and back, instantly.", implemented: false },
  { slug: "invoice-generator", name: "Invoice Generator", category: "calculators", icon: "FileSpreadsheet", description: "Create a professional PDF invoice with your logo, line items and totals.", implemented: false },
  { slug: "profit-margin-calculator", name: "Profit Margin Calculator", category: "calculators", icon: "BadgeDollarSign", description: "Calculate gross profit margin and markup from cost and sale price.", implemented: false },

  // Generators & Random Tools
  { slug: "password-generator", name: "Secure Password Generator", category: "generators-security", icon: "ShieldCheck", description: "Generate strong, random passwords with an entropy strength meter.", popular: true, implemented: false },
  { slug: "passphrase-generator", name: "Passphrase Generator", category: "generators-security", icon: "KeyRound", description: "Generate memorable, secure passphrases using Diceware-style logic.", implemented: false },
  { slug: "qr-code-generator", name: "QR Code Generator", category: "generators-security", icon: "QrCode", description: "Create custom QR codes with logos, colors and multiple data types.", popular: true, implemented: false },
  { slug: "random-number-generator", name: "Random Number Generator", category: "generators-security", icon: "Dices", description: "Generate random numbers, pick from a list, or roll custom dice.", implemented: false },
  { slug: "business-name-generator", name: "Business Name Generator", category: "generators-security", icon: "Briefcase", description: "Generate brandable business names with taglines and domain ideas.", implemented: false },
  { slug: "password-strength-checker", name: "Password Strength Checker", category: "generators-security", icon: "ShieldAlert", description: "Check how strong a password is and how long it would take to crack.", implemented: false },
  { slug: "barcode-generator", name: "Barcode Generator", category: "generators-security", icon: "ScanLine", description: "Generate scannable barcodes in common formats like Code128 and EAN.", implemented: false },
  { slug: "wheel-of-names", name: "Wheel of Names / Random Picker", category: "generators-security", icon: "RotateCw", description: "Spin a wheel to fairly pick a random name, winner or option from a list.", implemented: false },
  { slug: "coin-flip-dice-roller", name: "Coin Flip & Dice Roller", category: "generators-security", icon: "Circle", description: "Flip a coin or roll one or more dice with a fair, on-device random result.", implemented: false },
  { slug: "random-team-generator", name: "Random Team Generator", category: "generators-security", icon: "Users", description: "Split a list of names into randomized, evenly sized teams.", implemented: false },
  { slug: "nickname-generator", name: "Nickname Generator", category: "generators-security", icon: "UserCircle", description: "Generate fun nickname ideas based on a name or personality trait.", implemented: false },
  { slug: "countdown-timer-generator", name: "Countdown Timer Generator", category: "generators-security", icon: "AlarmClock", description: "Create a shareable countdown to any date and time.", implemented: false },

  // Design & Color Tools
  { slug: "color-picker", name: "Color Picker", category: "design-color-tools", icon: "Pipette", description: "Pick colors from images with an eyedropper and check contrast ratios.", implemented: false },
  { slug: "hex-rgb-converter", name: "HEX to RGB Converter", category: "design-color-tools", icon: "Palette", description: "Convert between HEX, RGB, HSL and CMYK color formats instantly.", implemented: false },
  { slug: "palette-generator", name: "Palette Generator", category: "design-color-tools", icon: "SwatchBook", description: "Extract a color palette from any image and export it in one click.", implemented: false },

  // SEO & Marketing Tools
  { slug: "utm-link-builder", name: "UTM Link Builder", category: "seo-marketing-tools", icon: "Link", description: "Build campaign-tagged UTM links for accurate traffic tracking.", implemented: false },
  { slug: "open-graph-preview-generator", name: "Open Graph Preview Generator", category: "seo-marketing-tools", icon: "Layout", description: "Preview how a link will look when shared on Facebook, X or LinkedIn.", implemented: false },
  { slug: "keyword-density-checker", name: "Keyword Density Checker", category: "seo-marketing-tools", icon: "SearchCheck", description: "Check how often a keyword or phrase appears in a block of content.", implemented: false },
  { slug: "meta-description-length-checker", name: "Meta Description Length Checker", category: "seo-marketing-tools", icon: "Ruler", description: "Check whether a title or meta description will get cut off in search results.", implemented: false },
];

export function getToolBySlug(slug) {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(categorySlug) {
  return TOOLS.filter((t) => t.category === categorySlug);
}

export function getPopularTools(limit = 8) {
  return TOOLS.filter((t) => t.popular).slice(0, limit);
}

export function getRelatedTools(tool, limit = 4) {
  return TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, limit);
}
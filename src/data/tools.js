// Central tools registry. Adding a new tool = add one object here.
// `implemented: true` tools have a real component in /src/tools-impl and are wired
// in /src/tools-impl/registry.js. Everything else renders <ToolComingSoon /> until built —
// the route, SEO metadata, sitemap entry and card all work from day one either way.
export const TOOLS = [

  // Image & PDF Tools
  { slug: "pdf-to-image", name: "PDF to Image Converter", category: "image-pdf-tools", icon: "FileImage", description: "Convert PDF pages into JPG or PNG images in seconds — no account required.", popular: true, implemented: true },
  { slug: "image-to-pdf", name: "Image to PDF", category: "image-pdf-tools", icon: "FileText", description: "Combine one or more images into a single PDF with custom layout and ordering.", implemented: true },
  { slug: "text-to-pdf", name: "Text to PDF", category: "image-pdf-tools", icon: "FileText", description: "Turn plain text into a formatted PDF with headers, watermarks and templates.", implemented: true },
  { slug: "image-converter", name: "Image Converter", category: "image-pdf-tools", icon: "RefreshCw", description: "Convert between JPG, PNG and WebP with transparent background handling.", implemented: true },
  { slug: "image-resizer", name: "Image Resizer", category: "image-pdf-tools", icon: "Maximize", description: "Resize images by pixels or percentage with aspect ratio lock.", implemented: true },
  { slug: "bulk-image-resizer", name: "Bulk Image Resizer", category: "image-pdf-tools", icon: "Images", description: "Resize multiple images at once and download them as a ZIP file.", implemented: true },
  { slug: "image-compressor", name: "Image Compressor", category: "image-pdf-tools", icon: "Minimize2", description: "Compress images with lossy or lossless options and bulk support.", popular: true, implemented: true },
  { slug: "image-crop-tool", name: "Image Crop Tool", category: "image-pdf-tools", icon: "Crop", description: "Crop images freeform or to fixed ratios, with rotation support.", implemented: true },
  { slug: "image-to-text-ocr", name: "Image to Text (OCR)", category: "image-pdf-tools", icon: "ScanText", description: "Extract text from any image using on-device optical character recognition.", popular: true, implemented: true },
  { slug: "screenshot-to-text", name: "Screenshot to Text", category: "image-pdf-tools", icon: "Camera", description: "Paste a screenshot straight from your clipboard to extract its text instantly.", implemented: true },
  { slug: "meme-generator", name: "Meme Generator", category: "image-pdf-tools", icon: "Laugh", description: "Add top/bottom caption text to any image in the classic meme style.", implemented: true },
  { slug: "background-remover", name: "Background Remover", category: "image-pdf-tools", icon: "ImageOff", description: "Remove the background from a photo automatically, right in your browser.", implemented: true },
  { slug: "image-watermark-adder", name: "Image Watermark Adder", category: "image-pdf-tools", icon: "Stamp", description: "Add a text or logo watermark to one image or a whole batch at once.", implemented: true },
  { slug: "photo-collage-maker", name: "Photo Collage Maker", category: "image-pdf-tools", icon: "LayoutGrid", description: "Arrange multiple photos into a collage using ready-made grid layouts.", implemented: true },
  { slug: "favicon-generator", name: "Favicon Generator", category: "image-pdf-tools", icon: "Image", description: "Generate a full favicon set in every size a browser or device needs.", implemented: true },
  { slug: "svg-to-png-converter", name: "SVG to PNG Converter", category: "image-pdf-tools", icon: "FileType2", description: "Convert an SVG file to a PNG at any resolution you choose.", implemented: true },

  // Video & Audio Tools
  { slug: "video-compressor", name: "Video Compressor", category: "video-audio-tools", icon: "FileVideo", description: "Shrink video file size in your browser while keeping the quality watchable.", implemented: true },
  { slug: "gif-maker", name: "GIF Maker (Video to GIF)", category: "video-audio-tools", icon: "Clapperboard", description: "Turn a short video clip into a looping GIF, trimmed to the part you want.", implemented: true },
  { slug: "audio-trimmer", name: "Audio Trimmer", category: "video-audio-tools", icon: "AudioLines", description: "Cut an audio clip down to the exact section you need and export it.", implemented: true },
  { slug: "screen-recorder", name: "Screen Recorder", category: "video-audio-tools", icon: "MonitorPlay", description: "Record your own screen and download the clip — nothing is uploaded.", implemented: true },

  // Text & Writing Tools
  { slug: "word-counter", name: "Word Counter", category: "text-writing-tools", icon: "Type", description: "Count words, characters and paragraphs with reading-time analysis.", popular: true, implemented: true },
  { slug: "case-converter", name: "Case Converter", category: "text-writing-tools", icon: "CaseSensitive", description: "Convert text to uppercase, lowercase, title case and more.", implemented: true },
  { slug: "fancy-text-generator", name: "Fancy Text Generator", category: "text-writing-tools", icon: "Sparkles", description: "Turn plain text into stylish fonts for social media bios and posts.", implemented: true },
  { slug: "text-to-handwriting", name: "Text to Handwriting", category: "text-writing-tools", icon: "PenLine", description: "Convert typed text into realistic handwriting on paper-style backgrounds.", implemented: true },
  { slug: "hashtag-generator", name: "Hashtag Generator", category: "text-writing-tools", icon: "Hash", description: "Generate relevant hashtags with reach and engagement estimates.", implemented: true },
  { slug: "lorem-ipsum-generator", name: "Lorem Ipsum Generator", category: "text-writing-tools", icon: "AlignLeft", description: "Generate placeholder paragraphs, sentences or word counts for mockups and layouts.", implemented: true },
  { slug: "text-diff-checker", name: "Text Diff Checker", category: "text-writing-tools", icon: "GitCompare", description: "Compare two blocks of text and highlight exactly what changed.", implemented: true },
  { slug: "text-to-speech", name: "Text to Speech", category: "text-writing-tools", icon: "Volume2", description: "Convert typed text into natural-sounding speech you can play or download.", implemented: true },
  { slug: "speech-to-text", name: "Speech to Text", category: "text-writing-tools", icon: "Mic", description: "Dictate into your microphone and get live, editable text.", implemented: false },
  { slug: "duplicate-line-remover", name: "Duplicate Line Remover", category: "text-writing-tools", icon: "Eraser", description: "Paste a list and instantly remove duplicate or blank lines.", implemented: true },
  { slug: "text-sorter", name: "Text Sorter (A-Z)", category: "text-writing-tools", icon: "ArrowDownAZ", description: "Sort lines of text alphabetically, by length, or in reverse order.", implemented: true },
  { slug: "slug-generator", name: "Slug Generator", category: "text-writing-tools", icon: "Link2", description: "Turn any title into a clean, URL-safe slug for blog posts and pages.", implemented: true },
  { slug: "text-reverser", name: "Text Reverser", category: "text-writing-tools", icon: "FlipHorizontal", description: "Reverse text character by character, word by word, or line by line.", implemented: true },
  { slug: "readability-score-checker", name: "Readability Score Checker", category: "text-writing-tools", icon: "BookOpenCheck", description: "Check the Flesch-Kincaid readability grade of your writing instantly.", implemented: true },
  { slug: "instagram-bio-generator", name: "Instagram Bio Generator", category: "text-writing-tools", icon: "AtSign", description: "Generate catchy Instagram bio ideas from a few keywords about you.", implemented: true },

  // Developer Tools
  { slug: "json-formatter-validator", name: "JSON Formatter & Validator", category: "developer-tools", icon: "Braces", description: "Format, minify and validate JSON with syntax highlighting and error detection.", popular: true, implemented: true },
  { slug: "json-to-csv", name: "JSON to CSV", category: "developer-tools", icon: "Table", description: "Convert JSON data to CSV with nested object flattening and a live preview.", implemented: true },
  { slug: "regex-tester", name: "Regex Tester", category: "developer-tools", icon: "Regex", description: "Test regular expressions with live match highlighting and a quick-reference sheet.", implemented: true },
  { slug: "url-encoder-decoder", name: "URL Encoder/Decoder", category: "developer-tools", icon: "Link", description: "Encode and decode URLs with strict and loose modes.", implemented: true },
  { slug: "base64-encoder-decoder", name: "Base64 Encoder/Decoder", category: "developer-tools", icon: "Binary", description: "Encode or decode text and files to and from Base64.", implemented: true },
  { slug: "meta-tags-generator", name: "Meta Tags Generator", category: "developer-tools", icon: "Tags", description: "Generate SEO meta tags with live Google, Facebook and Twitter previews.", implemented: true },
  { slug: "robots-txt-generator", name: "Robots.txt Generator", category: "developer-tools", icon: "Bot", description: "Create and validate robots.txt files with a visual rule builder.", implemented: true },
  { slug: "fake-data-generator", name: "Fake Data Generator", category: "developer-tools", icon: "Database", description: "Generate fake users, emails, JSON and CSV for development and testing.", implemented: true },
  { slug: "markdown-editor-previewer", name: "Markdown Editor & Previewer", category: "developer-tools", icon: "FileCode", description: "Write Markdown on one side and see the live-rendered preview on the other.", implemented: true },
  { slug: "html-formatter-beautifier", name: "HTML Formatter/Beautifier", category: "developer-tools", icon: "Code", description: "Clean up messy, minified or inconsistently indented HTML in one click.", implemented: true },
  { slug: "css-formatter-minifier", name: "CSS Formatter/Minifier", category: "developer-tools", icon: "Paintbrush", description: "Beautify or minify CSS with configurable indentation.", implemented: true },
  { slug: "js-formatter-minifier", name: "JS Formatter/Minifier", category: "developer-tools", icon: "FileJson", description: "Format or minify JavaScript for readability or production size.", implemented: true },
  { slug: "xml-formatter-validator", name: "XML Formatter & Validator", category: "developer-tools", icon: "FileCode2", description: "Pretty-print and validate XML documents with error line numbers.", implemented: true },
  { slug: "yaml-to-json-converter", name: "YAML to JSON Converter", category: "developer-tools", icon: "FileInput", description: "Convert YAML configuration files to JSON and back, instantly.", implemented: true },
  { slug: "cron-expression-generator", name: "Cron Expression Generator", category: "developer-tools", icon: "Clock", description: "Build and explain cron expressions with a plain-English breakdown.", implemented: true },
  { slug: "uuid-guid-generator", name: "UUID/GUID Generator", category: "developer-tools", icon: "Fingerprint", description: "Generate bulk v4 UUIDs/GUIDs in your preferred format.", implemented: true },
  { slug: "hash-generator", name: "Hash Generator (MD5/SHA-256)", category: "developer-tools", icon: "KeyRound", description: "Generate MD5, SHA-1 and SHA-256 hashes from text or files, on-device.", implemented: true },
  { slug: "jwt-decoder", name: "JWT Decoder", category: "developer-tools", icon: "KeySquare", description: "Decode a JWT's header and payload and inspect its claims and expiry.", implemented: true },
  { slug: "timestamp-converter", name: "Timestamp Converter (Unix ↔ Date)", category: "developer-tools", icon: "Timer", description: "Convert Unix timestamps to human-readable dates and back, in any timezone.", implemented: true },
  { slug: "color-contrast-checker", name: "Color Contrast Checker (WCAG)", category: "developer-tools", icon: "Contrast", description: "Check foreground/background color contrast against WCAG AA and AAA.", implemented: true },

  // Calculators & Converters
  { slug: "percentage-calculator", name: "Percentage Calculator", category: "calculators", icon: "Percent", description: "Calculate percentages with a visual breakdown of the formula used.", implemented: true },
  { slug: "scientific-calculator", name: "Scientific Calculator", category: "calculators", icon: "Sigma", description: "Advanced calculator with trigonometry, logarithms and memory functions.", implemented: true },
  { slug: "gpa-calculator", name: "GPA Calculator", category: "calculators", icon: "GraduationCap", description: "Calculate GPA or CGPA with weighted credits and custom grading scales.", implemented: true },
  { slug: "emi-calculator", name: "EMI Calculator", category: "calculators", icon: "Landmark", description: "Calculate loan installments with a prepayment and amortization schedule.", implemented: true },
  { slug: "age-calculator", name: "Age Calculator", category: "calculators", icon: "Cake", description: "Calculate exact age in years, months and days from a date of birth.", implemented: true },
  { slug: "bmi-calculator", name: "BMI Calculator", category: "calculators", icon: "Activity", description: "Calculate BMI and see which healthy-weight range you fall in.", popular: true, implemented: true },
  { slug: "discount-calculator", name: "Discount Calculator", category: "calculators", icon: "Tag", description: "Work out sale prices, tax and BOGO deals in one step.", implemented: true },
  { slug: "unit-converter", name: "Unit Converter", category: "calculators", icon: "ArrowLeftRight", description: "Convert length, weight, temperature and more with high precision.", implemented: true },
  { slug: "love-calculator", name: "Love Calculator", category: "calculators", icon: "Heart", description: "A fun compatibility calculator with a simple breakdown chart.", implemented: true },
  { slug: "loan-calculator", name: "Loan Calculator", category: "calculators", icon: "HandCoins", description: "Work out monthly payments and total interest on any loan.", implemented: true },
  { slug: "mortgage-calculator", name: "Mortgage Calculator", category: "calculators", icon: "Home", description: "Estimate monthly mortgage payments including taxes and insurance.", implemented: true },
  { slug: "salary-take-home-calculator", name: "Salary / Take-Home Pay Calculator", category: "calculators", icon: "Wallet", description: "Estimate your take-home pay after common deductions.", implemented: true },
  { slug: "tip-calculator", name: "Tip Calculator", category: "calculators", icon: "Receipt", description: "Split a bill and calculate the tip in seconds.", implemented: true },
  { slug: "currency-converter", name: "Currency Converter", category: "calculators", icon: "Coins", description: "Convert between world currencies using live exchange rates.", implemented: true },
  { slug: "calorie-calculator-tdee", name: "Calorie Calculator (TDEE)", category: "calculators", icon: "Flame", description: "Estimate your daily calorie needs based on activity level and goals.", implemented: true },
  { slug: "macro-calculator", name: "Macro Calculator", category: "calculators", icon: "PieChart", description: "Calculate a daily protein, carb and fat target from your calorie goal.", implemented: true },
  { slug: "retirement-savings-calculator", name: "Retirement Savings Calculator", category: "calculators", icon: "PiggyBank", description: "Project retirement savings growth based on contributions and returns.", implemented: true },
  { slug: "car-loan-calculator", name: "Car Loan Calculator", category: "calculators", icon: "Car", description: "Calculate monthly car loan payments including trade-in and down payment.", implemented: true },
  { slug: "investment-return-calculator", name: "Investment Return Calculator", category: "calculators", icon: "LineChart", description: "Project investment growth with regular contributions over time.", implemented: true },
  { slug: "water-intake-calculator", name: "Water Intake Calculator", category: "calculators", icon: "Droplets", description: "Estimate your recommended daily water intake based on weight and activity.", implemented: true },
  { slug: "heart-rate-zone-calculator", name: "Heart Rate Zone Calculator", category: "calculators", icon: "HeartPulse", description: "Calculate your training heart rate zones from age and resting heart rate.", implemented: true },
  { slug: "break-even-calculator", name: "Break-Even Calculator", category: "calculators", icon: "Scale", description: "Find the sales volume where your business starts turning a profit.", implemented: true },
  { slug: "compound-interest-calculator", name: "Compound Interest Calculator", category: "calculators", icon: "BadgePercent", description: "See how savings or investments grow with compound interest over time.", implemented: true },
  { slug: "roman-numeral-converter", name: "Roman Numeral Converter", category: "calculators", icon: "Repeat", description: "Convert numbers to Roman numerals and back, instantly.", implemented: true },
  { slug: "invoice-generator", name: "Invoice Generator", category: "calculators", icon: "FileSpreadsheet", description: "Create a professional PDF invoice with your logo, line items and totals.", implemented: true },
  { slug: "profit-margin-calculator", name: "Profit Margin Calculator", category: "calculators", icon: "BadgeDollarSign", description: "Calculate gross profit margin and markup from cost and sale price.", implemented: true },

  // Generators & Random Tools
  { slug: "password-generator", name: "Secure Password Generator", category: "generators-security", icon: "ShieldCheck", description: "Generate strong, random passwords with an entropy strength meter.", popular: true, implemented: true },
  { slug: "passphrase-generator", name: "Passphrase Generator", category: "generators-security", icon: "KeyRound", description: "Generate memorable, secure passphrases using Diceware-style logic.", implemented: true },
  { slug: "qr-code-generator", name: "QR Code Generator", category: "generators-security", icon: "QrCode", description: "Create custom QR codes with logos, colors and multiple data types.", popular: true, implemented: true },
  { slug: "random-number-generator", name: "Random Number Generator", category: "generators-security", icon: "Dices", description: "Generate random numbers, pick from a list, or roll custom dice.", implemented: true },
  { slug: "business-name-generator", name: "Business Name Generator", category: "generators-security", icon: "Briefcase", description: "Generate brandable business names with taglines and domain ideas.", implemented: true },
  { slug: "password-strength-checker", name: "Password Strength Checker", category: "generators-security", icon: "ShieldAlert", description: "Check how strong a password is and how long it would take to crack.", implemented: false },
  { slug: "barcode-generator", name: "Barcode Generator", category: "generators-security", icon: "ScanLine", description: "Generate scannable barcodes in common formats like Code128 and EAN.", implemented: false },
  { slug: "gamertag-generator", name: "Gamertag Generator", category: "generators-security", icon: "Gamepad2", description: "Generate unique gamertags and gaming usernames for Xbox, PlayStation, Steam and more.", implemented: false },
  { slug: "coin-flip-dice-roller", name: "Coin Flip & Dice Roller", category: "generators-security", icon: "Circle", description: "Flip a coin or roll one or more dice with a fair, on-device random result.", implemented: true },
  { slug: "random-team-generator", name: "Random Team Generator", category: "generators-security", icon: "Users", description: "Split a list of names into randomized, evenly sized teams.", implemented: true },
  { slug: "nickname-generator", name: "Nickname Generator", category: "generators-security", icon: "UserCircle", description: "Generate fun nickname ideas based on a name or personality trait.", implemented: true },
  { slug: "countdown-timer-generator", name: "Countdown Timer Generator", category: "generators-security", icon: "AlarmClock", description: "Create a shareable countdown to any date and time.", implemented: true },

  // Design & Color Tools
  { slug: "color-picker", name: "Color Picker", category: "design-color-tools", icon: "Pipette", description: "Pick colors from images with an eyedropper and check contrast ratios.", implemented: true },
  { slug: "hex-rgb-converter", name: "HEX to RGB Converter", category: "design-color-tools", icon: "Palette", description: "Convert between HEX, RGB, HSL and CMYK color formats instantly.", implemented: true },
  { slug: "palette-generator", name: "Palette Generator", category: "design-color-tools", icon: "SwatchBook", description: "Extract a color palette from any image and export it in one click.", implemented: true },

  // SEO & Marketing Tools
  { slug: "utm-link-builder", name: "UTM Link Builder", category: "seo-marketing-tools", icon: "Link", description: "Build campaign-tagged UTM links for accurate traffic tracking.", implemented: true },
  { slug: "open-graph-preview-generator", name: "Open Graph Preview Generator", category: "seo-marketing-tools", icon: "Layout", description: "Preview how a link will look when shared on Facebook, X or LinkedIn.", implemented: true },
  { slug: "keyword-density-checker", name: "Keyword Density Checker", category: "seo-marketing-tools", icon: "SearchCheck", description: "Check how often a keyword or phrase appears in a block of content.", implemented: true },
  { slug: "meta-description-length-checker", name: "Meta Description Length Checker", category: "seo-marketing-tools", icon: "Ruler", description: "Check whether a title or meta description will get cut off in search results.", implemented: true },


// Text & Writing Tools (batch 2 — quick-win additions)
  { slug: "character-counter", name: "Character Counter (Platform Limits)", category: "text-writing-tools", icon: "Ruler", description: "Count characters against live limits for X/Twitter, SMS, and meta descriptions.", implemented: true },
  { slug: "morse-code-translator", name: "Morse Code Translator", category: "text-writing-tools", icon: "Radio", description: "Translate text to Morse code and back, with audio playback.", implemented: true },
  { slug: "nato-phonetic-alphabet-converter", name: "NATO Phonetic Alphabet Converter", category: "text-writing-tools", icon: "Radio", description: "Convert any text into the NATO phonetic alphabet (Alpha, Bravo, Charlie...).", implemented: true },
  { slug: "pig-latin-translator", name: "Pig Latin Translator", category: "text-writing-tools", icon: "Shuffle", description: "Translate English text into Pig Latin instantly.", implemented: true },
  { slug: "anagram-solver", name: "Anagram Solver", category: "text-writing-tools", icon: "Shuffle", description: "Find real words that can be made from a set of letters.", implemented: true },
  { slug: "text-repeater", name: "Text Repeater", category: "text-writing-tools", icon: "Repeat", description: "Repeat any word, sentence or emoji a set number of times.", implemented: true },
  { slug: "whitespace-remover", name: "Extra Space / Whitespace Remover", category: "text-writing-tools", icon: "Eraser", description: "Strip extra spaces, tabs and blank lines from pasted text.", implemented: true },
  { slug: "letter-frequency-counter", name: "Letter Frequency Counter", category: "text-writing-tools", icon: "BarChart3", description: "Count how often each letter appears in a block of text.", implemented: true },

// Developer Tools (batch 2 — quick-win additions)
  { slug: "data-storage-converter", name: "Data Storage Converter (MB/GB/TB)", category: "developer-tools", icon: "HardDrive", description: "Convert between bytes, KB, MB, GB and TB instantly.", implemented: true },
  { slug: "number-base-converter", name: "Number Base Converter (Bin/Dec/Hex/Oct)", category: "developer-tools", icon: "Binary", description: "Convert numbers between binary, decimal, hexadecimal and octal.", implemented: true },
  { slug: "text-binary-converter", name: "Text to Binary Converter", category: "developer-tools", icon: "Binary", description: "Convert plain text to binary code and back.", implemented: true },
  { slug: "csv-to-json-converter", name: "CSV to JSON Converter", category: "developer-tools", icon: "Table", description: "Convert CSV data into clean, nested or flat JSON.", implemented: true },
  { slug: "json-diff-checker", name: "JSON Diff Checker", category: "developer-tools", icon: "GitCompare", description: "Compare two JSON objects and highlight exactly what changed.", implemented: true },
  { slug: "markdown-to-html-converter", name: "Markdown to HTML Converter", category: "developer-tools", icon: "FileCode", description: "Convert Markdown into clean, ready-to-paste HTML.", implemented: true },
  { slug: "html-to-markdown-converter", name: "HTML to Markdown Converter", category: "developer-tools", icon: "FileCode2", description: "Convert HTML into clean Markdown for docs, notes or blogs.", implemented: true },
  { slug: "css-gradient-generator", name: "CSS Gradient Generator", category: "developer-tools", icon: "Paintbrush", description: "Design linear or radial gradients and copy ready-to-use CSS.", implemented: true },
  { slug: "css-box-shadow-generator", name: "CSS Box-Shadow Generator", category: "developer-tools", icon: "Square", description: "Build a box-shadow visually and copy the CSS instantly.", implemented: true },
  { slug: "css-clamp-calculator", name: "CSS clamp() Calculator", category: "developer-tools", icon: "Move", description: "Generate a responsive CSS clamp() value from a min and max size.", implemented: true },
  { slug: "htaccess-generator", name: ".htaccess Generator", category: "developer-tools", icon: "FileCog", description: "Generate common .htaccess rules for redirects, caching and rewrites.", implemented: true },
  { slug: "xml-sitemap-generator", name: "XML Sitemap Generator", category: "developer-tools", icon: "Map", description: "Generate a valid XML sitemap for any list of page URLs.", implemented: true },
  { slug: "sql-formatter-minifier", name: "SQL Formatter / Minifier", category: "developer-tools", icon: "Database", description: "Format messy SQL for readability or minify it for production.", implemented: true },
  { slug: "placeholder-image-generator", name: "Placeholder Image Generator", category: "developer-tools", icon: "ImagePlus", description: "Generate placeholder images at any size for mockups and layouts.", implemented: true },

// Calculators & Converters (batch 2 — quick-win additions)
  { slug: "date-difference-calculator", name: "Date Difference Calculator", category: "calculators", icon: "CalendarRange", description: "Calculate the exact number of days, months or years between two dates.", implemented: true },
  { slug: "work-days-calculator", name: "Work Days Calculator", category: "calculators", icon: "CalendarCheck", description: "Calculate business days between two dates, excluding weekends.", implemented: true },
  { slug: "time-duration-calculator", name: "Time Duration Calculator", category: "calculators", icon: "Hourglass", description: "Add or subtract hours, minutes and seconds between two times.", implemented: true },
  { slug: "hourly-to-salary-converter", name: "Hourly to Salary Converter", category: "calculators", icon: "Wallet", description: "Convert an hourly wage into daily, weekly, monthly and yearly pay.", implemented: true },
  { slug: "bill-splitter-calculator", name: "Bill Splitter Calculator", category: "calculators", icon: "Receipt", description: "Split a shared bill evenly or by custom shares between friends.", implemented: true },
  { slug: "simple-interest-calculator", name: "Simple Interest Calculator", category: "calculators", icon: "Percent", description: "Calculate simple interest on a loan or deposit over time.", implemented: true },
  { slug: "debt-payoff-calculator", name: "Debt Payoff Calculator", category: "calculators", icon: "CreditCard", description: "Compare snowball vs avalanche strategies to pay off debt faster.", implemented: true },
  { slug: "freelance-hourly-rate-calculator", name: "Freelance Hourly Rate Calculator", category: "calculators", icon: "Briefcase", description: "Work out the hourly rate you need to charge to hit your income goal.", implemented: true },
  { slug: "overtime-pay-calculator", name: "Overtime Pay Calculator", category: "calculators", icon: "Clock", description: "Calculate overtime pay at 1.5x or 2x your regular hourly rate.", implemented: true },
  { slug: "401k-contribution-calculator", name: "401(k) Contribution Calculator", category: "calculators", icon: "PiggyBank", description: "Estimate retirement savings growth from your 401(k) contributions.", implemented: true },
  { slug: "car-depreciation-calculator", name: "Car Depreciation Calculator", category: "calculators", icon: "Car", description: "Estimate how much a car's value will drop over the years you own it.", implemented: true },
  { slug: "lease-vs-buy-car-calculator", name: "Lease vs Buy Car Calculator", category: "calculators", icon: "Car", description: "Compare the total cost of leasing versus buying a car.", implemented: true },
  { slug: "property-tax-estimator", name: "Property Tax Estimator", category: "calculators", icon: "Home", description: "Get a rough property tax estimate based on your home's value and local rate.", implemented: true },
  { slug: "college-savings-calculator", name: "529 College Savings Growth Calculator", category: "calculators", icon: "GraduationCap", description: "Project how a college savings plan grows with regular contributions.", implemented: true },
  { slug: "social-security-fra-calculator", name: "Social Security Full Retirement Age Calculator", category: "calculators", icon: "Landmark", description: "Find your full retirement age and benefit impact based on birth year.", implemented: true },
  { slug: "shoe-size-converter", name: "Shoe Size Converter", category: "calculators", icon: "Footprints", description: "Convert shoe sizes between US, UK, EU and CM instantly.", implemented: true },
  { slug: "clothing-size-converter", name: "Clothing Size Converter", category: "calculators", icon: "Shirt", description: "Convert clothing sizes between US, UK, EU and international charts.", implemented: true },
  { slug: "ring-size-converter", name: "Ring Size Converter", category: "calculators", icon: "Circle", description: "Convert ring sizes between US, UK, EU sizing systems.", implemented: true },
  { slug: "oven-temperature-converter", name: "Oven Temperature Converter", category: "calculators", icon: "Thermometer", description: "Convert oven temperatures between Fahrenheit, Celsius and gas mark.", implemented: true },

// Generators & Random Tools (batch 2 — quick-win additions)
  { slug: "fantasy-name-generator", name: "Fantasy Name Generator", category: "generators-security", icon: "Sparkles", description: "Generate RPG and fantasy character names for games and stories.", implemented: true },
  { slug: "baby-name-generator", name: "Baby Name Generator", category: "generators-security", icon: "Baby", description: "Generate baby name ideas filtered by origin, meaning or style.", implemented: true },
  { slug: "pet-name-generator", name: "Pet Name Generator", category: "generators-security", icon: "PawPrint", description: "Generate cute, funny or unique name ideas for a new pet.", implemented: true },
  { slug: "license-plate-generator", name: "License Plate Generator", category: "generators-security", icon: "Car", description: "Generate random, fictional license plate styles for design or fun.", implemented: true },
  { slug: "typing-speed-test", name: "Typing Speed Test (WPM)", category: "generators-security", icon: "Keyboard", description: "Test your typing speed and accuracy in words per minute.", implemented: true },
  { slug: "reaction-time-test", name: "Reaction Time Test", category: "generators-security", icon: "Zap", description: "Test how fast your reflexes are with a simple click challenge.", implemented: true },
  { slug: "vin-decoder", name: "VIN Decoder", category: "generators-security", icon: "Car", description: "Decode a vehicle's VIN to see its make, model, year and specs.", implemented: true },
  { slug: "snow-day-predictor", name: "Snow Day Predictor", category: "generators-security", icon: "Snowflake", description: "Get a fun, weather-based prediction of tomorrow's snow-day odds.", implemented: true },
  { slug: "us-holiday-countdown", name: "US Public Holiday Countdown", category: "generators-security", icon: "CalendarClock", description: "Count down to the next US public holiday.", implemented: true },
  { slug: "daylight-saving-countdown", name: "Daylight Saving Time Countdown", category: "generators-security", icon: "Clock4", description: "Count down to the next Daylight Saving Time clock change.", implemented: true },
  { slug: "fantasy-points-calculator", name: "Fantasy Points Calculator", category: "generators-security", icon: "Trophy", description: "Calculate fantasy sports points from a player's stat line.", implemented: true },
  { slug: "gaming-session-time-calculator", name: "Gaming Session Time Calculator", category: "generators-security", icon: "Gamepad2", description: "Estimate total playtime from levels, missions and average time each.", implemented: true },
  { slug: "tournament-bracket-generator", name: "Tournament Bracket Generator", category: "generators-security", icon: "Trophy", description: "Generate a printable single-elimination bracket for any number of teams.", implemented: true },

// Design & Color Tools (batch 2 — quick-win additions)
  { slug: "color-name-finder", name: "Color Name Finder", category: "design-color-tools", icon: "Palette", description: "Find the closest named color for any HEX or RGB value.", implemented: true },

// SEO & Marketing Tools (batch 2 — quick-win additions)
  { slug: "twitter-thread-splitter", name: "X/Twitter Thread Splitter", category: "seo-marketing-tools", icon: "MessagesSquare", description: "Split a long piece of text into numbered, tweet-sized posts.", implemented: true },

// Life & Everyday Tools
  { slug: "dog-food-safety-checker", name: "Can My Dog Eat This? (Food Safety Checker)", category: "life-everyday-tools", icon: "Dog", description: "Check whether a food item is safe, unsafe or toxic for dogs.", implemented: true },
  { slug: "dog-age-calculator", name: "Dog Age to Human Years Calculator", category: "life-everyday-tools", icon: "Dog", description: "Convert your dog's age to human years based on breed size.", implemented: true },
  { slug: "cat-age-calculator", name: "Cat Age to Human Years Calculator", category: "life-everyday-tools", icon: "Cat", description: "Convert your cat's age into human-equivalent years.", implemented: true },
  { slug: "pet-calorie-calculator", name: "Pet Calorie Needs Calculator", category: "life-everyday-tools", icon: "Bone", description: "Estimate your pet's daily calorie needs from weight and activity level.", implemented: true },
  { slug: "dog-walking-time-calculator", name: "Dog Walking Time Calculator", category: "life-everyday-tools", icon: "Dog", description: "Get a recommended daily walk time based on your dog's breed and age.", implemented: true },
  { slug: "food-calorie-burn-calculator", name: "Steps to Burn Food Calculator", category: "life-everyday-tools", icon: "Footprints", description: "See roughly how many steps it takes to burn off a food item's calories.", implemented: true },
  { slug: "sleep-cycle-calculator", name: "Sleep Cycle Bedtime Calculator", category: "life-everyday-tools", icon: "Moon", description: "Find the best bedtime based on 90-minute sleep cycles and your wake time.", implemented: true },
  { slug: "standing-vs-sitting-calculator", name: "Standing vs Sitting Calorie Burn", category: "life-everyday-tools", icon: "Activity", description: "Compare calories burned standing versus sitting over a set time.", implemented: true },
  { slug: "stretching-routine-generator", name: "Stretching Routine Generator", category: "life-everyday-tools", icon: "PersonStanding", description: "Generate a custom stretching routine for a body part and time available.", implemented: true },
  { slug: "study-time-calculator", name: "Study Time Calculator (Exam Prep)", category: "life-everyday-tools", icon: "BookOpen", description: "Build a study plan by splitting topics across the days before an exam.", implemented: true },
  { slug: "reading-time-calculator", name: "Reading Time Calculator", category: "life-everyday-tools", icon: "BookOpenText", description: "Estimate how long a piece of text takes to read at any pace.", implemented: true },
  { slug: "grade-percentage-calculator", name: "Grade Percentage Calculator", category: "life-everyday-tools", icon: "GraduationCap", description: "Calculate a percentage and letter grade from marks obtained and total marks.", implemented: true },
  { slug: "gpa-to-percentage-converter", name: "GPA to Percentage Converter", category: "life-everyday-tools", icon: "GraduationCap", description: "Convert a GPA on any common scale into an equivalent percentage.", implemented: true },
  { slug: "scholarship-eligibility-checker", name: "Scholarship Eligibility Checker", category: "life-everyday-tools", icon: "Award", description: "Check which scholarships you may be eligible for by country, field and grades.", implemented: true },
  { slug: "recipe-scaler", name: "Recipe Scaler (Ingredient Adjuster)", category: "life-everyday-tools", icon: "ChefHat", description: "Automatically scale ingredient amounts up or down for any serving size.", implemented: true },
  { slug: "baking-conversion-calculator", name: "Baking Conversion Calculator", category: "life-everyday-tools", icon: "Cookie", description: "Convert baking measurements between cups, grams, tablespoons and ml.", implemented: true },
  { slug: "coffee-water-ratio-calculator", name: "Coffee to Water Ratio Calculator", category: "life-everyday-tools", icon: "Coffee", description: "Get the right coffee-to-water ratio for your cup count and strength.", implemented: true },
  { slug: "cooking-time-calculator", name: "Cooking Time by Weight Calculator", category: "life-everyday-tools", icon: "Utensils", description: "Estimate cooking time for meat based on its type and weight.", implemented: true },
  { slug: "freezing-time-estimator", name: "Freezing Time Estimator", category: "life-everyday-tools", icon: "Snowflake", description: "Estimate how long a food item takes to freeze solid.", implemented: true },
  { slug: "flight-co2-calculator", name: "Flight CO2 Emissions Calculator", category: "life-everyday-tools", icon: "Plane", description: "Estimate the CO2 emissions from a flight by distance and class.", implemented: true },
  { slug: "road-trip-cost-calculator", name: "Road Trip Cost Calculator", category: "life-everyday-tools", icon: "Fuel", description: "Calculate total fuel cost for a road trip from distance and mileage.", implemented: true },
  { slug: "luggage-weight-checker", name: "Luggage Weight Checker", category: "life-everyday-tools", icon: "Luggage", description: "Add up item weights to check your luggage against airline limits.", implemented: true },
  { slug: "travel-budget-planner", name: "Travel Budget Planner (Daily)", category: "life-everyday-tools", icon: "Wallet", description: "Plan a total trip budget from daily accommodation, food and transport costs.", implemented: true },
  { slug: "timezone-meeting-planner", name: "Timezone Meeting Planner", category: "life-everyday-tools", icon: "Globe2", description: "Find overlapping meeting times across two or three time zones.", implemented: true },
  { slug: "paint-quantity-calculator", name: "Paint Quantity Calculator", category: "life-everyday-tools", icon: "PaintBucket", description: "Calculate how much paint a room needs from its dimensions.", implemented: true },
  { slug: "carpet-area-calculator", name: "Carpet Area Calculator", category: "life-everyday-tools", icon: "LayoutGrid", description: "Calculate room area and estimated carpet cost from length and width.", implemented: true },
  { slug: "moving-box-calculator", name: "Moving Box Calculator", category: "life-everyday-tools", icon: "Package", description: "Estimate how many boxes of each size you'll need for a move.", implemented: true },
  { slug: "electricity-bill-estimator", name: "Electricity Bill Estimator", category: "life-everyday-tools", icon: "Zap", description: "Estimate your monthly electricity cost from appliance usage.", implemented: true },
  { slug: "garden-soil-calculator", name: "Garden Soil Volume Calculator", category: "life-everyday-tools", icon: "Sprout", description: "Calculate how much soil a garden bed needs from its dimensions.", implemented: true },
  { slug: "wedding-budget-calculator", name: "Wedding Budget Calculator", category: "life-everyday-tools", icon: "Heart", description: "Break down a wedding budget by guest count and spending category.", implemented: true },
  { slug: "party-food-calculator", name: "Party Food Quantity Calculator", category: "life-everyday-tools", icon: "Pizza", description: "Estimate how much food to prepare based on guest count and event type.", implemented: true },
  { slug: "event-seating-planner", name: "Event Seating Arrangement Planner", category: "life-everyday-tools", icon: "Armchair", description: "Work out table counts and a seating layout from your guest list.", implemented: true },
  { slug: "invitation-word-counter", name: "Invitation Word Counter", category: "life-everyday-tools", icon: "MailOpen", description: "Count words and characters in invitation text for print sizing.", implemented: true },
  { slug: "running-pace-calculator", name: "Running Pace Calculator", category: "life-everyday-tools", icon: "Footprints", description: "Calculate running pace per kilometer or mile from distance and time.", implemented: true },
  { slug: "cycling-speed-calculator", name: "Cycling Speed & Distance Calculator", category: "life-everyday-tools", icon: "Bike", description: "Calculate cycling speed, distance or time from any two of the three.", implemented: true },
  { slug: "pregnancy-due-date-calculator", name: "Pregnancy Due Date Calculator", category: "life-everyday-tools", icon: "Baby", description: "Estimate a due date and trimester timeline from the last period date.", implemented: true },
  { slug: "baby-feeding-schedule-generator", name: "Baby Feeding Schedule Generator", category: "life-everyday-tools", icon: "Baby", description: "Generate a feeding frequency and schedule template based on baby's age.", implemented: true },
  { slug: "diaper-changes-estimator", name: "Diaper Changes Per Day Estimator", category: "life-everyday-tools", icon: "Baby", description: "Estimate average daily diaper changes based on your baby's age.", implemented: true },
  { slug: "child-growth-percentile-checker", name: "Child Growth Percentile Checker", category: "life-everyday-tools", icon: "TrendingUp", description: "Check a child's height/weight percentile against standard growth charts.", implemented: true },
  { slug: "carbon-footprint-calculator", name: "Carbon Footprint Calculator (Simple)", category: "life-everyday-tools", icon: "Leaf", description: "Get a rough personal CO2 estimate from travel, electricity and diet habits.", implemented: true },
  { slug: "plastic-usage-estimator", name: "Plastic Usage Estimator", category: "life-everyday-tools", icon: "Recycle", description: "Estimate your household's plastic waste based on everyday habits.", implemented: true },
  { slug: "tree-planting-impact-calculator", name: "Tree Planting Impact Calculator", category: "life-everyday-tools", icon: "TreePine", description: "Estimate the CO2 offset from a number of trees planted.", implemented: true },
  { slug: "recycling-savings-calculator", name: "Recycling Savings Calculator", category: "life-everyday-tools", icon: "Recycle", description: "Estimate money and CO2 saved from items you recycle.", implemented: true },
  { slug: "ev-vs-petrol-calculator", name: "EV vs Petrol Cost Calculator", category: "life-everyday-tools", icon: "Fuel", description: "Compare running costs between an electric and a petrol vehicle.", implemented: true },
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
  return scoreRelatedTools(tool, limit);
}

// --- Relevance engine for "Related tools" ---------------------------------
// Plain "same category" matching kept showing the same handful of tools on
// every page in a big category (Calculators alone has 45 tools). This scores
// every other tool by actual topical overlap — shared words in its name and
// description, not just the category label — so a genuinely related tool in
// a *different* category (e.g. "BMI Calculator" <-> "Calorie Calculator")
// can outrank a same-category tool that has nothing else in common. Ties are
// broken with a stable per-source-tool shuffle so different pages in the
// same category don't all surface an identical set.

const STOPWORDS = new Set([
  "a","an","the","and","or","for","to","of","in","on","with","your","you","from",
  "into","is","are","this","that","free","online","browser","instantly","instant",
  "any","one","or","using","use","based","get","how","many","also","right","all",
]);
const GENERIC_TOOL_WORDS = new Set([
  "calculator","converter","generator","checker","tool","estimator","planner",
  "builder","tools","finder","maker","validator","formatter","minifier","decoder",
  "encoder","tester",
]);

function tokenize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

let keywordCache = null;
function getKeywordIndex() {
  if (keywordCache) return keywordCache;
  keywordCache = new Map();
  for (const t of TOOLS) {
    const nameTokens = tokenize(t.name);
    const descTokens = tokenize(t.description);
    keywordCache.set(t.slug, {
      nameWords: new Set(nameTokens.filter((w) => !STOPWORDS.has(w) && !GENERIC_TOOL_WORDS.has(w))),
      descWords: new Set(descTokens.filter((w) => !STOPWORDS.has(w) && !GENERIC_TOOL_WORDS.has(w))),
      genericWords: new Set(nameTokens.concat(descTokens).filter((w) => GENERIC_TOOL_WORDS.has(w))),
    });
  }
  return keywordCache;
}

function hashPair(a, b) {
  const s = `${a}::${b}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function relevanceScore(a, b, index) {
  let score = a.category === b.category ? 3 : 0;
  const ka = index.get(a.slug);
  const kb = index.get(b.slug);
  if (!ka || !kb) return score;

  for (const w of ka.nameWords) if (kb.nameWords.has(w)) score += 5;
  for (const w of ka.nameWords) if (kb.descWords.has(w)) score += 2;
  for (const w of ka.descWords) if (kb.nameWords.has(w)) score += 2;
  for (const w of ka.descWords) if (kb.descWords.has(w)) score += 1;
  for (const w of ka.genericWords) if (kb.genericWords.has(w)) score += 1;
  return score;
}

function scoreRelatedTools(tool, limit) {
  const index = getKeywordIndex();
  const scored = TOOLS.filter((t) => t.slug !== tool.slug).map((t) => ({
    tool: t,
    score: relevanceScore(tool, t, index),
    tiebreak: hashPair(tool.slug, t.slug),
  }));

  scored.sort((x, y) => y.score - x.score || x.tiebreak - y.tiebreak);
  return scored.slice(0, limit).map((s) => s.tool);
}

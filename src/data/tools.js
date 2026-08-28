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

  // Text & Writing Tools
  { slug: "word-counter", name: "Word Counter", category: "text-writing-tools", icon: "Type", description: "Count words, characters and paragraphs with reading-time analysis.", popular: true, implemented: true },
  { slug: "case-converter", name: "Case Converter", category: "text-writing-tools", icon: "CaseSensitive", description: "Convert text to uppercase, lowercase, title case and more.", implemented: false },
  { slug: "fancy-text-generator", name: "Fancy Text Generator", category: "text-writing-tools", icon: "Sparkles", description: "Turn plain text into stylish fonts for social media bios and posts.", implemented: false },
  { slug: "text-to-handwriting", name: "Text to Handwriting", category: "text-writing-tools", icon: "PenLine", description: "Convert typed text into realistic handwriting on paper-style backgrounds.", implemented: false },
  { slug: "hashtag-generator", name: "Hashtag Generator", category: "text-writing-tools", icon: "Hash", description: "Generate relevant hashtags with reach and engagement estimates.", implemented: false },

  // Developer Tools
  { slug: "json-formatter-validator", name: "JSON Formatter & Validator", category: "developer-tools", icon: "Braces", description: "Format, minify and validate JSON with syntax highlighting and error detection.", popular: true, implemented: false },
  { slug: "json-to-csv", name: "JSON to CSV", category: "developer-tools", icon: "Table", description: "Convert JSON data to CSV with nested object flattening and a live preview.", implemented: false },
  { slug: "regex-tester", name: "Regex Tester", category: "developer-tools", icon: "Regex", description: "Test regular expressions with live match highlighting and a quick-reference sheet.", implemented: false },
  { slug: "url-encoder-decoder", name: "URL Encoder/Decoder", category: "developer-tools", icon: "Link", description: "Encode and decode URLs with strict and loose modes.", implemented: false },
  { slug: "base64-encoder-decoder", name: "Base64 Encoder/Decoder", category: "developer-tools", icon: "Binary", description: "Encode or decode text and files to and from Base64.", implemented: false },
  { slug: "meta-tags-generator", name: "Meta Tags Generator", category: "developer-tools", icon: "Tags", description: "Generate SEO meta tags with live Google, Facebook and Twitter previews.", implemented: false },
  { slug: "robots-txt-generator", name: "Robots.txt Generator", category: "developer-tools", icon: "Bot", description: "Create and validate robots.txt files with a visual rule builder.", implemented: false },
  { slug: "fake-data-generator", name: "Fake Data Generator", category: "developer-tools", icon: "Database", description: "Generate fake users, emails, JSON and CSV for development and testing.", implemented: false },

  // Calculators & Converters
  { slug: "percentage-calculator", name: "Percentage Calculator", category: "calculators", icon: "Percent", description: "Calculate percentages with a visual breakdown of the formula used.", implemented: false },
  { slug: "scientific-calculator", name: "Scientific Calculator", category: "calculators", icon: "Sigma", description: "Advanced calculator with trigonometry, logarithms and memory functions.", implemented: false },
  { slug: "gpa-calculator", name: "GPA Calculator", category: "calculators", icon: "GraduationCap", description: "Calculate GPA or CGPA with weighted credits and custom grading scales.", implemented: false },
  { slug: "emi-calculator", name: "EMI Calculator", category: "calculators", icon: "Landmark", description: "Calculate loan installments with a prepayment and amortization schedule.", implemented: false },
  { slug: "age-calculator", name: "Age Calculator", category: "calculators", icon: "Cake", description: "Calculate exact age in years, months and days from a date of birth.", implemented: false },
  { slug: "bmi-calculator", name: "BMI Calculator", category: "calculators", icon: "Activity", description: "Calculate BMI and see which healthy-weight range you fall in.", popular: true, implemented: true },
  { slug: "discount-calculator", name: "Discount Calculator", category: "calculators", icon: "Tag", description: "Work out sale prices, tax and BOGO deals in one step.", implemented: false },
  { slug: "unit-converter", name: "Unit Converter", category: "calculators", icon: "ArrowLeftRight", description: "Convert length, weight, temperature and more with high precision.", implemented: false },
  { slug: "love-calculator", name: "Love Calculator", category: "calculators", icon: "Heart", description: "A fun compatibility calculator with a simple breakdown chart.", implemented: false },

  // Generators & Security
  { slug: "password-generator", name: "Secure Password Generator", category: "generators-security", icon: "ShieldCheck", description: "Generate strong, random passwords with an entropy strength meter.", popular: true, implemented: false },
  { slug: "passphrase-generator", name: "Passphrase Generator", category: "generators-security", icon: "KeyRound", description: "Generate memorable, secure passphrases using Diceware-style logic.", implemented: false },
  { slug: "qr-code-generator", name: "QR Code Generator", category: "generators-security", icon: "QrCode", description: "Create custom QR codes with logos, colors and multiple data types.", popular: true, implemented: false },
  { slug: "random-number-generator", name: "Random Number Generator", category: "generators-security", icon: "Dices", description: "Generate random numbers, pick from a list, or roll custom dice.", implemented: false },
  { slug: "business-name-generator", name: "Business Name Generator", category: "generators-security", icon: "Briefcase", description: "Generate brandable business names with taglines and domain ideas.", implemented: false },

  // Design & Color Tools
  { slug: "color-picker", name: "Color Picker", category: "design-color-tools", icon: "Pipette", description: "Pick colors from images with an eyedropper and check contrast ratios.", implemented: false },
  { slug: "hex-rgb-converter", name: "HEX to RGB Converter", category: "design-color-tools", icon: "Palette", description: "Convert between HEX, RGB, HSL and CMYK color formats instantly.", implemented: false },
  { slug: "palette-generator", name: "Palette Generator", category: "design-color-tools", icon: "SwatchBook", description: "Extract a color palette from any image and export it in one click.", implemented: false },
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

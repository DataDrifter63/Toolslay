// Replaces getAllToolsContent() at the end of src/lib/toolContent.js with new About + FAQ copy.
//   node scripts/apply-alltools-content.mjs      (run from the project root)
import fs from "node:fs";

const FILE = "src/lib/toolContent.js";
const MARKER = "// Generic version of getCategoryContent() for the";

const NEW_BLOCK = `// Content for the "All tools" state on the /tools page, i.e. when no single
// category is selected. Also feeds the FAQ schema in src/app/tools/page.js.
export function getAllToolsContent(toolCount) {
  const intro = [
    \`Toolslay is a free online toolbox with \${toolCount}+ tools for everyday jobs. Compress an image, merge photos into a PDF, count words, format JSON, work out a loan payment or generate a strong password. Open the tool, do the task and get your result in seconds, with no account and nothing to install.\`,
    "The collection spans nine categories. Image and PDF tools handle conversion, resizing, compression and OCR. Video and audio tools trim, compress and record. Text tools count, convert and compare. Developer tools format and decode code, and calculators cover money, health, dates and units. Generators, design, SEO and everyday planning tools round it out.",
    "Most tools do their work inside your browser tab. Your file or text is processed on your own device, so there is no upload queue and no copy left on a server. A few tools need the internet for one thing, such as the currency converter fetching live exchange rates. Check the page of a specific tool if privacy matters for a particular file.",
    "There is no sign-up, no watermark and no daily limit on the tools here. They work on phones, tablets and laptops in any modern browser, so you can fix a PDF on your commute or test a regex at your desk. Because the heavy lifting happens on your device, big files depend on your own memory more than on any server plan.",
    "Not sure where to start? Search by task, like compress image, EMI or word count, and the grid filters as you type. Popular picks include the PDF to Image converter, Image Compressor, Word Counter, JSON Formatter, BMI Calculator, Password Generator and QR Code Generator. New tools are added often, and each one has its own page with a short guide and FAQ.",
  ];

  const faq = [
    {
      q: "Are Toolslay tools really free?",
      a: "Yes. Every tool is free to use, with no paywall, no watermark and no daily limit. There is no premium tier, and you never need to enter a card or create an account to use any of them.",
    },
    {
      q: "Do I need an account or to install anything?",
      a: "No. Each tool opens in your browser and works straight away. There is no sign-up and nothing to download, on desktop or on mobile.",
    },
    {
      q: "Are my files uploaded to a server?",
      a: "For most tools, no. Files and text are processed in your browser, on your own device. A few tools need a connection for specific data, such as live exchange rates in the currency converter. Check the individual tool page if privacy matters for a certain file.",
    },
    {
      q: "Which tools are the most popular?",
      a: "The most used are the PDF to Image converter, Image Compressor, Image to Text (OCR), Word Counter, JSON Formatter and Validator, BMI Calculator, Secure Password Generator and QR Code Generator.",
    },
    {
      q: "Do the tools work on my phone?",
      a: "Yes. They run in any modern browser, including Chrome, Safari, Firefox and Edge, on Android, iPhone, tablet and desktop. Heavy tasks such as video compression or screen recording work best on a laptop or desktop because they use more memory.",
    },
    {
      q: "How do I find the right tool quickly?",
      a: "Type what you want to do into the search box, for example resize image, loan payment or JSON, or tap a category button to see only that group. Each card has a one line summary, so you can pick the right one without opening it.",
    },
    {
      q: "Can I use these tools offline?",
      a: "Many tools keep working after the page has loaded, because the processing happens on your device. Tools that need live data, like the currency converter, need an internet connection. Load the page first, then go offline.",
    },
    {
      q: "How often are new tools added?",
      a: "New tools are added regularly across the existing categories. Check this page or the blog for the latest additions, and use the contact page if there is a tool you would like to see.",
    },
  ];

  return { intro, faq };
}
`;

let src = fs.readFileSync(FILE, "utf8");
const at = src.indexOf(MARKER);
if (at < 0) { console.log("Marker not found. Nothing changed."); process.exit(1); }
src = src.slice(0, at) + NEW_BLOCK;
fs.writeFileSync(FILE, src);
console.log("getAllToolsContent() replaced.");

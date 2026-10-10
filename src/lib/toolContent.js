import { TOOLS_PAGE_CATEGORY } from "@/data/toolsPageCategory";
// Auto-generates "About this tool" copy and FAQ entries for every tool/category page,
// so every page ships with real, indexable content from day one instead of a thin
// one-line description. This is DEMO content — written to be reasonable placeholder
// copy, but each tool should get a hand-written pass (real screenshots, specific
// examples, accurate limits) before the site is submitted for AdSense review.
//
// Usage:
//   import { getToolContent } from "@/lib/toolContent";
//   const { about, faq } = getToolContent(tool, category);
//
// `about` is an array of paragraph strings (rendered as <p> by ToolPageShell).
// `faq` is an array of { q, a } objects.

const CATEGORY_COPY = {
  "image-pdf-tools": {
    verb: "process",
    audience: "anyone working with scanned documents, screenshots or photos",
    privacyNote:
      "your file never leaves your device — there's no upload step, no waiting on a server queue, and no copy of your document sitting on someone else's storage",
    extraBenefit:
      "because everything runs on your own device, there's no file-size cap tied to a server plan and no daily usage limit",
  },
  "text-writing-tools": {
    verb: "work with",
    audience: "writers, students, marketers and anyone polishing text before it goes out",
    privacyNote:
      "your text is processed locally in the page, so drafts, captions or anything you paste in stays on your own screen",
    extraBenefit:
      "you can paste in as much text as you like — there's no per-request limit and no account needed to keep using it",
  },
  "developer-tools": {
    verb: "work with",
    audience: "developers, QA engineers and anyone debugging data on a deadline",
    privacyNote:
      "payloads, tokens and sample data are parsed in your browser, not sent to a remote API — useful when you're pasting in something you'd rather not upload anywhere",
    extraBenefit:
      "it responds instantly on every keystroke since there's no network round-trip, which matters when you're iterating on a large payload",
  },
  calculators: {
    verb: "calculate",
    audience: "students, professionals and anyone who wants a fast, transparent answer",
    privacyNote:
      "the numbers you enter are calculated on-device and never transmitted anywhere",
    extraBenefit:
      "the formula behind every result is shown alongside the answer, so you can check the working rather than just trusting a black box",
  },
  "generators-security": {
    verb: "generate",
    audience: "anyone setting up a new account or project, or who just needs a fair, unbiased random pick for a game, raffle or team draw",
    privacyNote:
      "values are generated locally using your browser's random number source, and nothing is ever sent to a server or logged anywhere",
    extraBenefit:
      "because generation happens on-device, there's no record of what you generated — not in a database, not in a log file, not anywhere",
  },
  "design-color-tools": {
    verb: "work with",
    audience: "designers, developers and anyone matching colors across a project",
    privacyNote:
      "images and color values are read directly in your browser and never uploaded to a server",
    extraBenefit:
      "results update live as you adjust values, so you can fine-tune a color or palette without repeated page reloads",
  },
  "video-audio-tools": {
    verb: "edit",
    audience: "creators, podcasters, streamers and anyone trimming or compressing a clip before sharing it",
    privacyNote:
      "your video or audio file is processed entirely in your own browser and never uploaded to a server",
    extraBenefit:
      "there's no file-size cap tied to a subscription plan, no watermark, and no waiting on a server-side render queue",
  },
  "seo-marketing-tools": {
    verb: "check",
    audience: "marketers, SEOs and website owners preparing content or links before they go live",
    privacyNote:
      "your URLs and text are checked locally in your browser, not logged on a server",
    extraBenefit:
      "there's no daily query limit like many SEO platforms enforce, so you can check as many pages or links as you need",
  },
  "life-everyday-tools": {
    verb: "work out",
    audience: "anyone planning a trip, a move, a party, a pregnancy, or just everyday life around a pet, a kitchen or a home",
    privacyNote:
      "everything you enter is calculated locally in your browser and never sent anywhere",
    extraBenefit:
      "there's no sign-up and no limit on how many times you can recalculate as your plans change",
  },
};

function getCopy(category) {
  return CATEGORY_COPY[category?.slug] || CATEGORY_COPY["developer-tools"];
}

export function getToolContent(tool, category) {
  const copy = getCopy(category);
  const name = tool.name;

  const about = [
    `${name} is a free, browser-based tool built for ${copy.audience}. ${tool.description} There's nothing to install and nothing to configure — open the tool, do the task, and get your result immediately.`,
    `Like every tool on Toolslay, it runs entirely client-side: ${copy.privacyNote}. That also means it works the same whether you're on a fast office connection or patchy mobile data, since there's no back-and-forth with a server once the page has loaded.`,
    `Beyond privacy, running in the browser has a practical upside — ${copy.extraBenefit}. Use it as often as you need, with no sign-up, no watermark, and no forced upgrade prompt.`,
    `${name} is part of Toolslay's ${category?.name?.toLowerCase() || "tools"} collection. If this isn't quite the right fit, check the related tools below — several cover adjacent tasks in the same category.`,
  ];

  const faq = [
    {
      q: `Is ${name} free to use?`,
      a: `Yes. ${name} is completely free, with no usage limits, no account requirement, and no watermark on the output.`,
    },
    {
      q: "Is my data uploaded to a server?",
      a: `No. ${copy.privacyNote.charAt(0).toUpperCase()}${copy.privacyNote.slice(1)}. Everything happens locally in your browser tab.`,
    },
    {
      q: `Does ${name} work on mobile?`,
      a: "Yes, it works in any modern mobile or desktop browser — Chrome, Safari, Firefox and Edge are all supported. No app download is required.",
    },
    {
      q: "Do I need to create an account?",
      a: "No sign-up is needed for any tool on Toolslay. Just open the page and start using it.",
    },
  ];

  return { about, faq };
}

export function getCategoryContent(category, toolCount) {
  const custom = TOOLS_PAGE_CATEGORY[category?.slug];
  if (custom) {
    return { intro: [custom.lead(toolCount), ...custom.paragraphs], faq: custom.faq };
  }

  // Fallback for any category that has no hand-written copy yet.
  const copy = getCopy(category);
  const name = category?.name || "These tools";
  const intro = [
    `${name} on Toolslay is a set of ${toolCount} free, browser-based tools to ${copy.verb} the everyday tasks in this category. They are built for ${copy.audience}, and ${copy.privacyNote}.`,
    "There is no sign-up and no daily limit. Pick a tool below to get started, or use the search box if you know what you are looking for.",
  ];
  const faq = [
    {
      q: `Are the ${name.toLowerCase()} free to use?`,
      a: "Yes. Every tool in this category is free, with no hidden limits or premium tier.",
    },
    {
      q: "Which tool should I start with?",
      a: "Each card has a one line summary of what the tool does, so read through them and open the one that matches your task.",
    },
  ];
  return { intro, faq };
}

// Content for the "All tools" state on the /tools page, i.e. when no single
// category is selected. Also feeds the FAQ schema in src/app/tools/page.js.
export function getAllToolsContent(toolCount) {
  const intro = [
    `Toolslay is a free online toolbox with ${toolCount}+ tools for everyday jobs. Compress an image, merge photos into a PDF, count words, format JSON, work out a loan payment or generate a strong password. Open the tool, do the task and get your result in seconds, with no account and nothing to install.`,
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

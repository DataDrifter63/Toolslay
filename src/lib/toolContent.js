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
    audience: "anyone setting up a new account, project or system that needs random, unpredictable values",
    privacyNote:
      "values are generated locally using your browser's cryptographically secure random number source, and nothing is ever sent to a server or logged anywhere",
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
};

function getCopy(category) {
  return CATEGORY_COPY[category?.slug] || CATEGORY_COPY["developer-tools"];
}

export function getToolContent(tool, category) {
  const copy = getCopy(category);
  const name = tool.name;

  const about = [
    `${name} is a free, browser-based tool built for ${copy.audience}. ${tool.description} There's nothing to install and nothing to configure — open the tool, do the task, and get your result immediately.`,
    `Like every tool on ToolSlay, it runs entirely client-side: ${copy.privacyNote}. That also means it works the same whether you're on a fast office connection or patchy mobile data, since there's no back-and-forth with a server once the page has loaded.`,
    `Beyond privacy, running in the browser has a practical upside — ${copy.extraBenefit}. Use it as often as you need, with no sign-up, no watermark, and no forced upgrade prompt.`,
    `${name} is part of ToolSlay's ${category?.name?.toLowerCase() || "tools"} collection. If this isn't quite the right fit, check the related tools below — several cover adjacent tasks in the same category.`,
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
      a: "No sign-up is needed for any tool on ToolSlay. Just open the page and start using it.",
    },
  ];

  return { about, faq };
}

export function getCategoryContent(category, toolCount) {
  const copy = getCopy(category);
  const name = category.name;

  const intro = [
    `${name} on ToolSlay is a collection of ${toolCount} free, browser-based tools to ${copy.verb} the everyday tasks that come up in this category. Every tool here is built for ${copy.audience}, and every one of them runs entirely in your browser — ${copy.privacyNote}.`,
    `None of these tools require sign-up, and there's no daily limit on how many times you can use them. Pick a tool below to get started, or use the search bar at the top of the page if you know what you're looking for.`,
  ];

  const faq = [
    {
      q: `Are the ${name.toLowerCase()} free to use?`,
      a: "Yes, every tool in this category is completely free, with no hidden limits or premium tier.",
    },
    {
      q: "Do these tools work without an internet connection?",
      a: "Once the page has loaded, most tools in this category continue to work without a live connection, since processing happens on your device rather than a server.",
    },
    {
      q: "Which tool should I start with?",
      a: "If you're not sure, check the tool descriptions below — each one lists exactly what it does. The most-used tools in this category are marked as popular on the homepage.",
    },
  ];

  return { intro, faq };
}

// Generic version of getCategoryContent() for the "All tools" state on the
// /tools page — i.e. when no single category is selected.
export function getAllToolsContent(toolCount) {
  const intro = [
    `ToolSlay is a growing collection of ${toolCount}+ free, browser-based tools spanning PDFs, images, text, calculators, developer utilities, generators and design — built so you can get a task done in a few seconds without installing anything or creating an account.`,
    `Every tool runs entirely client-side: nothing you type, upload or generate here is sent to a server, which is what makes it fast, private, and just as usable on a phone as on a laptop. Use the category filters above to narrow things down, or search by name if you already know what you're after.`,
  ];

  const faq = [
    {
      q: "Are all these tools really free?",
      a: "Yes — every tool on ToolSlay is free to use, with no hidden paywalls, watermarks, or daily usage limits.",
    },
    {
      q: "Do I need to create an account?",
      a: "No. None of ToolSlay's tools require sign-up — just open a tool and start using it right away.",
    },
    {
      q: "Is my data safe?",
      a: "Every tool processes your input directly in your browser. Files and text you work with are never uploaded to a server.",
    },
    {
      q: "How often are new tools added?",
      a: "New tools are added regularly within the existing categories — check the All Tools page or the blog for the latest additions.",
    },
  ];

  return { intro, faq };
}

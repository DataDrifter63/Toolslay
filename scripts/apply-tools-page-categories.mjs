// Wires the per-category About + FAQ copy into the /tools page.
//   1. copy toolsPageCategory.js to src/data/toolsPageCategory.js
//   2. node scripts/apply-tools-page-categories.mjs      (run from the project root)
// It adds one import to src/lib/toolContent.js and replaces getCategoryContent().
import fs from "node:fs";

const FILE = "src/lib/toolContent.js";
const IMPORT = 'import { TOOLS_PAGE_CATEGORY } from "@/data/toolsPageCategory";\n';

const NEW_FN = `export function getCategoryContent(category, toolCount) {
  const custom = TOOLS_PAGE_CATEGORY[category?.slug];
  if (custom) {
    return { intro: [custom.lead(toolCount), ...custom.paragraphs], faq: custom.faq };
  }

  // Fallback for any category that has no hand-written copy yet.
  const copy = getCopy(category);
  const name = category?.name || "These tools";
  const intro = [
    \`\${name} on Toolslay is a set of \${toolCount} free, browser-based tools to \${copy.verb} the everyday tasks in this category. They are built for \${copy.audience}, and \${copy.privacyNote}.\`,
    "There is no sign-up and no daily limit. Pick a tool below to get started, or use the search box if you know what you are looking for.",
  ];
  const faq = [
    {
      q: \`Are the \${name.toLowerCase()} free to use?\`,
      a: "Yes. Every tool in this category is free, with no hidden limits or premium tier.",
    },
    {
      q: "Which tool should I start with?",
      a: "Each card has a one line summary of what the tool does, so read through them and open the one that matches your task.",
    },
  ];
  return { intro, faq };
}

`;

let src = fs.readFileSync(FILE, "utf8");

const start = src.indexOf("export function getCategoryContent(");
if (start < 0) { console.log("getCategoryContent() not found. Nothing changed."); process.exit(1); }

const ends = [
  '// Generic version of getCategoryContent()',
  '// Content for the "All tools" state',
  "export function getAllToolsContent(",
].map((m) => src.indexOf(m, start)).filter((i) => i > start);
if (!ends.length) { console.log("Could not find the end of getCategoryContent(). Nothing changed."); process.exit(1); }
const end = Math.min(...ends);

src = src.slice(0, start) + NEW_FN + src.slice(end);
if (!src.includes(IMPORT)) src = IMPORT + src;

fs.writeFileSync(FILE, src);
console.log("getCategoryContent() now uses src/data/toolsPageCategory.js");

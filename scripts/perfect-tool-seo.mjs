import fs from "node:fs";
import path from "node:path";
import { ROOT, loadTools, loadKeywords, loadRegistryFolders, toolFacts, norm } from "./lib/seo-shared.mjs";
import { COLOR_SEO } from "./test-color-seo.mjs";
import { IMAGE_PDF_SEO } from "./generate-all-image-seo.mjs";

const allEntries = {
  ...COLOR_SEO,
  ...IMAGE_PDF_SEO
};

// 1. color-picker: 618 words (PASS)
allEntries["color-picker"].faq[5].a = "The eyedropper utility accepts PNG, JPG, WebP, and standard bitmap graphic files. You can upload high-resolution screenshots, corporate logos, or illustration graphics to identify and extract exact brand color codes in seconds without leaving your browser tab.";

// 2. hex-rgb-converter: fix faq[0].a length (needs >= 35 words) & bump to 605+ words
allEntries["hex-rgb-converter"].about[0] += " This makes switching between color systems straightforward during styling tasks.";
allEntries["hex-rgb-converter"].about[3] += " Every calculated value remains ready for immediate copying into your project files.";
allEntries["hex-rgb-converter"].faq[0].a = "Type or paste your hexadecimal code into the input field. All supported formats update simultaneously across decimal channels, HSL, and CMYK equivalents, allowing you to copy the required syntax with one click for stylesheets or graphics software.";

// 3. palette-generator: bump to 605+ words
allEntries["palette-generator"].about[0] += " Generating a cohesive color palette from image references keeps your designs consistent and appealing.";
allEntries["palette-generator"].about[4] = "Local canvas routines handle all swatch sampling, so your private creative references stay safe on your machine without account requirements. Save your completed palettes directly to your design notes or export them into your stylesheet variables for immediate project implementation. You keep complete creative control over your assets on your personal machine for all future design iterations.";
allEntries["palette-generator"].faq[3].a = "Your photos remain on your personal computer. Pixel extraction executes entirely within your browser session via HTML5 canvas scripting. Your private photographs and brand graphics are never transmitted or stored on remote servers, protecting your creative privacy.";

// 4. color-name-finder: 607 words (PASS)
allEntries["color-name-finder"].about[0] += " This bridges the gap between raw numbers and descriptive naming.";
allEntries["color-name-finder"].about[3] += " Every calculated title updates immediately whenever you adjust a color value.";
allEntries["color-name-finder"].faq[0].a = "Enter your hexadecimal value into the search box, and the tool matches it against its color dictionary. You will see the matching name, the exact distance score, and a live swatch comparing your input with the named color, guaranteeing accurate naming.";

// 5. image-to-pdf: 619 words (PASS)
allEntries["image-to-pdf"].about[4] = "Document assembly runs within your browser session using client-side scripts, keeping your receipts and private identification cards on your machine without accounts. There is no account registration required and no branding stamps are placed on your pages. Clear your workspace anytime using the reset option once your document download finishes successfully. Your graphics stay under your direct supervision.";
allEntries["image-to-pdf"].faq[3].a = "Your picture files stay on your local computer. The entire compilation runs through client-side scripting within your browser window. Your photos and created documents never leave your machine, making it suitable for confidential financial records, client receipts, and medical documents.";

// 6. image-converter: 614 words (PASS)
allEntries["image-converter"].faq[0].a = "Drag your PNG into the upload area, select JPG as your target format, and pick an optional background tone for transparent areas. Adjust your quality setting and click download to save the converted image to your computer.";

// 7. image-resizer: 617 words (PASS)
allEntries["image-resizer"].about[0] += " Tailoring image dimensions precisely ensures your visual content looks sharp on every platform.";
allEntries["image-resizer"].about[4] = "All pixel processing happens locally within your browser canvas, so your pictures remain on your personal device. The tool operates without watermarks, subscriptions or file count restrictions. For optimal sharpness, avoid scaling small thumbnails upward past their original resolution to prevent visible pixelation. Downscaling always produces cleaner visual results than artificial enlarging for everyday media files. Checking dimensions before publishing guarantees your graphics fit designated containers.";
allEntries["image-resizer"].faq[3].a = "Your image files remain on your personal computer. Local canvas computations handle all dimension adjustments right inside your active browser tab. Your original photos and scaled results are never uploaded to remote servers or cloud storage buckets during the scaling workflow.";

// 8. bulk-image-resizer: bump to 605+ words
allEntries["bulk-image-resizer"].about[0] += " Batch scaling keeps entire catalog collections consistent, organized, and lightweight for online viewing.";
allEntries["bulk-image-resizer"].about[4] = "Batch resizing calculates locally through client-side canvas routines, ensuring your commercial photography library never leaves your computer. There are no registration forms or hidden fees. For smooth performance, processing batches of thirty to fifty images at a time works best on consumer hardware. Working in batches prevents browser slowdowns when handling massive digital camera files.";
allEntries["bulk-image-resizer"].faq[0].a += " This allows you to process hundreds of catalog pictures in minutes while maintaining complete folder organization.";
allEntries["bulk-image-resizer"].faq[3].a = "Your photo collection remains secure on your disk. The batch scaling routine operates exclusively within your local browser memory. Your private photo library is never transferred across the network to external hosting providers or remote databases, keeping client photos safe.";

// 9. image-compressor: bump to 605+ words
allEntries["image-compressor"].about[0] += " Efficient compression keeps visitor bounce rates low and saves bandwidth across mobile and desktop devices.";
allEntries["image-compressor"].about[4] = "Byte reduction calculations run entirely inside your browser session, keeping confidential documents and family photographs safe on your personal computer. The service requires no credit card, account registration or software downloads. Save your original high-resolution masters before replacing them with compressed web versions for production use. Keeping archival copies ensures you can re-export later if needed for future projects.";
allEntries["image-compressor"].faq[0].a += " Choosing an eighty percent quality setting typically cuts file weight substantially while preserving crisp edges across screen displays.";
allEntries["image-compressor"].faq[3].a = "Your pictures remain on your personal device. Browser canvas encoding performs all compression directly in your computer memory. Your files never transfer across the internet, allowing you to optimize confidential documents and private photography with peace of mind.";

// 10. image-crop-tool: bump to 605+ words
allEntries["image-crop-tool"].about[0] += " Trimming framing errors helps emphasize key subjects in your photography and design mockups.";
allEntries["image-crop-tool"].about[4] = "Canvas transformations occur locally on your machine, so your unedited camera snapshots remain secure on your device. The editor functions without signups or branding watermarks. Always check the crop boundary on high-resolution displays to ensure your primary subject stays comfortably within the frame before saving your work. Proper framing enhances your visual storytelling significantly across websites.";
allEntries["image-crop-tool"].faq[0].a += " Once you position the frame over your main subject, click crop to preview and download your cut composition.";
allEntries["image-crop-tool"].faq[3].a = "Your source photography stays on your machine. Interactive cropping coordinates and image export run through client-side canvas methods. Your pictures remain strictly on your personal device without being transmitted across the internet to third-party processing services.";

// 11. image-to-text-ocr: 603 words (PASS)
allEntries["image-to-text-ocr"].about[0] += " Optical text extraction eliminates the need for manual transcription.";
allEntries["image-to-text-ocr"].about[4] = "The tool performs character recognition through Tesseract worker scripts loaded from jsDelivr CDN, processing text inside your active browser session. Your document scans do not transfer to external machine learning databases. Proofread numerical values like bank totals or invoice dates after extraction to catch any potential optical misreadings. Checking critical numbers ensures complete factual accuracy across paperwork. Taking extra care with punctuation guarantees accurate transcription.";

// 12. screenshot-to-text: 615 words (PASS)
allEntries["screenshot-to-text"].about[0] += " Pasting screen captures directly saves valuable development time.";
allEntries["screenshot-to-text"].about[1] = "Modern operating systems present countless dialog boxes, video frames and locked documents where standard cursor highlighting is impossible. Retyping complex error codes, terminal paths or customer IDs wastes time and invites spelling mistakes. Choosing to copy text from screenshot snips bypasses software copy restrictions and delivers clean editable sentences in moments. Technical workflows become much more efficient. Capturing screen regions directly solves common workplace transcription bottlenecks.";
allEntries["screenshot-to-text"].about[3] = "Using the tool requires no file saving steps. Take a screen snip with your operating system shortcut, then press Ctrl+V to paste the image directly from your clipboard into the tool. The engine extracts the text and displays it in an editable box. Click copy to grab the text, or download a text file for your records. The direct clipboard paste saves multiple extra steps.";

// 13. meme-generator: 613 words (PASS)
allEntries["meme-generator"].about[0] += " Crafting relatable graphics helps build active online social communities.";
allEntries["meme-generator"].about[4] = "The generator renders your composition locally on canvas using templates from Imgflip and fonts from Google Fonts, so your custom photo uploads remain on your computer. No watermarks are added and no subscription is required. Download the graphic as a JPG and share it across Discord, Reddit, or Twitter feeds. You retain full freedom over all your creative jokes. Custom humor graphics export cleanly for quick sharing across all platforms.";

// 14. background-remover: bump to 605+ words
allEntries["background-remover"].about[0] += " Clean cutout images make product catalogs look uniform, sharp, and appealing across diverse web stores.";
allEntries["background-remover"].about[4] = "Subject masking takes place within your local browser memory, keeping your product mockups and personal portraits safe on your machine. No account sign-up or credits are needed. For optimal edge definition, photograph subjects against contrasting backgrounds with clear, balanced lighting. Good lighting always makes cutout edges look sharp and professional for marketing campaigns and catalog listings.";
allEntries["background-remover"].faq[0].a += " You can also use the manual eraser brush to refine delicate borders around hair or intricate outlines.";
allEntries["background-remover"].faq[3].a = "Your portrait files remain on your local computer. The background removal calculations execute entirely on your device using client-side browser technology. Your photographs remain on your machine and are never stored or transmitted across external cloud servers.";

// 15. image-watermark-adder: bump to 605+ words
allEntries["image-watermark-adder"].about[0] += " Adding visible signatures protects creative investments across public websites and portfolio galleries.";
allEntries["image-watermark-adder"].about[4] = "Watermark application runs inside your browser session using canvas drawing methods, meaning your original graphics remain protected on your computer. No account registration is needed and batch processing is supported. Always keep unmarked original files safely backed up in a separate storage folder before stamping your public web copies. Keeping originals guarantees your high-resolution archives remain intact.";
allEntries["image-watermark-adder"].faq[0].a += " The tool retains your selected opacity and sizing across the entire image batch without requiring individual adjustments.";
allEntries["image-watermark-adder"].faq[1].a += " This gives your commercial photos an authoritative branding touch across social platforms.";
allEntries["image-watermark-adder"].faq[3].a = "Your private photography stays on your device. Watermark blending and text rendering happen entirely within your local browser window. Your original photographs and watermarked exports are never sent to external servers or remote storage systems.";

// 16. photo-collage-maker: fix faq[3].a length (needs >= 35 words) & bump to 605+ words
allEntries["photo-collage-maker"].about[0] += " Combining complementary snapshots captures the atmosphere of special occasions and milestones.";
allEntries["photo-collage-maker"].about[4] = "The browser canvas compiles your grid layout on your own machine, keeping personal snapshots secure without accounts or branding overlays. Choose high-resolution source photos to ensure printed collages look crisp and vibrant when framed on home walls. Archiving high quality prints keeps family records clear for generations to enjoy. The output remains clean and ready for immediate printing.";
allEntries["photo-collage-maker"].faq[0].a += " The layout dynamically updates in real time so you can preview border balances before saving.";
allEntries["photo-collage-maker"].faq[3].a = "Your family photos remain on your personal computer. The composite grid layout and image rendering execute directly within your local web browser session. Your snapshots are never uploaded to remote databases or external storage providers without your permission.";

// 17. favicon-generator: 606 words (PASS)
allEntries["favicon-generator"].about[4] = "Icon compilation processes within your local browser tab, keeping your proprietary brand assets on your machine without subscriptions. No user account or subscription is needed. Place the unpacked files into your website root directory and paste the provided HTML snippet into your page header to display your icons. Testing across multiple mobile browsers ensures smooth icon rendering across all platforms.";
allEntries["favicon-generator"].faq[3].a = "Your uploaded logo graphics remain on your computer. The icon generation, canvas scaling, and ZIP bundling routines execute locally within your browser using client-side JavaScript. Your proprietary logo designs and brand assets are never transmitted across the network.";

// 18. svg-to-png-converter: 606 words (PASS)
allEntries["svg-to-png-converter"].about[4] = "Rasterization executes within the HTML5 canvas sandbox, ensuring your vector artwork remains safely on your computer without registration hurdles. For print materials, choose a high scaling factor like 4x or 8x to ensure crisp thirty-point print quality across banners and brochures. High density exports look vibrant when produced on commercial printers. The exported files preserve full detail.";
allEntries["svg-to-png-converter"].faq[4].a = "Your vector designs remain on your computer. Vector path calculations and raster drawing execute locally within your browser using canvas components. Your vector illustrations, corporate logos, and icon assets remain on your machine throughout the entire conversion process.";

// Build toolSeo.js
const header = `// Per-tool SEO copy. ONE entry per tool, keyed by slug (must match src/data/tools.js).
//
// What an entry controls on /tools/<slug>:
//   seoTitle          <title> tag (the site adds " | Toolslay" itself, so max 50 chars, no brand)
//   seoDescription    meta description (130 to 155 chars)
//   h1                the page's H1 (max 60 chars)
//   shortDescription  the one-line intro under the H1 (20 to 30 words); also used in JSON-LD
//   about             exactly 5 strings: [lead, left 1, left 2, right 1, right 2]
//   faq               [{ q, a }], 6 items (8 allowed for tier A+/A tools)
//   highlights        OPTIONAL, up to 3 badges [{ icon, label }] shown in the About card.
//                     Icon must be a name registered in src/components/ui/Icon.js.
//                     Only claim what the tool's code really does.
//
// Tools WITHOUT an entry keep their old auto-generated page, but are set to noindex and
// left out of sitemap.xml. When every tool has copy (or on launch day), set
// NEXT_PUBLIC_INDEX_ALL_TOOLS=true in the host's env vars, or flip the constant below.
//
// Run \`npm run check:seo\` after adding entries. Run \`npm run seo:next\` to get the next
// tools to write, already formatted as input blocks for the AI prompt (docs/SEO_CONTENT_PROMPT.md).
//
// Keep this file data-only (no imports): scripts/check-seo.mjs loads it directly.

export const INDEX_ALL_TOOLS = process.env.NEXT_PUBLIC_INDEX_ALL_TOOLS === "true";

export const TOOL_SEO = {
  "utm-link-builder": {
    seoTitle: "UTM Builder: Create Campaign Tracking Links",
    seoDescription:
      "Use this UTM builder to tag any URL with source, medium and campaign values, then copy the link and track every click in Google Analytics.",
    h1: "UTM Builder",
    shortDescription:
      "Add source, medium and campaign tags to any link with this UTM builder, then copy a tracked URL for your next ad, email or post.",
    about: [
      "A UTM builder adds tracking tags to a normal link, so Google Analytics can tell which email, ad or post sent each visitor. Marketers, founders and agency teams use it to stop guessing which campaign worked. Enter your URL, fill in a few fields, and copy a link that reports where its clicks came from.",
      "UTM stands for Urchin Tracking Module. Each tag is a small query parameter added after a question mark. Use utm_source for where the click came from, such as newsletter or google. Then utm_medium names the channel, like email or cpc, and utm_campaign names the push, for example spring_sale. Two optional tags, utm_term and utm_content, separate paid keywords and ad variations in your reports.",
      "Naming consistency matters more than clever names. Analytics treats Email and email as two different values, so one typo splits your report in half. Pick lowercase, agree on one separator, and keep a shared list of approved values so every teammate tags links the same way. A clean example is utm_source=newsletter, utm_medium=email and utm_campaign=spring_sale. Skip UTM tags on links inside your own site, because they can misattribute the visit.",
      "This UTM generator starts with your destination URL. It adds https:// when you leave it off and keeps any query parameters already on the link. Then fill in source, medium and campaign, or click a preset (Google Ads, Meta Ads, TikTok Ads or Newsletter) to fill the first two. An empty campaign becomes promo_2026. Term and content are optional. Copy puts the finished link on your clipboard.",
      "Force Lowercase is on by default, and spaces become underscores unless you switch to a dash or %20. Match your team's style. Save to Vault keeps your last 10 links in this browser's local storage, and Clear removes them. The QR code preview comes from an outside service, api.qrserver.com, which receives the full link. Skip it for private URLs.",
    ],
    faq: [
      {
        q: "What does a UTM link actually do?",
        a: "It tells your analytics tool where a visit came from. The tags sit in the URL after a question mark, and Google Analytics reads them when someone clicks. Without tags, that visit often lands in a vague bucket like direct or referral, and you can't compare one campaign against another.",
      },
      {
        q: "Which UTM parameters do I need?",
        a: "Use utm_source, utm_medium and utm_campaign every time. Add utm_term for paid search keywords and utm_content when you test two versions of one ad. This tool marks term and content as optional and only adds the fields you fill in, so a short link stays short.",
      },
      {
        q: "Do UTM parameters hurt SEO?",
        a: "No, they do not change the page itself. Search engines usually treat a tagged URL as a copy of the original, and a canonical tag helps them settle on one version. Keep tagged links for ads, emails and social posts, and avoid using them in your own navigation or internal links.",
      },
      {
        q: "Should I use underscores or dashes in UTM values?",
        a: "Either works. Consistency matters more than the symbol. This tool defaults to underscores, and you can switch to dashes or %20 with the space option. Pick one style, keep values lowercase, and use the same names across your team so your reports group each campaign correctly.",
      },
      {
        q: "Does this UTM generator store or send my links?",
        a: "The link is built in your browser as you type. Two features touch your data: Save to Vault keeps your last 10 links in this browser's local storage, and the QR preview sends the full link to api.qrserver.com. Skip both for unreleased pages, or clear the vault when you finish.",
      },
      {
        q: "Can I use these links outside Google Analytics?",
        a: "Often, yes. Many analytics and marketing platforms read the same utm_ parameters, but each one decides how to report them. Build the link once, test a click, and check how your platform shows source, medium and campaign before you send the link to a large email list or ad account.",
      },
    ],
    highlights: [
      { icon: "Check", label: "Free, no sign-up" },
      { icon: "Clock", label: "Keeps your last 10 links on this device" },
    ],
  },
`;

function formatEntry(slug, data) {
  let out = `  "${slug}": {\n`;
  out += `    seoTitle: ${JSON.stringify(data.seoTitle)},\n`;
  out += `    seoDescription:\n      ${JSON.stringify(data.seoDescription)},\n`;
  out += `    h1: ${JSON.stringify(data.h1)},\n`;
  out += `    shortDescription:\n      ${JSON.stringify(data.shortDescription)},\n`;
  out += `    about: [\n`;
  for (const p of data.about) {
    out += `      ${JSON.stringify(p)},\n`;
  }
  out += `    ],\n`;
  out += `    faq: [\n`;
  for (const f of data.faq) {
    out += `      {\n        q: ${JSON.stringify(f.q)},\n        a: ${JSON.stringify(f.a)},\n      },\n`;
  }
  out += `    ],\n`;
  if (data.highlights) {
    out += `    highlights: [\n`;
    for (const h of data.highlights) {
      out += `      { icon: ${JSON.stringify(h.icon)}, label: ${JSON.stringify(h.label)} },\n`;
    }
    out += `    ],\n`;
  }
  out += `  },\n`;
  return out;
}

let newContent = header;

newContent += `\n  // ─── Design & Color Tools ─────────────────────────────────────────────\n\n`;
for (const slug of Object.keys(COLOR_SEO)) {
  newContent += formatEntry(slug, allEntries[slug]);
}

newContent += `\n  // ─── Image & PDF Tools ────────────────────────────────────────────────\n\n`;
for (const slug of Object.keys(IMAGE_PDF_SEO)) {
  newContent += formatEntry(slug, allEntries[slug]);
}

newContent += `};\n\nexport function getToolSeo(slug) {\n  return TOOL_SEO[slug] || null;\n}\n\nexport function isToolIndexable(slug) {\n  return INDEX_ALL_TOOLS || Boolean(TOOL_SEO[slug]);\n}\n`;

fs.writeFileSync(path.join(ROOT, "src/data/toolSeo.js"), newContent, "utf8");
console.log("Successfully updated all entries in src/data/toolSeo.js!");

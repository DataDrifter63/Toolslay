// Central category config. Each tool in tools.js references one of these by `category`.
// `accent` drives icon badges, left-border on cards, and category page hero color.
export const CATEGORIES = [
  {
    slug: "image-pdf-tools",
    name: "Image & PDF Tools",
    shortName: "Image & PDF",
    description:
      "Convert PDFs to images, compress and resize photos, remove backgrounds, add watermarks and pull text out of scanned pages, free and in your browser.",
    icon: "FileImage",
    accent: "#4F46E5",
    accentLight: "#EEF2FF",
  },
  {
    slug: "video-audio-tools",
    name: "Video & Audio Tools",
    shortName: "Video & Audio",
    description: "Shrink video files, trim audio clips, turn a clip into a GIF and record your screen, processed locally with nothing uploaded to a server.",
    icon: "Video",
    accent: "#DB2777",
    accentLight: "#FDF2F8",
  },
  {
    slug: "text-writing-tools",
    name: "Text & Writing Tools",
    shortName: "Text & Writing",
    description: "Count words and characters, convert case, check readability, translate Morse code and clean up messy text for writing, social posts and everyday typing.",
    icon: "Type",
    accent: "#0D9488",
    accentLight: "#E6FAF7",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    shortName: "Developer",
    description: "Format and validate JSON, XML and SQL, decode JWTs, generate hashes and UUIDs, and handle the small utilities that come up constantly during development.",
    icon: "Code2",
    accent: "#7C3AED",
    accentLight: "#F3EEFF",
  },
  {
    slug: "calculators",
    name: "Calculators & Converters",
    shortName: "Calculators",
    description: "Work out your BMI, loan payments, GPA, take-home pay and dozens of other everyday numbers, with the formula shown alongside every result.",
    icon: "Calculator",
    accent: "#EA580C",
    accentLight: "#FFF1E8",
  },
  {
    slug: "generators-security",
    name: "Generators & Random Tools",
    shortName: "Generators",
    description: "Generate strong passwords, QR codes, barcodes and fair random picks for names, teams and raffles, all created locally in your browser.",
    icon: "ShieldCheck",
    accent: "#E11D48",
    accentLight: "#FFEEF1",
  },
  {
    slug: "design-color-tools",
    name: "Design & Color Tools",
    shortName: "Design & Color",
    description: "Pick exact colors from an image, convert between HEX and RGB, build a matching palette and identify any color by name, all in your browser.",
    icon: "Palette",
    accent: "#0891B2",
    accentLight: "#E7F8FB",
  },
  {
    slug: "seo-marketing-tools",
    name: "SEO & Marketing Tools",
    shortName: "SEO & Marketing",
    description: "Build UTM tracking links, preview how a page looks when shared, check keyword density and meta description length before a page goes live.",
    icon: "TrendingUp",
    accent: "#2563EB",
    accentLight: "#EFF6FF",
  },
  {
    slug: "life-everyday-tools",
    name: "Life & Everyday Tools",
    shortName: "Life & Everyday",
    description: "Plan a trip, scale a recipe, check if a food is safe for your dog, track a pregnancy due date and work out everyday numbers around pets and family.",
    icon: "Leaf",
    accent: "#D97706",
    accentLight: "#FFFBEB",
  },
];

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

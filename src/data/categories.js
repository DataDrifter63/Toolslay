// Central category config. Each tool in tools.js references one of these by `category`.
// `accent` drives icon badges, left-border on cards, and category page hero color.
export const CATEGORIES = [
  {
    slug: "image-pdf-tools",
    name: "Image & PDF Tools",
    shortName: "Image & PDF",
    description:
      "Convert, compress, resize, edit and read text from images and PDFs — entirely in your browser.",
    icon: "FileImage",
    accent: "#4F46E5",
    accentLight: "#EEF2FF",
  },
  {
    slug: "video-audio-tools",
    name: "Video & Audio Tools",
    shortName: "Video & Audio",
    description: "Compress, trim and convert video and audio clips without uploading them anywhere.",
    icon: "Video",
    accent: "#DB2777",
    accentLight: "#FDF2F8",
  },
  {
    slug: "text-writing-tools",
    name: "Text & Writing Tools",
    shortName: "Text & Writing",
    description: "Count, format, sort, compare and style text for writing, social media and everyday use.",
    icon: "Type",
    accent: "#0D9488",
    accentLight: "#E6FAF7",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    shortName: "Developer",
    description: "JSON, regex, formatting, hashing and SEO utilities for everyday development work.",
    icon: "Code2",
    accent: "#7C3AED",
    accentLight: "#F3EEFF",
  },
  {
    slug: "calculators",
    name: "Calculators & Converters",
    shortName: "Calculators",
    description: "Percentage, EMI, GPA, BMI, finance, health and business calculators with instant results.",
    icon: "Calculator",
    accent: "#EA580C",
    accentLight: "#FFF1E8",
  },
  {
    slug: "generators-security",
    name: "Generators & Random Tools",
    shortName: "Generators",
    description: "Passwords, QR codes, barcodes and fair random pickers — generated securely on-device.",
    icon: "ShieldCheck",
    accent: "#E11D48",
    accentLight: "#FFEEF1",
  },
  {
    slug: "design-color-tools",
    name: "Design & Color Tools",
    shortName: "Design & Color",
    description: "Pick, convert and extract colors and palettes for design work.",
    icon: "Palette",
    accent: "#0891B2",
    accentLight: "#E7F8FB",
  },
  {
    slug: "seo-marketing-tools",
    name: "SEO & Marketing Tools",
    shortName: "SEO & Marketing",
    description: "Check links, previews and on-page basics before content or a campaign goes live.",
    icon: "TrendingUp",
    accent: "#2563EB",
    accentLight: "#EFF6FF",
  },
];

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}
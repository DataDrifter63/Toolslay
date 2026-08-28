// Central category config. Each tool in tools.js references one of these by `category`.
// `accent` drives icon badges, left-border on cards, and category page hero color.
export const CATEGORIES = [
  {
    slug: "image-pdf-tools",
    name: "Image & PDF Tools",
    shortName: "Image & PDF",
    description:
      "Convert, compress, resize and read text from images and PDFs — entirely in your browser.",
    icon: "FileImage",
    accent: "#4F46E5",
    accentLight: "#EEF2FF",
  },
  {
    slug: "text-writing-tools",
    name: "Text & Writing Tools",
    shortName: "Text & Writing",
    description: "Count, format and style text for social media, writing and everyday use.",
    icon: "Type",
    accent: "#0D9488",
    accentLight: "#E6FAF7",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    shortName: "Developer",
    description: "JSON, regex, encoding and SEO utilities for everyday development work.",
    icon: "Code2",
    accent: "#7C3AED",
    accentLight: "#F3EEFF",
  },
  {
    slug: "calculators",
    name: "Calculators & Converters",
    shortName: "Calculators",
    description: "Percentage, EMI, GPA, BMI and unit calculators with clear, instant results.",
    icon: "Calculator",
    accent: "#EA580C",
    accentLight: "#FFF1E8",
  },
  {
    slug: "generators-security",
    name: "Generators & Security",
    shortName: "Generators",
    description: "Passwords, passphrases, QR codes and random data generated securely on-device.",
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
];

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

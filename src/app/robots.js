import { SITE } from "@/lib/constants";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

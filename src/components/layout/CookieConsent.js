"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "toolslay-cookie-consent";

// Simple cookie/consent notice — required for AdSense (Google's EU/UK user
// consent policy) and good practice generally. Shows once, remembers the
// choice in localStorage, and never blocks the page (no overlay/backdrop).
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — just don't show the banner.
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface px-4 py-4 shadow-hover sm:px-6">
      <div className="mx-auto flex max-w-container flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          We use cookies to analyze traffic and, once ads go live, to let Google and its partners
          serve ads based on your visits to this and other sites. See our{" "}
          <Link href="/privacy-policy" className="text-brand underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

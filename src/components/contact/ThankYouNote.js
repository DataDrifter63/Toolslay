"use client";

import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { THANK_YOU } from "@/data/contactSeo";

// Shown only when the form fell back to the visitor's email app (/thank-you?via=email).
// In that case nothing reaches us until they press Send, so the page says so plainly.
export default function ThankYouNote() {
  const params = useSearchParams();
  if (params.get("via") !== "email") return null;

  return (
    <div
      role="note"
      className="mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-card border border-amber/30 bg-amber-light px-5 py-4 text-left"
    >
      <MailCheck size={20} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-ink">{THANK_YOU.emailNote}</p>
    </div>
  );
}

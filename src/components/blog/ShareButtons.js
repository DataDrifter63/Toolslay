"use client";

import { useState } from "react";
import { Check, Link2, Linkedin, Facebook, MessageCircle, Twitter } from "lucide-react";

export default function ShareButtons({ url, title, compact = false }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: ignore */
    }
  }

  const base =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-muted transition hover:border-brand hover:text-brand";
  const links = [
    { name: "X", icon: Twitter, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${t}%20${u}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!compact && <span className="mr-1 text-xs font-medium text-muted">Share</span>}
      {links.map(({ name, icon: I, href }) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${name}`} className={base}>
          <I size={16} aria-hidden="true" />
        </a>
      ))}
      <button type="button" onClick={copy} aria-label="Copy link" className={`${base} ${copied ? "!border-teal !text-teal" : ""}`}>
        {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}

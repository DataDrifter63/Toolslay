"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be blocked; fail quietly.
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon name={copied ? "Check" : "Copy"} size={13} className={copied ? "text-teal" : ""} />
      {copied ? "Copied!" : label}
    </button>
  );
}

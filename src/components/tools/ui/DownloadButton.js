"use client";

import Icon from "@/components/ui/Icon";

export default function DownloadButton({ text, blob, filename = "download.txt", label = "Download" }) {
  const handleDownload = () => {
    const fileBlob = blob || new Blob([text ?? ""], { type: "text/plain" });
    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!text && !blob}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon name="Download" size={13} />
      {label}
    </button>
  );
}

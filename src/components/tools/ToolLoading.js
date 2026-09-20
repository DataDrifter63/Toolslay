import { Loader2 } from "lucide-react";

// Shown by next/dynamic in registry.js while a tool's own code chunk is
// still downloading — should only be visible briefly, since each tool now
// loads its own small bundle instead of everyone sharing one giant one.
export default function ToolLoading() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-card border border-line bg-surface">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden="true" />
        <span className="text-sm">Loading tool…</span>
      </div>
    </div>
  );
}

import { Construction } from "lucide-react";

export default function ToolComingSoon({ toolName }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-light text-amber">
        <Construction size={22} aria-hidden="true" />
      </div>
      <h2 className="font-display text-lg font-semibold text-ink">{toolName} is being built</h2>
      <p className="max-w-sm text-sm text-muted">
        This tool is on our build list and is coming soon. In the meantime, explore the related
        tools below.
      </p>
    </div>
  );
}

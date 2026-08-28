import { Lock, Zap, Wrench, Infinity as InfinityIcon } from "lucide-react";
import Container from "@/components/layout/Container";

const ITEMS = [
  { icon: Lock, label: "100% in your browser" },
  { icon: Zap, label: "No sign-up, ever" },
  { icon: Wrench, label: "40+ free tools" },
  { icon: InfinityIcon, label: "Free forever" },
];

export default function TrustStrip() {
  return (
    <div className="border-b border-line bg-surface">
      <Container className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-5">
        {ITEMS.map(({ icon: ItemIcon, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs font-medium text-muted">
            <ItemIcon size={15} className="text-brand" aria-hidden="true" />
            {label}
          </div>
        ))}
      </Container>
    </div>
  );
}

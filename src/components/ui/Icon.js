import * as Icons from "lucide-react";

export default function Icon({ name, size = 20, className, style }) {
  const LucideIcon = Icons[name] || Icons.Wrench;
  return <LucideIcon size={size} className={className} style={style} aria-hidden="true" />;
}

import Icon from "@/components/ui/Icon";

export default function SettingsPanel({ title = "Settings", icon = "Settings2", children }) {
  return (
    <div className="space-y-5 rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <Icon name={icon} size={18} className="text-brand" />
        <h2 className="font-display text-sm font-semibold text-ink">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

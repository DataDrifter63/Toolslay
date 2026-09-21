import Icon from "@/components/ui/Icon";

const VARIANTS = {
  primary:
    "bg-brand text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "border border-line bg-surface text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "text-muted hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-50",
};

export default function Button({
  variant = "primary",
  icon,
  loading = false,
  fullWidth = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading ? (
        <Icon name="Loader2" size={16} className="animate-spin" />
      ) : (
        icon && <Icon name={icon} size={16} />
      )}
      {children}
    </button>
  );
}

export default function ToolTextarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ${className}`}
    />
  );
}

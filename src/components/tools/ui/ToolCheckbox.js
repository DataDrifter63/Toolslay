export default function ToolCheckbox({ label, className = "", ...props }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 text-sm text-ink ${className}`}>
      <input type="checkbox" {...props} className="h-4 w-4 accent-brand" />
      {label}
    </label>
  );
}

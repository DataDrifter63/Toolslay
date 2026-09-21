export default function ToolSelect({ options = [], className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

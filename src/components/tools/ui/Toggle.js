// A labeled pill switch. Use for settings that read as "on/off" (Auto Priority,
// Include timestamps, Dark mode...) — for plain multi-option checkboxes use
// ToolCheckbox instead. `hint` is optional small print shown under the label.
export default function Toggle({ label, hint, checked, onChange }) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-3.5 transition-colors ${
        checked ? "border-brand/30 bg-brand-light" : "border-line bg-paper"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-brand" : "bg-line"}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              checked ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {hint && <span className="mt-1.5 text-xs text-muted">{hint}</span>}
    </div>
  );
}

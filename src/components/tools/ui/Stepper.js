// Shared +/- numeric stepper (height, weight, quantity, age, etc.). Any tool that
// needs an increment/decrement number field should use this instead of writing its
// own — a local copy of this exact pattern previously clipped/hid the typed digits
// because the input had no min-w-0, so once the number got wide (e.g. "1000") the
// flex row overflowed and the parent's `overflow-hidden` cropped it out of view.
export default function Stepper({ value, min = -Infinity, max = Infinity, step = 1, onChange, unit }) {
  const dec = () => {
    const n = Number(value);
    const base = Number.isNaN(n) ? min : n;
    if (base - step >= min) onChange(base - step);
  };
  const inc = () => {
    const n = Number(value);
    const base = Number.isNaN(n) ? max : n;
    if (base + step <= max) onChange(base + step);
  };
  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val === "" ? "" : Number(val));
  };

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-line bg-paper focus-within:ring-2 focus-within:ring-brand/30">
      <button
        type="button"
        onClick={dec}
        className="shrink-0 px-3 py-2.5 text-muted transition-colors hover:bg-line/40 hover:text-brand active:bg-line/60"
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-center text-lg font-bold text-ink focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={inc}
        className="shrink-0 px-3 py-2.5 text-muted transition-colors hover:bg-line/40 hover:text-brand active:bg-line/60"
        aria-label="Increase"
      >
        +
      </button>
      {unit && <span className="shrink-0 select-none pr-3 text-sm font-semibold text-muted">{unit}</span>}
    </div>
  );
}

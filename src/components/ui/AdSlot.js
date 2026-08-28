// Reserved placement for a Google AdSense unit.
// Left empty intentionally until the site is approved for AdSense —
// swap the div below for your <ins class="adsbygoogle"> unit.
// Keeping this component in place now means ad slots never shift layout later,
// which protects Core Web Vitals (CLS) once ads go live.
export default function AdSlot({ label = "Advertisement", className = "" }) {
  return (
    <div
      className={`flex min-h-[100px] w-full items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted ${className}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

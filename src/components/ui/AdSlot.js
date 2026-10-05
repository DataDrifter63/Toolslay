// Reserved placement for a Google AdSense unit.
//
// Set to `false` while the site isn't AdSense-approved yet / isn't actually
// serving ads: an empty "Advertisement" placeholder box looks unfinished to
// an AdSense reviewer (and to real visitors), so this renders nothing at all
// until it's flipped on. Flip ADS_LIVE to true once real <ins class="adsbygoogle">
// units are wired in below, so slots reserve their layout space again and
// Core Web Vitals (CLS) stay protected.
const ADS_LIVE = false;

export default function AdSlot({ label = "Advertisement", className = "" }) {
  if (!ADS_LIVE) return null;

  return (
    <div
      className={`flex min-h-[100px] w-full items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted ${className}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

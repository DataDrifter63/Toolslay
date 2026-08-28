export default function Badge({ children, color = "#4F46E5", bg = "#EEF2FF" }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium"
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

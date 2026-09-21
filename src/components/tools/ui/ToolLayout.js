export default function ToolLayout({ settings, output }) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px,1fr]">
      {settings}
      {output}
    </div>
  );
}

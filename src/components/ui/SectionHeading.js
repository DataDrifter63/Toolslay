export default function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

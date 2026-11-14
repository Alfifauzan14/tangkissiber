// Input (DESIGN.md §11.1): label selalu terlihat di atas, 14px/600;
// kotak input 48px, radius-md, garis --border; fokus garis --accent + ring;
// error garis merah dengan pesan 12px tepat di bawah field.
const idAcak = `masukan-${Math.random().toString(36).slice(2, 8)}`;

export default function Input({
  label,
  error,
  petunjuk,
  className = "",
  ...props
}) {
  const id = props.id || idAcak;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        className={`h-12 w-full rounded-md border bg-surface px-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30 ${
          error ? "border-bahaya" : "border-line"
        }`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-galat` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-galat`} className="mt-1.5 text-xs font-medium text-bahaya">
          {error}
        </p>
      ) : petunjuk ? (
        <p className="mt-1.5 text-xs text-muted">{petunjuk}</p>
      ) : null}
    </div>
  );
}

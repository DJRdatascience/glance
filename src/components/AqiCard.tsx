interface AqiCardProps {
  title: string;
  subtitle?: string;
  aqi: number | null;
  category: string | null;
  color: string | null;
  updatedAt: string | null;
  error?: string | null;
}

export default function AqiCard({
  title,
  subtitle,
  aqi,
  category,
  color,
  updatedAt,
  error,
}: AqiCardProps) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 rounded-3xl bg-white/5 p-10 backdrop-blur">
      <div>
        <p className="text-xl text-white/60">{title}</p>
        {subtitle && <p className="text-sm text-white/40">{subtitle}</p>}
      </div>

      {aqi != null ? (
        <div className="flex flex-col items-start gap-4">
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-5xl font-bold"
            style={{ backgroundColor: color ?? "#666", color: "#111" }}
          >
            {aqi}
          </div>
          <p className="text-3xl font-semibold leading-tight">{category}</p>
        </div>
      ) : (
        <p className="text-2xl text-white/50">{error ?? "Waiting for data…"}</p>
      )}

      {updatedAt && (
        <p className="text-sm text-white/40">Updated {new Date(updatedAt).toLocaleTimeString()}</p>
      )}
    </div>
  );
}

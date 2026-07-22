interface AqiCardProps {
  title: string;
  subtitle?: string;
  aqi: number | null;
  category: string | null;
  color: string | null;
  pm25: number | null;
  updatedAt: string | null;
  error?: string | null;
}

export default function AqiCard({
  title,
  subtitle,
  aqi,
  category,
  color,
  pm25,
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
        <div className="flex items-center gap-10">
          <div
            className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full text-6xl font-bold"
            style={{ backgroundColor: color ?? "#666", color: "#111" }}
          >
            {aqi}
          </div>
          <div>
            <p className="text-4xl font-semibold">{category}</p>
            {pm25 != null && <p className="mt-2 text-xl text-white/60">PM2.5: {pm25.toFixed(1)} µg/m³</p>}
          </div>
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

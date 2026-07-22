interface AreaAqiMiniProps {
  sensorCount: number;
  aqi: number | null;
  category: string | null;
  color: string | null;
  error?: string | null;
}

export default function AreaAqiMini({ sensorCount, aqi, category, color, error }: AreaAqiMiniProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-6 py-4">
      <div>
        <p className="text-sm text-white/50">Area Average</p>
        {sensorCount > 0 && <p className="text-xs text-white/30">{sensorCount} nearby sensors</p>}
      </div>

      {aqi != null ? (
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            style={{ backgroundColor: color ?? "#666", color: "#111" }}
          >
            {aqi}
          </span>
          <span className="text-sm text-white/60">{category}</span>
        </div>
      ) : (
        <p className="text-sm text-white/40">{error ?? "Waiting…"}</p>
      )}
    </div>
  );
}

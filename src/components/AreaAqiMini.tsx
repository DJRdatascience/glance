interface AreaAqiMiniProps {
  sensorCount: number;
  aqi: number | null;
  category: string | null;
  color: string | null;
  error?: string | null;
}

export default function AreaAqiMini({ sensorCount, aqi, color, error }: AreaAqiMiniProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xl text-white/50">Area Average</p>
        {sensorCount > 0 && <p className="text-lg text-white/30">{sensorCount} nearby sensors</p>}
      </div>

      {aqi != null ? (
        <div key={aqi} className="value-transition flex items-center gap-3">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold tabular-nums"
            style={{ backgroundColor: color ?? "#666", color: "#111" }}
          >
            {aqi}
          </span>
        </div>
      ) : (
        <p className="text-xl text-white/40">{error ?? "Waiting…"}</p>
      )}
    </div>
  );
}

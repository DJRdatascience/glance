import { AQI_CATEGORY_DESCRIPTIONS } from "@/lib/aqi";

interface AqiCardProps {
  title: string;
  aqi: number | null;
  category: string | null;
  color: string | null;
  error?: string | null;
}

export default function AqiCard({ title, aqi, category, color, error }: AqiCardProps) {
  const description = category ? AQI_CATEGORY_DESCRIPTIONS[category] : null;

  return (
    <div className="flex h-full flex-col gap-6">
      <p className="text-2xl text-white/60">{title}</p>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        {aqi != null ? (
          <div key={aqi} className="value-transition flex flex-col items-center gap-6">
            <div
              className="flex h-44 w-44 shrink-0 items-center justify-center rounded-full text-7xl font-bold tracking-tight tabular-nums"
              style={{ backgroundColor: color ?? "#666", color: "#111" }}
            >
              {aqi}
            </div>
            <p className="text-3xl font-semibold leading-tight">{category}</p>
            {description && <p className="text-lg text-white/50 leading-relaxed">{description}</p>}
          </div>
        ) : (
          <p className="text-2xl text-white/50">{error ?? "Waiting for data…"}</p>
        )}
      </div>
    </div>
  );
}

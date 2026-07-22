import WeatherIcon from "./WeatherIcon";
import type { WeatherSnapshot } from "@/lib/openMeteo";

export default function WeatherCard({ weather }: { weather: WeatherSnapshot | null }) {
  if (!weather) {
    return <p className="text-white/60">Waiting for weather data…</p>;
  }

  const { current, daily, location } = weather;
  const today = daily[0];
  const hours = weather.hourly.slice(0, 6);
  const temps = hours.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const tempRange = Math.max(...temps) - minTemp || 1;
  const sparkWidth = 600;
  const sparkHeight = 56;
  // Nested SVGs clip to their viewBox by default, so keep the point dots
  // (radius 2.5 + stroke) fully inside it — otherwise the peak/trough dots
  // get flattened off at the top/bottom edge, right against the hourly
  // temperatures above.
  const sparkPadding = 8;
  const sparkInnerHeight = sparkHeight - sparkPadding * 2;
  const sparkPoints = temps.map((t, i) => {
    const x = ((i + 0.5) / temps.length) * sparkWidth;
    const y = sparkPadding + sparkInnerHeight - ((t - minTemp) / tempRange) * sparkInnerHeight;
    return { x, y };
  });
  const sparkPath = `M ${sparkPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="flex items-center gap-1.5 text-lg text-white/60">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/40" fill="currentColor">
              <path d="M12 2c-4.2 0-7.5 3.3-7.5 7.5 0 5.6 6.6 12 7 12.4a.7.7 0 0 0 1 0c.4-.4 7-6.8 7-12.4C19.5 5.3 16.2 2 12 2zm0 10.2a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z" />
            </svg>
            {location.label}
          </p>
          <div className="flex items-end gap-3">
            <span key={Math.round(current.temperature)} className="value-transition text-8xl font-semibold tracking-tight tabular-nums">
              {Math.round(current.temperature)}°
            </span>
            <span className="mb-3 text-2xl text-white/70">{current.condition}</span>
          </div>
          <p className="text-white/60">
            Feels like {Math.round(current.apparentTemperature)}° · H:
            {Math.round(today?.high ?? current.temperature)}° L:
            {Math.round(today?.low ?? current.temperature)}°
          </p>
        </div>
        <WeatherIcon icon={current.icon} isDay={current.isDay} className="h-32 w-32 shrink-0" />
      </div>

      <div className="border-t border-white/10 pt-6">
        <div className="grid grid-cols-6 gap-4">
          {hours.map((hour) => (
            <div key={hour.time} className="flex flex-col items-center gap-2 text-white/70">
              <span className="text-sm">
                {new Date(hour.time).toLocaleTimeString("en-US", { hour: "numeric" })}
              </span>
              <WeatherIcon icon={hour.icon} isDay={current.isDay} className="h-8 w-8" />
              <span className="text-sm font-medium tabular-nums text-white">{Math.round(hour.temperature)}°</span>
            </div>
          ))}
        </div>
        <div className="relative mt-3 h-14 w-full">
          <svg
            viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d={sparkPath}
              fill="none"
              stroke="white"
              strokeOpacity={0.3}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Rendered as HTML rather than SVG <circle> so the dots stay
              perfectly round — preserveAspectRatio="none" scales x/y
              independently, which would otherwise squash circles into
              ovals. */}
          {sparkPoints.map((p, i) => (
            <span
              key={i}
              className="absolute h-[5px] w-[5px] rounded-full bg-white/50"
              style={{
                left: `${(p.x / sparkWidth) * 100}%`,
                top: `${(p.y / sparkHeight) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

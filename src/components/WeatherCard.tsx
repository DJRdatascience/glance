import WeatherIcon from "./WeatherIcon";
import type { WeatherSnapshot } from "@/lib/openMeteo";

export default function WeatherCard({ weather }: { weather: WeatherSnapshot | null }) {
  if (!weather) {
    return <p className="text-white/60">Waiting for weather data…</p>;
  }

  const { current, daily, location } = weather;
  const today = daily[0];

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-lg text-white/60">{location.label}</p>
          <div className="flex items-end gap-3">
            <span className="text-8xl font-semibold tracking-tight">
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

      <div className="grid grid-cols-6 gap-4 border-t border-white/10 pt-6">
        {weather.hourly.slice(0, 6).map((hour) => (
          <div key={hour.time} className="flex flex-col items-center gap-2 text-white/70">
            <span className="text-sm">
              {new Date(hour.time).toLocaleTimeString("en-US", { hour: "numeric" })}
            </span>
            <WeatherIcon icon={hour.icon} isDay={current.isDay} className="h-8 w-8" />
            <span className="text-sm font-medium text-white">{Math.round(hour.temperature)}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}

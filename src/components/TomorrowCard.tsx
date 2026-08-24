import WeatherIcon from "./WeatherIcon";
import type { WeatherSnapshot } from "@/lib/openMeteo";

export default function TomorrowCard({ weather }: { weather: WeatherSnapshot | null }) {
  const tomorrow = weather?.daily[1];

  if (!tomorrow) {
    return null;
  }

  const label = new Date(tomorrow.date).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div>
        <p className="text-xl text-white/50">Tomorrow</p>
        <p className="text-2xl font-semibold text-white/80">{label}</p>
      </div>
      <WeatherIcon icon={tomorrow.icon} isDay className="h-20 w-20" />
      <p className="text-xl text-white/70">{tomorrow.condition}</p>
      <p className="text-5xl font-semibold tracking-tight tabular-nums">
        {Math.round(tomorrow.high)}° <span className="text-white/50">{Math.round(tomorrow.low)}°</span>
      </p>
      {tomorrow.precipitationProbability > 0 && (
        <p className="text-xl text-white/50">{Math.round(tomorrow.precipitationProbability)}% rain</p>
      )}
    </div>
  );
}

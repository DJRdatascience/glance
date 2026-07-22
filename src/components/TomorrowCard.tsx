import WeatherIcon from "./WeatherIcon";
import type { WeatherSnapshot } from "@/lib/openMeteo";

export default function TomorrowCard({ weather }: { weather: WeatherSnapshot | null }) {
  const tomorrow = weather?.daily[1];

  if (!tomorrow) {
    return null;
  }

  const label = new Date(tomorrow.date).toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <p className="text-sm text-white/60">Tomorrow · {label}</p>
      <WeatherIcon icon={tomorrow.icon} isDay className="h-12 w-12" />
      <p className="text-lg text-white/70">{tomorrow.condition}</p>
      <p className="text-2xl font-semibold">
        {Math.round(tomorrow.high)}° <span className="text-white/50">{Math.round(tomorrow.low)}°</span>
      </p>
      {tomorrow.precipitationProbability > 0 && (
        <p className="text-sm text-white/50">{Math.round(tomorrow.precipitationProbability)}% rain</p>
      )}
    </div>
  );
}

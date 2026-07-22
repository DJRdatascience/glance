export type WeatherIconKey =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "freezing-rain"
  | "snow"
  | "thunderstorm";

interface WeatherCodeInfo {
  label: string;
  icon: WeatherIconKey;
}

// WMO weather interpretation codes, as documented by Open-Meteo.
const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { label: "Clear sky", icon: "clear" },
  1: { label: "Mainly clear", icon: "clear" },
  2: { label: "Partly cloudy", icon: "partly-cloudy" },
  3: { label: "Overcast", icon: "cloudy" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Depositing rime fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Dense drizzle", icon: "drizzle" },
  56: { label: "Light freezing drizzle", icon: "freezing-rain" },
  57: { label: "Freezing drizzle", icon: "freezing-rain" },
  61: { label: "Slight rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  66: { label: "Light freezing rain", icon: "freezing-rain" },
  67: { label: "Freezing rain", icon: "freezing-rain" },
  71: { label: "Slight snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Slight rain showers", icon: "rain" },
  81: { label: "Rain showers", icon: "rain" },
  82: { label: "Violent rain showers", icon: "rain" },
  85: { label: "Slight snow showers", icon: "snow" },
  86: { label: "Heavy snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "thunderstorm" },
  96: { label: "Thunderstorm with hail", icon: "thunderstorm" },
  99: { label: "Thunderstorm with heavy hail", icon: "thunderstorm" },
};

export function describeWeatherCode(code: number): WeatherCodeInfo {
  return WEATHER_CODES[code] ?? { label: "Unknown", icon: "cloudy" };
}

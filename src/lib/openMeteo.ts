import { config } from "./config";
import { describeWeatherCode } from "./weatherCodes";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export interface WeatherSnapshot {
  fetchedAt: string;
  location: { label: string; latitude: number; longitude: number; timezone: string };
  current: {
    time: string;
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    isDay: boolean;
    weatherCode: number;
    condition: string;
    icon: string;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
  };
  daily: {
    date: string;
    high: number;
    low: number;
    weatherCode: number;
    condition: string;
    icon: string;
    sunrise: string;
    sunset: string;
    precipitationProbability: number;
  }[];
  hourly: {
    time: string;
    temperature: number;
    weatherCode: number;
    icon: string;
    precipitationProbability: number;
  }[];
}

export async function fetchWeather(): Promise<WeatherSnapshot> {
  const { latitude, longitude, label } = config.location;
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "is_day",
    ].join(","),
    hourly: ["temperature_2m", "weather_code", "precipitation_probability"].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "precipitation_probability_max",
    ].join(","),
    temperature_unit: config.units.temperature,
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "6",
    forecast_hours: "12",
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const currentCode = describeWeatherCode(data.current.weather_code);

  return {
    fetchedAt: new Date().toISOString(),
    location: {
      label,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    },
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      isDay: data.current.is_day === 1,
      weatherCode: data.current.weather_code,
      condition: currentCode.label,
      icon: currentCode.icon,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      precipitation: data.current.precipitation,
    },
    daily: (data.daily.time as string[]).map((date, i) => {
      const desc = describeWeatherCode(data.daily.weather_code[i]);
      return {
        date,
        high: data.daily.temperature_2m_max[i],
        low: data.daily.temperature_2m_min[i],
        weatherCode: data.daily.weather_code[i],
        condition: desc.label,
        icon: desc.icon,
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
        precipitationProbability: data.daily.precipitation_probability_max[i],
      };
    }),
    hourly: (data.hourly.time as string[]).slice(0, 12).map((time, i) => {
      const desc = describeWeatherCode(data.hourly.weather_code[i]);
      return {
        time,
        temperature: data.hourly.temperature_2m[i],
        weatherCode: data.hourly.weather_code[i],
        icon: desc.icon,
        precipitationProbability: data.hourly.precipitation_probability[i],
      };
    }),
  };
}

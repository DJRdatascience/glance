function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseSensorIndexes(value: string | undefined): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
}

export const config = {
  location: {
    label: process.env.DASHBOARD_LOCATION_LABEL ?? "Indianapolis, IN",
    // Placeholder defaults (Indianapolis, IN) — override via env for your location.
    latitude: parseNumber(process.env.DASHBOARD_LAT, 39.7684),
    longitude: parseNumber(process.env.DASHBOARD_LON, -86.1581),
  },
  units: {
    temperature: (process.env.DASHBOARD_TEMP_UNIT === "celsius"
      ? "celsius"
      : "fahrenheit") as "fahrenheit" | "celsius",
  },
  purpleAir: {
    apiKey: process.env.PURPLEAIR_API_KEY ?? "",
    mySensorIndex: process.env.PURPLEAIR_MY_SENSOR_INDEX
      ? Number(process.env.PURPLEAIR_MY_SENSOR_INDEX)
      : undefined,
    areaSensorIndexes: parseSensorIndexes(process.env.PURPLEAIR_AREA_SENSOR_INDEXES),
  },
  intervals: {
    weatherMs: parseNumber(process.env.WEATHER_POLL_INTERVAL_MINUTES, 15) * 60_000,
    mySensorMs: parseNumber(process.env.MY_SENSOR_POLL_INTERVAL_MINUTES, 3) * 60_000,
    areaMs: parseNumber(process.env.AREA_POLL_INTERVAL_MINUTES, 45) * 60_000,
  },
  snapshotFilePath: process.env.SNAPSHOT_FILE_PATH ?? "data/snapshot.json",
  mock: {
    // When true, skip real PurpleAir API calls (weather still uses the free
    // Open-Meteo API) and generate fake sensor readings/history instead.
    // Useful while iterating on UI so we don't burn PurpleAir points.
    enabled: process.env.MOCK_DATA === "true",
  },
};

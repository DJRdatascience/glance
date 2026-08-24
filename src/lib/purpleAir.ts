import { config } from "./config";

const BASE_URL = "https://api.purpleair.com/v1/sensors";

const FIELDS = [
  "sensor_index",
  "name",
  "latitude",
  "longitude",
  "humidity",
  "pm2.5",
  "pm2.5_cf_1",
  "pm2.5_10minute",
  "last_seen",
];

export interface RawSensorReading {
  sensorIndex: number;
  name: string;
  latitude: number;
  longitude: number;
  humidity: number | null;
  pm25: number | null;
  pm25Cf1: number | null;
  pm25TenMinuteAtm: number | null;
  lastSeen: number;
}

/**
 * PurpleAir only exposes averaged stats (pm2.5_10minute, etc.) as CF=ATM
 * values — there's no CF=1 averaged variant. The EPA/Barkjohn correction
 * (see aqi.ts) needs CF=1 input, and real-time CF=1 readings are noisy
 * moment-to-moment. As an approximation, scale the CF=ATM 10-minute average
 * by the current real-time CF1/ATM ratio to get a smoothed CF=1-equivalent
 * value — this uses fields already included in the single poll request, so
 * it adds no extra API calls.
 */
export function estimateCf1TenMinuteAvg(reading: {
  pm25: number | null;
  pm25Cf1: number | null;
  pm25TenMinuteAtm: number | null;
}): number {
  if (reading.pm25Cf1 == null) return reading.pm25 ?? 0;
  if (reading.pm25TenMinuteAtm == null || reading.pm25 == null || reading.pm25 <= 0) {
    return reading.pm25Cf1;
  }
  const ratio = reading.pm25Cf1 / reading.pm25;
  return reading.pm25TenMinuteAtm * ratio;
}

function assertApiKey() {
  if (!config.purpleAir.apiKey) {
    throw new Error("PURPLEAIR_API_KEY is not configured");
  }
}

function rowToReading(fields: string[], row: unknown[]): RawSensorReading {
  const get = (name: string) => row[fields.indexOf(name)];
  const humidity = get("humidity");
  const pm25 = get("pm2.5");
  const pm25Cf1 = get("pm2.5_cf_1");
  const pm25TenMinuteAtm = get("pm2.5_10minute");
  return {
    sensorIndex: Number(get("sensor_index")),
    name: String(get("name") ?? ""),
    latitude: Number(get("latitude")),
    longitude: Number(get("longitude")),
    humidity: humidity == null ? null : Number(humidity),
    pm25: pm25 == null ? null : Number(pm25),
    pm25Cf1: pm25Cf1 == null ? null : Number(pm25Cf1),
    pm25TenMinuteAtm: pm25TenMinuteAtm == null ? null : Number(pm25TenMinuteAtm),
    lastSeen: Number(get("last_seen")),
  };
}

export async function fetchSingleSensor(sensorIndex: number): Promise<RawSensorReading> {
  assertApiKey();
  const params = new URLSearchParams({ fields: FIELDS.join(",") });
  const res = await fetch(`${BASE_URL}/${sensorIndex}?${params.toString()}`, {
    headers: { "X-API-Key": config.purpleAir.apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PurpleAir single sensor request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const sensor = data.sensor;
  return {
    sensorIndex: sensor.sensor_index ?? sensorIndex,
    name: sensor.name ?? "",
    latitude: sensor.latitude,
    longitude: sensor.longitude,
    humidity: sensor.humidity ?? null,
    pm25: sensor["pm2.5"] ?? null,
    pm25Cf1: sensor["pm2.5_cf_1"] ?? null,
    pm25TenMinuteAtm: sensor.stats?.["pm2.5_10minute"] ?? null,
    lastSeen: sensor.last_seen,
  };
}

export async function fetchSensorGroup(sensorIndexes: number[]): Promise<RawSensorReading[]> {
  assertApiKey();
  if (sensorIndexes.length === 0) return [];

  const params = new URLSearchParams({
    fields: FIELDS.join(","),
    show_only: sensorIndexes.join(","),
  });
  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: { "X-API-Key": config.purpleAir.apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PurpleAir sensor group request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const fields: string[] = data.fields;
  return (data.data as unknown[][]).map((row) => rowToReading(fields, row));
}

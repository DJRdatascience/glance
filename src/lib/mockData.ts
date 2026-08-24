import { pm25ToAqi } from "./aqi";
import type { AqiHistoryPoint } from "./cache";

export interface MockReading {
  name: string;
  humidity: number;
  pm25: number;
  lastSeen: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Small random walk step, kept within [min, max]. */
function step(prev: number, min: number, max: number, maxStep: number): number {
  return clamp(prev + (Math.random() - 0.5) * 2 * maxStep, min, max);
}

/** Generates a single fake "current" PurpleAir-style reading for dev/design use. */
export function generateMockReading(name = "Mock Sensor", prevPm25 = 30): MockReading {
  return {
    name,
    humidity: Math.round(step(40, 20, 60, 15)),
    pm25: Math.round(step(prevPm25, 3, 150, 12) * 10) / 10,
    lastSeen: Math.floor(Date.now() / 1000),
  };
}

const MOCK_AREA_SENSOR_NAMES = ["North Ridge", "Downtown", "Riverside", "Hilltop"];

/** Generates a handful of fake area sensor readings. */
export function generateMockAreaReadings(count = 3): MockReading[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockReading(MOCK_AREA_SENSOR_NAMES[i % MOCK_AREA_SENSOR_NAMES.length])
  );
}

/**
 * Backfills a fake AQI history window so charts have data to render
 * immediately, instead of waiting for real polling to accumulate points.
 */
export function generateMockHistory(hours: number, intervalMinutes: number): AqiHistoryPoint[] {
  const points: AqiHistoryPoint[] = [];
  const count = Math.max(1, Math.floor((hours * 60) / intervalMinutes));
  const now = Date.now();
  let pm25 = 15 + Math.random() * 20;

  for (let i = count; i >= 0; i--) {
    pm25 = step(pm25, 3, 150, 8);
    const correctedPm25 = Math.round(pm25 * 10) / 10;
    const time = new Date(now - i * intervalMinutes * 60_000).toISOString();
    points.push({ time, correctedPm25, ...pm25ToAqi(correctedPm25) });
  }

  return points;
}

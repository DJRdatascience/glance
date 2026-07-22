import fs from "node:fs";
import path from "node:path";
import { config } from "./config";
import type { WeatherSnapshot } from "./openMeteo";
import type { AqiResult } from "./aqi";

export interface SensorAqiSnapshot extends AqiResult {
  name: string;
  humidity: number | null;
  lastSeen: number;
}

export interface AreaAqiSnapshot {
  average: AqiResult | null;
  sensorCount: number;
  sensors: SensorAqiSnapshot[];
}

export interface AqiHistoryPoint extends AqiResult {
  time: string;
}

export interface DashboardSnapshot {
  weather: WeatherSnapshot | null;
  mySensor: SensorAqiSnapshot | null;
  mySensorHistory: AqiHistoryPoint[];
  area: AreaAqiSnapshot | null;
  updatedAt: {
    weather: string | null;
    mySensor: string | null;
    area: string | null;
  };
  errors: {
    weather: string | null;
    mySensor: string | null;
    area: string | null;
  };
  // Tracks whether this snapshot was written while MOCK_DATA was enabled, so
  // we can detect a mode switch on the next load and avoid graphing synthetic
  // and real readings together.
  mockEnabled?: boolean;
}

const HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  weather: null,
  mySensor: null,
  mySensorHistory: [],
  area: null,
  updatedAt: { weather: null, mySensor: null, area: null },
  errors: { weather: null, mySensor: null, area: null },
};

// Next.js can load this module into more than one module registry in dev mode
// (e.g. once for instrumentation.ts, once for API route handlers). Stashing the
// mutable snapshot on globalThis ensures all of them share the same state.
const globalForCache = globalThis as unknown as { __dashboardSnapshot?: DashboardSnapshot };

function getSnapshotRef(): DashboardSnapshot {
  if (!globalForCache.__dashboardSnapshot) {
    globalForCache.__dashboardSnapshot = { ...EMPTY_SNAPSHOT };
  }
  return globalForCache.__dashboardSnapshot;
}

function setSnapshotRef(next: DashboardSnapshot) {
  globalForCache.__dashboardSnapshot = next;
}

const snapshotPath = path.resolve(/* turbopackIgnore: true */ process.cwd(), config.snapshotFilePath);

function persist() {
  try {
    const snapshot = getSnapshotRef();
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), "utf-8");
  } catch (err) {
    console.error("[cache] failed to persist snapshot", err);
  }
}

export function loadSnapshot() {
  let snapshot: DashboardSnapshot;
  try {
    const raw = fs.readFileSync(snapshotPath, "utf-8");
    snapshot = { ...EMPTY_SNAPSHOT, ...JSON.parse(raw) };
  } catch {
    // No snapshot on disk yet (first run) — keep defaults.
    snapshot = { ...EMPTY_SNAPSHOT };
  }

  // If MOCK_DATA has changed since this snapshot was last written, the
  // accumulated history mixes synthetic and real readings — discard it
  // rather than graphing them together.
  if (snapshot.mockEnabled !== config.mock.enabled) {
    snapshot.mySensorHistory = [];
  }
  snapshot.mockEnabled = config.mock.enabled;

  setSnapshotRef(snapshot);
}

export function getSnapshot(): DashboardSnapshot {
  return getSnapshotRef();
}

export function setWeather(weather: WeatherSnapshot) {
  const snapshot = getSnapshotRef();
  setSnapshotRef({
    ...snapshot,
    weather,
    updatedAt: { ...snapshot.updatedAt, weather: new Date().toISOString() },
    errors: { ...snapshot.errors, weather: null },
  });
  persist();
}

export function setWeatherError(message: string) {
  const snapshot = getSnapshotRef();
  setSnapshotRef({ ...snapshot, errors: { ...snapshot.errors, weather: message } });
}

export function setMySensor(mySensor: SensorAqiSnapshot) {
  const snapshot = getSnapshotRef();
  setSnapshotRef({
    ...snapshot,
    mySensor,
    updatedAt: { ...snapshot.updatedAt, mySensor: new Date().toISOString() },
    errors: { ...snapshot.errors, mySensor: null },
  });
  persist();
}

export function setMySensorError(message: string) {
  const snapshot = getSnapshotRef();
  setSnapshotRef({ ...snapshot, errors: { ...snapshot.errors, mySensor: message } });
}

export function setMySensorHistory(history: AqiHistoryPoint[]) {
  const snapshot = getSnapshotRef();
  setSnapshotRef({ ...snapshot, mySensorHistory: history });
  persist();
}

export function appendMySensorHistoryPoint(point: AqiHistoryPoint) {
  const snapshot = getSnapshotRef();
  const cutoff = Date.now() - HISTORY_WINDOW_MS;
  const trimmed = snapshot.mySensorHistory.filter((p) => new Date(p.time).getTime() >= cutoff);
  setSnapshotRef({ ...snapshot, mySensorHistory: [...trimmed, point] });
  persist();
}

export function setArea(area: AreaAqiSnapshot) {
  const snapshot = getSnapshotRef();
  setSnapshotRef({
    ...snapshot,
    area,
    updatedAt: { ...snapshot.updatedAt, area: new Date().toISOString() },
    errors: { ...snapshot.errors, area: null },
  });
  persist();
}

export function setAreaError(message: string) {
  const snapshot = getSnapshotRef();
  setSnapshotRef({ ...snapshot, errors: { ...snapshot.errors, area: message } });
}

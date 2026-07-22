export interface AqiResult {
  correctedPm25: number;
  aqi: number;
  category: string;
  color: string;
}

/**
 * EPA/AirNow correction for PurpleAir PM2.5 readings (Barkjohn et al., 2021),
 * the same correction used on the AirNow Fire and Smoke Map for the
 * "PurpleAir (US EPA)" layer. Expects the CF=1 10-minute average PM2.5 value
 * and relative humidity (%). Not for regulatory use — verify against current
 * EPA guidance if that level of accuracy is ever required.
 */
export function correctPm25(rawPm25Cf1: number, humidity: number): number {
  const pm = Math.max(rawPm25Cf1, 0);
  const rh = Number.isFinite(humidity) ? humidity : 50;

  if (pm <= 343) {
    return 0.52 * pm - 0.085 * rh + 5.71;
  }
  return 0.46 * pm + 0.0000393 * pm * pm + 2.97;
}

export interface Breakpoint {
  concLow: number;
  concHigh: number;
  aqiLow: number;
  aqiHigh: number;
  category: string;
  color: string;
}

// EPA PM2.5 AQI breakpoints (effective May 6, 2024).
export const AQI_BREAKPOINTS: Breakpoint[] = [
  { concLow: 0.0, concHigh: 9.0, aqiLow: 0, aqiHigh: 50, category: "Good", color: "#00e400" },
  { concLow: 9.1, concHigh: 35.4, aqiLow: 51, aqiHigh: 100, category: "Moderate", color: "#ffd400" },
  {
    concLow: 35.5,
    concHigh: 55.4,
    aqiLow: 101,
    aqiHigh: 150,
    category: "Unhealthy for Sensitive Groups",
    color: "#ff7e00",
  },
  { concLow: 55.5, concHigh: 125.4, aqiLow: 151, aqiHigh: 200, category: "Unhealthy", color: "#ff0000" },
  { concLow: 125.5, concHigh: 225.4, aqiLow: 201, aqiHigh: 300, category: "Very Unhealthy", color: "#8f3f97" },
  { concLow: 225.5, concHigh: 325.4, aqiLow: 301, aqiHigh: 400, category: "Hazardous", color: "#7e0023" },
  { concLow: 325.5, concHigh: 500.4, aqiLow: 401, aqiHigh: 500, category: "Hazardous", color: "#7e0023" },
];

export function pm25ToAqi(concentration: number): { aqi: number; category: string; color: string } {
  const c = Math.max(0, Math.round(concentration * 10) / 10);
  const bp = AQI_BREAKPOINTS.find((b) => c <= b.concHigh);

  if (!bp) {
    const last = AQI_BREAKPOINTS[AQI_BREAKPOINTS.length - 1];
    return { aqi: 500, category: last.category, color: last.color };
  }

  const aqi = Math.round(
    ((bp.aqiHigh - bp.aqiLow) / (bp.concHigh - bp.concLow)) * (c - bp.concLow) + bp.aqiLow
  );
  return { aqi, category: bp.category, color: bp.color };
}

export function purpleAirToAqi(rawPm25Cf1: number, humidity: number): AqiResult {
  const correctedPm25 = Math.round(correctPm25(rawPm25Cf1, humidity) * 10) / 10;
  const { aqi, category, color } = pm25ToAqi(correctedPm25);
  return { correctedPm25, aqi, category, color };
}

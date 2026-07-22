import { config } from "./config";
import { fetchWeather } from "./openMeteo";
import { fetchSingleSensor, fetchSensorGroup } from "./purpleAir";
import { purpleAirToAqi, pm25ToAqi } from "./aqi";
import { generateMockAreaReadings, generateMockHistory, generateMockReading } from "./mockData";
import * as cache from "./cache";

let started = false;
let mySensorHistorySeeded = false;

async function pollWeather() {
  try {
    const weather = await fetchWeather();
    cache.setWeather(weather);
  } catch (err) {
    console.error("[scheduler] weather poll failed", err);
    cache.setWeatherError(err instanceof Error ? err.message : "Unknown error");
  }
}

async function pollMySensor() {
  if (config.mock.enabled) {
    if (!mySensorHistorySeeded) {
      const intervalMinutes = Math.max(1, config.intervals.mySensorMs / 60_000);
      cache.setMySensorHistory(generateMockHistory(24, intervalMinutes));
      mySensorHistorySeeded = true;
    }

    const reading = generateMockReading();
    const aqi = purpleAirToAqi(reading.pm25, reading.humidity);
    cache.setMySensor({
      ...aqi,
      name: reading.name,
      humidity: reading.humidity,
      lastSeen: reading.lastSeen,
    });
    cache.appendMySensorHistoryPoint({ time: new Date().toISOString(), ...aqi });
    return;
  }

  const { mySensorIndex } = config.purpleAir;
  if (!mySensorIndex) return;

  try {
    const reading = await fetchSingleSensor(mySensorIndex);
    const humidity = reading.humidity ?? 50;
    const pm25 = reading.pm25_10min ?? reading.pm25 ?? 0;
    const aqi = purpleAirToAqi(pm25, humidity);
    cache.setMySensor({
      ...aqi,
      name: reading.name,
      humidity: reading.humidity,
      lastSeen: reading.lastSeen,
    });
    cache.appendMySensorHistoryPoint({ time: new Date().toISOString(), ...aqi });
  } catch (err) {
    console.error("[scheduler] my-sensor poll failed", err);
    cache.setMySensorError(err instanceof Error ? err.message : "Unknown error");
  }
}

async function pollArea() {
  if (config.mock.enabled) {
    const readings = generateMockAreaReadings(3);
    const sensors = readings.map((r) => {
      const aqi = purpleAirToAqi(r.pm25, r.humidity);
      return { ...aqi, name: r.name, humidity: r.humidity, lastSeen: r.lastSeen };
    });
    const avgCorrected = sensors.reduce((sum, s) => sum + s.correctedPm25, 0) / sensors.length;
    const roundedAvg = Math.round(avgCorrected * 10) / 10;
    cache.setArea({
      average: { correctedPm25: roundedAvg, ...pm25ToAqi(roundedAvg) },
      sensorCount: sensors.length,
      sensors,
    });
    return;
  }

  const { areaSensorIndexes } = config.purpleAir;
  if (areaSensorIndexes.length === 0) return;

  try {
    const readings = await fetchSensorGroup(areaSensorIndexes);
    const sensors = readings
      .filter((r) => r.pm25 != null)
      .map((r) => {
        const humidity = r.humidity ?? 50;
        const pm25 = r.pm25_10min ?? r.pm25 ?? 0;
        const aqi = purpleAirToAqi(pm25, humidity);
        return { ...aqi, name: r.name, humidity: r.humidity, lastSeen: r.lastSeen };
      });

    let average = null;
    if (sensors.length > 0) {
      const avgCorrected =
        sensors.reduce((sum, s) => sum + s.correctedPm25, 0) / sensors.length;
      const roundedAvg = Math.round(avgCorrected * 10) / 10;
      average = { correctedPm25: roundedAvg, ...pm25ToAqi(roundedAvg) };
    }

    cache.setArea({ average, sensorCount: sensors.length, sensors });
  } catch (err) {
    console.error("[scheduler] area poll failed", err);
    cache.setAreaError(err instanceof Error ? err.message : "Unknown error");
  }
}

export function startBackgroundJobs() {
  if (started) return;
  started = true;

  cache.loadSnapshot();

  if (config.mock.enabled) {
    console.log("[scheduler] MOCK_DATA enabled — PurpleAir API calls are disabled");
  }

  void pollWeather();
  void pollMySensor();
  void pollArea();

  setInterval(pollWeather, config.intervals.weatherMs);
  setInterval(pollMySensor, config.intervals.mySensorMs);
  setInterval(pollArea, config.intervals.areaMs);

  console.log("[scheduler] background jobs started");
}

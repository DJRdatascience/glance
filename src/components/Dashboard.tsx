"use client";

import { useEffect, useState } from "react";
import WeatherCard from "./WeatherCard";
import TomorrowCard from "./TomorrowCard";
import AqiCard from "./AqiCard";
import AreaAqiMini from "./AreaAqiMini";
import AqiHistoryChart from "./AqiHistoryChart";
import Clock from "./Clock";
import type { DashboardSnapshot } from "@/lib/cache";

const POLL_INTERVAL_MS = 60_000;
const RELOAD_AFTER_MS = 6 * 60 * 60 * 1000; // safety-net full reload every 6h

export default function Dashboard({ initialData }: { initialData: DashboardSnapshot }) {
  const [data, setData] = useState<DashboardSnapshot>(initialData);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // Keep showing the last-known-good data on transient network errors.
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => window.location.reload(), RELOAD_AFTER_MS);
    return () => clearTimeout(id);
  }, []);

  const isNight = data.weather ? !data.weather.current.isDay : false;

  return (
    <div
      className={`h-screen w-screen select-none overflow-hidden px-12 py-10 transition-colors duration-[3000ms] ${
        isNight ? "bg-slate-950" : "bg-slate-800"
      } text-white`}
    >
      {isNight && (
        <div className="pointer-events-none fixed inset-0 bg-black/40 transition-opacity duration-[3000ms]" />
      )}

      <div className="relative z-10 flex h-full flex-col gap-10">
        <div className="flex items-start justify-between gap-8">
          <WeatherCard weather={data.weather} />
          <TomorrowCard weather={data.weather} />
          <Clock timezone={data.weather?.location.timezone} />
        </div>

        <div className="flex flex-1 gap-8">
          <div className="flex w-[380px] shrink-0 flex-col gap-6">
            <AqiCard
              title="Air Quality — My Sensor"
              subtitle={data.mySensor?.name}
              aqi={data.mySensor?.aqi ?? null}
              category={data.mySensor?.category ?? null}
              color={data.mySensor?.color ?? null}
              updatedAt={data.updatedAt.mySensor}
              error={data.errors.mySensor}
            />
            <AreaAqiMini
              sensorCount={data.area?.sensorCount ?? 0}
              aqi={data.area?.average?.aqi ?? null}
              category={data.area?.average?.category ?? null}
              color={data.area?.average?.color ?? null}
              error={data.errors.area}
            />
          </div>

          <div className="flex-1 rounded-3xl bg-white/5 p-8 backdrop-blur">
            <AqiHistoryChart history={data.mySensorHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

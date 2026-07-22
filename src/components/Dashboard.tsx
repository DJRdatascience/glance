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
  const accentColor = data.mySensor?.color ?? "#38bdf8";

  return (
    <div
      className={`h-screen w-screen select-none overflow-hidden px-12 py-10 transition-colors duration-[3000ms] ${
        isNight ? "bg-slate-950" : "bg-slate-800"
      } text-white`}
    >
      {isNight && (
        <div className="pointer-events-none fixed inset-0 bg-black/40 transition-opacity duration-[3000ms]" />
      )}

      <div className="relative z-10 flex h-full flex-col">
        <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent shadow-2xl shadow-black/40">
          <div
            className="pointer-events-none absolute -top-32 -right-24 h-[440px] w-[440px] rounded-full blur-[110px]"
            style={{ backgroundColor: accentColor, opacity: 0.22, transition: "background-color 3s ease" }}
          />
          <div
            className="pointer-events-none absolute -bottom-40 -left-24 h-[360px] w-[360px] rounded-full blur-[110px]"
            style={{ backgroundColor: accentColor, opacity: 0.12, transition: "background-color 3s ease" }}
          />

          <div className="pointer-events-none absolute top-2.5 left-8 text-xs font-medium tracking-[0.3em] text-white/15 uppercase">
            glance
          </div>

          <div className="relative flex h-full flex-col divide-y divide-white/10">
            <div className="flex divide-x divide-white/10">
              <div className="relative flex-1 p-8">
                <div
                  className="absolute inset-x-8 top-0 h-[3px] rounded-full"
                  style={{ backgroundColor: accentColor, transition: "background-color 3s ease" }}
                />
                <WeatherCard weather={data.weather} />
              </div>
              <div className="w-56 shrink-0 p-6">
                <TomorrowCard weather={data.weather} />
              </div>
              <div className="flex items-center justify-end p-8">
                <Clock timezone={data.weather?.location.timezone} />
              </div>
            </div>

            <div className="flex flex-1 divide-x divide-white/10 overflow-hidden">
              <div className="flex w-[380px] shrink-0 flex-col divide-y divide-white/10">
                <div className="relative flex-1 p-8">
                  <div
                    className="absolute inset-x-8 top-0 h-[3px] rounded-full"
                    style={{ backgroundColor: accentColor, transition: "background-color 3s ease" }}
                  />
                  <AqiCard
                    title="Air Quality — My Sensor"
                    aqi={data.mySensor?.aqi ?? null}
                    category={data.mySensor?.category ?? null}
                    color={data.mySensor?.color ?? null}
                    error={data.errors.mySensor}
                  />
                </div>
                <div className="p-6">
                  <AreaAqiMini
                    sensorCount={data.area?.sensorCount ?? 0}
                    aqi={data.area?.average?.aqi ?? null}
                    category={data.area?.average?.category ?? null}
                    color={data.area?.average?.color ?? null}
                    error={data.errors.area}
                  />
                </div>
              </div>

              <div className="flex-1 p-8">
                <AqiHistoryChart history={data.mySensorHistory} updatedAt={data.updatedAt.mySensor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

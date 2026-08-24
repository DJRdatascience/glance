"use client";

import { useEffect, useRef, useState } from "react";
import WeatherCard from "./WeatherCard";
import TomorrowCard from "./TomorrowCard";
import AqiCard from "./AqiCard";
import AreaAqiMini from "./AreaAqiMini";
import AqiHistoryChart from "./AqiHistoryChart";
import Clock from "./Clock";
import type { DashboardSnapshot } from "@/lib/cache";
import { isOvernightHour } from "@/lib/nightSchedule";

const POLL_INTERVAL_MS = 60_000;
const RELOAD_AFTER_MS = 6 * 60 * 60 * 1000; // safety-net full reload every 6h

// Fixed design canvas the layout below is built for (matches the Fire HD 10
// kiosk display — see src/app/preview/page.tsx). Rather than relying on the
// browser's viewport meta tag to scale the page (which only scales width,
// distorting the aspect ratio whenever height doesn't scale by the same
// factor), we measure the real available space ourselves and apply a single
// uniform transform: scale() — the same technique the preview page uses.
const DEVICE_WIDTH = 1920;
const DEVICE_HEIGHT = 1200;

export default function Dashboard({ initialData }: { initialData: DashboardSnapshot }) {
  const [data, setData] = useState<DashboardSnapshot>(initialData);
  // Starts false and is set client-side only (like Clock.tsx's mount-time
  // state) to avoid a hydration mismatch — the server has no reliable way
  // to know the client's local time/timezone.
  const [isOvernight, setIsOvernight] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  // Position/scale are computed as plain numbers (not left to flexbox
  // centering) so this doesn't depend on the host browser's flex/vh-vw
  // handling — some kiosk WebViews (e.g. Fire OS) have been observed to
  // distort flex-centered, transform-scaled content.
  const [box, setBox] = useState({ scale: 1, left: 0, top: 0 });

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scale = Math.min(width / DEVICE_WIDTH, height / DEVICE_HEIGHT);
      setBox({
        scale,
        left: (width - DEVICE_WIDTH * scale) / 2,
        top: (height - DEVICE_HEIGHT * scale) / 2,
      });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    // Some kiosk browsers (e.g. Fully Kiosk on Fire OS) settle into true
    // fullscreen — hiding system bars — a moment after the initial paint,
    // without firing a resize event. Re-check a few times early on to catch
    // that late-settling viewport size instead of getting stuck with a
    // stale, too-small measurement.
    const retries = [100, 300, 800, 1500, 3000].map((ms) => setTimeout(update, ms));

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      retries.forEach(clearTimeout);
    };
  }, []);

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

  // Checked independently of the data poll above so the overnight dim
  // reliably kicks in/out on schedule even if data fetches fail.
  useEffect(() => {
    const update = () => setIsOvernight(isOvernightHour(new Date(), data.weather?.location.timezone));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [data.weather?.location.timezone]);

  const isNight = data.weather ? !data.weather.current.isDay : false;
  const accentColor = data.mySensor?.color ?? "#38bdf8";

  return (
    <div ref={stageRef} className="fixed inset-0 overflow-hidden bg-slate-950">
      <div
        style={{
          position: "absolute",
          left: box.left,
          top: box.top,
          width: DEVICE_WIDTH,
          height: DEVICE_HEIGHT,
          transform: `scale(${box.scale})`,
          transformOrigin: "top left",
          filter: isOvernight ? "brightness(0.4)" : "none",
          transition: "filter 3000ms ease",
        }}
        className={`select-none overflow-hidden px-12 py-10 transition-colors duration-[3000ms] ${
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
    </div>
  );
}

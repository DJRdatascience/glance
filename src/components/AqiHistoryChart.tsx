"use client";

import { useMemo } from "react";
import { AQI_BREAKPOINTS } from "@/lib/aqi";
import type { AqiHistoryPoint } from "@/lib/cache";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 240;
const PADDING_LEFT = 8;
const PADDING_RIGHT = 8;
const PADDING_TOP = 8;
const PADDING_BOTTOM = 24;

export default function AqiHistoryChart({ history }: { history: AqiHistoryPoint[] }) {
  const chart = useMemo(() => {
    if (history.length === 0) return null;

    const innerWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    const maxAqi = Math.max(...history.map((p) => p.aqi));
    const yMax = Math.max(150, Math.ceil((maxAqi * 1.15) / 50) * 50);

    const xFor = (i: number) => PADDING_LEFT + (i / (history.length - 1 || 1)) * innerWidth;
    const yFor = (aqi: number) => PADDING_TOP + innerHeight - (Math.min(aqi, yMax) / yMax) * innerHeight;

    const linePoints = history.map((p, i) => `${xFor(i)},${yFor(p.aqi)}`);
    const floorY = PADDING_TOP + innerHeight;
    const linePath = `M ${linePoints.join(" L ")}`;
    const areaPath = `M ${PADDING_LEFT},${floorY} L ${linePoints.join(" L ")} L ${xFor(
      history.length - 1
    )},${floorY} Z`;

    const bands = AQI_BREAKPOINTS.filter((b) => b.aqiLow < yMax).map((b) => {
      const top = yFor(Math.min(b.aqiHigh, yMax));
      const bottom = yFor(b.aqiLow);
      return { color: b.color, y: top, height: Math.max(0, bottom - top) };
    });

    const tickCount = Math.min(5, history.length);
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      const idx = Math.round((i / (tickCount - 1 || 1)) * (history.length - 1));
      const point = history[idx];
      const anchor: "start" | "middle" | "end" = i === 0 ? "start" : i === tickCount - 1 ? "end" : "middle";
      return {
        x: xFor(idx),
        anchor,
        label: new Date(point.time).toLocaleTimeString("en-US", { hour: "numeric" }),
      };
    });

    return { linePath, areaPath, bands, ticks, latest: history[history.length - 1] };
  }, [history]);

  if (!chart) {
    return <p className="text-white/50">Waiting for history…</p>;
  }

  const { linePath, areaPath, bands, ticks, latest } = chart;

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-xl text-white/60">My Sensor — 24 Hour Trend</p>
        <p className="text-sm text-white/40">
          Latest: {latest.aqi} AQI · {latest.category}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full flex-1"
      >
        {bands.map((band, i) => (
          <rect
            key={i}
            x={PADDING_LEFT}
            y={band.y}
            width={CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT}
            height={band.height}
            fill={band.color}
            opacity={0.12}
          />
        ))}
        <path d={areaPath} fill={latest.color} opacity={0.25} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {ticks.map((tick, i) => (
          <text
            key={i}
            x={tick.x}
            y={CHART_HEIGHT - 6}
            fill="rgba(255,255,255,0.4)"
            fontSize={11}
            textAnchor={tick.anchor}
          >
            {tick.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

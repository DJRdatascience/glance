"use client";

import { useId, useMemo } from "react";
import type { AqiHistoryPoint } from "@/lib/cache";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 240;
const PADDING_LEFT = 8;
const PADDING_RIGHT = 8;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 24;
const GRID_STEP = 50;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const TICK_INTERVALS = 4;

// Muted, cohesive palette — distinct hues at consistent saturation/lightness
// so categories stay identifiable without the garishness of raw EPA colors.
const CATEGORY_COLORS: Record<string, string> = {
  Good: "#5cb88a",
  Moderate: "#d9b44a",
  "Unhealthy for Sensitive Groups": "#d9823f",
  Unhealthy: "#c1495b",
  "Very Unhealthy": "#8b5fa3",
  Hazardous: "#7a4b52",
};

export default function AqiHistoryChart({
  history,
  updatedAt,
}: {
  history: AqiHistoryPoint[];
  updatedAt?: string | null;
}) {
  const id = useId();
  const lineGradientId = `${id}-line`;
  const fadeId = `${id}-fade`;
  const maskId = `${id}-mask`;

  const chart = useMemo(() => {
    if (history.length === 0) return null;

    const innerWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    const maxAqi = Math.max(...history.map((p) => p.aqi));
    const yMax = Math.max(150, Math.ceil((maxAqi * 1.15) / 50) * 50);

    // Anchor the x-axis to a fixed 24-hour window ending at the most recent
    // reading, positioning points by their actual timestamp rather than by
    // array index. Index-based positioning stretched sparse/unevenly-sampled
    // history (e.g. right after a reset, before a full day of polls have
    // landed) across the full width, which threw off tick label spacing.
    // Anchoring to real time keeps the axis honest and consistent no matter
    // how much history exists yet.
    const endTime = new Date(history[history.length - 1].time).getTime();
    const startTime = endTime - WINDOW_MS;

    const xFor = (time: number) => {
      const ratio = (time - startTime) / WINDOW_MS;
      return PADDING_LEFT + Math.min(Math.max(ratio, 0), 1) * innerWidth;
    };
    const yFor = (aqi: number) => PADDING_TOP + innerHeight - (Math.min(aqi, yMax) / yMax) * innerHeight;

    const points = history.map((p) => ({
      x: xFor(new Date(p.time).getTime()),
      y: yFor(p.aqi),
      category: p.category,
      color: p.color,
    }));
    const linePoints = points.map((p) => `${p.x},${p.y}`);
    const floorY = PADDING_TOP + innerHeight;
    const linePath = `M ${linePoints.join(" L ")}`;
    const areaPath = `M ${PADDING_LEFT},${floorY} L ${linePoints.join(" L ")} L ${
      points[points.length - 1].x
    },${floorY} Z`;

    // Faint reference gridlines at round AQI intervals — structure without noise.
    const gridLines: number[] = [];
    for (let v = GRID_STEP; v < yMax; v += GRID_STEP) {
      gridLines.push(v);
    }

    // Color stops sampled from each point's own category — the line (and the
    // wash beneath it) genuinely reflects how conditions changed over the day,
    // rather than tinting the whole chart with just the current reading.
    const colorStops = points.map((p) => ({
      offset: ((p.x - PADDING_LEFT) / innerWidth) * 100,
      color: CATEGORY_COLORS[p.category] ?? p.color,
    }));

    // Fixed, evenly time-spaced ticks across the full 24-hour window (every
    // 6 hours) — independent of how much history data has been collected so
    // far, so the axis always looks the same shape, just with the line only
    // occupying however much of it is actually backed by data.
    const ticks = Array.from({ length: TICK_INTERVALS + 1 }, (_, i) => {
      const t = startTime + (i / TICK_INTERVALS) * WINDOW_MS;
      const anchor: "start" | "middle" | "end" = i === 0 ? "start" : i === TICK_INTERVALS ? "end" : "middle";
      return {
        x: xFor(t),
        anchor,
        label: new Date(t).toLocaleTimeString("en-US", { hour: "numeric" }),
      };
    });

    const latest = history[history.length - 1];
    const endPoint = points[points.length - 1];
    const endColor = CATEGORY_COLORS[latest.category] ?? latest.color;

    return { linePath, areaPath, gridLines, colorStops, ticks, latest, endPoint, endColor, yFor, floorY };
  }, [history]);

  if (!chart) {
    return <p className="text-white/50">Waiting for history…</p>;
  }

  const { linePath, areaPath, gridLines, colorStops, ticks, endPoint, endColor, yFor, floorY } = chart;

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-xl text-white/60">Air Quality — 24 Hour Trend</p>
        {updatedAt && (
          <p className="text-sm text-white/40">
            My Sensor, Updated {new Date(updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        )}
      </div>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full flex-1"
      >
        <defs>
          <linearGradient
            id={lineGradientId}
            gradientUnits="userSpaceOnUse"
            x1={PADDING_LEFT}
            x2={CHART_WIDTH - PADDING_RIGHT}
            y1="0"
            y2="0"
          >
            {colorStops.map((stop, i) => (
              <stop key={i} offset={`${stop.offset}%`} stopColor={stop.color} />
            ))}
          </linearGradient>
          <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity={0.9} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </linearGradient>
          <mask id={maskId}>
            <rect x="0" y="0" width={CHART_WIDTH} height={CHART_HEIGHT} fill={`url(#${fadeId})`} />
          </mask>
        </defs>

        {gridLines.map((v) => (
          <line
            key={v}
            x1={PADDING_LEFT}
            x2={CHART_WIDTH - PADDING_RIGHT}
            y1={yFor(v)}
            y2={yFor(v)}
            stroke="white"
            strokeWidth={1}
            opacity={0.06}
          />
        ))}

        <path d={areaPath} fill={`url(#${lineGradientId})`} opacity={0.18} mask={`url(#${maskId})`} stroke="none" />

        <path
          d={linePath}
          fill="none"
          stroke={`url(#${lineGradientId})`}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <circle cx={endPoint.x} cy={endPoint.y} r={4} fill={endColor} stroke="white" strokeWidth={1.5} />

        <line
          x1={PADDING_LEFT}
          x2={CHART_WIDTH - PADDING_RIGHT}
          y1={floorY}
          y2={floorY}
          stroke="white"
          opacity={0.1}
          strokeWidth={1}
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

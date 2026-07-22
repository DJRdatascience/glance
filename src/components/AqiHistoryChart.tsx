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

    const xFor = (i: number) => PADDING_LEFT + (i / (history.length - 1 || 1)) * innerWidth;
    const yFor = (aqi: number) => PADDING_TOP + innerHeight - (Math.min(aqi, yMax) / yMax) * innerHeight;

    const linePoints = history.map((p, i) => `${xFor(i)},${yFor(p.aqi)}`);
    const floorY = PADDING_TOP + innerHeight;
    const linePath = `M ${linePoints.join(" L ")}`;
    const areaPath = `M ${PADDING_LEFT},${floorY} L ${linePoints.join(" L ")} L ${xFor(
      history.length - 1
    )},${floorY} Z`;

    // Faint reference gridlines at round AQI intervals — structure without noise.
    const gridLines: number[] = [];
    for (let v = GRID_STEP; v < yMax; v += GRID_STEP) {
      gridLines.push(v);
    }

    // Color stops sampled from each point's own category — the line (and the
    // wash beneath it) genuinely reflects how conditions changed over the day,
    // rather than tinting the whole chart with just the current reading.
    const first = xFor(0);
    const last = xFor(history.length - 1);
    const span = last - first || 1;
    const colorStops = history.map((p, i) => ({
      offset: ((xFor(i) - first) / span) * 100,
      color: CATEGORY_COLORS[p.category] ?? p.color,
    }));

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

    const latest = history[history.length - 1];
    const endPoint = { x: xFor(history.length - 1), y: yFor(latest.aqi) };
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
        <p className="text-xl text-white/60">My Sensor — 24 Hour Trend</p>
        {updatedAt && (
          <p className="text-sm text-white/40">
            Updated {new Date(updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
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

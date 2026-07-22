"use client";

import { useEffect, useRef, useState } from "react";

// Fire HD 10 (9th Gen) — 1920x1200, 224 ppi.
const DEVICE_WIDTH = 1920;
const DEVICE_HEIGHT = 1200;

export default function PreviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function updateScale(width: number, height: number) {
      setScale(Math.min(width / DEVICE_WIDTH, height / DEVICE_HEIGHT));
    }

    // ResizeObserver reacts to the container's actual rendered size changing,
    // regardless of what triggered it (window drag, devtools panel, zoom,
    // etc.) — more reliable than a window "resize" listener alone.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      updateScale(width, height);
    });
    observer.observe(el);

    const rect = el.getBoundingClientRect();
    updateScale(rect.width, rect.height);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen items-center justify-center gap-4 overflow-hidden bg-black"
    >
      <div
        style={{ width: DEVICE_WIDTH * scale, height: DEVICE_HEIGHT * scale }}
        className="relative shrink-0 shadow-2xl shadow-black/60"
      >
        <div
          style={{ width: DEVICE_WIDTH, height: DEVICE_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <iframe src="/" width={DEVICE_WIDTH} height={DEVICE_HEIGHT} style={{ border: "none", display: "block" }} title="Fire HD 10 preview" />
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-3 left-3 rounded bg-white/10 px-2 py-1 font-mono text-xs text-white/50">
        Fire HD 10 · {DEVICE_WIDTH}×{DEVICE_HEIGHT} · {Math.round(scale * 100)}%
      </div>
    </div>
  );
}

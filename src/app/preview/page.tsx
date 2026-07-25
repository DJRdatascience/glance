"use client";

import { useEffect, useRef, useState } from "react";

// Fire HD 10 (9th Gen) — 1920x1200, 224 ppi.
const DEVICE_WIDTH = 1920;
const DEVICE_HEIGHT = 1200;

export default function PreviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden bg-black">
      <div
        style={{
          position: "absolute",
          left: box.left,
          top: box.top,
          width: DEVICE_WIDTH,
          height: DEVICE_HEIGHT,
          transform: `scale(${box.scale})`,
          transformOrigin: "top left",
        }}
        className="shadow-2xl shadow-black/60"
      >
        <iframe src="/" width={DEVICE_WIDTH} height={DEVICE_HEIGHT} style={{ border: "none", display: "block" }} title="Fire HD 10 preview" />
      </div>

      <div className="pointer-events-none fixed bottom-3 left-3 rounded bg-white/10 px-2 py-1 font-mono text-xs text-white/50">
        Fire HD 10 · {DEVICE_WIDTH}×{DEVICE_HEIGHT} · {Math.round(box.scale * 100)}%
      </div>
    </div>
  );
}

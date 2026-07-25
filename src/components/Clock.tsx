"use client";

import { useEffect, useState } from "react";

export default function Clock({ timezone }: { timezone?: string }) {
  // Start with a real time so the server-rendered page has a visible clock.
  // This is important for kiosk WebViews where client hydration may be slow
  // or disabled; the effect below keeps it current once JavaScript is active.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let time: string;
  let date: string;
  try {
    // Android WebViews with incomplete timezone/Intl data can throw here.
    // Keep the dashboard usable by falling back to the tablet's local time.
    time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    }).format(now);
    date = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: timezone,
    }).format(now);
  } catch {
    time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }

  return (
    <div className="text-right whitespace-nowrap">
      <div className="text-7xl font-semibold tracking-tight tabular-nums">
        {time}
      </div>
      <div className="text-xl text-white/70">{date}</div>
    </div>
  );
}

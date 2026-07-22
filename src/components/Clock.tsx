"use client";

import { useEffect, useState } from "react";

export default function Clock({ timezone }: { timezone?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <div className="h-24 w-64" />;
  }

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  });
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });

  return (
    <div className="text-right">
      <div className="text-7xl font-semibold tracking-tight tabular-nums">
        {timeFormatter.format(now)}
      </div>
      <div className="text-xl text-white/70">{dateFormatter.format(now)}</div>
    </div>
  );
}

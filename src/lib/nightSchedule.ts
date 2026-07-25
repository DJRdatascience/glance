// Shared overnight window (10 PM – 5 AM local time) used to both throttle
// background API polling and drive the dashboard's overnight dimming. Kept
// dependency-free (no env reads) so it's safe to import from both server
// code (scheduler.ts) and client components (Dashboard.tsx).
export const NIGHT_START_HOUR = 22; // 10 PM
export const NIGHT_END_HOUR = 5; // 5 AM

function getHourInTimeZone(date: Date, timeZone?: string): number {
  if (!timeZone) return date.getHours();

  try {
    const hour = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .find((part) => part.type === "hour")?.value;
    const parsedHour = Number(hour);
    if (Number.isInteger(parsedHour)) return parsedHour;
  } catch {
    // Fall back to the runtime timezone if a deployment supplies an invalid
    // IANA zone. This keeps polling alive while the configuration is fixed.
  }

  return date.getHours();
}

export function isOvernightHour(date: Date = new Date(), timeZone?: string): boolean {
  const hour = getHourInTimeZone(date, timeZone);
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

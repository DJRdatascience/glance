// Shared overnight window (10 PM – 5 AM local time) used to both throttle
// background API polling and drive the dashboard's overnight dimming. Kept
// dependency-free (no env reads) so it's safe to import from both server
// code (scheduler.ts) and client components (Dashboard.tsx).
export const NIGHT_START_HOUR = 22; // 10 PM
export const NIGHT_END_HOUR = 5; // 5 AM

export function isOvernightHour(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

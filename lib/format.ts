/**
 * Bulk-imported train data (RailRadar) stores clock times as "HH:MM:SS".
 * Hand-seeded data already uses "HH:MM". Normalize to "HH:MM" everywhere
 * it's displayed or fed into <input type="time">.
 */
export function formatClockTime(time: string | null | undefined): string | null {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : time;
}

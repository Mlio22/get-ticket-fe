import { DEFAULT_TIMEZONE } from "@/constants";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

/**
 * Format a UTC date string into a human-readable date/time in the
 * specified timezone.
 * @param dateStr  ISO date string (UTC)
 * @param timezone IANA timezone (e.g. "Asia/Jakarta")
 * @param pattern  date-fns format pattern (default: "dd MMM yyyy, HH:mm")
 */
export function formatEventDate(
  dateStr: string,
  timezone = DEFAULT_TIMEZONE,
  pattern = "dd MMM yyyy, HH:mm"
): string {
  const utcDate = parseISO(dateStr);
  const zonedDate = toZonedTime(utcDate, timezone);
  return format(zonedDate, pattern);
}

/**
 * Format only the date part (no time).
 */
export function formatDate(
  dateStr: string,
  timezone = DEFAULT_TIMEZONE
): string {
  return formatEventDate(dateStr, timezone, "dd MMM yyyy");
}

/**
 * Format only the time part.
 */
export function formatTime(
  dateStr: string,
  timezone = DEFAULT_TIMEZONE
): string {
  return formatEventDate(dateStr, timezone, "HH:mm");
}

/**
 * Return a relative time string (e.g. "3 days ago", "in 2 hours").
 */
export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

/**
 * Convert a local time in the given timezone to a UTC ISO string.
 */
export function toUTC(localDateStr: string, timezone = DEFAULT_TIMEZONE): string {
  const utcDate = fromZonedTime(new Date(localDateStr), timezone);
  return utcDate.toISOString();
}

/**
 * Get commonly used timezone options for select inputs.
 */
export const TIMEZONE_OPTIONS = [
  { value: "Asia/Jakarta", label: "WIB – Jakarta (UTC+7)" },
  { value: "Asia/Makassar", label: "WITA – Makassar (UTC+8)" },
  { value: "Asia/Jayapura", label: "WIT – Jayapura (UTC+9)" },
  { value: "Asia/Singapore", label: "SGT – Singapore (UTC+8)" },
  { value: "America/New_York", label: "EST/EDT – New York" },
  { value: "America/Los_Angeles", label: "PST/PDT – Los Angeles" },
  { value: "Europe/London", label: "GMT/BST – London" },
  { value: "Europe/Paris", label: "CET/CEST – Paris" },
  { value: "Asia/Tokyo", label: "JST – Tokyo (UTC+9)" },
] as const;

import { format, parseISO } from "date-fns";

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
}

export function minutesToHHMM(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatTimeRange(start: string, end?: string | null) {
  const startDate = parseISO(start);
  const endDate = end ? parseISO(end) : null;
  const startString = format(startDate, "HH:mm");
  const endString = endDate ? format(endDate, "HH:mm") : "--:--";
  return `${startString} - ${endString}`;
}

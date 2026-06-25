import { format } from "date-fns";

export const getTimestamp = (ts: unknown): Date | null => {
  if (!ts) return null;

  let date: Date | null = null;

  if (ts instanceof Date) {
    date = ts;
  } else if (typeof ts === "object") {
    const t = ts as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof t.toDate === "function") {
      try {
        date = t.toDate();
      } catch {
        // ignore
      }
    } else {
      const secs = t.seconds ?? t._seconds;
      if (typeof secs === "number") {
        date = new Date(secs * 1000);
      }
    }
  } else if (typeof ts === "string" || typeof ts === "number") {
    date = new Date(ts);
  }

  return date && !isNaN(date.getTime()) ? date : null;
};

export const formatToInputDate = (ts: unknown): string => {
  const date = getTimestamp(ts);
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
};

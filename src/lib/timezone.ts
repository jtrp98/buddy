const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

export function formatThaiDateTime(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "-";

  return (
    new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date) + " น. (เวลาไทย)"
  );
}

export function formatThaiDateOnly(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Converts a `datetime-local` string representing Asia/Bangkok (UTC+7) wall-clock time
 * (e.g. "2026-12-25T18:00") into a UTC Date object.
 */
export function bangkokLocalInputToUtc(localStr: string): Date {
  const trimmed = localStr.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (!match) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("รูปแบบวันและเวลาไม่ถูกต้อง");
    }
    return parsed;
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const utcMs =
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    ) - BANGKOK_OFFSET_MS;

  return new Date(utcMs);
}

/**
 * Converts a UTC Date into a `datetime-local` input string in Asia/Bangkok (UTC+7).
 */
export function utcToBangkokLocalInput(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "";

  const bkk = new Date(date.getTime() + BANGKOK_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${bkk.getUTCFullYear()}-${pad(bkk.getUTCMonth() + 1)}-${pad(bkk.getUTCDate())}T${pad(bkk.getUTCHours())}:${pad(bkk.getUTCMinutes())}`;
}

export function getDefaultCloseInput(daysAhead = 3): string {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const str = utcToBangkokLocalInput(d);
  return `${str.slice(0, 10)}T18:00`;
}

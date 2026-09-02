const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MILLISECONDS_PER_DAY = 86_400_000;

export function toEpochDay(date: string): number {
  const match = DATE_PATTERN.exec(date);

  if (!match) {
    throw new TypeError("Expected an ISO calendar date.");
  }

  const epochDay = Math.floor(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) /
      MILLISECONDS_PER_DAY,
  );

  if (fromEpochDay(epochDay) !== date) {
    throw new TypeError("Expected a valid ISO calendar date.");
  }

  return epochDay;
}

export function fromEpochDay(day: number): string {
  return new Date(day * MILLISECONDS_PER_DAY).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return fromEpochDay(toEpochDay(date) + days);
}

export function startOfWeek(date: string): string {
  const weekday = new Date(toEpochDay(date) * MILLISECONDS_PER_DAY).getUTCDay();

  return addDays(date, -(weekday === 0 ? 6 : weekday - 1));
}

export function dateInTimeZone(instant: Date, timeZone: string): string {
  const parts = Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${value.year}-${value.month}-${value.day}`;
}

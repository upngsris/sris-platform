/**
 * SRIS activity dates are formatted on the server. Without an explicit zone
 * they shift with wherever the site is deployed, so every listing pins the
 * society's own timezone and visitors all see the same day and time.
 */
export const SRIS_TIME_ZONE = "Pacific/Port_Moresby";

export function formatInPortMoresby(
  value: string,
  options: Intl.DateTimeFormatOptions,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    ...options,
    timeZone: SRIS_TIME_ZONE,
  }).format(date);
}

export type ZonedDateParts = {
  year: number;
  monthIndex: number;
  day: number;
};

/**
 * Calendar grouping has to agree with the date a visitor actually sees.
 * `new Date(value).getMonth()` reads the *runtime's* zone, so an evening
 * Port Moresby event stored as UTC can land in the previous month on a
 * UTC server. Reading the parts back out of the pinned zone keeps grouping
 * and display in step wherever this renders.
 */
export function getZonedDateParts(
  value: string,
): ZonedDateParts | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = PART_FORMATTER.formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(
      parts.find((part) => part.type === type)?.value,
    );

  const year = read("year");
  const month = read("month");
  const day = read("day");

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }

  // Intl months are 1-based; the rest of the app uses JS 0-based indexes.
  return {
    year,
    monthIndex: month - 1,
    day,
  };
}

const PART_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: SRIS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

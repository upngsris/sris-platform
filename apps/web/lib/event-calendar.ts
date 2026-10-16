import {
  getZonedDateParts,
  type ZonedDateParts,
} from "@/lib/dates";

import type { EventData } from "@/sanity/lib/types";

export type CalendarMonth = {
  /** JS month index: 0 = January … 11 = December. */
  index: number;
  short: string;
  long: string;
};

export type CalendarSelection = {
  year: number;
  monthIndex: number;
};

export const CALENDAR_MONTHS: readonly CalendarMonth[] = [
  { index: 0, short: "Jan", long: "January" },
  { index: 1, short: "Feb", long: "February" },
  { index: 2, short: "Mar", long: "March" },
  { index: 3, short: "Apr", long: "April" },
  { index: 4, short: "May", long: "May" },
  { index: 5, short: "Jun", long: "June" },
  { index: 6, short: "Jul", long: "July" },
  { index: 7, short: "Aug", long: "August" },
  { index: 8, short: "Sep", long: "September" },
  { index: 9, short: "Oct", long: "October" },
  { index: 10, short: "Nov", long: "November" },
  { index: 11, short: "Dec", long: "December" },
];

/**
 * An event belongs to the month its start date falls in. Multi-day events are
 * listed once, under that month, rather than repeated across every month they
 * touch — the programme reads as a schedule, not a grid occupancy map.
 */
function getEventParts(event: EventData) {
  return getZonedDateParts(event.startsAt);
}

/** Unique years that have at least one event, ascending. */
export function getEventYears(
  events: readonly EventData[],
): number[] {
  const years = new Set<number>();

  for (const event of events) {
    const parts = getEventParts(event);

    if (parts) {
      years.add(parts.year);
    }
  }

  return [...years].sort((a, b) => a - b);
}

/** Event totals per month for one year, indexed 0–11. */
export function getMonthEventCounts(
  events: readonly EventData[],
  year: number,
): number[] {
  const counts = new Array<number>(12).fill(0);

  for (const event of events) {
    const parts = getEventParts(event);

    if (parts?.year === year) {
      counts[parts.monthIndex] += 1;
    }
  }

  return counts;
}

/** Events in one month, oldest first. Never mutates the source array. */
export function getEventsForMonth(
  events: readonly EventData[],
  year: number,
  monthIndex: number,
): EventData[] {
  return events
    .filter((event) => {
      const parts = getEventParts(event);

      return (
        parts?.year === year &&
        parts.monthIndex === monthIndex
      );
    })
    .slice()
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() -
        new Date(b.startsAt).getTime(),
    );
}

/**
 * Opening state for the calendar.
 *
 * Year: this year when it has events, otherwise the nearest future year with
 * events, otherwise the most recent one.
 *
 * Month: within the current year, this month if it has events, else the next
 * month that does, else the last month that did. Other years simply open on
 * their first month with events.
 *
 * `today` comes from GROQ's `now()` so the caller never reaches for a clock
 * during render, and the server and client agree on the opening view.
 */
export function resolveInitialCalendarSelection(
  events: readonly EventData[],
  today: string,
): CalendarSelection | null {
  const years = getEventYears(events);

  if (years.length === 0) {
    return null;
  }

  const todayParts = getZonedDateParts(today);

  const currentYear =
    todayParts?.year ?? years[years.length - 1];

  const currentMonthIndex = todayParts?.monthIndex ?? 0;

  const year = years.includes(currentYear)
    ? currentYear
    : (years.find((value) => value > currentYear) ??
      years[years.length - 1]);

  const counts = getMonthEventCounts(events, year);

  const monthsWithEvents = counts
    .map((count, index) => ({ count, index }))
    .filter((month) => month.count > 0)
    .map((month) => month.index);

  if (monthsWithEvents.length === 0) {
    return { year, monthIndex: 0 };
  }

  if (year !== currentYear) {
    return { year, monthIndex: monthsWithEvents[0] };
  }

  if (counts[currentMonthIndex] > 0) {
    return { year, monthIndex: currentMonthIndex };
  }

  const nextMonthWithEvents = monthsWithEvents.find(
    (index) => index > currentMonthIndex,
  );

  return {
    year,
    monthIndex:
      nextMonthWithEvents ??
      monthsWithEvents[monthsWithEvents.length - 1],
  };
}

export function getMonthLabel(monthIndex: number) {
  return (
    CALENDAR_MONTHS[monthIndex] ?? CALENDAR_MONTHS[0]
  );
}

export function formatEventCount(count: number) {
  if (count === 0) {
    return "No events";
  }

  return count === 1 ? "1 event" : `${count} events`;
}

export type EventDayLabel = {
  day: string;
  month: string;
};

/** The large day/month stamp used by the event rows. */
export function formatEventDayLabel(
  value: string,
): EventDayLabel {
  const parts = getZonedDateParts(value);

  if (!parts) {
    return { day: "--", month: "---" };
  }

  return {
    day: String(parts.day).padStart(2, "0"),
    month: getMonthLabel(parts.monthIndex).short.toUpperCase(),
  };
}

/**
 * "24 September 2026", or "24–26 September 2026" when an event runs across
 * several days. Months and years are only repeated when they actually differ.
 *
 * Composed from the zoned parts rather than Intl: the "en" locale renders
 * "September 24, 2026", which reads wrong here and splices badly into a range.
 */
function formatFullDate(parts: ZonedDateParts) {
  return `${parts.day} ${getMonthLabel(parts.monthIndex).long} ${parts.year}`;
}

export function formatEventDateRange(
  startsAt: string,
  endsAt?: string,
): string {
  const start = getZonedDateParts(startsAt);

  if (!start) {
    return "";
  }

  const end = endsAt ? getZonedDateParts(endsAt) : null;

  const isSameDay =
    end !== null &&
    end.year === start.year &&
    end.monthIndex === start.monthIndex &&
    end.day === start.day;

  if (!end || isSameDay) {
    return formatFullDate(start);
  }

  if (end.year !== start.year) {
    return `${formatFullDate(start)} – ${formatFullDate(end)}`;
  }

  if (end.monthIndex !== start.monthIndex) {
    return `${start.day} ${getMonthLabel(start.monthIndex).long} – ${formatFullDate(end)}`;
  }

  return `${start.day}–${formatFullDate(end)}`;
}

export function isMultiDayEvent(
  startsAt: string,
  endsAt?: string,
) {
  if (!endsAt) {
    return false;
  }

  const start = getZonedDateParts(startsAt);
  const end = getZonedDateParts(endsAt);

  if (!start || !end) {
    return false;
  }

  return (
    start.year !== end.year ||
    start.monthIndex !== end.monthIndex ||
    start.day !== end.day
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { routes } from "@/lib/route";

import {
  CALENDAR_MONTHS,
  formatEventCount,
  formatEventDateRange,
  formatEventDayLabel,
  getEventYears,
  getEventsForMonth,
  getMonthEventCounts,
  getMonthLabel,
  isMultiDayEvent,
  resolveInitialCalendarSelection,
} from "@/lib/event-calendar";

import type { EventData } from "@/sanity/lib/types";

import styles from "@/app/community/events/events.module.css";

type Props = {
  events: EventData[];
  /** GROQ now() — the calendar never reads a clock during render. */
  today: string;
};

/**
 * Year → month → programme. Only the year/month switching is client-side;
 * the events themselves are fetched on the server and handed down.
 *
 * Note: rows here deliberately carry no `data-reveal`. The global reveal
 * observer collects elements once per navigation, so nodes created later by
 * a month change would never be observed and would stay hidden.
 */
export function EventsCalendar({ events, today }: Props) {
  const years = useMemo(
    () => getEventYears(events),
    [events],
  );

  const initialSelection = useMemo(
    () => resolveInitialCalendarSelection(events, today),
    [events, today],
  );

  const [selection, setSelection] = useState(
    initialSelection,
  );

  const activeYear =
    selection?.year ?? years[years.length - 1];

  const activeMonthIndex = selection?.monthIndex ?? 0;

  const monthCounts = useMemo(
    () =>
      activeYear === undefined
        ? new Array<number>(12).fill(0)
        : getMonthEventCounts(events, activeYear),
    [events, activeYear],
  );

  const monthEvents = useMemo(
    () =>
      activeYear === undefined
        ? []
        : getEventsForMonth(
            events,
            activeYear,
            activeMonthIndex,
          ),
    [events, activeYear, activeMonthIndex],
  );

  if (years.length === 0 || activeYear === undefined) {
    return (
      <div className="emptyState">
        <p className="eyebrow blue">Events calendar</p>

        <h3>No events have been scheduled yet.</h3>

        <p className="body muted">
          The yearly programme will appear here once SRIS
          activities are published.
        </p>
      </div>
    );
  }

  /** Moving to another year re-opens it on its first month with events. */
  function selectYear(year: number) {
    const counts = getMonthEventCounts(events, year);

    const firstMonthWithEvents = counts.findIndex(
      (count) => count > 0,
    );

    setSelection({
      year,
      monthIndex:
        firstMonthWithEvents === -1
          ? 0
          : firstMonthWithEvents,
    });
  }

  const activeMonth = getMonthLabel(activeMonthIndex);

  return (
    <div className={styles.calendar}>
      <div className={styles.yearNav} role="group" aria-label="Select a year">
        {years.map((year) => {
          const isActive = year === activeYear;

          return (
            <button
              key={year}
              type="button"
              className={styles.yearButton}
              aria-current={isActive ? "true" : undefined}
              onClick={() => selectYear(year)}
            >
              {year}
            </button>
          );
        })}
      </div>

      <div
        className={styles.monthGrid}
        role="group"
        aria-label={`Select a month in ${activeYear}`}
      >
        {CALENDAR_MONTHS.map((month) => {
          const count = monthCounts[month.index];
          const isActive = month.index === activeMonthIndex;

          return (
            <button
              key={month.index}
              type="button"
              className={styles.monthButton}
              aria-pressed={isActive}
              onClick={() =>
                setSelection({
                  year: activeYear,
                  monthIndex: month.index,
                })
              }
            >
              <span className={styles.monthLabel}>
                {month.short.toUpperCase()}
              </span>

              <span className={styles.monthCount}>
                {formatEventCount(count)}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.monthProgramme}>
        <h3 className={styles.monthHeading}>
          {activeMonth.long} {activeYear}
        </h3>

        {monthEvents.length > 0 ? (
          <ol className={styles.monthList}>
            {monthEvents.map((event) => (
              <CalendarEventRow
                key={event._id}
                event={event}
              />
            ))}
          </ol>
        ) : (
          <div className={styles.monthEmpty}>
            <p>
              No events are currently scheduled for{" "}
              {activeMonth.long} {activeYear}.
            </p>

            <p className="body muted">
              Check another month or return later as new
              activities are added.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarEventRow({ event }: { event: EventData }) {
  const stamp = formatEventDayLabel(event.startsAt);

  const href = routes.community.events.detail(event.slug);

  const multiDay = isMultiDayEvent(
    event.startsAt,
    event.endsAt,
  );

  return (
    <li className={styles.monthItem}>
      <Link href={href} className={styles.monthItemLink}>
        <span className={styles.monthItemDate}>
          <strong>{stamp.day}</strong>
          <span>{stamp.month}</span>
        </span>

        <span className={styles.monthItemBody}>
          <span className={styles.monthItemMeta}>
            <span>{event.venue}</span>

            {multiDay && (
              <span>
                {formatEventDateRange(
                  event.startsAt,
                  event.endsAt,
                )}
              </span>
            )}

            {event.isPast && <span>Completed</span>}
          </span>

          <span className={styles.monthItemTitle}>
            {event.title}
          </span>

          {event.summary && (
            <span className={styles.monthItemSummary}>
              {event.summary}
            </span>
          )}
        </span>

        <span
          className={styles.monthItemArrow}
          aria-hidden="true"
        >
          →
        </span>
      </Link>
    </li>
  );
}

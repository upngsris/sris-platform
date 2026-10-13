import { SRIS_TIME_ZONE } from "@/lib/dates";
import { routes } from "@/lib/route";

import { LpiCard, LpiGrid } from "./lpi-card";

import type { EventData } from "@/sanity/lib/types";

type Props = {
  data?: EventData[];
};

const eventKinds = [
  "Workshops & training",
  "Laboratory practicals",
  "Student showcases",
  "Talks & knowledge sharing",
];

export function Events({ data }: Props) {
  if (!data?.length) {
    return null;
  }

  return (
    <section className="lpi-section lpi-tint">
      <div className="lpi-container">
        <div className="lpi-head">
          <h2>What&apos;s happening at SRIS.</h2>

          <p>
            Workshops, practical sessions, project activities and
            opportunities to meet other curious students.
          </p>
        </div>

        <LpiGrid count={data.length + 1}>
          {data.map((event) => {
            const date = formatEventDate(event.startsAt);

            const meta = [event.venue, date.time].filter(Boolean).join(" · ");

            return (
              <LpiCard
                key={event._id}
                tone="interactive"
                label="Events"
                title={event.title}
                summary={event.summary}
                meta={meta}
                image={event.image}
                badge={{ primary: date.day, secondary: date.month }}
                href={routes.community.events.detail(event.slug)}
                linkLabel="View event"
              />
            );
          })}

          <LpiCard
            tone="accent"
            label="Event calendar"
            title="Open to every UPNG science student."
            summary="SRIS activities run through the academic year and most sessions are open to students from any discipline — no prior experience required."
            href={routes.community.events.index}
            linkLabel="View all events"
          >
            <ul className="lpi-card-list">
              {eventKinds.map((kind) => (
                <li key={kind}>{kind}</li>
              ))}
            </ul>
          </LpiCard>
        </LpiGrid>
      </div>
    </section>
  );
}

function formatEventDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return {
      day: "--",
      month: "---",
      time: "",
    };
  }

  const day = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    timeZone: SRIS_TIME_ZONE,
  }).format(date);

  const month = new Intl.DateTimeFormat("en", {
    month: "short",
    timeZone: SRIS_TIME_ZONE,
  })
    .format(date)
    .toUpperCase();

  const time = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: SRIS_TIME_ZONE,
  }).format(date);

  return {
    day,
    month,
    time,
  };
}

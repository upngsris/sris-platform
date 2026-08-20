import type { HomeIntroData } from "@/sanity/lib/types";

type Props = {
  data?: HomeIntroData["featuredEvents"];
};

const fallbackEvents = [
  {
    _id: "fallback-research-workshop",
    title: "Research Skills Workshop",
    slug: "research-skills-workshop",
    startsAt: "2026-09-24T10:00:00",
    venue: "MSCS Laboratory",
  },
  {
    _id: "fallback-scientific-writing",
    title: "Introduction to Scientific Writing",
    slug: "introduction-to-scientific-writing",
    startsAt: "2026-10-03T13:00:00",
    venue: "Science Lecture Theatre",
  },
  {
    _id: "fallback-project-showcase",
    title: "SRIS Student Project Showcase",
    slug: "sris-student-project-showcase",
    startsAt: "2026-10-11T09:00:00",
    venue: "UPNG",
  },
];

export function Events({ data }: Props) {
  const events =
    data && data.length > 0
      ? data
      : fallbackEvents;

  return (
    <section className="events section">
      <div className="shell eventGrid">

        {/* Section introduction */}
        <div>
          <p className="eyebrow blue">
            Upcoming events
          </p>

          <h2>
            What&apos;s happening
            <br />
            at SRIS.
          </h2>

          <p className="body muted eventIntro">
            Workshops, practical sessions, project
            activities and opportunities to meet other
            curious students.
          </p>
        </div>

        {/* Event list */}
        <div className="eventList">
          {events.map((event) => {
            const date = formatEventDate(event.startsAt);

            return (
              <a
                key={event._id}
                href={`/community/events/${event.slug}`}
              >
                <div className="date">
                  <strong>{date.day}</strong>
                  <small>{date.month}</small>
                </div>

                <div>
                  <b>{event.title}</b>

                  {event.venue && (
                    <p>
                      {event.venue}
                      {date.time && ` · ${date.time}`}
                    </p>
                  )}
                </div>

                <span aria-hidden="true">
                  →
                </span>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}


/**
 * Converts Sanity ISO datetime into the compact
 * homepage event presentation.
 */
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
  }).format(date);

  const month = new Intl.DateTimeFormat("en", {
    month: "short",
  })
    .format(date)
    .toUpperCase();

  const time = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return {
    day,
    month,
    time,
  };
}
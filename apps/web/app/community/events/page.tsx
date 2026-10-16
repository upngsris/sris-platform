import type {Metadata} from "next";
import Link from "next/link";

import {ShowMore} from "@/components/events/show-more";
import {SanityImage} from "@/components/sanity/sanity-image";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {getZonedDateParts} from "@/lib/dates";
import {getMonthLabel} from "@/lib/event-calendar";
import {routes} from "@/lib/route";
import {pageMetadata} from "@/lib/seo";

import {sanityFetch} from "@/sanity/lib/fetch";
import {
  PAST_EVENTS_QUERY,
  UPCOMING_EVENTS_QUERY,
} from "@/sanity/lib/queries";

import type {EventData} from "@/sanity/lib/types";

import styles from "./events-index.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Events | UPNG SRIS",
  description:
    "Explore upcoming and past workshops, talks, practical sessions, showcases and community events from the Science, Research and Innovation Society.",
  path: routes.community.events.index,
});

/** Past events shown before "See more events". Two rows of four. */
const PAST_INITIAL = 8;

export default async function EventsPage() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    sanityFetch<EventData[]>({
      query: UPCOMING_EVENTS_QUERY,
    }),

    sanityFetch<EventData[]>({
      query: PAST_EVENTS_QUERY,
    }),
  ]);

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div className="shell">
          <Breadcrumb trail={[{label: "Events"}]} />

          <div className={styles.introGrid}>
            <div data-reveal>
              <h1>Events</h1>

              <p className={styles.introCopy}>
                SRIS events take place throughout the year, from
                hands-on workshops and laboratory sessions to
                public talks, showcases and community activities.
              </p>
            </div>

            <p className={styles.wordmark} aria-hidden="true">
              <span>Even</span>
              <span className={styles.wordmarkOutline}>ts</span>
            </p>
          </div>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="upcoming-heading">
        <div className="shell">
          <h2 id="upcoming-heading" className={styles.groupHeading}>
            Upcoming events
          </h2>

          {upcomingEvents.length > 0 ? (
            <div className={styles.grid}>
              {upcomingEvents.map((event, index) => (
                <EventTile
                  key={event._id}
                  event={event}
                  index={index}
                  reveal
                />
              ))}
            </div>
          ) : (
            <div className="emptyState">
              <h3>No upcoming events are currently published.</h3>

              <p className="body muted">
                New workshops, talks and activities will appear
                here when they are announced.
              </p>
            </div>
          )}
        </div>
      </section>

      {pastEvents.length > 0 && (
        <section className={styles.group} aria-labelledby="past-heading">
          <div className="shell">
            <h2 id="past-heading" className={styles.groupHeading}>
              Past events
            </h2>

            <ShowMore
              initial={PAST_INITIAL}
              className={styles.grid}
              buttonClassName={styles.moreButton}
            >
              {pastEvents.map((event, index) => (
                <EventTile
                  key={event._id}
                  event={event}
                  index={index}
                  // Tiles revealed by "See more" mount after the reveal
                  // observer has run, so only the first rows animate.
                  reveal={index < PAST_INITIAL}
                />
              ))}
            </ShowMore>
          </div>
        </section>
      )}
    </main>
  );
}

function EventTile({
  event,
  index,
  reveal,
}: {
  event: EventData;
  index: number;
  reveal: boolean;
}) {
  const href = routes.community.events.detail(event.slug);
  const parts = getZonedDateParts(event.startsAt);
  const month = parts ? getMonthLabel(parts.monthIndex).long : "";

  const canRegister = !event.isPast && Boolean(event.registrationUrl);

  return (
    <article
      className={styles.tile}
      data-reveal={reveal ? "" : undefined}
      style={{"--reveal-index": index % 4} as React.CSSProperties}
    >
      <div className={styles.tileBody}>
        <h3>
          <Link href={href}>{event.title}</Link>
        </h3>

        {parts && (
          <p className={styles.tileDate}>
            <strong>{parts.day}</strong>

            {/* The month set as a narrow stack, as on a printed poster. */}
            <span aria-hidden="true">
              {splitMonth(month).map((chunk) => (
                <span key={chunk}>{chunk}</span>
              ))}
            </span>

            <span className="sr-only">
              {month} {parts.year}
            </span>
          </p>
        )}
      </div>

      <Link href={href} className={styles.tileImage} tabIndex={-1}>
        {event.image?.asset ? (
          <SanityImage
            image={event.image}
            fallbackAlt={event.title}
            className={styles.tileImageAsset}
            sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 25vw"
            width={800}
            height={560}
          />
        ) : (
          <ImagePlaceholder
            className={styles.tilePlaceholder}
            label="Event photography"
          />
        )}
      </Link>

      <div className={styles.tileActions}>
        {canRegister && (
          <a
            href={event.registrationUrl!}
            target="_blank"
            rel="noopener noreferrer"
          >
            Register
          </a>
        )}

        <Link href={href}>
          More info
          <span className="sr-only">: {event.title}</span>
        </Link>
      </div>
    </article>
  );
}

/** "September" → ["Sep", "tem", "ber"]; "May" stays whole. */
function splitMonth(month: string) {
  const chunks: string[] = [];

  for (let i = 0; i < month.length; i += 3) {
    chunks.push(month.slice(i, i + 3));
  }

  return chunks;
}

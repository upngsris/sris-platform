import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";

import {toPlainText} from "next-sanity";

import {RichText} from "@/components/sanity/rich-text";
import {SanityImage} from "@/components/sanity/sanity-image";
import {JsonLd} from "@/components/seo/json-ld";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";
import {ShareLinks} from "@/components/ui/share-links";

import {formatInPortMoresby, getZonedDateParts} from "@/lib/dates";
import {
  formatEventDateRange,
  getMonthLabel,
  isMultiDayEvent,
} from "@/lib/event-calendar";
import {routes} from "@/lib/route";
import {eventSchema} from "@/lib/schema";
import {pageMetadata, shareImage} from "@/lib/seo";

import {sanityFetch} from "@/sanity/lib/fetch";
import {
  EVENT_QUERY,
  PAST_EVENTS_QUERY,
  RELATED_EVENTS_QUERY,
  UPCOMING_EVENTS_QUERY,
} from "@/sanity/lib/queries";

import type {
  EventData,
  RelatedEventsData,
} from "@/sanity/lib/types";

import styles from "./event-detail.module.css";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/** Where events with no address of their own are held. */
const CAMPUS = "University of Papua New Guinea, Waigani, Port Moresby";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {slug} = await params;

  const event = await sanityFetch<EventData | null>({
    query: EVENT_QUERY,
    params: {
      slug,
    },
  });

  if (!event) {
    return {
      title: "Event Not Found | UPNG SRIS",
    };
  }

  return pageMetadata({
    title: `${event.title} | UPNG SRIS Events`,

    /*
     * The summary is written as one or two plain sentences, so it is the
     * right length for a link preview. Older events may not have one yet;
     * flattening the programme keeps them from falling back to boilerplate.
     */
    description:
      event.summary ??
      (event.description
        ? truncate(toPlainText(event.description), 200)
        : `${event.title}, an SRIS event at the University of Papua New Guinea.`),
    image: shareImage(event.image, event.title),
    path: routes.community.events.detail(event.slug),
  });
}

export async function generateStaticParams() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    sanityFetch<EventData[]>({
      query: UPCOMING_EVENTS_QUERY,
    }),

    sanityFetch<EventData[]>({
      query: PAST_EVENTS_QUERY,
    }),
  ]);

  return [...upcomingEvents, ...pastEvents].map((event) => ({
    slug: event.slug,
  }));
}

export default async function EventDetailPage({params}: PageProps) {
  const {slug} = await params;

  const [event, related] = await Promise.all([
    sanityFetch<EventData | null>({
      query: EVENT_QUERY,
      params: {
        slug,
      },
    }),

    sanityFetch<RelatedEventsData>({
      query: RELATED_EVENTS_QUERY,
      params: {
        slug,
      },
    }),
  ]);

  if (!event) {
    notFound();
  }

  const isPast = event.isPast ?? false;
  const path = routes.community.events.detail(event.slug);

  const location = event.address
    ? `${event.venue}, ${event.address}`
    : `${event.venue}, ${CAMPUS}`;

  const otherEvents = [
    ...(related?.upcoming ?? []),
    ...(related?.past ?? []),
  ].slice(0, 6);

  const canRegister = !isPast && Boolean(event.registrationUrl);

  return (
    <main className={styles.page}>
      <JsonLd data={eventSchema(event)} />

      <article>
        {/* -------------------------------------------------
            Hero: photograph panel with the booking card
            ------------------------------------------------- */}
        <header className={styles.hero}>
          <div className="shell">
            <Breadcrumb
              trail={[
                {
                  label: "Events",
                  href: routes.community.events.index,
                },
                {label: event.title},
              ]}
            />

            <div className={styles.heroPanel}>
              {event.image?.asset ? (
                <SanityImage
                  image={event.image}
                  fallbackAlt={event.title}
                  className={styles.heroImage}
                  sizes="(max-width: 1360px) 100vw, 1360px"
                  width={2000}
                  height={900}
                  priority
                />
              ) : (
                <div className={styles.heroFallback} aria-hidden="true" />
              )}

              <div className={styles.heroGrid}>
                <div className={styles.heroCopy} data-reveal>
                  <Link
                    href={routes.community.events.index}
                    className={styles.back}
                  >
                    <span aria-hidden="true">←</span>
                    Back to events
                  </Link>

                  <h1>{event.title}</h1>

                  <p className={styles.organiser}>
                    By {event.organiser || "UPNG SRIS"}
                  </p>

                  <p className={styles.heroVenue}>{location}</p>

                  <a href="#event-location" className={styles.mapLink}>
                    <PinIcon />
                    View map
                  </a>
                </div>

                <aside className={styles.booking} data-reveal>
                  <h2>Date &amp; time</h2>

                  <p className={styles.bookingWhen}>
                    {formatWhen(event)}
                  </p>

                  {!isPast && (
                    <a
                      href={calendarUrl(event, location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.addToCalendar}
                    >
                      <span aria-hidden="true">+</span>
                      Add to calendar
                    </a>
                  )}

                  <div className={styles.bookingActions}>
                    {canRegister ? (
                      <a
                        href={event.registrationUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.primaryAction}
                      >
                        Register
                        {event.admission && ` (${event.admission})`}
                      </a>
                    ) : (
                      <Link
                        href={
                          isPast
                            ? routes.community.events.index
                            : routes.about.contact
                        }
                        className={styles.primaryAction}
                      >
                        {isPast ? "View upcoming events" : "Ask about this event"}
                      </Link>
                    )}

                    <Link
                      href={routes.about.contact}
                      className={styles.secondaryAction}
                    >
                      Contact SRIS
                    </Link>
                  </div>

                  <p className={styles.bookingNote}>
                    {isPast
                      ? "This event has taken place."
                      : event.admission
                        ? `Admission: ${event.admission}`
                        : "Open to the SRIS community"}
                  </p>
                </aside>
              </div>
            </div>
          </div>
        </header>

        {/* -------------------------------------------------
            Body: description beside location, tags, sharing
            ------------------------------------------------- */}
        <section className={styles.body}>
          <div className={`shell ${styles.bodyGrid}`}>
            <div className={styles.main}>
              <section aria-labelledby="description-heading">
                <h2 id="description-heading">Description</h2>

                {event.summary && (
                  <p className={styles.summary}>{event.summary}</p>
                )}

                <RichText
                  value={event.description}
                  className={styles.description}
                  headingLevel={3}
                />

                {!event.summary && !event.description && (
                  <p className={styles.summary}>
                    This event does not yet have a published
                    description.
                  </p>
                )}
              </section>

              <section aria-labelledby="hours-heading">
                <h2 id="hours-heading">Hours</h2>

                <dl className={styles.hours}>
                  {hoursRows(event).map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}:</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section aria-labelledby="contact-heading">
                <h2 id="contact-heading">
                  How can I contact the organiser with any question?
                </h2>

                <p className={styles.contactCopy}>
                  Please visit the{" "}
                  <Link href={routes.about.contact}>SRIS contact page</Link>{" "}
                  and mention “{event.title}” in your message. A
                  member of the committee will get back to you.
                </p>
              </section>
            </div>

            <aside className={styles.side}>
              <section
                id="event-location"
                aria-labelledby="location-heading"
              >
                <h2 id="location-heading">Event location</h2>

                <div className={styles.map}>
                  <iframe
                    title={`Map of ${event.venue}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <h3 className={styles.venue}>{event.venue}</h3>

                <p className={styles.address}>
                  {event.address || CAMPUS}
                </p>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.directions}
                >
                  Get directions
                  <span aria-hidden="true">↗</span>
                </a>
              </section>

              {event.tags && event.tags.length > 0 && (
                <section aria-labelledby="tags-heading">
                  <h2 id="tags-heading">Tags</h2>

                  <ul className={styles.tags}>
                    {event.tags.map((tag) => (
                      <li key={tag}>
                        <Link
                          href={`${routes.search}?q=${encodeURIComponent(tag)}`}
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="share-heading">
                <h2 id="share-heading">Share with friends</h2>

                <ShareLinks
                  path={path}
                  title={event.title}
                  className={styles.share}
                />
              </section>
            </aside>
          </div>
        </section>

        {event.gallery && event.gallery.length > 0 && (
          <section
            className={styles.gallery}
            aria-labelledby="gallery-heading"
          >
            <div className="shell">
              <h2 id="gallery-heading">Photographs from this event</h2>

              <ul className={styles.galleryGrid}>
                {event.gallery.map((photo) => (
                  <li key={photo._key}>
                    <figure>
                      <div className={styles.galleryImage}>
                        <SanityImage
                          image={photo}
                          fallbackAlt={`Photograph from ${event.title}`}
                          className={styles.cover}
                          sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 33vw"
                          width={1200}
                          height={900}
                        />
                      </div>

                      {photo.caption && (
                        <figcaption>{photo.caption}</figcaption>
                      )}
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </article>

      {/* -----------------------------------------------------
          Other events
          ----------------------------------------------------- */}
      {otherEvents.length > 0 && (
        <section
          className={styles.related}
          aria-labelledby="related-heading"
        >
          <div className="shell">
            <h2 id="related-heading">Other events you may like</h2>

            <div className={styles.relatedGrid}>
              {otherEvents.map((other, index) => (
                <RelatedCard
                  key={other._id}
                  event={other}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function RelatedCard({
  event,
  index,
}: {
  event: EventData;
  index: number;
}) {
  const href = routes.community.events.detail(event.slug);
  const parts = getZonedDateParts(event.startsAt);

  const badge = event.isPast ? "Past event" : event.admission;

  return (
    <article
      className={styles.card}
      data-reveal
      style={{"--reveal-index": index % 3} as React.CSSProperties}
    >
      <Link href={href} className={styles.cardImage} tabIndex={-1}>
        {event.image?.asset ? (
          <SanityImage
            image={event.image}
            fallbackAlt={event.title}
            className={styles.cover}
            sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 33vw"
            width={800}
            height={480}
          />
        ) : (
          <ImagePlaceholder
            className={styles.cardPlaceholder}
            label="Event photography"
          />
        )}

        {badge && <span className={styles.badge}>{badge}</span>}
      </Link>

      <div className={styles.cardBody}>
        {parts && (
          <p className={styles.cardDate}>
            <span>
              {getMonthLabel(parts.monthIndex).short.toUpperCase()}
            </span>
            <strong>{parts.day}</strong>
          </p>
        )}

        <div>
          <h3>
            <Link href={href}>{event.title}</Link>
          </h3>

          <p>{event.venue}</p>
        </div>
      </div>
    </article>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function formatTime(value: string) {
  return formatInPortMoresby(value, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** "Saturday, 14 September 2026 at 8:30 pm". */
function formatWhen(event: EventData) {
  const weekday = formatInPortMoresby(event.startsAt, {weekday: "long"});
  const dates = formatEventDateRange(event.startsAt, event.endsAt);

  if (isMultiDayEvent(event.startsAt, event.endsAt)) {
    return dates;
  }

  return `${weekday}, ${dates} at ${formatTime(event.startsAt)}`;
}

function hoursRows(event: EventData) {
  const start = formatTime(event.startsAt);
  const end = event.endsAt ? formatTime(event.endsAt) : null;

  return [
    {
      label: "Date",
      value: formatEventDateRange(event.startsAt, event.endsAt),
    },
    {
      label: "Time",
      value: end ? `${start} – ${end}` : `From ${start}`,
    },
  ];
}

/** Google Calendar's template link; events without an end get two hours. */
function calendarUrl(event: EventData, location: string) {
  const start = new Date(event.startsAt);
  const end = event.endsAt
    ? new Date(event.endsAt)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const stamp = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: event.summary ?? "",
    location,
  });

  return `https://calendar.google.com/calendar/render?${query}`;
}

/** Cuts at a word boundary so a preview never ends mid-word. */
function truncate(value: string, limit: number) {
  const collapsed = value.replace(/\s+/g, " ").trim();

  if (collapsed.length <= limit) {
    return collapsed;
  }

  const clipped = collapsed.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");

  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

import type {Metadata} from "next";
import Link from "next/link";

import {SanityImage} from "@/components/sanity/sanity-image";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {formatInPortMoresby} from "@/lib/dates";
import {routes} from "@/lib/route";
import {pageMetadata} from "@/lib/seo";

import {sanityFetch} from "@/sanity/lib/fetch";
import {NEWSLETTER_ISSUES_QUERY} from "@/sanity/lib/queries";

import type {
  NewsBriefTeaser,
  NewsletterIssue,
  SanityImage as SanityImageData,
} from "@/sanity/lib/types";

import styles from "./newsletter.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Newsletter | UPNG SRIS",

  description:
    "News, activities and discoveries from the Science, Research and Innovation Society at the University of Papua New Guinea.",
  path: routes.learn.newsletter.index,
});

/** A brief, carrying the issue it was published in. */
type Story = NewsBriefTeaser & {
  issue: NewsletterIssue;
};

/** Briefs in the main "Latest news" column; the next few go to the rail. */
const LATEST_COUNT = 5;
const RAIL_COUNT = 2;

export default async function NewsletterPage() {
  const issues = await sanityFetch<NewsletterIssue[]>({
    query: NEWSLETTER_ISSUES_QUERY,
  });

  const [lead, ...rest] = issues;

  /* Issues fill the lead and the pair; briefs fill the news columns. */
  const pair = rest.slice(0, 2);
  const sideFeature = rest[2] ?? null;
  const archive = rest.slice(3, 9);
  const featured = issues.filter((issue) => issue.featured).slice(0, 4);

  const stories: Story[] = issues.flatMap((issue) =>
    (issue.briefs ?? []).map((brief) => ({...brief, issue})),
  );

  const latest = stories.slice(0, LATEST_COUNT);
  const rail = stories
    .slice(LATEST_COUNT)
    .filter((story) => story.image?.asset)
    .slice(0, RAIL_COUNT);

  return (
    <main className={styles.page}>
      {/* ---------------------------------------------------
          Masthead
          --------------------------------------------------- */}
      <header className={styles.masthead}>
        <div className="shell">
          <Breadcrumb
            trail={[
              {label: "Learn & Do", href: routes.learn.index},
              {label: "Newsletter"},
            ]}
          />

          <div className={styles.mastheadRow}>
            <h1>Newsletter</h1>

            <p>
              {lead && (
                <span>
                  Issue {lead.issueNumber} ·{" "}
                  {formatInPortMoresby(lead.publishedAt, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
              News, activities and discoveries from SRIS.
            </p>
          </div>
        </div>

        <nav className={styles.sectionNav} aria-label="Newsletter sections">
          <div className="shell">
            <ul>
              <li>
                <a href="#top-stories" aria-current="true">
                  Home
                </a>
              </li>
              {latest.length > 0 && (
                <li>
                  <a href="#latest-news">Latest news</a>
                </li>
              )}
              {featured.length > 0 && (
                <li>
                  <a href="#featured">Featured</a>
                </li>
              )}
              {archive.length > 0 && (
                <li>
                  <a href="#archive">Issues</a>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </header>

      {!lead ? (
        <section className={styles.empty}>
          <div className="shell">
            <div className="emptyState">
              <h2>No newsletter issues are published yet.</h2>

              <p className="body muted">
                The first issue will appear here when it is released.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className={`shell ${styles.layout}`} id="top-stories">
          {/* -------------------------------------------------
              Main column
              ------------------------------------------------- */}
          <div className={styles.mainCol}>
            <OverlayCard
              href={routes.learn.newsletter.detail(lead.slug)}
              image={lead.coverImage}
              label={issueLabel(lead)}
              title={lead.title}
              date={lead.publishedAt}
              size="lead"
              priority
            />

            {pair.length > 0 && (
              <div className={styles.pair}>
                {pair.map((issue) => (
                  <OverlayCard
                    key={issue._id}
                    href={routes.learn.newsletter.detail(issue.slug)}
                    image={issue.coverImage}
                    label={issueLabel(issue)}
                    title={issue.title}
                    date={issue.publishedAt}
                    size="small"
                  />
                ))}
              </div>
            )}

            {latest.length > 0 && (
              <section
                id="latest-news"
                className={styles.block}
                aria-labelledby="latest-heading"
              >
                <h2 id="latest-heading" className={styles.blockHeading}>
                  Latest news
                </h2>

                <ul className={styles.newsList}>
                  {latest.map((story) => (
                    <li key={`${story.issue._id}-${story._key}`}>
                      <NewsRow story={story} />
                    </li>
                  ))}
                </ul>

                <Link
                  href={routes.learn.newsletter.detail(lead.slug)}
                  className={styles.seeAll}
                >
                  Read the latest issue
                </Link>
              </section>
            )}
          </div>

          {/* -------------------------------------------------
              Side column
              ------------------------------------------------- */}
          <div className={styles.sideCol}>
            <section aria-labelledby="popular-heading">
              <h2 id="popular-heading" className={styles.blockHeading}>
                In this issue
              </h2>

              {lead.briefs && lead.briefs.length > 0 ? (
                <ul className={styles.thumbList}>
                  {lead.briefs.slice(0, 5).map((brief) => (
                    <li key={brief._key}>
                      <ThumbRow
                        href={`${routes.learn.newsletter.detail(lead.slug)}#brief-${brief._key}`}
                        image={brief.image}
                        label={brief.category || "News"}
                        title={brief.headline}
                        date={lead.publishedAt}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.blockNote}>{lead.summary}</p>
              )}

              <Link
                href={routes.learn.newsletter.detail(lead.slug)}
                className={styles.seeAll}
              >
                See all
              </Link>
            </section>

            {sideFeature && (
              <OverlayCard
                href={routes.learn.newsletter.detail(sideFeature.slug)}
                image={sideFeature.coverImage}
                label={issueLabel(sideFeature)}
                title={sideFeature.title}
                date={sideFeature.publishedAt}
                size="small"
              />
            )}

            {featured.length > 0 && (
              <section
                id="featured"
                className={styles.block}
                aria-labelledby="featured-heading"
              >
                <h2 id="featured-heading" className={styles.blockHeading}>
                  Featured
                </h2>

                <ul className={styles.textList}>
                  {featured.map((issue) => (
                    <li key={issue._id}>
                      <span className={styles.label}>
                        {issueLabel(issue)}
                      </span>

                      <h3>
                        <Link
                          href={routes.learn.newsletter.detail(issue.slug)}
                        >
                          {issue.title}
                        </Link>
                      </h3>

                      <Meta date={issue.publishedAt} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {archive.length > 0 && (
              <section
                id="archive"
                className={styles.block}
                aria-labelledby="archive-heading"
              >
                <h2 id="archive-heading" className={styles.blockHeading}>
                  Previous issues
                </h2>

                <ul className={styles.thumbList}>
                  {archive.map((issue) => (
                    <li key={issue._id}>
                      <ThumbRow
                        href={routes.learn.newsletter.detail(issue.slug)}
                        image={issue.coverImage}
                        label={issueLabel(issue)}
                        title={issue.title}
                        date={issue.publishedAt}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* -------------------------------------------------
              Rail: tall photo stories
              ------------------------------------------------- */}
          {rail.length > 0 && (
            <aside className={styles.rail} aria-label="Photo stories">
              {rail.map((story) => (
                <Link
                  key={`${story.issue._id}-${story._key}`}
                  href={`${routes.learn.newsletter.detail(story.issue.slug)}#brief-${story._key}`}
                  className={styles.railCard}
                >
                  <div className={styles.railImage}>
                    <SanityImage
                      image={story.image!}
                      fallbackAlt={story.headline}
                      className={styles.cover}
                      sizes="(max-width: 900px) 50vw, 200px"
                      width={400}
                      height={520}
                    />

                    <span className={styles.label}>
                      {story.category || "News"}
                    </span>
                  </div>

                  <div className={styles.railBody}>
                    <h3>{story.headline}</h3>

                    {story.excerpt && <p>{clip(story.excerpt, 90)}</p>}

                    <Meta date={story.issue.publishedAt} />
                  </div>
                </Link>
              ))}
            </aside>
          )}
        </div>
      )}
    </main>
  );
}

function OverlayCard({
  href,
  image,
  label,
  title,
  date,
  size,
  priority = false,
}: {
  href: string;
  image?: SanityImageData | null;
  label: string;
  title: string;
  date: string;
  size: "lead" | "small";
  priority?: boolean;
}) {
  const isLead = size === "lead";

  return (
    <Link
      href={href}
      className={`${styles.overlay} ${isLead ? styles.overlayLead : styles.overlaySmall}`}
    >
      {image?.asset ? (
        <SanityImage
          image={image}
          fallbackAlt={title}
          className={styles.cover}
          sizes={
            isLead
              ? "(max-width: 900px) 100vw, 560px"
              : "(max-width: 480px) 100vw, 280px"
          }
          width={isLead ? 1200 : 640}
          height={isLead ? 900 : 480}
          priority={priority}
        />
      ) : (
        <ImagePlaceholder
          className={styles.overlayPlaceholder}
          label="Newsletter cover"
        />
      )}

      <span className={styles.label}>{label}</span>

      <div className={styles.overlayBody}>
        {isLead ? <h2>{title}</h2> : <h3>{title}</h3>}

        <Meta date={date} />
      </div>
    </Link>
  );
}

function NewsRow({story}: {story: Story}) {
  const href = `${routes.learn.newsletter.detail(story.issue.slug)}#brief-${story._key}`;

  return (
    <article className={styles.newsRow}>
      <Link href={href} className={styles.newsThumb} tabIndex={-1}>
        {story.image?.asset ? (
          <SanityImage
            image={story.image}
            fallbackAlt={story.headline}
            className={styles.cover}
            sizes="160px"
            width={320}
            height={240}
          />
        ) : (
          <ImagePlaceholder
            className={styles.thumbPlaceholder}
            label="News photograph"
          />
        )}
      </Link>

      <div>
        <span className={styles.label}>{story.category || "News"}</span>

        <h3>
          <Link href={href}>{story.headline}</Link>
        </h3>

        <Meta date={story.issue.publishedAt} issue={story.issue.issueNumber} />

        {story.excerpt && <p>{clip(story.excerpt, 160)}</p>}
      </div>
    </article>
  );
}

function ThumbRow({
  href,
  image,
  label,
  title,
  date,
}: {
  href: string;
  image?: SanityImageData | null;
  label: string;
  title: string;
  date: string;
}) {
  return (
    <article className={styles.thumbRow}>
      <Link href={href} className={styles.thumb} tabIndex={-1}>
        {image?.asset ? (
          <SanityImage
            image={image}
            fallbackAlt={title}
            className={styles.cover}
            sizes="72px"
            width={160}
            height={160}
          />
        ) : (
          <ImagePlaceholder
            className={styles.thumbPlaceholder}
            label="Newsletter cover"
          />
        )}
      </Link>

      <div>
        <span className={styles.label}>{label}</span>

        <h3>
          <Link href={href}>{title}</Link>
        </h3>

        <Meta date={date} />
      </div>
    </article>
  );
}

function Meta({date, issue}: {date: string; issue?: number}) {
  return (
    <p className={styles.meta}>
      <ClockIcon />
      <time dateTime={date}>{formatDate(date)}</time>
      {issue !== undefined && <span>Issue {issue}</span>}
    </p>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5V8l2.25 1.5" />
    </svg>
  );
}

function issueLabel(issue: NewsletterIssue) {
  return issue.tags?.[0] ?? `Issue ${issue.issueNumber}`;
}

function formatDate(value: string) {
  return formatInPortMoresby(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Cuts at a word boundary so a teaser never ends mid-word. */
function clip(value: string, limit: number) {
  const collapsed = value.replace(/\s+/g, " ").trim();

  if (collapsed.length <= limit) {
    return collapsed;
  }

  const clipped = collapsed.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");

  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

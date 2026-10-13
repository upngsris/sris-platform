import type {Metadata} from "next";
import Link from "next/link";

import {SanityImage} from "@/components/sanity/sanity-image";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {formatInPortMoresby} from "@/lib/dates";
import {
  disciplines,
  disciplineTitle,
  findDiscipline,
} from "@/lib/disciplines";
import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {LAB_PRACTICALS_QUERY} from "@/sanity/lib/queries";
import type {LaboratoryPracticalSummary} from "@/sanity/lib/types";

import styles from "../learn.module.css";
import { pageMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{discipline?: string | string[]}>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const discipline = findDiscipline(
    (await searchParams).discipline,
  );

  return pageMetadata({
    title: discipline
      ? `${discipline.title} Laboratory Practicals | UPNG SRIS`
      : "Laboratory Practicals | Learn & Do | UPNG SRIS",
    description: discipline
      ? `Hands-on ${discipline.title.toLowerCase()} laboratory practicals from UPNG SRIS, building scientific understanding through observation and experimentation.`
      : "Explore hands-on laboratory practicals that help students strengthen scientific understanding through observation and experimentation.",

    // A discipline filter narrows the same list, so every filtered view
    // points search engines back at the full one.
    path: routes.learn.laboratoryPracticals,
  });
}

export default async function LaboratoryPracticalsPage({
  searchParams,
}: PageProps) {
  const [{discipline: requested}, practicals] = await Promise.all([
    searchParams,

    sanityFetch<LaboratoryPracticalSummary[]>({
      query: LAB_PRACTICALS_QUERY,
    }),
  ]);

  // An unknown or missing ?discipline= falls back to every discipline.
  const active = findDiscipline(requested);

  // Filtered here rather than in GROQ so the chip counts come from the same
  // single fetch as the list.
  const visible = active
    ? practicals.filter((practical) =>
        practical.disciplines.includes(active.value),
      )
    : practicals;

  const allHref = `${routes.learn.laboratoryPracticals}#activities`;

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb
            trail={[
              {label: "Learn & Do", href: routes.learn.index},
              {label: "Laboratory Practicals"},
            ]}
          />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">Laboratory Practicals</p>

              <h1>Understand the science by working with it.</h1>
            </div>

            <p className="lead" data-reveal>
              Laboratory practicals give students opportunities to
              observe, test, measure and connect scientific theory
              with hands-on experience.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.categoryItems} id="activities">
        <div className="shell">
          <nav
            className={styles.disciplineFilter}
            aria-label="Filter by discipline"
          >
            <Link
              href={allHref}
              scroll={false}
              aria-current={active ? undefined : "page"}
            >
              All disciplines
              <small>{practicals.length}</small>
            </Link>

            {disciplines.map((discipline) => (
              <Link
                key={discipline.value}
                href={routes.learn.laboratoryPracticalsFor(
                  discipline.value,
                )}
                scroll={false}
                aria-current={
                  active?.value === discipline.value
                    ? "page"
                    : undefined
                }
              >
                {discipline.title}
                <small>
                  {
                    practicals.filter((practical) =>
                      practical.disciplines.includes(
                        discipline.value,
                      ),
                    ).length
                  }
                </small>
              </Link>
            ))}
          </nav>

          {visible.length > 0 ? (
            <div className={styles.categoryGrid}>
              {visible.map((practical, index) => (
                <PracticalCard
                  key={practical._id}
                  practical={practical}
                  index={index}
                />
              ))}
            </div>
          ) : active ? (
            <div className="emptyState">
              <p className="eyebrow blue">{active.title}</p>

              <h2>
                No {active.title} practicals are published yet.
              </h2>

              <p className="body muted">
                Practicals for this discipline will appear here as
                they are published. In the meantime, browse every
                discipline.
              </p>

              <Link href={allHref} scroll={false} className="textlink">
                <span>View all practicals</span>
                <i aria-hidden="true">→</i>
              </Link>
            </div>
          ) : (
            <div className="emptyState">
              <p className="eyebrow blue">Laboratory Practicals</p>

              <h2>No laboratory practicals are published yet.</h2>

              <p className="body muted">
                New practicals will appear here as they are prepared
                and published by SRIS.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function PracticalCard({
  practical,
  index,
}: {
  practical: LaboratoryPracticalSummary;
  index: number;
}) {
  const href = routes.learn.laboratoryPractical(practical.slug);

  const date = practical.conductedOn
    ? formatInPortMoresby(practical.conductedOn, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <article
      className={styles.card}
      data-reveal
      style={{"--reveal-index": index % 3} as React.CSSProperties}
    >
      <Link
        href={href}
        className={styles.cardImage}
        aria-label={`Explore ${practical.title}`}
      >
        {practical.featuredImage?.asset ? (
          <SanityImage
            image={practical.featuredImage}
            fallbackAlt={practical.title}
            className={styles.cardImageAsset}
            sizes="(max-width: 900px) 100vw, 33vw"
            width={1200}
            height={850}
          />
        ) : (
          <ImagePlaceholder
            className={styles.cardImagePlaceholder}
            label="Laboratory practical photography"
          />
        )}

        <span className={styles.cardIndex}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </Link>

      <p className="eyebrow blue">
        {date || "Laboratory Practical"}
      </p>

      <h2>
        <Link href={href}>{practical.title}</Link>
      </h2>

      <p className="body muted">{practical.summary}</p>

      {practical.disciplines.length > 0 && (
        <ul className={styles.cardTags} aria-label="Disciplines">
          {practical.disciplines.map((discipline) => (
            <li key={discipline} className="tag">
              {disciplineTitle(discipline)}
            </li>
          ))}
        </ul>
      )}

      <Link href={href} className="textlink">
        <span>View practical</span>
        <i aria-hidden="true">→</i>
      </Link>
    </article>
  );
}

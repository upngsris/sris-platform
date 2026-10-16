import type {Metadata} from "next";
import Link from "next/link";

import {LeadershipSections} from "@/components/team/leadership-sections";
import {TermSelect} from "@/components/team/term-select";
import {Breadcrumb} from "@/components/ui/breadcrumb";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";

import {
  ARCHIVED_TEAM_BY_YEAR_QUERY,
  ARCHIVED_TEAM_YEARS_QUERY,
  TEAM_PAGE_QUERY,
} from "@/sanity/lib/queries";

import type {
  TeamAssignment,
  TeamPageData,
} from "@/sanity/lib/types";

import styles from "../team.module.css";
import { pageMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{year?: string | string[]}>;
};

type ArchivedTerm = {
  year: number;
  members: number;
};

/** The first leadership term the archive covers. */
const FIRST_ARCHIVE_YEAR = 2023;

/**
 * Every term from 2023 to the current year, newest first, with how many
 * people served in each. Years without archived records are still listed so
 * the filter shows the full run; an archived year beyond the current one
 * (a term logged ahead of time) extends the range rather than disappearing.
 */
async function getArchivedTerms(): Promise<ArchivedTerm[]> {
  const years = await sanityFetch<number[]>({
    query: ARCHIVED_TEAM_YEARS_QUERY,
  });

  const counts = new Map<number, number>();

  years.forEach((year) => {
    counts.set(year, (counts.get(year) ?? 0) + 1);
  });

  const lastYear = Math.max(
    new Date().getFullYear(),
    ...counts.keys(),
  );

  const terms: ArchivedTerm[] = [];

  for (
    let termYear = lastYear;
    termYear >= FIRST_ARCHIVE_YEAR;
    termYear -= 1
  ) {
    terms.push({
      year: termYear,
      members: counts.get(termYear) ?? 0,
    });
  }

  return terms;
}

/**
 * The requested term, or — when the query string is missing, malformed or
 * outside the range — the most recent term that has an archived team.
 */
function resolveYear(
  requested: string | string[] | undefined,
  terms: ArchivedTerm[],
): number | undefined {
  const value = Number(
    Array.isArray(requested) ? requested[0] : requested,
  );

  if (terms.some((term) => term.year === value)) {
    return value;
  }

  return (
    terms.find((term) => term.members > 0) ?? terms[0]
  )?.year;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{year}, terms] = await Promise.all([
    searchParams,
    getArchivedTerms(),
  ]);

  const activeYear = resolveYear(year, terms);

  // With no ?year= the archive opens on the default term, so that term's
  // canonical is the bare archive URL and only other years carry the query.
  const isDefaultYear = activeYear === resolveYear(undefined, terms);

  return pageMetadata({
    title: activeYear
      ? `${activeYear} Leadership Team | UPNG SRIS`
      : "Leadership Archive | UPNG SRIS",

    description: activeYear
      ? `Meet the ${activeYear} student leaders, representatives and team members of the Science, Research and Innovation Society at UPNG.`
      : "Explore previous student leaders, representatives and team members who have contributed to the Science, Research and Innovation Society.",

    path:
      activeYear && !isDefaultYear
        ? `${routes.about.teamArchive}?year=${activeYear}`
        : routes.about.teamArchive,
  });
}

export default async function TeamArchivePage({
  searchParams,
}: PageProps) {
  const [{year}, page, terms] = await Promise.all([
    searchParams,

    sanityFetch<TeamPageData | null>({
      query: TEAM_PAGE_QUERY,
    }),

    getArchivedTerms(),
  ]);

  const activeYear = resolveYear(year, terms);

  const assignments =
    activeYear === undefined
      ? []
      : await sanityFetch<TeamAssignment[]>({
          query: ARCHIVED_TEAM_BY_YEAR_QUERY,
          params: {year: activeYear},
        });

  const certificate = page?.termCertificates?.find(
    (entry) =>
      entry.termYear === activeYear && entry.fileUrl,
  );

  const activeIndex = terms.findIndex(
    (term) => term.year === activeYear,
  );

  const laterTerm = terms[activeIndex - 1];
  const earlierTerm = terms[activeIndex + 1];

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb
            trail={[
              {label: "About SRIS", href: routes.about.index},
              {label: "Our Team", href: routes.about.team},
              {label: "Leadership archive"},
            ]}
          />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">
                Leadership archive
              </p>

              <h1>Previous teams. Continuing contribution.</h1>
            </div>

            <p className="lead" data-reveal>
              {page?.archiveIntroduction ??
                "Explore the students and representatives who have contributed to SRIS leadership over previous terms."}
            </p>
          </div>
        </div>
      </section>

      {activeYear === undefined ? (
        <section className={styles.archive}>
          <div className="shell">
            <div className="emptyState">
              <p className="eyebrow blue">
                Leadership archive
              </p>

              <h2>
                No previous team records have been archived yet.
              </h2>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section
            id="term"
            className={styles.termFilter}
            aria-label="Leadership term filter"
          >
            <div className="shell">
              <div className={styles.termFilterBar}>
                <TermSelect
                  key={activeYear}
                  terms={terms}
                  activeYear={activeYear}
                />
              </div>

              <div className={styles.termSummary}>
                <div>
                  <p className="eyebrow blue">
                    Leadership term
                  </p>

                  <h2>The {activeYear} leadership team</h2>

                  <p className="body muted">
                    {assignments.length > 0
                      ? `${formatMembers(assignments.length)} served the society during this term.`
                      : "No leadership records have been archived for this term yet."}
                  </p>
                </div>

                {certificate?.fileUrl && (
                  <a
                    href={certificate.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.certificateLink}
                  >
                    <span>
                      {certificate.label ??
                        "View certificates"}
                    </span>

                    <i aria-hidden="true">↗</i>

                    <span className="visuallyHidden">
                      {" "}
                      for the {activeYear} leadership team
                      (opens in a new tab)
                    </span>
                  </a>
                )}
              </div>
            </div>
          </section>

          {/*
            Keyed by year so a term switch remounts the sections rather
            than diffing one team's cards into another's.
          */}
          <div key={activeYear}>
            {assignments.length === 0 && (
              <section className={styles.archive}>
                <div className="shell">
                  <div className="emptyState">
                    <p className="eyebrow blue">
                      {activeYear} term
                    </p>

                    <h3>
                      This team has not been added to the
                      archive yet.
                    </h3>

                    <p className="body muted">
                      Choose another year, or meet the students
                      leading SRIS today.
                    </p>
                  </div>
                </div>
              </section>
            )}

            <LeadershipSections
              assignments={assignments}
              reveal={false}
              headings={{
                patronage: `${activeYear} patronage`,
                executive: `The ${activeYear} executive`,
                committee: `${activeYear} committees`,
                coordinator: `${activeYear} discipline coordinators`,
              }}
            />
          </div>

          {(earlierTerm || laterTerm) && (
            <nav
              className={styles.termPager}
              aria-label="Adjacent leadership terms"
            >
              <div className="shell">
                {laterTerm ? (
                  <Link
                    href={termHref(laterTerm.year)}
                    className={styles.termPagerLink}
                  >
                    <span aria-hidden="true">←</span>
                    <span>
                      <small>Later term</small>
                      {laterTerm.year} team
                    </span>
                  </Link>
                ) : null}

                {earlierTerm && (
                  <Link
                    href={termHref(earlierTerm.year)}
                    className={`${styles.termPagerLink} ${styles.termPagerNext}`}
                  >
                    <span>
                      <small>Earlier term</small>
                      {earlierTerm.year} team
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </nav>
          )}
        </>
      )}

      <section className="bandDeep">
        <div className="shell bandGrid">
          <div data-reveal>
            <p className="eyebrow soft">Our Team</p>

            <h2>Meet the students leading SRIS today.</h2>
          </div>

          <Link
            href={routes.about.team}
            className="button buttonLight"
            data-reveal
          >
            <span>View the current team</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * The pager sits below a whole team, so it jumps back up to the filter.
 */
function termHref(year: number) {
  return `${routes.about.teamArchive}?year=${year}#term`;
}

function formatMembers(count: number) {
  return count === 1 ? "One member" : `${count} members`;
}

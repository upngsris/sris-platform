import type {Metadata} from "next";
import Link from "next/link";

import {
  LeadershipSections,
  PatronageProfile,
  SectionHeading,
} from "@/components/team/leadership-sections";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";

import {
  CURRENT_TEAM_ASSIGNMENTS_QUERY,
  FOUNDING_TEAM_ASSIGNMENTS_QUERY,
  TEAM_PAGE_QUERY,
} from "@/sanity/lib/queries";

import type {
  TeamAssignment,
  TeamPageData,
} from "@/sanity/lib/types";

import styles from "./team.module.css";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page =
    await sanityFetch<TeamPageData | null>({
      query: TEAM_PAGE_QUERY,
    });

  return pageMetadata({
    title:
      page?.seo?.title ??
      "Our Team | UPNG SRIS",

    description:
      page?.seo?.description ??
      page?.introduction ??
      "Meet the students and staff supporting the Science, Research and Innovation Society at the University of Papua New Guinea.",
    path: routes.about.team,
  });
}

export default async function TeamPage() {
  const [page, assignments, founders] =
    await Promise.all([
      sanityFetch<TeamPageData | null>({
        query: TEAM_PAGE_QUERY,
      }),

      sanityFetch<TeamAssignment[]>({
        query:
          CURRENT_TEAM_ASSIGNMENTS_QUERY,
      }),

      sanityFetch<TeamAssignment[]>({
        query:
          FOUNDING_TEAM_ASSIGNMENTS_QUERY,
      }),
    ]);

  if (!page) {
    return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <p className="eyebrow blue">
            Our Team
          </p>

          <h1>Team page content is not published yet.</h1>

          <p className="lead muted">
            Create and publish the Our Team Page document in
            Sanity Studio.
          </p>
        </div>
      </section>
    </main>
  );
  }

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb
            trail={[
              {label: "About SRIS", href: routes.about.index},
              {label: "Our Team"},
            ]}
          />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">
                {page.eyebrow}
              </p>

              <h1>{page.heading}</h1>
            </div>

            <p className="lead" data-reveal>
              {page.introduction}
            </p>
          </div>
        </div>
      </section>

      <LeadershipSections
        assignments={assignments}
        headings={{
          patronage: page.patronageHeading,
          executive: page.executiveHeading,
          committee: page.committeeHeading,
          coordinator: page.coordinatorHeading,
        }}
      />

      {founders.length > 0 && (
        <section className={styles.founders}>
          <div className="shell">
            <SectionHeading
              eyebrow="Where SRIS began"
              heading={
                page.founderHeading ??
                "Founders & Pioneer Executives"
              }
            />

            <div className={styles.patronageList}>
              {founders.map((assignment) => (
                <PatronageProfile
                  key={assignment._id}
                  assignment={assignment}
                  placeholderLabel="Founder portrait"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bandDeep">
        <div className="shell bandGrid">
          <div data-reveal>
            <p className="eyebrow soft">
              Leadership archive
            </p>

            <h2>{page.archiveHeading}</h2>

            <p className="lead">
              {page.archiveIntroduction}
            </p>
          </div>

          <Link
            href={routes.about.teamArchive}
            className="button buttonLight"
            data-reveal
          >
            <span>View previous teams</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {
  PROJECT_OPPORTUNITIES_QUERY,
  PROJECT_OPPORTUNITY_QUERY,
} from "@/sanity/lib/queries";

import type {ProjectOpportunity} from "@/sanity/lib/types";

import styles from "../projects-to-join.module.css";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {SRIS_TIME_ZONE} from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {slug} = await params;

  const project =
    await sanityFetch<ProjectOpportunity | null>({
      query: PROJECT_OPPORTUNITY_QUERY,

      params: {
        slug,
      },
    });

  if (!project) {
    return {
      title: "Project Opportunity Not Found | UPNG SRIS",
    };
  }

  return pageMetadata({
    title: `${project.title} | Projects to Join | UPNG SRIS`,
    description: project.summary,
    type: "article",
    publishedTime: project.publishedAt,
    path: routes.explore.projectsToJoin.detail(project.slug),
  });
}

export async function generateStaticParams() {
  const projects =
    await sanityFetch<ProjectOpportunity[]>({
      query: PROJECT_OPPORTUNITIES_QUERY,
    });

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectOpportunityPage({
  params,
}: PageProps) {
  const {slug} = await params;

  const project =
    await sanityFetch<ProjectOpportunity | null>({
      query: PROJECT_OPPORTUNITY_QUERY,

      params: {
        slug,
      },
    });

  if (!project) {
    notFound();
  }

  const publishedDate =
    formatPublishedDate(project.publishedAt);

  return (
    <main>
      <article>
        <header className={styles.detailHero}>
          <div className="shell">
            <Breadcrumb
              trail={[
                {
                  label: "Projects to join",
                  href: routes.explore.projectsToJoin.index,
                },
                {label: project.title},
              ]}
            />

            <div className={styles.detailHeroGrid}>
            <div data-reveal>
              <p className="eyebrow blue">
                {project.discipline}
              </p>

              <h1>{project.title}</h1>
            </div>

            <aside className={styles.detailMeta} data-reveal>
              <MetaRow
                label="Status"
                value={project.applicationStatus}
              />

              <MetaRow
                label="Discipline"
                value={project.discipline}
              />

              <MetaRow
                label="Participation"
                value={project.level}
              />

              {publishedDate && (
                <MetaRow
                  label="Published"
                  value={publishedDate}
                />
              )}
            </aside>
            </div>
          </div>
        </header>

        <section className={styles.detailOverview}>
          <div
            className={`shell ${styles.detailOverviewGrid}`}
          >
            <div>
              <p className="eyebrow blue">
                Opportunity overview
              </p>
            </div>

            <div data-reveal>
              <p className={styles.detailLead}>
                {project.summary}
              </p>
            </div>
          </div>
        </section>

        <OpportunityState project={project} />

        <section className="bandDeep">
          <div className="shell bandGrid">
            <div data-reveal>
              <p className="eyebrow soft">
                Explore
              </p>

              <h2>
                Find another project to contribute to.
              </h2>
            </div>

            <Link
              href={
                routes.explore.projectsToJoin.index
              }
              className="button buttonLight"
            >
              <span>View all opportunities</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OpportunityState({
  project,
}: {
  project: ProjectOpportunity;
}) {
  const closed =
    project.applicationStatus === "Closed";

  return (
    <section
      className={
        closed
          ? styles.closedPanel
          : styles.participationPanel
      }
    >
      <div
        className={`shell ${styles.participationGrid}`}
      >
        <div data-reveal>
          <p
            className={
              closed
                ? "eyebrow blue"
                : "eyebrow soft"
            }
          >
            {closed
              ? "Opportunity closed"
              : "Participation"}
          </p>

          <h2>
            {closed
              ? "This opportunity is no longer accepting participants."
              : "Interested in contributing?"}
          </h2>
        </div>

        <div className={styles.participationCopy} data-reveal>
          <p className="lead">
            {closed
              ? "Explore the other projects currently available through SRIS."
              : "Find out more about SRIS participation or contact the society if you would like to learn how to get involved in this project."}
          </p>

          {closed ? (
            <Link
              href={
                routes.explore.projectsToJoin.index
              }
              className="button"
            >
              <span>See open opportunities</span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <div className={styles.participationActions}>
              <Link
                href={routes.about.contact}
                className="button buttonLight"
              >
                <span>Contact SRIS</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href={routes.community.membership}
                className={styles.secondaryAction}
              >
                Learn about membership
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function formatPublishedDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    timeZone: SRIS_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
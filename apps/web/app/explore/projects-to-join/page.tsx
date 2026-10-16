import type {Metadata} from "next";
import Link from "next/link";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {PROJECT_OPPORTUNITIES_QUERY} from "@/sanity/lib/queries";

import type {ProjectOpportunity} from "@/sanity/lib/types";

import styles from "./projects-to-join.module.css";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Projects to Join | UPNG SRIS",
  description:
    "Explore open SRIS projects and opportunities where students can contribute, build practical skills and work with others beyond the classroom.",
  path: routes.explore.projectsToJoin.index,
});

export default async function ProjectsToJoinPage() {
  const projects = await sanityFetch<ProjectOpportunity[]>({
    query: PROJECT_OPPORTUNITIES_QUERY,
  });

  const activeCount = projects.filter(
    (project) =>
      project.applicationStatus !== "Closed",
  ).length;

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb trail={[{label: "Projects to join"}]} />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">
                Explore · Participate
              </p>

              <h1>Find something worth joining.</h1>
            </div>

            <div className={styles.heroAside} data-reveal>
              <p className="lead">
                Join projects where students can apply what
                they know, develop practical skills and
                contribute to work beyond formal coursework.
              </p>

              <div className={styles.availability}>
                <strong>{activeCount}</strong>

                <span>
                  {activeCount === 1
                    ? "current opportunity"
                    : "current opportunities"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.projects}>
        <div className="shell">
          {projects.length > 0 ? (
            <div className={styles.list}>
              {projects.map((project, index) => (
                <article
                  key={project._id}
                  className={styles.project}
                  data-reveal
                  style={{"--reveal-index": index % 4} as React.CSSProperties}
                >
                  <div className={styles.number}>
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className={styles.content}>
                    <div className={styles.meta}>
                      <span>{project.discipline}</span>
                      <span>{project.level}</span>
                    </div>

                    <h2>
                      <Link
                        href={routes.explore.projectsToJoin.detail(
                          project.slug,
                        )}
                      >
                        {project.title}
                      </Link>
                    </h2>

                    <p className="body muted">
                      {project.summary}
                    </p>
                  </div>

                  <div className={styles.action}>
                    <StatusBadge
                      status={project.applicationStatus}
                    />

                    <Link
                      href={routes.explore.projectsToJoin.detail(
                        project.slug,
                      )}
                      className="textlink"
                    >
                      <span>View opportunity</span>
                      <i aria-hidden="true">→</i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyState">
              <p className="eyebrow blue">
                Projects to join
              </p>

              <h2>
                No project opportunities are currently
                published.
              </h2>

              <p className="body muted">
                New opportunities to participate in SRIS
                projects will appear here as they become
                available.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: ProjectOpportunity["applicationStatus"];
}) {
  const statusClass =
    status === "Closed"
      ? styles.statusClosed
      : styles.statusOpen;

  return (
    <span className={`${styles.status} ${statusClass}`}>
      {status}
    </span>
  );
}
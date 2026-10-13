import { routes } from "@/lib/route";

import { LpiCard, LpiGrid } from "./lpi-card";

import type { ProjectOpportunity } from "@/sanity/lib/types";

type Props = {
  data?: ProjectOpportunity[];
};

const fallbackProjects = [
  {
    _id: "fallback-python",
    title: "Python Data Analysis Research Project",
    slug: "python-data-analysis-research-project",
    discipline: "Mathematics & Computer Science",
    level: "Beginner friendly",
    summary:
      "Work with real datasets, develop practical analysis skills and contribute to a student-led research activity.",
    applicationStatus: "Applications open",
  },
  {
    _id: "fallback-water",
    title: "Water Quality Research",
    slug: "water-quality-research-team",
    discipline: "Environmental Science",
    level: "Field + laboratory",
    summary:
      "Take part in field observation, sampling, laboratory analysis and scientific reporting.",
    applicationStatus: "Positions available",
  },
];

export function ProjectsToJoin({ data }: Props) {
  const projects = data && data.length > 0 ? data : fallbackProjects;

  return (
    <section className="lpi-section lpi-tint">
      <div className="lpi-container">
        <div className="lpi-head">
          <h2>Don&apos;t just read about the work. Take part.</h2>

          <p>
            Open positions on student-led projects, with the support to learn
            the methods as you go.
          </p>
        </div>

        <LpiGrid count={projects.length}>
          {projects.map((project, index) => {
            const isOpen = project.applicationStatus !== "Closed";

            return (
              <LpiCard
                key={project._id}
                tone="support"
                label={project.discipline}
                title={project.title}
                summary={project.summary}
                meta={project.level}
                badge={{
                  primary: String(index + 1).padStart(2, "0"),
                  secondary: "Project",
                }}
                href={routes.explore.projectsToJoin.detail(project.slug)}
                linkLabel="View opportunity"
              >
                <p>
                  <span className={isOpen ? "lpi-status is-open" : "lpi-status"}>
                    {project.applicationStatus}
                  </span>
                </p>
              </LpiCard>
            );
          })}
        </LpiGrid>
      </div>
    </section>
  );
}

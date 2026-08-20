import { TextLink } from "@/components/ui/text-link";
import type { HomeIntroData } from "@/sanity/lib/types";

type Props = {
  data?: HomeIntroData["featuredOpportunities"];
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
  const projects =
    data && data.length > 0
      ? data
      : fallbackProjects;

  return (
    <section className="opps section">
      <div className="shell">

        <div className="oppsHead">
          <div>
            <p className="eyebrow blue">
              Projects to join
            </p>

            <h2>
              Don&apos;t just read
              <br />
              about the work.
            </h2>
          </div>

          <p>Take part.</p>
        </div>

        <div className="projectList">
          {projects.map((project, index) => {
            const number = String(index + 1).padStart(
              2,
              "0"
            );

            return (
              <article key={project._id}>
                <div className="projectNum">
                  {number}
                </div>

                <div className="projectMain">
                  <div className="projectMeta">
                    <span>
                      {project.discipline}
                    </span>

                    <span>
                      {project.level}
                    </span>
                  </div>

                  <h3>{project.title}</h3>

                  <p className="body muted">
                    {project.summary}
                  </p>
                </div>

                <div className="projectAction">
                  <p>
                    {project.applicationStatus}
                  </p>

                  <TextLink
                    href={`/explore/projects-to-join/${project.slug}`}
                  >
                    View opportunity
                  </TextLink>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
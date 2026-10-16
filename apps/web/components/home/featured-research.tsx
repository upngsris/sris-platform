import { routes } from "@/lib/route";

import { LpiCard, LpiGrid } from "./lpi-card";

import type { ResearchProject } from "@/sanity/lib/types";

type Props = {
  data?: ResearchProject;
};

export function FeaturedResearch({ data }: Props) {
  if (!data) {
    return null;
  }

  const meta = [data.discipline, data.year, data.status]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="lpi-section lpi-white">
      <div className="lpi-container">
        <div className="lpi-head">
          <h2>Ideas become more useful when you test them.</h2>

          <p>
            See how students turn questions, classroom concepts and curiosity
            into practical investigation.
          </p>
        </div>

        <LpiGrid count={2}>
          <LpiCard
            tone="primary"
            label="Featured research"
            title={data.title}
            summary={data.summary}
            meta={meta ? `${meta} · Led by UPNG students` : "Led by UPNG students"}
            image={data.coverImage}
            badge={{ primary: "Research" }}
            href={routes.explore.research.detail(data.slug)}
            linkLabel="Explore the research"
          />

          <LpiCard
            tone="accent"
            label="Also exploring"
            title="Testing ideas beyond the lecture theatre."
            summary="Student-led practical work creates space to experiment, make mistakes, discuss results and understand the theory more deeply."
            href={routes.explore.research.index}
            linkLabel="View all projects"
            badge={{ primary: "Projects" }}
          />
        </LpiGrid>
      </div>
    </section>
  );
}

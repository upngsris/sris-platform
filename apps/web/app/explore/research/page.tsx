import type { Metadata } from "next";
import Link from "next/link";

import { SanityImage } from "@/components/sanity/sanity-image";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

import { routes } from "@/lib/route";

import { sanityFetch } from "@/sanity/lib/fetch";
import { RESEARCH_PROJECTS_QUERY } from "@/sanity/lib/queries";

import type { ResearchProject } from "@/sanity/lib/types";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Research Projects | UPNG SRIS",
  description:
    "Explore student-led research, investigations and scientific projects from the Science, Research and Innovation Society at the University of Papua New Guinea.",
  path: routes.explore.research.index,
});

export default async function ResearchProjectsPage() {
  const projects = await sanityFetch<ResearchProject[]>({
    query: RESEARCH_PROJECTS_QUERY,
  });

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb trail={[{label: "Research projects"}]} />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">
                Explore
              </p>

              <h1>Research begins with a question.</h1>
            </div>

            <p className="lead" data-reveal>
              Explore student-led investigations that turn
              classroom ideas into practical observation,
              experimentation, analysis and discovery.
            </p>
          </div>
        </div>
      </section>

      <section className="researchArchive">
        <div className="shell">
          {projects.length > 0 ? (
            <div className="researchArchiveList">
              {projects.map((project, index) => (
                <article
                  className="researchArchiveItem"
                  key={project._id}
                  data-reveal
                  style={{"--reveal-index": index % 3} as React.CSSProperties}
                >
                  <Link
                    href={routes.explore.research.detail(
                      project.slug,
                    )}
                    className="researchArchiveImage"
                    aria-label={`View ${project.title}`}
                  >
                    {project.coverImage?.asset ? (
                      <SanityImage
                        image={project.coverImage}
                        fallbackAlt={project.title}
                        className="researchArchiveImageAsset"
                        sizes="(max-width: 900px) 100vw, 45vw"
                        width={1400}
                        height={900}
                      />
                    ) : (
                      <ImagePlaceholder
                        className="researchArchiveImagePlaceholder"
                        label="Research photography"
                      />
                    )}
                  </Link>

                  <div className="researchArchiveContent">
                    <div className="researchArchiveMeta">
                      <span>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span>{project.discipline}</span>

                      <span>{project.year}</span>

                      <span>{project.status}</span>
                    </div>

                    <h2>
                      <Link
                        href={routes.explore.research.detail(
                          project.slug,
                        )}
                      >
                        {project.title}
                      </Link>
                    </h2>

                    <p className="body muted">
                      {project.summary}
                    </p>

                    <Link
                      href={routes.explore.research.detail(
                        project.slug,
                      )}
                      className="textlink"
                    >
                      <span>Explore research</span>
                      <i aria-hidden="true">→</i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyState">
              <p className="eyebrow blue">
                Research
              </p>

              <h2>
                No research projects are currently published.
              </h2>

              <p className="body muted">
                New student research and practical investigations
                will appear here as they are published.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
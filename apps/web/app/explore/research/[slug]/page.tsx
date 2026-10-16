import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SanityImage } from "@/components/sanity/sanity-image";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

import { routes } from "@/lib/route";

import { sanityFetch } from "@/sanity/lib/fetch";
import {
  RESEARCH_PROJECT_QUERY,
  RESEARCH_PROJECTS_QUERY,
} from "@/sanity/lib/queries";

import type { ResearchProject } from "@/sanity/lib/types";
import { pageMetadata, shareImage } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { articleSchema } from "@/lib/schema";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const project = await sanityFetch<ResearchProject | null>({
    query: RESEARCH_PROJECT_QUERY,
    params: {
      slug,
    },
  });

  if (!project) {
    return {
      title: "Research Project Not Found | UPNG SRIS",
    };
  }

  return pageMetadata({
    title: `${project.title} | UPNG SRIS`,
    description: project.summary,
    type: "article",
    image: shareImage(project.coverImage, project.title),
    path: routes.explore.research.detail(project.slug),
  });
}

export async function generateStaticParams() {
  const projects = await sanityFetch<ResearchProject[]>({
    query: RESEARCH_PROJECTS_QUERY,
  });

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ResearchProjectPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const project = await sanityFetch<ResearchProject | null>({
    query: RESEARCH_PROJECT_QUERY,
    params: {
      slug,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <main>
      <JsonLd
        data={articleSchema({
          title: project.title,
          path: routes.explore.research.detail(project.slug),
          description: project.summary,
          image: project.coverImage,
        })}
      />

      <article>
        <header className="researchDetailHero">
          <div className="shell">
            <Breadcrumb
              trail={[
                {
                  label: "Research projects",
                  href: routes.explore.research.index,
                },
                {label: project.title},
              ]}
            />

            <div className="researchDetailHeroGrid">
            <div className="researchDetailHeading" data-reveal>
              <p className="eyebrow blue">
                {project.discipline} · {project.year}
              </p>

              <h1>{project.title}</h1>
            </div>

            <div className="researchDetailMeta" data-reveal>
              <div>
                <span>Status</span>
                <strong>{project.status}</strong>
              </div>

              <div>
                <span>Discipline</span>
                <strong>{project.discipline}</strong>
              </div>

              <div>
                <span>Year</span>
                <strong>{project.year}</strong>
              </div>
            </div>
            </div>
          </div>
        </header>

        <section className="researchDetailMedia">
          <div className="shell">
            {project.coverImage?.asset ? (
              <div className="researchDetailImage">
                <SanityImage
                  image={project.coverImage}
                  fallbackAlt={project.title}
                  className="researchDetailImageAsset"
                  sizes="100vw"
                  width={2000}
                  height={1250}
                  priority
                />
              </div>
            ) : (
              <ImagePlaceholder
                className="researchDetailImage"
                label="Research photography"
              />
            )}
          </div>
        </section>

        <section className="researchDetailBody">
          <div className="shell researchDetailBodyGrid">
            <aside>
              <p className="eyebrow blue">
                Research overview
              </p>
            </aside>

            <div data-reveal>
              <p className="researchDetailLead">
                {project.summary}
              </p>
            </div>
          </div>
        </section>

        <section className="researchDetailNext">
          <div className="shell researchDetailNextInner">
            <div data-reveal>
              <p className="eyebrow soft">
                Explore
              </p>

              <h2>
                Discover more student research.
              </h2>
            </div>

            <Link
              href={routes.explore.research.index}
              className="button buttonLight"
            >
              <span>View all research</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
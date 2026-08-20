import Image from "next/image";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { TextLink } from "@/components/ui/text-link";

import { urlFor } from "@/sanity/lib/image";
import type { HomeIntroData } from "@/sanity/lib/types";

type Props = {
  data?: HomeIntroData["featuredResearch"];
};

export function FeaturedResearch({ data }: Props) {
  /*
   * Sanity content with V4 fallbacks.
   */
  const title =
    data?.title ??
    "Understanding our environment through practical research.";

  const discipline =
    data?.discipline ?? "Environmental Science";

  const year =
    data?.year ?? 2026;

  const summary =
    data?.summary ??
    "Follow the question, method, observations and students behind an SRIS research activity.";

  const slug =
    data?.slug ?? "#";

  /*
   * Generate the Sanity image URL only when
   * a cover image actually exists.
   */
  const researchImageUrl = data?.coverImage?.asset
    ? urlFor(data.coverImage)
        .width(1600)
        .height(1000)
        .fit("crop")
        .auto("format")
        .url()
    : null;

  const researchHref =
    slug === "#"
      ? "/explore/research"
      : `/explore/research/${slug}`;

  return (
    <section className="research section">
      <div className="shell">

        {/* Section heading */}
        <div className="sectionHead">
          <div>
            <p className="eyebrow blue">
              Research & Projects
            </p>

            <h2>
              Ideas become more useful when you test them.
            </h2>
          </div>

          <p className="lead muted">
            See how students turn questions, classroom
            concepts and curiosity into practical investigation.
          </p>
        </div>

        {/* Featured research */}
        <article className="feature">

          {researchImageUrl ? (
            <div className="featureImage">
              <Image
                src={researchImageUrl}
                alt={
                  data?.coverImage?.alt ??
                  `${title} research project`
                }
                fill
                sizes="(max-width: 900px) 100vw, 70vw"
                className="researchImage"
              />
            </div>
          ) : (
            <ImagePlaceholder
              className="featureImage"
              label="Featured research photography"
            />
          )}

          <div className="featurePanel">
            <div>
              <p className="eyebrow soft">
                {discipline} · {year}
              </p>

              <h3>{title}</h3>

              <p>{summary}</p>
            </div>

            <TextLink href={researchHref}>
              Explore the research
            </TextLink>
          </div>
        </article>

        {/* Secondary research information */}
        <div className="researchStrip">
          <div>
            <p className="eyebrow blue">
              Also exploring
            </p>

            <h3>
              Testing ideas beyond the lecture theatre.
            </h3>
          </div>

          <p className="body muted">
            Student-led practical work creates space to
            experiment, make mistakes, discuss results and
            understand the theory more deeply.
          </p>

          <TextLink href="/explore/research">
            View all projects
          </TextLink>
        </div>

      </div>
    </section>
  );
}
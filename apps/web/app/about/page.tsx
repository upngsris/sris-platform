import type {Metadata} from "next";
import Link from "next/link";

import {Breadcrumb} from "@/components/ui/breadcrumb";
import {SanityImage} from "@/components/sanity/sanity-image";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {routes} from "@/lib/route";
import {defaultAboutTimeline} from "@/data/about-timeline";

import {sanityFetch} from "@/sanity/lib/fetch";
import {ABOUT_PAGE_QUERY} from "@/sanity/lib/queries";

import type {AboutPageData} from "@/sanity/lib/types";

import styles from "./about.module.css";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page =
    await sanityFetch<AboutPageData | null>({
      query: ABOUT_PAGE_QUERY,
    });

  return pageMetadata({
    title:
      page?.seo?.title ??
      "About SRIS | UPNG",

    description:
      page?.seo?.description ??
      page?.introduction ??
      "Learn about the Science, Research and Innovation Society at the University of Papua New Guinea.",
    path: routes.about.index,
  });
}

export default async function AboutPage() {
  const page =
    await sanityFetch<AboutPageData | null>({
      query: ABOUT_PAGE_QUERY,
    });

  if (!page) {
    return null;
  }

  const timeline = page.timeline?.length
    ? page.timeline
    : defaultAboutTimeline;

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb trail={[{label: "About SRIS"}]} />

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

      <section className={styles.story}>
        <div className={`shell ${styles.storyGrid}`}>
          <div className={styles.storyImage} data-reveal>
            {page.image?.asset ? (
              <SanityImage
                image={page.image}
                fallbackAlt="SRIS students participating in practical learning"
                className={styles.storyImageAsset}
                sizes="(max-width: 900px) 100vw, 50vw"
                width={1500}
                height={1100}
              />
            ) : (
              <ImagePlaceholder
                className={styles.storyImagePlaceholder}
                label="Authentic SRIS documentary photography"
              />
            )}
          </div>

          <div className={styles.storyCopy} data-reveal>
            <p className="eyebrow blue">
              Why SRIS exists
            </p>

            <h2>{page.storyHeading}</h2>

            <p className="body muted">
              {page.story}
            </p>

            <div className={styles.storyLinks}>
              <Link
                href={routes.about.missionVision}
                className="textlink"
              >
                <span>Read our mission and vision</span>
                <i aria-hidden="true">→</i>
              </Link>

              <Link
                href={routes.community.collaborations}
                className="textlink"
              >
                <span>Collaborate with SRIS</span>
                <i aria-hidden="true">→</i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bandBlue">
        <div className="shell">
          <div className={styles.statementGrid}>
            <article data-reveal>
              <p className="eyebrow soft">
                Mission
              </p>

              <p>{page.mission}</p>
            </article>

            <article data-reveal style={{"--reveal-index": 1} as React.CSSProperties}>
              <p className="eyebrow soft">
                Vision
              </p>

              <p>{page.vision}</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.principles}>
        <div className="shell">
          <div className="pageHeading" data-reveal>
            <div>
              <p className="eyebrow blue">
                What guides us
              </p>

              <h2>
                Principles behind the way SRIS learns and works.
              </h2>
            </div>

            <p>
              A short set of commitments that shape how the society runs
              its projects, practicals and shared learning.
            </p>
          </div>

          <div className={styles.principleList}>
            {page.principles.map(
              (principle, index) => (
                <article
                  key={principle._key}
                  className={styles.principle}
                  data-reveal
                  style={{"--reveal-index": index} as React.CSSProperties}
                >
                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <h3>{principle.title}</h3>

                  <p className="body muted">
                    {principle.description}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className={styles.journey}>
        <div className="shell">
          <div className="pageHeading" data-reveal>
            <div>
              <p className="eyebrow blue">
                Our journey
              </p>

              <h2>
                How SRIS grew from an idea into a society.
              </h2>
            </div>

            <p>
              The milestones that took SRIS from a group of science
              students to a society running practicals, research and
              projects across UPNG.
            </p>
          </div>

          <ol className={styles.timeline}>
            {timeline.map((milestone, index) => (
              <li
                key={milestone._key}
                className={styles.milestone}
                data-reveal
                style={{"--reveal-index": index} as React.CSSProperties}
              >
                <p className={styles.milestonePeriod}>
                  {milestone.period}
                </p>

                <div className={styles.milestoneCopy}>
                  <h3>{milestone.title}</h3>

                  <p className="body muted">
                    {milestone.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bandDeep">
        <div className="shell bandGrid">
          <div data-reveal>
            <p className="eyebrow soft">
              The people behind SRIS
            </p>

            <h2>
              Meet the students and staff supporting the society.
            </h2>
          </div>

          <Link
            href={routes.about.team}
            className="button buttonLight"
            data-reveal
          >
            <span>Meet our team</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
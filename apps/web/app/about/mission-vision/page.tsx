import type {Metadata} from "next";
import Link from "next/link";

import {Breadcrumb} from "@/components/ui/breadcrumb";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {ABOUT_PAGE_QUERY} from "@/sanity/lib/queries";

import type {AboutPageData} from "@/sanity/lib/types";

import styles from "../about.module.css";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mission & Vision | UPNG SRIS",
  description:
    "Explore the mission, vision and guiding principles of the Science, Research and Innovation Society at the University of Papua New Guinea.",
  path: routes.about.missionVision,
});

export default async function MissionVisionPage() {
  const page =
    await sanityFetch<AboutPageData | null>({
      query: ABOUT_PAGE_QUERY,
    });

  if (!page) {
    return null;
  }

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb
            trail={[
              {label: "About SRIS", href: routes.about.index},
              {label: "Mission & Vision"},
            ]}
          />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">
                Mission &amp; Vision
              </p>

              <h1>
                Why we exist, and where we want to go.
              </h1>
            </div>

            <p className="lead" data-reveal>
            SRIS exists to create more room for
            students to practise, explore,
            collaborate and strengthen their
              understanding beyond formal coursework.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.mvStatements}>
        <div className="shell">
          <article className={styles.mvStatement} data-reveal>
            <span className={styles.mvNumber}>
              01
            </span>

            <div>
              <p className="eyebrow blue">
                Mission
              </p>

              <blockquote>
                {page.mission}
              </blockquote>
            </div>
          </article>

          <article className={styles.mvStatement} data-reveal>
            <span className={styles.mvNumber}>
              02
            </span>

            <div>
              <p className="eyebrow blue">
                Vision
              </p>

              <blockquote>
                {page.vision}
              </blockquote>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.principles}>
        <div className="shell">
          <div className="pageHeading" data-reveal>
            <div>
              <p className="eyebrow blue">
                Core principles
              </p>

              <h2>
                How the mission becomes practice.
              </h2>
            </div>

            <p>
              The commitments students and staff hold each other to while
              running SRIS activities.
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

      <section className="bandDeep">
        <div className="shell bandGrid">
          <div data-reveal>
            <p className="eyebrow soft">
              Put it into practice
            </p>

            <h2>
              Explore what students are working on.
            </h2>
          </div>

          <Link
            href={routes.explore.research.index}
            className="button buttonLight"
            data-reveal
          >
            <span>Explore research</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
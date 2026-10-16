import type {Metadata} from "next";
import Link from "next/link";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";

import {COLLABORATIONS_PAGE_QUERY} from "@/sanity/lib/queries";

import type {CollaborationsPageData} from "@/sanity/lib/types";

import styles from "./collaborations.module.css";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page =
    await sanityFetch<CollaborationsPageData | null>({
      query: COLLABORATIONS_PAGE_QUERY,
    });

  return pageMetadata({
    title:
      page?.seo?.title ??
      "Collaborations | UPNG SRIS",

    description:
      page?.seo?.description ??
      page?.introduction ??
      "Explore opportunities to collaborate with the Science, Research and Innovation Society at the University of Papua New Guinea.",
    path: routes.community.collaborations,
  });
}

export default async function CollaborationsPage() {
  const page =
    await sanityFetch<CollaborationsPageData | null>({
      query: COLLABORATIONS_PAGE_QUERY,
    });

  if (!page) {
    return null;
  }

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb trail={[{label: "Collaborations"}]} />

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

      <section className={styles.opportunities}>
        <div className="shell">
          <div className="pageHeading" data-reveal>
            <div>
              <p className="eyebrow blue">
                Ways to collaborate
              </p>

              <h2>
                Work together where ideas, skills and
                opportunities meet.
              </h2>
            </div>

            <p>
              Students, departments, organisations and partners can work
              with SRIS in several ways.
            </p>
          </div>

          <div className={styles.opportunityList}>
            {page.opportunities.map(
              (opportunity, index) => (
                <article
                  key={opportunity._key}
                  className={styles.opportunity}
                  data-reveal
                  style={{"--reveal-index": index % 4} as React.CSSProperties}
                >
                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <h3>
                    {opportunity.title}
                  </h3>

                  <p className="body muted">
                    {opportunity.description}
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
              Partnership
            </p>

            <h2>
              {page.partnerHeading}
            </h2>
          </div>

          <div className="bandCopy" data-reveal>
            <p className="lead">
              {page.partnerText}
            </p>

            <Link
              href={routes.about.contact}
              className="button buttonLight"
            >
              <span>{page.ctaLabel}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
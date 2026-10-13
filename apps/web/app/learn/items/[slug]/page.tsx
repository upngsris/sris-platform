import type {Metadata} from "next";
import Link from "next/link";
import {notFound, permanentRedirect} from "next/navigation";

import {SanityImage} from "@/components/sanity/sanity-image";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {
  LAB_PRACTICAL_QUERY,
  LEARNING_ITEMS_QUERY,
  LEARNING_ITEM_QUERY,
} from "@/sanity/lib/queries";

import type {
  LaboratoryPracticalSummary,
  LearningItem,
  LearningItemKind,
} from "@/sanity/lib/types";

import styles from "../../learn.module.css";
import {Breadcrumb} from "@/components/ui/breadcrumb";
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
  const {slug} = await params;

  const item =
    await sanityFetch<LearningItem | null>({
      query: LEARNING_ITEM_QUERY,

      params: {
        slug,
      },
    });

  if (!item) {
    return {
      title: "Learning Activity Not Found | UPNG SRIS",
    };
  }

  return pageMetadata({
    title: `${item.title} | Learn & Do | UPNG SRIS`,
    description: item.summary,
    type: "article",
    image: shareImage(item.image, item.title),
    path: routes.learn.detail(item.slug),
  });
}

export async function generateStaticParams() {
  const items =
    await sanityFetch<LearningItem[]>({
      query: LEARNING_ITEMS_QUERY,
    });

  return items.map((item) => ({
    slug: item.slug,
  }));
}

export default async function LearningItemPage({
  params,
}: PageProps) {
  const {slug} = await params;

  const item =
    await sanityFetch<LearningItem | null>({
      query: LEARNING_ITEM_QUERY,

      params: {
        slug,
      },
    });

  if (!item) {
    // Laboratory practicals moved out of Learning Items into their own type,
    // so old /learn/items/ links follow them to the new page.
    const practical =
      await sanityFetch<LaboratoryPracticalSummary | null>({
        query: LAB_PRACTICAL_QUERY,

        params: {
          slug,
        },
      });

    if (practical) {
      permanentRedirect(
        routes.learn.laboratoryPractical(practical.slug),
      );
    }

    notFound();
  }

  const categoryHref =
    getCategoryHref(item.kind);

  return (
    <main>
      <JsonLd
        data={articleSchema({
          type: "LearningResource",
          title: item.title,
          path: routes.learn.detail(item.slug),
          description: item.summary,
          image: item.image,
        })}
      />

      <article>
        <header className={styles.detailHero}>
          <div className="shell">
            <Breadcrumb
              trail={[
                {label: "Learn & Do", href: routes.learn.index},
                {
                  label: getCategoryLabel(item.kind),
                  href: categoryHref,
                },
                {label: item.title},
              ]}
            />

            <div className={styles.detailHeroGrid}>
            <div data-reveal>
              <p className="eyebrow blue">
                {item.kind}
              </p>

              <h1>{item.title}</h1>
            </div>

            <aside className={styles.detailMeta} data-reveal>
              <div>
                <span>Learning type</span>
                <strong>{item.kind}</strong>
              </div>

              <div>
                <span>Programme</span>
                <strong>SRIS Learn & Do</strong>
              </div>
            </aside>
            </div>
          </div>
        </header>

        <section className={styles.detailMedia}>
          <div className="shell">
            {item.image?.asset ? (
              <div className={styles.detailImage}>
                <SanityImage
                  image={item.image}
                  fallbackAlt={item.title}
                  className={styles.detailImageAsset}
                  sizes="100vw"
                  width={1900}
                  height={1200}
                  priority
                />
              </div>
            ) : (
              <ImagePlaceholder
                className={styles.detailImage}
                label="Learning activity photography"
              />
            )}
          </div>
        </section>

        <section className={styles.detailOverview}>
          <div
            className={`shell ${styles.detailOverviewGrid}`}
          >
            <aside>
              <p className="eyebrow blue">
                Activity overview
              </p>
            </aside>

            <div data-reveal>
              <p className={styles.detailLead}>
                {item.summary}
              </p>
            </div>
          </div>
        </section>

        <section className="bandDeep">
          <div className="shell bandGrid">
            <div data-reveal>
              <p className="eyebrow soft">
                Keep exploring
              </p>

              <h2>
                Continue learning through practice.
              </h2>
            </div>

            <div className={styles.detailCtaActions} data-reveal>
              <Link
                href={categoryHref}
                className="button buttonLight"
              >
                <span>
                  View {getCategoryLabel(item.kind)}
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </Link>

              <Link
                href={routes.learn.index}
                className={styles.secondaryAction}
              >
                Explore Learn & Do
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

function getCategoryHref(
  kind: LearningItemKind,
) {
  switch (kind) {
    case "Skills Track":
      return routes.learn.skills;

    case "Knowledge Sharing":
      return routes.learn.knowledgeSharing;

    // A practical not yet moved to the laboratoryPractical type.
    default:
      return routes.learn.laboratoryPracticals;
  }
}

function getCategoryLabel(
  kind: LearningItemKind,
) {
  switch (kind) {
    case "Skills Track":
      return "Skills Track";

    case "Knowledge Sharing":
      return "Knowledge Sharing";

    default:
      return "Laboratory Practicals";
  }
}
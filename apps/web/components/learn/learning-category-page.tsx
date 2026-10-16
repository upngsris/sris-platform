import Link from "next/link";

import {SanityImage} from "@/components/sanity/sanity-image";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {LEARNING_ITEMS_BY_KIND_QUERY} from "@/sanity/lib/queries";

import type {
  LearningItem,
  LearningItemKind,
} from "@/sanity/lib/types";

import styles from "@/app/learn/learn.module.css";
import {Breadcrumb} from "@/components/ui/breadcrumb";

type Props = {
  kind: LearningItemKind;
  heading: string;
  introduction: string;
};

export async function LearningCategoryPage({
  kind,
  heading,
  introduction,
}: Props) {
  const items =
    await sanityFetch<LearningItem[]>({
      query: LEARNING_ITEMS_BY_KIND_QUERY,

      params: {
        kind,
      },
    });

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb
            trail={[
              {label: "Learn & Do", href: routes.learn.index},
              {label: kind},
            ]}
          />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">
                {kind}
              </p>

              <h1>{heading}</h1>
            </div>

            <p className="lead" data-reveal>
              {introduction}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.categoryItems}>
        <div className="shell">
          {items.length > 0 ? (
            <div className={styles.categoryGrid}>
              {items.map((item, index) => (
                <LearningCard
                  key={item._id}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="emptyState">
              <p className="eyebrow blue">
                {kind}
              </p>

              <h2>
                No learning activities are currently published.
              </h2>

              <p className="body muted">
                New activities will appear here as they are
                prepared and published by SRIS.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function LearningCard({
  item,
  index,
}: {
  item: LearningItem;
  index: number;
}) {
  const href =
    routes.learn.detail(item.slug);

  return (
    <article
      className={styles.card}
      data-reveal
      style={{"--reveal-index": index % 3} as React.CSSProperties}
    >
      <Link
        href={href}
        className={styles.cardImage}
        aria-label={`Explore ${item.title}`}
      >
        {item.image?.asset ? (
          <SanityImage
            image={item.image}
            fallbackAlt={item.title}
            className={styles.cardImageAsset}
            sizes="(max-width: 900px) 100vw, 50vw"
            width={1200}
            height={850}
          />
        ) : (
          <ImagePlaceholder
            className={styles.cardImagePlaceholder}
            label="Learning activity photography"
          />
        )}

        <span className={styles.cardIndex}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </Link>

      <p className="eyebrow blue">
        {item.kind}
      </p>

      <h2>
        <Link href={href}>
          {item.title}
        </Link>
      </h2>

      <p className="body muted">
        {item.summary}
      </p>

      <Link
        href={href}
        className="textlink"
      >
        <span>Explore activity</span>
        <i aria-hidden="true">→</i>
      </Link>
    </article>
  );
}
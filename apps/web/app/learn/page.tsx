import type {Metadata} from "next";
import Link from "next/link";

import {SanityImage} from "@/components/sanity/sanity-image";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {LEARNING_ITEMS_QUERY} from "@/sanity/lib/queries";

import type {
  LearningItem,
  LearningItemKind,
} from "@/sanity/lib/types";

import styles from "./learn.module.css";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Learn & Do | UPNG SRIS",
  description:
    "Develop practical skills, explore laboratory work and learn through student knowledge sharing with the Science, Research and Innovation Society at the University of Papua New Guinea.",
  path: routes.learn.index,
});

const learningAreas = [
  {
    index: "01",
    kind: "Skills Track" as LearningItemKind,
    title: "Skills Track",
    description:
      "Build practical scientific, technical and research skills that complement formal coursework.",
    href: routes.learn.skills,
  },
  {
    index: "02",
    kind: "Laboratory Practical",
    title: "Laboratory Practicals",
    description:
      "Strengthen scientific understanding through practical laboratory activities, observation and experimentation.",
    href: routes.learn.laboratoryPracticals,
  },
  {
    index: "03",
    kind: "Knowledge Sharing" as LearningItemKind,
    title: "Knowledge Sharing",
    description:
      "Learn from students explaining concepts, methods and experiences in the way they understand them.",
    href: routes.learn.knowledgeSharing,
  },
];

export default async function LearnPage() {
  const items =
    await sanityFetch<LearningItem[]>({
      query: LEARNING_ITEMS_QUERY,
    });

  const featuredItems = items.slice(0, 3);

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb trail={[{label: "Learn & Do"}]} />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">
                Learn &amp; Do
              </p>

              <h1>Learn it. Try it. Share it.</h1>
            </div>

            <div className={styles.heroCopy} data-reveal>
              <p className="lead">
              Learning becomes more useful when students can
              apply ideas, test methods, practise skills and
                explain what they understand to others.
              </p>

              <p>
                SRIS creates space for learning beyond formal
                lectures through practical activities,
                skill-building and peer knowledge sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.areas}>
        <div className="shell">
          <div className="pageHeading" data-reveal>
            <div>
              <p className="eyebrow blue">
                Three ways to learn
              </p>

              <h2>
                Move from understanding to doing.
              </h2>
            </div>

            <p>
              Choose an area based on what you want to practise,
              explore or share.
            </p>
          </div>

          <div className={styles.areaList}>
            {learningAreas.map((area) => (
              <Link
                href={area.href}
                key={area.kind}
                className={styles.area}
              >
                <span className={styles.areaIndex}>
                  {area.index}
                </span>

                <div>
                  <p className="eyebrow blue">
                    {area.kind}
                  </p>

                  <h3>{area.title}</h3>

                  <p>
                    {area.description}
                  </p>
                </div>

                <span
                  className={styles.areaArrow}
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ))}
          </div>

          <Link
            href={routes.learn.newsletter.index}
            className={`textlink ${styles.areasMore}`}
          >
            <span>Catch up on the SRIS newsletter</span>
            <i aria-hidden="true">→</i>
          </Link>
        </div>
      </section>

      {featuredItems.length > 0 && (
        <section className={styles.featured}>
          <div className="shell">
            <div className="pageHeading" data-reveal>
              <div>
                <p className="eyebrow blue">
                  Explore activities
                </p>

                <h2>
                  Start with something practical.
                </h2>
              </div>

              <p>
                A selection of learning activities currently
                available through SRIS.
              </p>
            </div>

            <div className={styles.featuredGrid}>
              {featuredItems.map((item) => (
                <FeaturedLearningItem
                  key={item._id}
                  item={item}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bandDeep">
        <div className="shell bandGrid">
          <div data-reveal>
            <p className="eyebrow soft">
              Participate
            </p>

            <h2>
              Learning is stronger when you take part.
            </h2>
          </div>

          <div className="bandCopy" data-reveal>
            <p className="lead">
              Become part of the SRIS community and explore
              opportunities to practise, contribute and share
              what you know.
            </p>

            <Link
              href={routes.community.membership}
              className="button buttonLight"
            >
              <span>Become a member</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeaturedLearningItem({
  item,
}: {
  item: LearningItem;
}) {
  const href =
    routes.learn.detail(item.slug);

  return (
    <article className={styles.featuredCard} data-reveal>
      <Link
        href={href}
        className={styles.featuredImage}
      >
        {item.image?.asset ? (
          <SanityImage
            image={item.image}
            fallbackAlt={item.title}
            className={styles.featuredImageAsset}
            sizes="(max-width: 900px) 100vw, 33vw"
            width={1000}
            height={760}
          />
        ) : (
          <ImagePlaceholder
            className={styles.featuredImagePlaceholder}
            label="Learning activity photography"
          />
        )}
      </Link>

      <p className="eyebrow blue">
        {item.kind}
      </p>

      <h3>
        <Link href={href}>
          {item.title}
        </Link>
      </h3>

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
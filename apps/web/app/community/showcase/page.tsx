import type {Metadata} from "next";
import Link from "next/link";

import {SanityImage} from "@/components/sanity/sanity-image";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {STUDENT_STORIES_QUERY} from "@/sanity/lib/queries";

import type {StudentStoryData} from "@/sanity/lib/types";

import styles from "./showcase.module.css";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Student Showcase | UPNG SRIS",
  description:
    "Discover student stories, practical learning experiences and scientific work from the Science, Research and Innovation Society at the University of Papua New Guinea.",
  path: routes.community.showcase.index,
});

export default async function StudentShowcasePage() {
  const stories =
    await sanityFetch<StudentStoryData[]>({
      query: STUDENT_STORIES_QUERY,
    });

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb trail={[{label: "Student showcase"}]} />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">
                Community
              </p>

              <h1>See what students do with what they learn.</h1>
            </div>

            <p className="lead" data-reveal>
              Explore stories from students who are applying ideas,
              developing practical skills, contributing to projects
              and discovering new ways to learn beyond lectures.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.showcase}>
        <div className="shell">
          {stories.length > 0 ? (
            <div className={styles.grid}>
              {stories.map((story, index) => (
                <StoryCard
                  key={story._id}
                  story={story}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="emptyState">
              <p className="eyebrow blue">
                Student Showcase
              </p>

              <h2>
                Student stories are coming soon.
              </h2>

              <p className="body muted">
                New stories showing student learning, projects
                and practical experiences will appear here as
                they are published.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bandDeep">
        <div className="shell bandGrid">
          <div data-reveal>
            <p className="eyebrow soft">
              Your experience matters
            </p>

            <h2>
              Your work could be part of the next story.
            </h2>
          </div>

          <div className="bandCopy" data-reveal>
            <p className="lead">
              Join SRIS and take part in practical learning,
              student projects, research and collaborative
              activities across the community.
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

function StoryCard({
  story,
  index,
}: {
  story: StudentStoryData;
  index: number;
}) {
  const href =
    routes.community.showcase.detail(
      story.slug,
    );

  return (
    <article
      className={styles.card}
      data-reveal
      style={{"--reveal-index": index % 3} as React.CSSProperties}
    >
      <Link
        href={href}
        className={styles.cardImage}
        aria-label={`Read ${story.title}`}
      >
        {story.image?.asset ? (
          <SanityImage
            image={story.image}
            fallbackAlt={`${story.studentName} participating in SRIS`}
            className={styles.cardImageAsset}
            sizes="(max-width: 900px) 100vw, 50vw"
            width={1200}
            height={1500}
          />
        ) : (
          <ImagePlaceholder
            className={styles.cardImagePlaceholder}
            label="Student documentary photography"
          />
        )}

        <span className={styles.cardIndex}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </Link>

      <div className={styles.cardMeta}>
        <span>{story.studentName}</span>
        <span>{story.discipline}</span>
      </div>

      <h2>
        <Link href={href}>
          {story.title}
        </Link>
      </h2>

      <blockquote>
        “{story.quote}”
      </blockquote>

      <Link
        href={href}
        className="textlink"
      >
        <span>Read their story</span>
        <i aria-hidden="true">→</i>
      </Link>
    </article>
  );
}
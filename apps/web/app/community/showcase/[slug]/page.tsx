import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";

import {RichText} from "@/components/sanity/rich-text";
import {SanityImage} from "@/components/sanity/sanity-image";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {
  STUDENT_STORIES_QUERY,
  STUDENT_STORY_QUERY,
} from "@/sanity/lib/queries";

import type {StudentStoryData} from "@/sanity/lib/types";

import styles from "../showcase.module.css";
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

  const story =
    await sanityFetch<StudentStoryData | null>({
      query: STUDENT_STORY_QUERY,
      params: {
        slug,
      },
    });

  if (!story) {
    return {
      title: "Student Story Not Found | UPNG SRIS",
    };
  }

  return pageMetadata({
    title: `${story.title} | Student Showcase | UPNG SRIS`,
    description:
      `${story.studentName} shares an SRIS learning experience in ${story.discipline}.`,
    type: "article",
    image: shareImage(story.image, story.title),
    path: routes.community.showcase.detail(story.slug),
  });
}

export async function generateStaticParams() {
  const stories =
    await sanityFetch<StudentStoryData[]>({
      query: STUDENT_STORIES_QUERY,
    });

  return stories.map((story) => ({
    slug: story.slug,
  }));
}

export default async function StudentStoryPage({
  params,
}: PageProps) {
  const {slug} = await params;

  const story =
    await sanityFetch<StudentStoryData | null>({
      query: STUDENT_STORY_QUERY,
      params: {
        slug,
      },
    });

  if (!story) {
    notFound();
  }

  return (
    <main>
      <JsonLd
        data={articleSchema({
          title: story.title,
          path: routes.community.showcase.detail(story.slug),
          description: story.quote,
          image: story.image,
          author: story.studentName,
        })}
      />

      <article>
        <header className={styles.detailHero}>
          <div className="shell">
            <Breadcrumb
              trail={[
                {
                  label: "Student showcase",
                  href: routes.community.showcase.index,
                },
                {label: story.title},
              ]}
            />

            <div className={styles.detailHeroGrid}>
            <div data-reveal>
              <p className="eyebrow blue">
                Student story · {story.discipline}
              </p>

              <h1>{story.title}</h1>
            </div>

            <aside className={styles.detailIdentity} data-reveal>
              <span>Student</span>
              <strong>{story.studentName}</strong>

              <span>Discipline</span>
              <strong>{story.discipline}</strong>
            </aside>
            </div>
          </div>
        </header>

        <section className={styles.detailMedia}>
          <div className="shell">
            {story.image?.asset ? (
              <div className={styles.detailImage}>
                <SanityImage
                  image={story.image}
                  fallbackAlt={`${story.studentName} participating in SRIS`}
                  className={styles.detailImageAsset}
                  sizes="100vw"
                  width={1800}
                  height={1200}
                  priority
                />
              </div>
            ) : (
              <ImagePlaceholder
                className={styles.detailImage}
                label="Student documentary photography"
              />
            )}
          </div>
        </section>

        <section className={styles.storyBody}>
          <div
            className={`shell ${styles.storyBodyGrid}`}
          >
            <aside>
              <p className="eyebrow blue">
                Their experience
              </p>
            </aside>

            <div data-reveal>
              <blockquote className={styles.detailQuote}>
                “{story.quote}”
              </blockquote>

              <div className={styles.storyAttribution}>
                <strong>{story.studentName}</strong>
                <span>{story.discipline}</span>
              </div>
            </div>
          </div>
        </section>

        {story.story && story.story.length > 0 && (
          <section
            className={`${styles.storyBody} ${styles.storyArticle}`}
          >
            <div className={`shell ${styles.storyBodyGrid}`}>
              <aside>
                <p className="eyebrow blue">The full story</p>
              </aside>

              <div data-reveal>
                <RichText value={story.story} />
              </div>
            </div>
          </section>
        )}

        <section className="bandDeep">
          <div className="shell bandGrid">
            <div data-reveal>
              <p className="eyebrow soft">
                Student Showcase
              </p>

              <h2>
                Discover more student experiences.
              </h2>
            </div>

            <Link
              href={routes.community.showcase.index}
              className="button buttonLight"
            >
              <span>View all stories</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
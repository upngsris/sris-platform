import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";

import {RichText} from "@/components/sanity/rich-text";
import {
  SanityImage,
  SanityImageFull,
} from "@/components/sanity/sanity-image";
import {JsonLd} from "@/components/seo/json-ld";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {formatInPortMoresby} from "@/lib/dates";
import {routes} from "@/lib/route";
import {articleSchema} from "@/lib/schema";
import {pageMetadata, shareImage} from "@/lib/seo";

import {sanityFetch} from "@/sanity/lib/fetch";
import {
  NEWSLETTER_ISSUES_QUERY,
  NEWSLETTER_ISSUE_QUERY,
} from "@/sanity/lib/queries";

import type {NewsletterIssue} from "@/sanity/lib/types";

import styles from "./issue.module.css";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {slug} = await params;

  const issue = await sanityFetch<NewsletterIssue | null>({
    query: NEWSLETTER_ISSUE_QUERY,

    params: {
      slug,
    },
  });

  if (!issue) {
    return {
      title: "Newsletter Issue Not Found | UPNG SRIS",
    };
  }

  return pageMetadata({
    title: issue.seo?.title ?? `${issue.title} | SRIS Newsletter`,

    description: issue.seo?.description ?? issue.summary,
    type: "article",
    publishedTime: issue.publishedAt,
    image: shareImage(issue.coverImage, issue.title),
    path: routes.learn.newsletter.detail(issue.slug),
  });
}

export async function generateStaticParams() {
  const issues = await sanityFetch<NewsletterIssue[]>({
    query: NEWSLETTER_ISSUES_QUERY,
  });

  return issues.map((issue) => ({
    slug: issue.slug,
  }));
}

export default async function NewsletterIssuePage({params}: PageProps) {
  const {slug} = await params;

  const [issue, allIssues] = await Promise.all([
    sanityFetch<NewsletterIssue | null>({
      query: NEWSLETTER_ISSUE_QUERY,

      params: {
        slug,
      },
    }),

    sanityFetch<NewsletterIssue[]>({
      query: NEWSLETTER_ISSUES_QUERY,
    }),
  ]);

  if (!issue) {
    notFound();
  }

  const briefs = issue.newsBriefs ?? [];

  /* Brief categories first, then the issue's own tags, without repeats. */
  const categories = [
    ...new Set([
      ...briefs.map((brief) => brief.category).filter(Boolean),
      ...(issue.tags ?? []),
    ]),
  ].slice(0, 8) as string[];

  const moreIssues = allIssues
    .filter((other) => other._id !== issue._id)
    .slice(0, 4);

  return (
    <main className={styles.page}>
      <JsonLd
        data={articleSchema({
          type: "NewsArticle",
          title: issue.title,
          path: routes.learn.newsletter.detail(issue.slug),
          description: issue.summary,
          image: issue.coverImage,
          datePublished: issue.publishedAt,
        })}
      />

      <article>
        <header className={styles.header}>
          <div className="shell">
            <Breadcrumb
              trail={[
                {label: "Learn & Do", href: routes.learn.index},
                {
                  label: "Newsletter",
                  href: routes.learn.newsletter.index,
                },
                {label: issue.title},
              ]}
            />

            <div className={styles.headerCopy} data-reveal>
              <h1>{issue.title}</h1>

              <p>{issue.summary}</p>
            </div>
          </div>
        </header>

        <div className={`shell ${styles.layout}`}>
          <div className={styles.main}>
            <div className={styles.cover}>
              {issue.coverImage?.asset ? (
                <SanityImage
                  image={issue.coverImage}
                  fallbackAlt={issue.title}
                  className={styles.coverAsset}
                  sizes="(max-width: 900px) 100vw, 820px"
                  width={1640}
                  height={1000}
                  priority
                />
              ) : (
                <ImagePlaceholder
                  className={styles.coverPlaceholder}
                  label="Newsletter cover"
                />
              )}
            </div>

            {briefs.length > 0 ? (
              <ol className={styles.briefs}>
                {briefs.map((brief, index) => (
                  <li
                    key={brief._key}
                    id={`brief-${brief._key}`}
                    className={styles.brief}
                  >
                    <h2>
                      <span aria-hidden="true">{index + 1}.</span>
                      {brief.headline}
                    </h2>

                    {brief.image?.asset && (
                      <figure className={styles.figure}>
                        <div className={styles.briefImage}>
                          <SanityImage
                            image={brief.image}
                            fallbackAlt={brief.image.caption ?? brief.headline}
                            className={styles.coverAsset}
                            sizes="(max-width: 900px) 100vw, 820px"
                            width={1640}
                            height={1000}
                          />
                        </div>

                        {brief.image.caption && (
                          <figcaption>{brief.image.caption}</figcaption>
                        )}
                      </figure>
                    )}

                    <RichText
                      value={brief.body ?? undefined}
                      className={styles.prose}
                      headingLevel={3}
                    />

                    {brief.gallery && brief.gallery.length > 0 && (
                      <div className={styles.gallery}>
                        {brief.gallery
                          .filter((photo) => photo.asset)
                          .map((photo) => (
                            <figure key={photo._key} className={styles.figure}>
                              <div className={styles.galleryImage}>
                                <SanityImageFull
                                  image={photo}
                                  fallbackAlt={photo.caption ?? brief.headline}
                                  sizes="(max-width: 480px) 100vw, 400px"
                                  maxWidth={800}
                                />
                              </div>

                              {photo.caption && (
                                <figcaption>{photo.caption}</figcaption>
                              )}
                            </figure>
                          ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.noBriefs}>
                {issue.pdfUrl
                  ? "This issue is published as a PDF. Use the download link to read it in full."
                  : "The stories in this issue have not been published online yet."}
              </p>
            )}
          </div>

          <aside className={styles.side}>
            {categories.length > 0 && (
              <section>
                <h2>Category</h2>

                <ul className={styles.chips}>
                  {categories.map((category) => (
                    <li key={category}>{category}</li>
                  ))}
                </ul>
              </section>
            )}

            {issue.editor && (
              <section>
                <h2>Written by</h2>

                <Author editor={issue.editor} />
              </section>
            )}

            <section>
              <h2>Issue</h2>

              <dl className={styles.facts}>
                <div>
                  <dt>Number</dt>
                  <dd>{issue.issueNumber}</dd>
                </div>

                <div>
                  <dt>Published</dt>
                  <dd>
                    <time dateTime={issue.publishedAt}>
                      {formatDate(issue.publishedAt)}
                    </time>
                  </dd>
                </div>
              </dl>

              {issue.pdfUrl && (
                <a
                  href={issue.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pdf}
                >
                  Download PDF
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </section>

            {briefs.length > 1 && (
              <nav aria-labelledby="contents-heading">
                <h2 id="contents-heading">In this issue</h2>

                <ol className={styles.contents}>
                  {briefs.map((brief) => (
                    <li key={brief._key}>
                      <a href={`#brief-${brief._key}`}>{brief.headline}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </aside>
        </div>
      </article>

      {moreIssues.length > 0 && (
        <section className={styles.more} aria-labelledby="more-heading">
          <div className="shell">
            <p className={styles.kicker}>Newsletter archive</p>

            <h2 id="more-heading">More from the newsletter</h2>

            <div className={styles.moreGrid}>
              {moreIssues.map((other) => (
                <Link
                  key={other._id}
                  href={routes.learn.newsletter.detail(other.slug)}
                  className={styles.moreCard}
                  data-reveal
                >
                  <div className={styles.moreImage}>
                    {other.coverImage?.asset ? (
                      <SanityImage
                        image={other.coverImage}
                        fallbackAlt={other.title}
                        className={styles.coverAsset}
                        sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 25vw"
                        width={640}
                        height={440}
                      />
                    ) : (
                      <ImagePlaceholder
                        className={styles.coverPlaceholder}
                        label="Newsletter cover"
                      />
                    )}
                  </div>

                  <p className={styles.moreMeta}>
                    Issue {other.issueNumber} · {formatDate(other.publishedAt)}
                  </p>

                  <h3>{other.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Author({
  editor,
}: {
  editor: NonNullable<NewsletterIssue["editor"]>;
}) {
  const body = (
    <>
      <span className={styles.avatar}>
        {editor.portrait?.asset ? (
          <SanityImage
            image={editor.portrait}
            fallbackAlt=""
            className={styles.coverAsset}
            sizes="48px"
            width={96}
            height={96}
          />
        ) : (
          <span aria-hidden="true">{initials(editor.fullName)}</span>
        )}
      </span>

      <span>
        <strong>{editor.fullName}</strong>
        {editor.professionalTitle && <small>{editor.professionalTitle}</small>}
      </span>
    </>
  );

  return editor.slug ? (
    <Link href={routes.about.teamMember(editor.slug)} className={styles.author}>
      {body}
    </Link>
  ) : (
    <div className={styles.author}>{body}</div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return formatInPortMoresby(value, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";

import {RichText} from "@/components/sanity/rich-text";
import {SanityImageFull} from "@/components/sanity/sanity-image";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {formatInPortMoresby} from "@/lib/dates";
import {disciplineTitle} from "@/lib/disciplines";
import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";
import {
  LAB_PRACTICALS_QUERY,
  LAB_PRACTICAL_QUERY,
} from "@/sanity/lib/queries";
import type {
  LaboratoryPractical,
  LaboratoryPracticalMember,
  LaboratoryPracticalSummary,
} from "@/sanity/lib/types";

import learnStyles from "../../learn.module.css";
import styles from "../practicals.module.css";
import { pageMetadata, shareImage } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { articleSchema } from "@/lib/schema";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getPractical(slug: string) {
  return sanityFetch<LaboratoryPractical | null>({
    query: LAB_PRACTICAL_QUERY,
    params: {slug},
  });
}

export async function generateStaticParams() {
  const practicals = await sanityFetch<LaboratoryPracticalSummary[]>({
    query: LAB_PRACTICALS_QUERY,
  });

  return practicals.map((practical) => ({
    slug: practical.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const practical = await getPractical((await params).slug);

  if (!practical) {
    return {
      title: "Laboratory Practical Not Found | UPNG SRIS",
    };
  }

  return pageMetadata({
    title: `${practical.title} | Laboratory Practicals | UPNG SRIS`,
    description: practical.summary,
    type: "article",
    image: shareImage(practical.featuredImage, practical.title),
    path: routes.learn.laboratoryPractical(practical.slug),
  });
}

export default async function LaboratoryPracticalPage({
  params,
}: PageProps) {
  const practical = await getPractical((await params).slug);

  if (!practical) {
    notFound();
  }

  const date = practical.conductedOn
    ? formatInPortMoresby(practical.conductedOn, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const disciplineNames = practical.disciplines.map(disciplineTitle);
  const members = practical.members ?? [];
  const steps = practical.methodology ?? [];

  return (
    <main>
      <JsonLd
        data={articleSchema({
          type: "LearningResource",
          title: practical.title,
          path: routes.learn.laboratoryPractical(practical.slug),
          description: practical.summary,
          image: practical.featuredImage,
          datePublished: practical.conductedOn,
        })}
      />

      <article>
        <header className={`${learnStyles.detailHero} ${styles.hero}`}>
          <div className="shell">
            <Breadcrumb
              trail={[
                {label: "Learn & Do", href: routes.learn.index},
                {
                  label: "Laboratory Practicals",
                  href: routes.learn.laboratoryPracticals,
                },
                {label: practical.title},
              ]}
            />

            <div className={learnStyles.detailHeroGrid}>
              <div data-reveal>
                <p className="eyebrow blue">
                  {disciplineNames.join(" · ") || "Laboratory Practical"}
                </p>

                <h1>{practical.title}</h1>
              </div>

              <aside
                className={`${learnStyles.detailMeta} ${styles.heroMeta}`}
                data-reveal
              >
                {date && (
                  <div>
                    <span>Conducted</span>
                    <strong>{date}</strong>
                  </div>
                )}

                {practical.location && (
                  <div>
                    <span>Location</span>
                    <strong>{practical.location}</strong>
                  </div>
                )}

                {disciplineNames.length > 0 && (
                  <div>
                    <span>
                      {disciplineNames.length > 1
                        ? "Disciplines"
                        : "Discipline"}
                    </span>
                    <strong>{disciplineNames.join(", ")}</strong>
                  </div>
                )}

                {members.length > 0 && (
                  <div>
                    <span>Members</span>
                    <strong>{members.length}</strong>
                  </div>
                )}

                {steps.length > 0 && (
                  <div>
                    <span>Steps</span>
                    <strong>{steps.length}</strong>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </header>

        <section className={learnStyles.detailMedia}>
          <div className="shell">
            {practical.featuredImage?.asset ? (
              <div className={styles.featuredImage}>
                <SanityImageFull
                  image={practical.featuredImage}
                  fallbackAlt={practical.title}
                  sizes="(max-width: 1440px) 100vw, 1360px"
                  priority
                />
              </div>
            ) : (
              <ImagePlaceholder
                className={learnStyles.detailImage}
                label="Laboratory practical photography"
              />
            )}
          </div>
        </section>

        <Section label="Overview">
          <p className={learnStyles.detailLead}>{practical.summary}</p>
        </Section>

        {members.length > 0 && (
          <Section label="Members">
            <ul className={styles.members}>
              {members.map((member) => (
                <Member key={member._key} member={member} />
              ))}
            </ul>
          </Section>
        )}

        {practical.materials.length > 0 && (
          <Section label="Equipment & materials">
            <ul className={styles.materials}>
              {practical.materials.map((material, index) => (
                <li key={`${material}-${index}`}>{material}</li>
              ))}
            </ul>
          </Section>
        )}

        {steps.length > 0 && (
          <Section label="Methodology">
            <ol className={styles.steps}>
              {steps.map((step, index) => (
                <li key={step._key} className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className={styles.stepBody}>
                    <h3>
                      <span className="visuallyHidden">
                        Step {index + 1}:{" "}
                      </span>
                      {step.title}
                    </h3>

                    <RichText value={step.instructions} headingLevel={4} />

                    {step.image?.asset && (
                      <figure className={styles.stepFigure}>
                        <div className={styles.stepImage}>
                          <SanityImageFull
                            image={step.image}
                            fallbackAlt={step.title}
                            sizes="(max-width: 900px) 100vw, 640px"
                            maxWidth={1280}
                          />
                        </div>

                        {step.image.caption && (
                          <figcaption>{step.image.caption}</figcaption>
                        )}
                      </figure>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {practical.body && practical.body.length > 0 && (
          <Section label="Write-up">
            <RichText value={practical.body} />
          </Section>
        )}

        <section className="bandDeep">
          <div className="shell bandGrid">
            <div data-reveal>
              <p className="eyebrow soft">Keep exploring</p>

              <h2>Continue learning through practice.</h2>
            </div>

            <div className={learnStyles.detailCtaActions} data-reveal>
              {practical.disciplines[0] && (
                <Link
                  href={routes.learn.laboratoryPracticalsFor(
                    practical.disciplines[0],
                  )}
                  className="button buttonLight"
                >
                  <span>
                    More {disciplineTitle(practical.disciplines[0])} practicals
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              )}

              <Link
                href={routes.learn.laboratoryPracticals}
                className={learnStyles.secondaryAction}
              >
                All laboratory practicals
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${learnStyles.detailOverview} ${styles.section}`}>
      <div className={`shell ${learnStyles.detailOverviewGrid}`}>
        <aside>
          <p className="eyebrow blue">{label}</p>
        </aside>

        <div data-reveal>{children}</div>
      </div>
    </section>
  );
}

function Member({member}: {member: LaboratoryPracticalMember}) {
  if (!member.name) {
    return null;
  }

  return (
    <li>
      <strong>{member.name}</strong>

      {member.role && <span>{member.role}</span>}
    </li>
  );
}

import type {Metadata} from "next";
import {notFound} from "next/navigation";

import {RichText} from "@/components/sanity/rich-text";
import {SanityImage} from "@/components/sanity/sanity-image";
import {
  CertificateViewer,
  type CertificateEntry,
} from "@/components/team/certificate-viewer";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {routes} from "@/lib/route";

import {sanityFetch} from "@/sanity/lib/fetch";

import {
  TEAM_PEOPLE_QUERY,
  TEAM_PERSON_QUERY,
} from "@/sanity/lib/queries";

import type {
  PersonData,
  TeamAssignment,
  TeamPersonPageData,
} from "@/sanity/lib/types";

import styles from "../../team.module.css";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import { pageMetadata, shareImage } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { personSchema } from "@/lib/schema";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {slug} = await params;

  const person =
    await sanityFetch<TeamPersonPageData | null>({
      query: TEAM_PERSON_QUERY,

      params: {
        slug,
      },
    });

  if (!person) {
    return {
      title:
        "Team Member Not Found | UPNG SRIS",
    };
  }

  return pageMetadata({
    title: `${person.fullName} | Our Team | UPNG SRIS`,

    description:
      person.biography ??
      `Learn more about ${person.fullName} and their contribution to the Science, Research and Innovation Society.`,
    type: "profile",
    image: shareImage(person.portrait, person.fullName),
    path: routes.about.teamMember(person.slug),
  });
}

export async function generateStaticParams() {
  const people =
    await sanityFetch<
      Pick<PersonData, "_id" | "slug">[]
    >({
      query: TEAM_PEOPLE_QUERY,
    });

  return people.map((person) => ({
    slug: person.slug,
  }));
}

export default async function TeamPersonPage({
  params,
}: PageProps) {
  const {slug} = await params;

  const person =
    await sanityFetch<TeamPersonPageData | null>({
      query: TEAM_PERSON_QUERY,

      params: {
        slug,
      },
    });

  if (!person) {
    notFound();
  }

  const currentAssignment =
    person.assignments.find(
      (assignment) =>
        assignment.status === "current",
    );

  const certificates: CertificateEntry[] =
    person.assignments.flatMap((assignment) =>
      assignment.certificate?.url
        ? [
            {
              key: assignment._id,
              title: `${assignment.role} · ${assignment.termYear}`,
              url: assignment.certificate.url,
              mimeType: assignment.certificate.mimeType,
            },
          ]
        : [],
    );

  return (
    <main>
      <JsonLd
        data={personSchema(person)}
      />

      <article>
        <header className={styles.profileHero}>
          <div className="shell">
            <Breadcrumb
              trail={[
                {label: "About SRIS", href: routes.about.index},
                {label: "Our Team", href: routes.about.team},
                {label: person.fullName},
              ]}
            />

            <div className={styles.profileHeroGrid}>
            <div data-reveal>
              <p className="eyebrow blue">
                {currentAssignment
                  ? currentAssignment.role
                  : "SRIS Contributor"}
              </p>

              <h1>{person.fullName}</h1>

              {person.professionalTitle && (
                <p className="lead muted">
                  {person.professionalTitle}
                </p>
              )}

              {!person.professionalTitle &&
                person.programme && (
                  <p className="lead muted">
                    {person.programme}
                  </p>
                )}

              {certificates.length > 0 && (
                <div className={styles.profileActions}>
                  <CertificateViewer
                    certificates={certificates}
                    label={
                      certificates.length > 1
                        ? "View certificates"
                        : "View certificate"
                    }
                  />
                </div>
              )}
            </div>

            <div className={styles.profilePortrait} data-reveal>
              {person.portrait?.asset ? (
                <SanityImage
                  image={person.portrait}
                  fallbackAlt={person.fullName}
                  className={
                    styles.personImageAsset
                  }
                  sizes="(max-width: 900px) 100vw, 420px"
                  width={1200}
                  height={1400}
                  priority
                />
              ) : (
                <ImagePlaceholder
                  className={
                    styles.personPlaceholder
                  }
                  label="Profile portrait"
                />
              )}
            </div>
            </div>
          </div>
        </header>

        {(person.biography ||
          person.quote) && (
          <section className={styles.profileStory}>
            <div
              className={`shell ${styles.profileStoryGrid}`}
            >
              <aside>
                <p className="eyebrow blue">
                  Profile
                </p>
              </aside>

              <div data-reveal>
                {person.quote && (
                  <blockquote>
                    “{person.quote}”
                  </blockquote>
                )}

                {person.biography && (
                  <p className="body muted">
                    {person.biography}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {person.assignments.length > 0 && (
          <section className={styles.roleHistory}>
            <div className="shell">
              <div className="pageHeading" data-reveal>
                <div>
                  <p className="eyebrow blue">
                    SRIS contribution
                  </p>

                  <h2>
                    Leadership and service history.
                  </h2>
                </div>
              </div>

              <div className={styles.roleHistoryList}>
                {person.assignments.map(
                  (assignment) => (
                    <div
                      key={assignment._id}
                      className={
                        styles.roleHistoryItem
                      }
                    >
                      <strong>
                        {assignment.termYear}
                      </strong>

                      <div>
                        <h3>
                          {assignment.role}
                        </h3>

                        {(assignment.discipline ||
                          assignment.committee) && (
                          <p className="body muted">
                            {assignment.discipline ??
                              assignment.committee}
                          </p>
                        )}

                        <RichText
                          value={assignment.contributions}
                          headingLevel={4}
                          className={
                            styles.roleContributions
                          }
                        />
                      </div>

                      <span>
                        {STATUS_LABELS[
                          assignment.status
                        ] ?? "Archived"}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {person.showContactLinks &&
          hasSocialLinks(person) && (
            <section
              className={styles.profileSocials}
            >
              <div
                className={`shell ${styles.profileSocialGrid}`}
              >
                <div data-reveal>
                  <p className="eyebrow blue">
                    Public links
                  </p>

                  <h2>
                    Connect with{" "}
                    {person.fullName}.
                  </h2>
                </div>

                <div
                  className={
                    styles.profileSocialLinks
                  }
                >
                  {person.socialLinks
                    ?.linkedin && (
                    <SocialLink
                      href={
                        person.socialLinks
                          .linkedin
                      }
                      label="LinkedIn"
                    />
                  )}

                  {person.socialLinks
                    ?.facebook && (
                    <SocialLink
                      href={
                        person.socialLinks
                          .facebook
                      }
                      label="Facebook"
                    />
                  )}

                  {person.socialLinks
                    ?.instagram && (
                    <SocialLink
                      href={
                        person.socialLinks
                          .instagram
                      }
                      label="Instagram"
                    />
                  )}

                  {person.socialLinks
                    ?.whatsapp && (
                    <SocialLink
                      href={
                        person.socialLinks
                          .whatsapp
                      }
                      label="WhatsApp"
                    />
                  )}
                </div>
              </div>
            </section>
          )}
      </article>
    </main>
  );
}

const STATUS_LABELS: Record<
  TeamAssignment["status"],
  string
> = {
  current: "Current",
  archived: "Archived",
  founder: "Founder",
};

function hasSocialLinks(
  person: TeamPersonPageData,
) {
  return Boolean(
    person.socialLinks?.linkedin ||
      person.socialLinks?.facebook ||
      person.socialLinks?.instagram ||
      person.socialLinks?.whatsapp,
  );
}

function SocialLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
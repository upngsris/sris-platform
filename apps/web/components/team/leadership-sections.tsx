import Link from "next/link";

import {SanityImage} from "@/components/sanity/sanity-image";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

import {routes} from "@/lib/route";

import type {TeamAssignment} from "@/sanity/lib/types";

import styles from "@/app/about/team/team.module.css";

export type LeadershipHeadings = {
  patronage: string;
  executive: string;
  committee: string;
  coordinator: string;
};

/**
 * The four leadership groups, in the order the society presents them. Shared
 * by the current team page and the archive so a past term reads exactly like
 * the present one.
 */
export function LeadershipSections({
  assignments,
  headings,
  reveal = true,
}: {
  assignments: TeamAssignment[];
  headings: LeadershipHeadings;
  /**
   * The global reveal observer only rescans on a pathname change, so content
   * swapped by a query-string change must opt out or it stays hidden.
   */
  reveal?: boolean;
}) {
  const revealProps = reveal ? {"data-reveal": true} : {};

  const byGroup = (group: TeamAssignment["group"]) =>
    assignments.filter(
      (assignment) => assignment.group === group,
    );

  const patronage = byGroup("patronage");
  const executives = byGroup("executive");
  const committees = byGroup("committee");
  const coordinators = byGroup("coordinator");

  return (
    <>
      {patronage.length > 0 && (
        <section className={styles.patronage}>
          <div className="shell">
            <SectionHeading
              eyebrow="Patronage"
              heading={headings.patronage}
              revealProps={revealProps}
            />

            <div className={styles.patronageList}>
              {patronage.map((assignment) => (
                <PatronageProfile
                  key={assignment._id}
                  assignment={assignment}
                  revealProps={revealProps}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {executives.length > 0 && (
        <section className={styles.executives}>
          <div className="shell">
            <SectionHeading
              eyebrow="Executive"
              heading={headings.executive}
              revealProps={revealProps}
            />

            <div className={styles.executiveGrid}>
              {executives.map((assignment) => (
                <StudentLeaderCard
                  key={assignment._id}
                  assignment={assignment}
                  revealProps={revealProps}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {committees.length > 0 && (
        <section className={styles.committees}>
          <div className="shell">
            <SectionHeading
              eyebrow="Working groups"
              heading={headings.committee}
              revealProps={revealProps}
            />

            <div className={styles.committeeGrid}>
              {committees.map((assignment) => (
                <StudentLeaderCard
                  key={assignment._id}
                  assignment={assignment}
                  revealProps={revealProps}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {coordinators.length > 0 && (
        <section className={styles.coordinators}>
          <div className="shell">
            <SectionHeading
              eyebrow="Across the sciences"
              heading={headings.coordinator}
              revealProps={revealProps}
            />

            <div className={styles.coordinatorList}>
              {coordinators.map(
                (assignment, index) => (
                  <CoordinatorRow
                    key={assignment._id}
                    assignment={assignment}
                    index={index}
                    revealProps={revealProps}
                  />
                ),
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

type RevealProps = {"data-reveal"?: boolean};

export function SectionHeading({
  eyebrow,
  heading,
  revealProps = {"data-reveal": true},
}: {
  eyebrow: string;
  heading: string;
  revealProps?: RevealProps;
}) {
  return (
    <div className="pageHeading" {...revealProps}>
      <div>
        <p className="eyebrow blue">
          {eyebrow}
        </p>

        <h2>{heading}</h2>
      </div>
    </div>
  );
}

export function PatronageProfile({
  assignment,
  placeholderLabel = "Staff portrait",
  revealProps = {"data-reveal": true},
}: {
  assignment: TeamAssignment;
  placeholderLabel?: string;
  revealProps?: RevealProps;
}) {
  const person = assignment.person;

  return (
    <article className={styles.patronProfile} {...revealProps}>
      <Link
        href={routes.about.teamMember(
          person.slug,
        )}
        className={styles.patronImage}
      >
        {person.portrait?.asset ? (
          <SanityImage
            image={person.portrait}
            fallbackAlt={person.fullName}
            className={styles.personImageAsset}
            sizes="(max-width: 900px) 100vw, 42vw"
            width={1200}
            height={1400}
          />
        ) : (
          <ImagePlaceholder
            className={styles.personPlaceholder}
            label={placeholderLabel}
          />
        )}
      </Link>

      <div className={styles.patronContent}>
        <p className="eyebrow blue">
          {assignment.role}
        </p>

        <h3>
          <Link
            href={routes.about.teamMember(
              person.slug,
            )}
          >
            {person.fullName}
          </Link>
        </h3>

        {person.professionalTitle && (
          <p className={styles.personPosition}>
            {person.professionalTitle}
          </p>
        )}

        {/* Staff carry a department; student founders a programme. */}
        {(person.department ?? person.programme) && (
          <p className="body muted">
            {person.department ?? person.programme}
          </p>
        )}

        {person.quote && (
          <blockquote>
            “{person.quote}”
          </blockquote>
        )}

        <Link
          href={routes.about.teamMember(
            person.slug,
          )}
          className="textlink"
        >
          <span>View profile</span>
          <i aria-hidden="true">→</i>
        </Link>
      </div>
    </article>
  );
}

export function StudentLeaderCard({
  assignment,
  revealProps = {"data-reveal": true},
}: {
  assignment: TeamAssignment;
  revealProps?: RevealProps;
}) {
  const person = assignment.person;

  return (
    <article className={styles.leaderCard} {...revealProps}>
      <Link
        href={routes.about.teamMember(
          person.slug,
        )}
        className={styles.leaderImage}
      >
        {person.portrait?.asset ? (
          <SanityImage
            image={person.portrait}
            fallbackAlt={person.fullName}
            className={styles.personImageAsset}
            sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 25vw"
            width={900}
            height={1100}
          />
        ) : (
          <ImagePlaceholder
            className={styles.personPlaceholder}
            label="Student leader portrait"
          />
        )}
      </Link>

      <div className={styles.leaderBody}>
        <p className="eyebrow blue">
          {assignment.committee ??
            assignment.role}
        </p>

        <h3>
          <Link
            href={routes.about.teamMember(
              person.slug,
            )}
          >
            {person.fullName}
          </Link>
        </h3>

        {assignment.committee && (
          <p className={styles.personPosition}>
            {assignment.role}
          </p>
        )}

        {person.programme && (
          <p className="body muted">
            {person.programme}
          </p>
        )}
      </div>
    </article>
  );
}

export function CoordinatorRow({
  assignment,
  index,
  revealProps = {"data-reveal": true},
}: {
  assignment: TeamAssignment;
  index: number;
  revealProps?: RevealProps;
}) {
  const person = assignment.person;

  return (
    <Link
      href={routes.about.teamMember(
        person.slug,
      )}
      className={styles.coordinator}
      {...revealProps}
    >
      <span className={styles.coordinatorIndex}>
        {String(index + 1).padStart(
          2,
          "0",
        )}
      </span>

      <div>
        <p className="eyebrow blue">
          {assignment.discipline}
        </p>

        <h3>{person.fullName}</h3>

        {person.programme && (
          <p className="body muted">
            {person.programme}
          </p>
        )}
      </div>

      <span
        className={styles.coordinatorArrow}
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}
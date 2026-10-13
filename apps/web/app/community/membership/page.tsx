import type { Metadata } from "next";
import Link from "next/link";

import {
  ClosedNotice,
  FeeTable,
  KeyDates,
  MembershipTerms,
} from "@/components/membership/membership-info";
import styles from "@/components/membership/membership.module.css";
import { Breadcrumb } from "@/components/ui/breadcrumb";

import { periodWindows } from "@/lib/membership/period";
import { getCurrentPeriod } from "@/lib/membership/period-source";

import { routes } from "@/lib/route";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Membership | UPNG SRIS",
  description:
    "How to take part in the Science, Research and Innovation Society at UPNG: join projects, attend workshops and events, and learn through hands-on work.",
  path: routes.community.membership,
});

/*
 * Every "Become a member" button on the site lands here. The dates are read at
 * request time, so a minute of staleness is the most the open/closed state can
 * lag behind the calendar.
 */
export const revalidate = 60;

const waysToTakePart = [
  {
    title: "Join a project",
    description:
      "Open positions on active student projects, from beginner friendly to field and laboratory work.",
    href: routes.explore.projectsToJoin.index,
  },
  {
    title: "Come to an event",
    description:
      "Practical sessions, research skills workshops, talks and showcases open to UPNG students.",
    href: routes.community.events.index,
  },
  {
    title: "Learn & do",
    description:
      "Skills Track activities, laboratory practicals and peer-led knowledge sharing.",
    href: routes.learn.index,
  },
];

export default async function MembershipPage() {
  const now = new Date();
  const period = await getCurrentPeriod();
  const windows = periodWindows(period, now);

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb
            trail={[
              { label: "Community", href: routes.community.events.index },
              { label: "Membership" },
            ]}
          />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">Membership</p>

              <h1>Take your learning beyond the classroom.</h1>
            </div>

            <p className="lead" data-reveal>
              Join a community of students who want to explore ideas, build
              practical skills, contribute to research and projects, and learn
              through hands-on experience beyond formal lectures.
            </p>
          </div>
        </div>
      </section>

      <section className="signposts" aria-labelledby="ways-to-take-part">
        <h2 id="ways-to-take-part" className="visuallyHidden">
          Ways to take part
        </h2>

        <div className="shell signpostGrid">
          {waysToTakePart.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              data-reveal
              style={{ "--reveal-index": index } as React.CSSProperties}
            >
              <div>
                <b>{item.title}</b>

                <p>{item.description}</p>
              </div>

              <i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="join-heading">
        <div className="shell">
          <div className={styles.stack}>
            <h2 id="join-heading">Join or renew online</h2>

            {windows.registration !== "open" && (
              <ClosedNotice state={windows.registration} opens={windows.registrationOpens} />
            )}

            <div className={styles.cta}>
              <div className={styles.ctaCard}>
                <h3>New member</h3>

                <p>Choose your category, pay the fee and register.</p>

                {windows.registration === "open" ? (
                  <Link href={routes.community.membershipRegister} className="button">
                    Register
                  </Link>
                ) : (
                  <span className="button" aria-disabled="true">
                    Registration closed
                  </span>
                )}
              </div>

              <div className={styles.ctaCard}>
                <h3>Existing member</h3>

                <p>Renew without re-entering your details.</p>

                {windows.renewals === "open" ? (
                  <Link href={routes.community.membershipRenew} className="button">
                    Renew
                  </Link>
                ) : (
                  <span className="button" aria-disabled="true">
                    Renewals closed
                  </span>
                )}
              </div>

              <div className={styles.ctaCard}>
                <h3>Already applied?</h3>

                <p>Check whether your payment has been approved.</p>

                <Link href={routes.community.membershipStatus} className="button buttonGhost">
                  Check status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="fees-heading">
        <div className="shell">
          <div className={styles.stack}>
            <h2 id="fees-heading">Membership fees</h2>

            <FeeTable period={period} />

            <h2>Key dates</h2>

            <KeyDates period={period} now={now} />
          </div>
        </div>
      </section>

      <section className="section" id="terms" aria-labelledby="terms-heading">
        <div className="shell">
          <div className={`${styles.stack} ${styles.narrow}`}>
            <h2 id="terms-heading">Terms and conditions</h2>

            <MembershipTerms period={period} now={now} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="richText" data-reveal>
            <h2>Who can join</h2>

            <p>
              SRIS is a student-led society at the University of Papua New
              Guinea, based in the School of Natural &amp; Physical Sciences. It
              is open to students who want to practise science, research and
              innovation alongside their coursework.
            </p>

            <h2>How to become a member</h2>

            <p>
              Register online while registration is open (see above). If it
              has closed, send the society a message through the{" "}
              <Link href={routes.about.contact}>contact form</Link> and the
              executives will help with late registration. You are also
              welcome to come along to an upcoming{" "}
              <Link href={routes.community.events.index}>event</Link> and meet
              the <Link href={routes.about.team}>student leadership team</Link>{" "}
              in person.
            </p>

            <h2>What members do</h2>

            <p>
              Members contribute to{" "}
              <Link href={routes.explore.research.index}>
                student-led research
              </Link>
              , take part in{" "}
              <Link href={routes.learn.laboratoryPracticals}>
                laboratory practicals
              </Link>
              , share what they know with other students, and have their work
              featured in the{" "}
              <Link href={routes.community.showcase.index}>
                student showcase
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bandDeep">
        <div className="shell bandGrid">
          <div data-reveal>
            <p className="eyebrow soft">Ready to join?</p>

            <h2>Get in touch with the society.</h2>
          </div>

          <Link
            href={routes.about.contact}
            className="button buttonLight"
            data-reveal
          >
            <span>Contact SRIS</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

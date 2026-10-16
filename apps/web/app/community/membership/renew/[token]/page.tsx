import type { Metadata } from "next";
import Link from "next/link";

import { ClosedNotice, ContactExecutives } from "@/components/membership/membership-info";
import styles from "@/components/membership/membership.module.css";
import { MembershipHero } from "@/components/membership/page-hero";
import { RenewalForm } from "@/components/membership/renewal-form";

import { CATEGORIES } from "@/lib/membership/categories";
import { getCurrentPeriod } from "@/lib/membership/period-source";
import { periodWindows } from "@/lib/membership/period";
import { membershipDeps, UNAVAILABLE_MESSAGE } from "@/lib/membership/runtime";
import { loadRenewal } from "@/lib/membership/service";
import { routes } from "@/lib/route";

/*
 * The token in the address is a credential, so this page is never cached,
 * never indexed, and the site's Referrer-Policy keeps the full address out of
 * anything the visitor clicks onward to.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Renew your membership | UPNG SRIS",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
};

const LABELS: Record<string, string> = {
  yearOfStudy: "Year of study",
  school: "School",
  major: "Major / study field",
  department: "Department",
  position: "Role / position",
  graduationYear: "Graduation year",
  occupation: "Occupation",
};

export default async function RenewWithLinkPage({ params }: Props) {
  const { token } = await params;

  const period = await getCurrentPeriod();
  const deps = await membershipDeps();

  const context = deps ? await loadRenewal(token, period, deps) : null;

  return (
    <main>
      <MembershipHero
        current="Renew"
        title="Renew your membership."
        lead="Your saved details are below. Update what has changed, pay the renewal fee and submit."
      />

      <section className="section">
        <div className="shell">
          <div className={styles.stack}>
            {!context && (
              <div className={`${styles.notice} ${styles.noticeError}`} role="alert">
                <h2>Renewal is unavailable</h2>
                <p>{UNAVAILABLE_MESSAGE}</p>
                <ContactExecutives />
              </div>
            )}

            {context?.state === "invalid" && (
              <div className={`${styles.notice} ${styles.noticeError}`} role="alert">
                <h2>
                  {context.reason === "expired"
                    ? "This renewal link has expired"
                    : "This renewal link is not valid"}
                </h2>

                <p>
                  Renewal links work for 30 minutes. Please request a new one.
                </p>

                <div className={styles.noticeActions}>
                  <Link href={routes.community.membershipRenew} className="button">
                    Request a new link
                  </Link>
                </div>
              </div>
            )}

            {context?.state === "closed" && (
              <ClosedNotice
                kind="renewal"
                state={periodWindows(period, new Date()).renewals}
                opens={periodWindows(period, new Date()).renewalsOpen}
              />
            )}

            {context?.state === "already" && (
              <div className={`${styles.notice} ${styles.noticeSuccess}`} role="status">
                <h2>You have already renewed</h2>

                <p>
                  Your renewal for {context.periodTitle} was received (reference{" "}
                  <strong>{context.referenceCode}</strong>).
                </p>

                <div className={styles.noticeActions}>
                  <Link href={routes.community.membershipStatus} className="button">
                    Check status
                  </Link>
                </div>
              </div>
            )}

            {context?.state === "ready" && period && (
              <RenewalForm
                token={token}
                category={context.member.category}
                fee={context.fee}
                retained={[
                  { label: "Name", value: `${context.member.firstName} ${context.member.lastName}` },
                  { label: "Email", value: context.member.email },
                  { label: "Category", value: CATEGORIES[context.member.category].label },
                  ...CATEGORIES[context.member.category].fields
                    .filter((field) => !CATEGORIES[context.member.category].renewalEditable.includes(field.name))
                    .flatMap((field) => {
                      const value = context.member[field.name];

                      return value === undefined
                        ? []
                        : [{ label: LABELS[field.name], value: String(value) }];
                    }),
                ]}
                editable={Object.fromEntries(
                  CATEGORIES[context.member.category].renewalEditable.map((name) => [
                    name,
                    String(context.member[name] ?? ""),
                  ]),
                )}
                paymentMethods={period.paymentMethods ?? []}
                paymentNote={period.paymentNote}
                termsHref={`${routes.community.membership}#terms`}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

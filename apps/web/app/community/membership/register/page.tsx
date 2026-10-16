import type { Metadata } from "next";
import Link from "next/link";

import { RegistrationForm } from "@/components/membership/registration-form";
import { ClosedNotice } from "@/components/membership/membership-info";
import styles from "@/components/membership/membership.module.css";
import { MembershipHero } from "@/components/membership/page-hero";

import {
  CATEGORIES,
  CATEGORY_ORDER,
  feeFor,
  formatKina,
  isCategory,
} from "@/lib/membership/categories";
import { periodWindows } from "@/lib/membership/period";
import { getCurrentPeriod } from "@/lib/membership/period-source";
import { routes } from "@/lib/route";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Register as a member | UPNG SRIS",
  description:
    "Register as a student, staff, alumni or other member of the Science, Research and Innovation Society at UPNG.",
  path: routes.community.membershipRegister,
});

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const { category: requested } = await searchParams;

  const now = new Date();
  const period = await getCurrentPeriod();
  const windows = periodWindows(period, now);
  const open = windows.registration === "open" && period !== null;

  const category = isCategory(requested) ? requested : null;

  return (
    <main>
      <MembershipHero
        current="Register"
        title="Join the society."
        lead="Choose your category, pay the membership fee and register. The executives approve registrations within 24 hours."
      />

      <section className="section">
        <div className="shell">
          <div className={styles.stack}>
            {!open ? (
              <ClosedNotice
                state={windows.registration}
                opens={windows.registrationOpens}
              />
            ) : (
              <>
                <h2 id="category-heading">1. Choose your category</h2>

                <ul className={styles.categories} aria-labelledby="category-heading">
                  {CATEGORY_ORDER.map((id) => (
                    <li key={id}>
                      <Link
                        href={`${routes.community.membershipRegister}?category=${id}#details`}
                        className={styles.categoryCard}
                        aria-current={category === id ? "true" : undefined}
                      >
                        <span className={styles.categoryName}>{CATEGORIES[id].label}</span>

                        <span className={styles.categoryFee}>
                          {formatKina(feeFor(id, period))}
                        </span>

                        <span className={styles.categorySummary}>
                          {CATEGORIES[id].summary}
                        </span>

                        {category === id && (
                          <span className={styles.chosen}>Selected</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div id="details" className={styles.stack} tabIndex={-1}>
                  {category ? (
                    <>
                      <h2>2. Your details and payment</h2>

                      <RegistrationForm
                        category={category}
                        fee={feeFor(category, period)}
                        paymentMethods={period.paymentMethods ?? []}
                        paymentNote={period.paymentNote}
                        termsHref={`${routes.community.membership}#terms`}
                      />
                    </>
                  ) : (
                    <p className={styles.hint}>
                      Select a category above to see its form and fee.
                    </p>
                  )}
                </div>

                <p>
                  Already a member?{" "}
                  <Link href={routes.community.membershipRenew} className={styles.link}>
                    Renew your membership
                  </Link>.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";

import { ClosedNotice } from "@/components/membership/membership-info";
import styles from "@/components/membership/membership.module.css";
import { MembershipHero } from "@/components/membership/page-hero";
import { RenewalRequestForm } from "@/components/membership/renewal-request-form";

import { periodWindows } from "@/lib/membership/period";
import { getCurrentPeriod } from "@/lib/membership/period-source";
import { routes } from "@/lib/route";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Renew your membership | UPNG SRIS",
  description: "Renew your SRIS membership without re-entering your details.",
  path: routes.community.membershipRenew,
});

export const revalidate = 60;

export default async function RenewPage() {
  const period = await getCurrentPeriod();
  const windows = periodWindows(period, new Date());

  return (
    <main>
      <MembershipHero
        current="Renew"
        title="Renew your membership."
        lead="Enter your email address and we will send a secure link to your saved details. You only need to update what has changed and submit a new payment."
      />

      <section className="section">
        <div className="shell">
          <div className={styles.stack}>
            {windows.renewals === "open" ? (
              <RenewalRequestForm />
            ) : (
              <ClosedNotice
                kind="renewal"
                state={windows.renewals}
                opens={windows.renewalsOpen}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

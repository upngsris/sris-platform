import type { Metadata } from "next";

import styles from "@/components/membership/membership.module.css";
import { MembershipHero } from "@/components/membership/page-hero";
import { StatusLookup } from "@/components/membership/status-lookup";

import { routes } from "@/lib/route";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Check your membership status | UPNG SRIS",
  description: "Check whether your SRIS membership registration or renewal has been approved.",
  path: routes.community.membershipStatus,
  noIndex: true,
});

export default function StatusPage() {
  return (
    <main>
      <MembershipHero
        current="Status"
        title="Check your status."
        lead="Enter the reference code from your confirmation and the email address you used to register."
      />

      <section className="section">
        <div className="shell">
          <div className={styles.stack}>
            <StatusLookup />
          </div>
        </div>
      </section>
    </main>
  );
}

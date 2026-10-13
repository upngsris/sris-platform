import type { Metadata } from "next";
import Link from "next/link";

import { StatusPage } from "@/components/status/status-page";

import { routes } from "@/lib/route";
import { statusTitle } from "@/lib/status";

export const metadata: Metadata = {
  title: statusTitle(401),
  robots: { index: false },
};

/**
 * 401 — rendered wherever a page calls unauthorized() from next/navigation.
 * The site has no sign-in yet; when one is added, put its button here.
 */
export default function Unauthorized() {
  return (
    <StatusPage
      code={401}
      actions={
        <>
          <Link href={routes.home} className="button">
            <span>Back to homepage</span>
            <span aria-hidden="true">→</span>
          </Link>

          <Link href={routes.about.contact} className="button buttonGhost">
            <span>Contact SRIS</span>
          </Link>
        </>
      }
    />
  );
}

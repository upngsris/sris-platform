import type { Metadata } from "next";
import Link from "next/link";

import { StatusPage } from "@/components/status/status-page";

import { routes } from "@/lib/route";
import { statusTitle } from "@/lib/status";

export const metadata: Metadata = {
  title: statusTitle(403),
  robots: { index: false },
};

/** 403 — rendered wherever a page calls forbidden() from next/navigation. */
export default function Forbidden() {
  return (
    <StatusPage
      code={403}
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

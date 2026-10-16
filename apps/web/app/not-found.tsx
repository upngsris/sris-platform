import type { Metadata } from "next";
import Link from "next/link";

import { SearchField } from "@/components/search/search-field";
import { StatusPage } from "@/components/status/status-page";

import { routes } from "@/lib/route";
import { statusTitle } from "@/lib/status";

export const metadata: Metadata = {
  title: statusTitle(404),
  robots: { index: false },
};

/** 404 — rendered for unknown URLs and wherever a page calls notFound(). */
export default function NotFound() {
  return (
    <StatusPage
      code={404}
      actions={
        <>
          <Link href={routes.home} className="button">
            <span>Back to homepage</span>
            <span aria-hidden="true">→</span>
          </Link>

          <Link href="/search" className="button buttonGhost">
            <span>Search the site</span>
          </Link>
        </>
      }
    >
      <div className="statusSearch">
        <SearchField placeholder="Search SRIS" />
      </div>
    </StatusPage>
  );
}

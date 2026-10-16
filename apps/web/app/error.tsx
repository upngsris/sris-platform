"use client";

import { useEffect } from "react";
import Link from "next/link";

import { StatusPage } from "@/components/status/status-page";

import { routes } from "@/lib/route";
import { statusTitle } from "@/lib/status";

/**
 * 500 — the error boundary for every page under the root layout, so the
 * header and footer stay in place. Errors in the root layout itself fall
 * through to global-error.tsx.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <title>{statusTitle(500)}</title>

      <StatusPage
        code={500}
        actions={
          <>
            <button type="button" className="button" onClick={() => retry()}>
              <span>Try again</span>
              <span aria-hidden="true">↻</span>
            </button>

            <Link href={routes.home} className="button buttonGhost">
              <span>Back to homepage</span>
            </Link>
          </>
        }
      >
        {error.digest && (
          <p className="statusReference">
            If you contact us about this, quote reference{" "}
            <code>{error.digest}</code>.
          </p>
        )}
      </StatusPage>
    </>
  );
}

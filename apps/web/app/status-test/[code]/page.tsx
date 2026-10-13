import type { Metadata } from "next";
import { forbidden, notFound, unauthorized } from "next/navigation";
import { connection } from "next/server";

import { statusTestRoutesEnabled } from "@/lib/status-testing";

/**
 * Triggers an error page on demand, for testing:
 *
 *   /status-test/401  → unauthorized()  → app/unauthorized.tsx
 *   /status-test/403  → forbidden()     → app/forbidden.tsx
 *   /status-test/404  → notFound()      → app/not-found.tsx
 *   /status-test/500  → throws          → app/error.tsx
 *
 * 400, 502 and 503 are handled earlier, in proxy.ts. See
 * docs/status-pages.md for the full testing guide.
 */
type PageProps = {
  params: Promise<{ code: string }>;
};

export const metadata: Metadata = {
  robots: { index: false },
};

export default async function StatusTestPage({ params }: PageProps) {
  // Render per request: the env switch must be read at runtime, and a
  // prerender would try to throw the 500 during the build.
  await connection();

  if (!statusTestRoutesEnabled()) {
    notFound();
  }

  switch ((await params).code) {
    case "401":
      unauthorized();

    case "403":
      forbidden();

    case "500":
      throw new Error("Status test: intentional 500 from /status-test/500");

    default:
      notFound();
  }
}

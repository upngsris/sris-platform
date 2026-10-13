import { NextResponse, type NextRequest } from "next/server";

import { statusTestRoutesEnabled } from "@/lib/status-testing";

/**
 * Serves the status pages that have no Next.js special file, with the right
 * HTTP status code. Rewrites keep the visitor's URL and carry the status;
 * the page itself lives at app/status/[code].
 *
 *   503 — maintenance mode, when MAINTENANCE_MODE=true
 *   400 — a URL path whose percent-encoding cannot be decoded (query
 *         strings are left alone: URLSearchParams already tolerates them)
 *   /status/400|502|503 — answer with their own code, never 200
 *   /status-test/400|502|503 — test URLs (see lib/status-testing.ts)
 *
 * 401, 403, 404 and 500 come from the special files in app/ instead.
 * See docs/status-pages.md.
 */

/** Suggested wait before retrying during maintenance, in seconds. */
const MAINTENANCE_RETRY_AFTER = "3600";

function statusRewrite(
  request: NextRequest,
  code: 400 | 502 | 503,
  headers?: HeadersInit,
) {
  return NextResponse.rewrite(new URL(`/status/${code}`, request.url), {
    status: code,
    headers,
  });
}

function isMalformed(request: NextRequest) {
  try {
    decodeURIComponent(request.nextUrl.pathname);

    return false;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.MAINTENANCE_MODE === "true") {
    return statusRewrite(request, 503, {
      "Retry-After": MAINTENANCE_RETRY_AFTER,
      // Keep caches and CDNs from holding the maintenance page afterwards.
      "Cache-Control": "no-store",
    });
  }

  const routed = pathname.match(/^\/status(-test)?\/(400|502|503)$/);

  if (routed) {
    const isTest = Boolean(routed[1]);

    if (isTest && !statusTestRoutesEnabled()) {
      return NextResponse.next();
    }

    return statusRewrite(request, Number(routed[2]) as 400 | 502 | 503);
  }

  if (isMalformed(request)) {
    return statusRewrite(request, 400);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Every page request, but not Next internals, API routes or files with
     * an extension (images, fonts, public/errors/*.html) — those must keep
     * loading even in maintenance mode.
     */
    "/((?!_next/static|_next/image|api/|.*\\.[\\w]+$).*)",
  ],
};

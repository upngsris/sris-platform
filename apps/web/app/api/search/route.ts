import { NextResponse } from "next/server";

import {
  RESULT_LIMIT,
  isSearchable,
  normaliseQuery,
  SEARCH_MIN_CHARS,
} from "@/lib/search";
import { searchSite } from "@/sanity/lib/search";

/**
 * Full search results.
 *
 * Kept separate from /api/search/suggest so the two can be tuned and cached
 * independently: suggestions are tiny and very hot, full results are larger
 * and requested far less often.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = normaliseQuery(searchParams.get("q"));

  if (!isSearchable(query)) {
    return NextResponse.json(
      {
        query,
        results: [],
        message: `Enter at least ${SEARCH_MIN_CHARS} characters.`,
      },
      { status: 200 },
    );
  }

  const limit = clampLimit(searchParams.get("limit"), RESULT_LIMIT);

  try {
    const results = await searchSite({ query, limit });

    return NextResponse.json(
      { query, results },
      {
        status: 200,
        headers: {
          // Short browser cache, longer shared cache, and serve stale while
          // revalidating so repeat queries never wait on Sanity.
          "Cache-Control":
            "public, max-age=30, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { query, results: [], message: "Search is unavailable right now." },
      { status: 503 },
    );
  }
}

function clampLimit(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), RESULT_LIMIT);
}

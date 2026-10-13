import { NextResponse } from "next/server";

import {
  SUGGESTION_LIMIT,
  isSearchable,
  normaliseQuery,
} from "@/lib/search";
import { searchSite } from "@/sanity/lib/search";

/**
 * Type-ahead suggestions.
 *
 * Returns at most SUGGESTION_LIMIT lightweight rows — never the dataset — and
 * stays quiet below the character threshold so early keystrokes cost nothing.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = normaliseQuery(searchParams.get("q"));

  if (!isSearchable(query)) {
    return NextResponse.json(
      { query, suggestions: [] },
      { status: 200 },
    );
  }

  try {
    const results = await searchSite({
      query,
      limit: SUGGESTION_LIMIT,
    });

    const suggestions = results
      .slice(0, SUGGESTION_LIMIT)
      .map(({ id, type, title, href, meta }) => ({
        id,
        type,
        title,
        href,
        meta,
      }));

    return NextResponse.json(
      { query, suggestions },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=600, stale-while-revalidate=1200",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { query, suggestions: [] },
      { status: 200 },
    );
  }
}

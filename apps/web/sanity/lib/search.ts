import { sanityFetch } from "@/sanity/lib/fetch";
import { SEARCH_QUERY } from "@/sanity/lib/queries";

import { routes } from "@/lib/route";

import {
  RESULT_LIMIT,
  isSearchable,
  matchStaticPages,
  normaliseQuery,
  type SearchResult,
  type SearchType,
} from "@/lib/search";

type RawHit = {
  _id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  meta?: string;
};

type RawSearchResponse = Record<string, RawHit[] | null>;

const HREF_BUILDERS: Record<
  Exclude<SearchType, "page">,
  (slug: string) => string
> = {
  research: routes.explore.research.detail,
  opportunity: routes.explore.projectsToJoin.detail,
  learning: routes.learn.detail,
  practical: routes.learn.laboratoryPractical,
  event: routes.community.events.detail,
  story: routes.community.showcase.detail,
  person: routes.about.teamMember,
  newsletter: routes.learn.newsletter.detail,
};

/**
 * Turns the user's text into a GROQ `match` term.
 *
 * The value is still passed as a query parameter, so it is never interpolated
 * into the query string; this only shapes it into a prefix search and strips
 * the wildcard characters GROQ would otherwise treat as operators.
 */
function toMatchTerm(query: string) {
  const words = query
    .replace(/[*?]/g, " ")
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "";
  }

  return `${words.join(" ")}*`;
}

function truncate(value: string | undefined, length = 180) {
  if (!value) {
    return undefined;
  }

  const clean = value.replace(/\s+/g, " ").trim();

  return clean.length > length
    ? `${clean.slice(0, length).trimEnd()}…`
    : clean;
}

/**
 * Runs the site-wide search on the server.
 *
 * Both API routes and the search page call this, so the index — which types
 * are covered, how results are ranked and how they are capped — is defined in
 * exactly one place.
 */
export async function searchSite({
  query,
  limit = RESULT_LIMIT,
}: {
  query: string;
  limit?: number;
}): Promise<SearchResult[]> {
  const cleaned = normaliseQuery(query);

  if (!isSearchable(cleaned)) {
    return [];
  }

  const term = toMatchTerm(cleaned);

  if (!term) {
    return [];
  }

  const data = await sanityFetch<RawSearchResponse>({
    query: SEARCH_QUERY,
    params: {
      term,
      // Per-type cap. The overall list is trimmed again below.
      limit,
    },
  });

  const results: SearchResult[] = [];

  for (const [type, hits] of Object.entries(data ?? {})) {
    const buildHref =
      HREF_BUILDERS[type as Exclude<SearchType, "page">];

    if (!buildHref || !hits) {
      continue;
    }

    for (const hit of hits) {
      if (!hit.slug || !hit.title) {
        continue;
      }

      results.push({
        id: hit._id,
        type: type as SearchType,
        title: hit.title,
        href: buildHref(hit.slug),
        excerpt: truncate(hit.excerpt),
        meta: hit.meta ?? undefined,
      });
    }
  }

  // Static pages are matched in code — they have no documents to query.
  results.push(...matchStaticPages(cleaned));

  return rankResults(results, cleaned).slice(0, limit);
}

/** Exact title matches first, then title prefixes, then everything else. */
function rankResults(results: SearchResult[], query: string) {
  const needle = query.toLowerCase();

  const score = (result: SearchResult) => {
    const title = result.title.toLowerCase();

    if (title === needle) return 0;
    if (title.startsWith(needle)) return 1;
    if (title.includes(needle)) return 2;

    return 3;
  };

  return results
    .map((result, index) => ({ result, index, score: score(result) }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((entry) => entry.result);
}

import type {Metadata} from "next";
import Link from "next/link";

import {Breadcrumb} from "@/components/ui/breadcrumb";
import {SearchField} from "@/components/search/search-field";

import {
  RESULT_LIMIT,
  SEARCH_MIN_CHARS,
  SEARCH_TYPE_LABELS,
  isSearchable,
  normaliseQuery,
  type SearchResult,
  type SearchType,
} from "@/lib/search";

import {searchSite} from "@/sanity/lib/search";

import styles from "./search.module.css";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/route";

export const metadata: Metadata = pageMetadata({
  title: "Search | UPNG SRIS",
  description:
    "Search research projects, events, learning activities, people and pages across the Science, Research and Innovation Society website.",

  // Results pages should not compete with the pages they point at.
  noIndex: true,
  path: routes.search,
});

type PageProps = {
  searchParams: Promise<{q?: string}>;
};

export default async function SearchPage({searchParams}: PageProps) {
  const {q} = await searchParams;

  const query = normaliseQuery(q);

  // Results are rendered on the server: the browser receives the matches,
  // never the index.
  const results = isSearchable(query)
    ? await searchSite({query, limit: RESULT_LIMIT})
    : [];

  const grouped = groupByType(results);

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb trail={[{label: "Search"}]} />

          <div className="pageHeroGrid">
            <div>
              <p className="eyebrow blue">Search</p>

              <h1>
                {query
                  ? `Results for “${query}”`
                  : "Search the SRIS website"}
              </h1>
            </div>

            <p className="lead">
              {query
                ? `${results.length} ${
                    results.length === 1 ? "result" : "results"
                  } across research, events, learning, people and pages.`
                : "Find research projects, events, learning activities, student stories, people and pages."}
            </p>
          </div>

          <div className={styles.searchBar}>
            <SearchField
              initialQuery={query}
              placeholder="Search research, events, people…"
              autoFocus
            />
          </div>
        </div>
      </section>

      <section className={styles.results}>
        <div className="shell">
          {!isSearchable(query) ? (
            <div className="emptyState">
              <p className="eyebrow blue">Start searching</p>

              <h2>Enter at least {SEARCH_MIN_CHARS} characters.</h2>

              <p className="body muted">
                Search covers research projects, projects to join, learning
                activities, events, student stories, people, the newsletter
                and the site&apos;s main pages.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="emptyState">
              <p className="eyebrow blue">No matches</p>

              <h2>Nothing found for “{query}”.</h2>

              <p className="body muted">
                Try a shorter or more general term — for example a discipline,
                a person&apos;s name or an activity.
              </p>
            </div>
          ) : (
            <div className={styles.groups}>
              {grouped.map(([type, items]) => (
                <section key={type} className={styles.group}>
                  <div className={styles.groupHeading}>
                    <p className="eyebrow blue">
                      {SEARCH_TYPE_LABELS[type]}
                    </p>

                    <span>{items.length}</span>
                  </div>

                  <ul className={styles.resultList}>
                    {items.map((result) => (
                      <li key={result.id}>
                        <Link
                          href={result.href}
                          className={styles.result}
                        >
                          <span className={styles.resultTitle}>
                            {result.title}
                          </span>

                          {result.meta && (
                            <span className={styles.resultMeta}>
                              {result.meta}
                            </span>
                          )}

                          {result.excerpt && (
                            <span className={styles.resultExcerpt}>
                              {result.excerpt}
                            </span>
                          )}

                          <span
                            className={styles.resultArrow}
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/** Keeps the order the ranker produced, grouped by content type. */
function groupByType(results: SearchResult[]) {
  const groups = new Map<SearchType, SearchResult[]>();

  for (const result of results) {
    const bucket = groups.get(result.type) ?? [];

    bucket.push(result);
    groups.set(result.type, bucket);
  }

  return [...groups.entries()];
}

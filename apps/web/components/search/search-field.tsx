"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_CHARS,
  SEARCH_TYPE_LABELS,
  SUGGESTION_LIMIT,
  isSearchable,
  normaliseQuery,
  routesSearchHref,
  type SearchResult,
} from "@/lib/search";

type Props = {
  /** Pre-fills the field on the results page. */
  initialQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
};

/**
 * Search box with type-ahead.
 *
 * The browser only ever holds the handful of suggestions it asked for: each
 * keystroke is debounced, queries below the threshold are never sent, and the
 * server caps the response at SUGGESTION_LIMIT rows.
 */
export function SearchField({
  initialQuery = "",
  placeholder = "Search SRIS",
  autoFocus = false,
  onNavigate,
}: Props) {
  const router = useRouter();

  const [value, setValue] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  /**
   * Suggestions are stored with the query that produced them, so a stale
   * response can never be shown against a newer query — and nothing has to be
   * cleared from inside an effect.
   */
  const [loaded, setLoaded] = useState<{
    query: string;
    items: SearchResult[];
  }>({ query: "", items: [] });

  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const query = normaliseQuery(value);

  const suggestions =
    loaded.query === query ? loaded.items : [];

  const isLoading =
    isSearchable(query) && loaded.query !== query;

  useEffect(() => {
    if (!isSearchable(query)) {
      return;
    }

    const controller = new AbortController();

    // Debounce: only the keystroke the user rests on reaches the network.
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("suggest failed");
        }

        const data: { suggestions: SearchResult[] } =
          await response.json();

        setLoaded({
          query,
          items: data.suggestions.slice(0, SUGGESTION_LIMIT),
        });

        setActiveIndex(-1);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLoaded({ query, items: [] });
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function goToResults(nextQuery: string) {
    const target = normaliseQuery(nextQuery);

    if (!isSearchable(target)) {
      return;
    }

    setIsOpen(false);
    onNavigate?.();
    router.push(routesSearchHref(target));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) =>
          (index - 1 + suggestions.length) % suggestions.length,
      );
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const chosen =
      activeIndex >= 0 ? suggestions[activeIndex] : undefined;

    if (chosen) {
      setIsOpen(false);
      onNavigate?.();
      router.push(chosen.href);

      return;
    }

    goToResults(value);
  }

  const showPanel =
    isOpen &&
    isSearchable(query) &&
    (isLoading || suggestions.length > 0);

  return (
    <div className="searchField" ref={containerRef}>
      <form role="search" onSubmit={handleSubmit}>
        <label htmlFor={`${listId}-input`} className="visuallyHidden">
          Search the SRIS website
        </label>

        <input
          id={`${listId}-input`}
          type="search"
          name="q"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0
              ? `${listId}-option-${activeIndex}`
              : undefined
          }
          onChange={(event) => {
            setValue(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        <button type="submit" className="searchSubmit">
          <span className="visuallyHidden">Search</span>

          <span aria-hidden="true">→</span>
        </button>
      </form>

      {showPanel && (
        <div className="searchPanel">
          <ul id={listId} role="listbox" aria-label="Search suggestions">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <a
                  href={suggestion.href}
                  className={
                    index === activeIndex ? "isActive" : undefined
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate?.();
                  }}
                >
                  <span className="searchSuggestionTitle">
                    {suggestion.title}
                  </span>

                  <span className="searchSuggestionType">
                    {SEARCH_TYPE_LABELS[suggestion.type]}
                  </span>
                </a>
              </li>
            ))}

            {suggestions.length === 0 && isLoading && (
              <li className="searchHint" role="presentation">
                Searching…
              </li>
            )}
          </ul>

          {suggestions.length > 0 && (
            <button
              type="button"
              className="searchAll"
              onClick={() => goToResults(value)}
            >
              See all results for “{query}”
            </button>
          )}
        </div>
      )}

      {isOpen &&
        value.length > 0 &&
        !isSearchable(query) && (
          <div className="searchPanel">
            <p className="searchHint">
              Keep typing — at least {SEARCH_MIN_CHARS} characters.
            </p>
          </div>
        )}
    </div>
  );
}

"use client";

import {usePathname, useRouter} from "next/navigation";

import styles from "@/app/about/team/team.module.css";

export type TermOption = {
  year: number;
  members: number;
};

/**
 * Leadership term dropdown. It is a plain GET form, so without JavaScript the
 * "Show" button submits `?year=`; with it, choosing a year navigates
 * straight away.
 */
export function TermSelect({
  terms,
  activeYear,
}: {
  terms: TermOption[];
  activeYear: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <form
      action={pathname}
      method="get"
      className={styles.termForm}
    >
      <label
        htmlFor="term-year"
        className={styles.termFilterLabel}
      >
        Leadership term
      </label>

      <div className={styles.termSelectWrap}>
        <select
          id="term-year"
          name="year"
          className={styles.termSelect}
          defaultValue={activeYear}
          onChange={(event) =>
            router.push(
              `${pathname}?year=${event.target.value}`,
              {scroll: false},
            )
          }
        >
          {terms.map((term) => (
            <option key={term.year} value={term.year}>
              {term.year}
              {term.members > 0
                ? ` · ${term.members} ${
                    term.members === 1 ? "member" : "members"
                  }`
                : " · No records yet"}
            </option>
          ))}
        </select>

        <span
          className={styles.termSelectChevron}
          aria-hidden="true"
        >
          ▾
        </span>
      </div>

      <noscript>
        <button type="submit" className="button">
          Show
        </button>
      </noscript>
    </form>
  );
}

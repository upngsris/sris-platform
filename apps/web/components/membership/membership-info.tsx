import Link from "next/link";

import { formatInPortMoresby } from "@/lib/dates";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  feeFor,
  formatKina,
} from "@/lib/membership/categories";
import { periodWindows, type WindowState } from "@/lib/membership/period";
import type { MembershipPeriod } from "@/lib/membership/types";
import { routes } from "@/lib/route";

import styles from "./membership.module.css";

const long = (value: string | Date | null | undefined) => {
  if (!value) {
    return "";
  }

  return formatInPortMoresby(typeof value === "string" ? value : value.toISOString(), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/** How to reach the executives, used wherever online sign-up is not open. */
export function ContactExecutives() {
  return (
    <div className={styles.noticeActions}>
      <Link href={routes.about.contact} className="button">
        Contact the executives
      </Link>

      <Link href={routes.about.team} className="button buttonGhost">
        Meet the executives
      </Link>
    </div>
  );
}

/**
 * Explains why a form is not shown and what to do instead. Registration and
 * renewal share this wording so a closed window always reads the same way.
 */
export function ClosedNotice({
  state,
  opens,
  kind = "registration",
}: {
  state: WindowState;
  opens: Date | null;
  kind?: "registration" | "renewal";
}) {
  const noun = kind === "renewal" ? "renewals" : "registration";

  if (state === "upcoming") {
    return (
      <div className={`${styles.notice} ${styles.noticeClosed}`}>
        <h2>Online {noun} is not open yet</h2>

        <p>
          Online {noun} opens on <strong>{long(opens)}</strong>, at the start
          of the academic year. Please come back then.
        </p>
      </div>
    );
  }

  if (state === "closed") {
    return (
      <div className={`${styles.notice} ${styles.noticeClosed}`}>
        <h2>Online {noun} is closed</h2>

        <p>
          Online {noun} has closed for this academic year.{" "}
          {kind === "renewal"
            ? "If you would still like to renew, please contact the society's executives about late renewal."
            : "If you would still like to join, please contact the society's executives about late registration."}
        </p>

        <ContactExecutives />
      </div>
    );
  }

  return (
    <div className={`${styles.notice} ${styles.noticeClosed}`}>
      <h2>Online {noun} is not available yet</h2>

      <p>
        The dates and payment details for this academic year have not been
        announced. Please contact the society&rsquo;s executives if you would
        like to take part.
      </p>

      <ContactExecutives />
    </div>
  );
}

export function FeeTable({ period }: { period: MembershipPeriod | null }) {
  return (
    <table className={styles.table}>
      <caption className="visuallyHidden">Membership fees by category</caption>

      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col">Who</th>
          <th scope="col">Annual fee</th>
        </tr>
      </thead>

      <tbody>
        {CATEGORY_ORDER.map((id) => (
          <tr key={id}>
            <th scope="row">{CATEGORIES[id].label}</th>
            <td>{CATEGORIES[id].summary}</td>
            <td>
              <strong>{formatKina(feeFor(id, period))}</strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function KeyDates({
  period,
  now,
}: {
  period: MembershipPeriod | null;
  now: Date;
}) {
  const windows = periodWindows(period, now);

  if (!period) {
    return (
      <p>
        The dates for this academic year have not been announced yet. They
        will appear here.
      </p>
    );
  }

  return (
    <dl className={styles.dl}>
      <dt>Academic year</dt>
      <dd>{period.academicYear || period.title}</dd>

      <dt>Registration opens</dt>
      <dd>{long(windows.registrationOpens)} (academic-year orientation)</dd>

      <dt>Registration closes</dt>
      <dd>{long(windows.registrationCloses)} (start of Semester 2)</dd>

      <dt>Membership period</dt>
      <dd>
        {long(period.membershipStarts)} to {long(period.membershipEnds)}
      </dd>

      <dt>Renewals</dt>
      <dd>
        Open {long(windows.renewalsOpen)}, at orientation each new academic year
      </dd>
    </dl>
  );
}

export function MembershipTerms({
  period,
  now,
}: {
  period: MembershipPeriod | null;
  now: Date;
}) {
  const windows = periodWindows(period, now);

  return (
    <ol className={styles.terms}>
      <li>
        <strong>Registration window.</strong> Online registration opens at
        academic-year orientation and closes at the beginning of Semester 2
        {period && windows.registrationOpens ? (
          <>
            {" "}
            (this year: {long(windows.registrationOpens)} to{" "}
            {long(windows.registrationCloses)})
          </>
        ) : null}
        . After it closes, anyone who would still like to join should contact
        the society&rsquo;s executives about late registration.
      </li>

      <li>
        <strong>Membership period.</strong> Membership lasts one academic
        year{period ? (
          <>
            {" "}
            ({long(period.membershipStarts)} to {long(period.membershipEnds)})
          </>
        ) : null}
        .
      </li>

      <li>
        <strong>Renewals.</strong> Renewals open at orientation at the start
        of each new academic year. Existing members renew online without
        re-entering their details; students can update their year of study
        and major.
      </li>

      <li>
        <strong>Fees.</strong> Students K15; staff and alumni K25; others K30
        for each academic year{period?.fees ? " (the amounts shown for this year apply)" : ""}.
      </li>

      <li>
        <strong>Payment and approval.</strong> You pay by one of the methods
        listed on the registration page, then submit the receipt details.
        Every registration and renewal is{" "}
        <strong>pending approval for up to 24 hours</strong> while the
        executives check the payment. Membership is confirmed only once it is
        approved; you can check your status with your reference code.
      </li>

      <li>
        <strong>Your information.</strong> We keep your details to run the
        society&rsquo;s membership. We never ask for card numbers or
        passwords. See the{" "}
        <Link href={routes.privacy} className={styles.link}>
          privacy page
        </Link>.
      </li>

      {period?.termsNote && <li>{period.termsNote}</li>}
    </ol>
  );
}

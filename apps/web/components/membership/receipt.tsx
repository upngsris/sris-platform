import { CATEGORIES, formatKina } from "@/lib/membership/categories";
import type { Receipt, StatusResult } from "@/lib/membership/form-state";
import { formatInPortMoresby } from "@/lib/dates";
import type { RegistrationStatus } from "@/lib/membership/types";
import { routes } from "@/lib/route";

import Link from "next/link";

import styles from "./membership.module.css";

const when = (value: string) =>
  formatInPortMoresby(value, { dateStyle: "full", timeStyle: "short" });

const day = (value: string) =>
  formatInPortMoresby(value, { dateStyle: "long" });

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  const label =
    status === "approved"
      ? "Approved"
      : status === "rejected"
        ? "Not approved"
        : "Pending approval";

  const tone =
    status === "approved"
      ? styles.badgeApproved
      : status === "rejected"
        ? styles.badgeRejected
        : styles.badgePending;

  return <span className={`${styles.badge} ${tone}`}>{label}</span>;
}

/** Shown after a registration or renewal is submitted. */
export function ReceiptView({ receipt }: { receipt: Receipt }) {
  const renewal = receipt.kind === "renewal";

  return (
    <div className={`${styles.notice} ${styles.noticeSuccess} ${styles.stack}`} role="status">
      <h2>{renewal ? "Renewal received" : "Registration received"}</h2>

      <p>
        Status: <StatusBadge status={receipt.status} />
      </p>

      <p>
        Your reference code is{" "}
        <span className={styles.reference}>{receipt.referenceCode}</span>. Keep
        it: you will need it, with your email address, to check your status.
      </p>

      <dl className={styles.dl}>
        <dt>Membership</dt>
        <dd>
          {CATEGORIES[receipt.category].label}, {receipt.periodTitle}
        </dd>

        <dt>Fee</dt>
        <dd>{formatKina(receipt.fee)}</dd>

        <dt>Proof of payment</dt>
        <dd>{receipt.proofReceived ? "Uploaded" : "Not uploaded"}</dd>

        <dt>Payment submitted</dt>
        <dd>
          {formatKina(receipt.amountPaid)}
          {!receipt.amountMatchesFee && (
            <>
              {" "}
              <strong>(different from the fee; the executives will contact you)</strong>
            </>
          )}
        </dd>
      </dl>

      <h3>What happens next</h3>

      <ol className={styles.steps}>
        <li>
          The executives check your payment. Your submission stays{" "}
          <strong>pending approval for up to 24 hours</strong> (by{" "}
          {when(receipt.decisionDueBy)}).
        </li>

        <li>
          {receipt.emailed
            ? "A confirmation has been emailed to you."
            : "We could not send a confirmation email, so please note your reference code now."}
        </li>

        <li>
          Check your status any time on the{" "}
          <Link href={routes.community.membershipStatus} className={styles.link}>
            status page
          </Link>.
        </li>
      </ol>
    </div>
  );
}

export function StatusView({ result }: { result: StatusResult }) {
  const renewal = result.kind === "renewal";

  return (
    <div
      className={`${styles.notice} ${
        result.status === "approved"
          ? styles.noticeSuccess
          : result.status === "rejected"
            ? styles.noticeError
            : styles.noticeClosed
      } ${styles.stack}`}
      role="status"
    >
      <h2>{renewal ? "Renewal" : "Registration"} {result.referenceCode}</h2>

      <p>
        Status: <StatusBadge status={result.status} />
      </p>

      <dl className={styles.dl}>
        <dt>Membership</dt>
        <dd>
          {CATEGORIES[result.category].label}, {result.periodTitle}
        </dd>

        <dt>Submitted</dt>
        <dd>{when(result.submittedAt)}</dd>

        {result.reviewedAt && (
          <>
            <dt>Decided</dt>
            <dd>{day(result.reviewedAt)}</dd>
          </>
        )}
      </dl>

      {result.status === "pending" && !result.overdue && (
        <p>
          Your submission is pending approval. The executives aim to decide by{" "}
          {when(result.decisionDueBy)}.
        </p>
      )}

      {result.status === "pending" && result.overdue && (
        <p>
          This is taking longer than the usual 24 hours. Please contact the
          society&rsquo;s executives and quote your reference code.
        </p>
      )}

      {result.status === "approved" && (
        <p>Your membership is confirmed. Welcome to SRIS.</p>
      )}

      {result.status === "rejected" && (
        <p>
          Your submission was not approved. Please contact the society&rsquo;s
          executives and quote your reference code so they can help.
        </p>
      )}
    </div>
  );
}

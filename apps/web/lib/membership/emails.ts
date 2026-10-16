import type { EmailMessage } from "@/lib/email";
import { escapeHtml, singleLine } from "@/lib/text";

import { CATEGORIES, formatKina } from "./categories";
import type { MembershipPeriod, RegistrationDoc } from "./types";

const shell = (inner: string) => `
  <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#202124">
    ${inner}
    <p style="color:#595959;font-size:13px;margin-top:24px">UPNG Science, Research &amp; Innovation Society</p>
  </div>`;

function when(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Pacific/Port_Moresby",
  }).format(new Date(value));
}

/** Sent to the person who registered or renewed. */
export function applicantConfirmation(
  registration: RegistrationDoc,
  period: MembershipPeriod,
): EmailMessage {
  const category = CATEGORIES[registration.category].label;
  const renewal = registration.kind === "renewal";

  const heading = renewal ? "We have your renewal" : "We have your registration";

  const lines = [
    `${heading}, ${registration.profile.firstName}.`,
    "",
    `Reference: ${registration.referenceCode}`,
    `Membership: ${category}, ${period.title}`,
    `Fee: ${formatKina(registration.fee)}`,
    `Payment submitted: ${formatKina(registration.payment.amountPaid)} by ${registration.payment.method} (receipt ${registration.payment.reference})`,
    "",
    "Status: Pending approval.",
    `The executives will check your payment and confirm within 24 hours (by ${when(registration.decisionDueBy)}).`,
    "",
    "You can check your status at any time with your reference and email address on the membership status page.",
  ];

  return {
    to: [registration.profile.email],
    subject: singleLine(`[SRIS] ${heading} (${registration.referenceCode})`),
    text: lines.join("\n"),
    html: shell(`
      <p><strong>${escapeHtml(heading)}, ${escapeHtml(registration.profile.firstName)}.</strong></p>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Reference</strong></td><td>${escapeHtml(registration.referenceCode)}</td></tr>
        <tr><td><strong>Membership</strong></td><td>${escapeHtml(category)}, ${escapeHtml(period.title)}</td></tr>
        <tr><td><strong>Fee</strong></td><td>${escapeHtml(formatKina(registration.fee))}</td></tr>
        <tr><td><strong>Payment submitted</strong></td><td>${escapeHtml(formatKina(registration.payment.amountPaid))} by ${escapeHtml(registration.payment.method)} (receipt ${escapeHtml(registration.payment.reference)})</td></tr>
      </table>
      <p><strong>Status: Pending approval.</strong><br>
      The executives will check your payment and confirm within 24 hours (by ${escapeHtml(when(registration.decisionDueBy))}).</p>
      <p>You can check your status at any time with your reference and email address on the membership status page.</p>`),
  };
}

/** Sent to the society so someone checks the payment. */
export function executiveNotification(
  registration: RegistrationDoc,
  period: MembershipPeriod,
  to: string[],
): EmailMessage {
  const p = registration.profile;
  const category = CATEGORIES[registration.category].label;
  const kind = registration.kind === "renewal" ? "Renewal" : "New registration";

  const mismatch = registration.payment.amountMatchesFee
    ? ""
    : ` (does NOT match the ${formatKina(registration.fee)} fee)`;

  const lines = [
    `${kind} awaiting approval: ${p.firstName} ${p.lastName}`,
    "",
    `Reference: ${registration.referenceCode}`,
    `Category: ${category}`,
    `Period: ${period.title}`,
    `Name: ${p.firstName} ${p.lastName}`,
    `Email: ${p.email}`,
    `Fee: ${formatKina(registration.fee)}`,
    `Amount paid: ${formatKina(registration.payment.amountPaid)}${mismatch}`,
    `Method: ${registration.payment.method}`,
    `Receipt / transaction: ${registration.payment.reference}`,
    `Paid on: ${registration.payment.paidOn}`,
    registration.payment.proof
      ? `Proof of payment: uploaded (${registration.payment.proof.fileName}); open the registration in Sanity Studio to view it.`
      : "Proof of payment: none uploaded.",
    "",
    `Decision due by ${when(registration.decisionDueBy)}.`,
    "Approve or reject it in Sanity Studio, under Records, Registrations.",
  ];

  return {
    to,
    replyTo: p.email,
    subject: singleLine(`[SRIS membership] ${kind}: ${p.firstName} ${p.lastName} (${registration.referenceCode})`),
    text: lines.join("\n"),
    html: shell(
      `<p><strong>${escapeHtml(kind)} awaiting approval</strong></p>` +
        `<pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(lines.slice(2).join("\n"))}</pre>`,
    ),
  };
}

/** Sent to a member who asked to renew. */
export function renewalLink(
  email: string,
  firstName: string,
  link: string,
  minutes: number,
): EmailMessage {
  return {
    to: [email],
    subject: "[SRIS] Your membership renewal link",
    text: [
      `Hello ${firstName},`,
      "",
      `Use this link to renew your SRIS membership. It is valid for the next ${minutes} minutes and only for your own details:`,
      "",
      link,
      "",
      "If you did not ask to renew, you can ignore this email; nothing will change.",
    ].join("\n"),
    html: shell(`
      <p>Hello ${escapeHtml(firstName)},</p>
      <p>Use this link to renew your SRIS membership. It is valid for the next ${minutes} minutes and only for your own details:</p>
      <p><a href="${escapeHtml(link)}">Renew my membership</a></p>
      <p style="color:#595959">If you did not ask to renew, you can ignore this email; nothing will change.</p>`),
  };
}

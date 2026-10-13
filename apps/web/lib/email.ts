import "server-only";

/**
 * Transactional email through Resend's REST API.
 *
 * It is a single HTTPS call, so there is no SDK to install or keep patched.
 * To use a different provider (SMTP, SES, Postmark…), replace
 * `sendEmail` and keep the same signature; nothing else depends on Resend.
 *
 * Configuration (all server-side, see .env.example):
 *   RESEND_API_KEY   API key from resend.com
 *   CONTACT_FROM     a sender on a domain verified in Resend,
 *                    e.g. "SRIS Website <no-reply@your-domain>"
 *   CONTACT_TO       who is notified; one address or a comma-separated list
 */

/** Overridable (RESEND_API_URL) only so tests can point at a local fake. */
const RESEND_URL = "https://api.resend.com/emails";

export type EmailMessage = {
  to: string[];
  subject: string;
  text: string;
  html: string;
  /** Replies go to the visitor, not to the no-reply sender. */
  replyTo?: string;
};

function addressList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

/** The sending side only: enough to email anyone (a member, an applicant). */
export function senderConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM?.trim();

  return apiKey && from ? { apiKey, from } : null;
}

/** Who the society itself is notified at, for enquiries and registrations. */
export function notifyList(override?: string) {
  const list = addressList(override);

  return list.length > 0 ? list : addressList(process.env.CONTACT_TO);
}

export function emailConfig() {
  const sender = senderConfig();
  const to = notifyList();

  if (!sender || to.length === 0) {
    return null;
  }

  return { ...sender, to };
}

/** True when enough is configured to send a notification. */
export const emailConfigured = () => emailConfig() !== null;

/**
 * Sends one email. Resolves to true on success and false on any failure, and
 * never throws: a notification problem must not lose or reject the message
 * the visitor already sent.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const config = senderConfig();

  if (!config) {
    return false;
  }

  try {
    const response = await fetch(process.env.RESEND_API_URL || RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo,
      }),
      // A slow provider must not hold the form open indefinitely.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(
        `[email] Resend responded ${response.status}: ${(await response.text()).slice(0, 300)}`,
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error("[email] Could not reach Resend:", error);

    return false;
  }
}

export { escapeHtml, singleLine } from "./text";

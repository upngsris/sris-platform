import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

/**
 * Member identifiers and renewal links are derived with a server secret
 * (MEMBERSHIP_SECRET). The same email always maps to the same member, which is
 * what makes duplicate registrations impossible at the database level, but
 * without the secret nobody can compute the identifier for a known email
 * address, and the identifier reveals nothing about the email.
 */

export const MIN_SECRET_LENGTH = 32;

export function secretUsable(secret: string | undefined): secret is string {
  return typeof secret === "string" && secret.length >= MIN_SECRET_LENGTH;
}

const base64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64url");

function hmac(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest();
}

/** A stable, non-reversible key for an (already normalised) email address. */
export function memberKey(email: string, secret: string) {
  return hmac(secret, `member:${email}`).toString("hex").slice(0, 40);
}

export const memberId = (key: string) => `member-${key}`;

/** One registration per member per period: the id itself enforces it. */
export function registrationId(key: string, periodId: string) {
  return `registration-${key}-${periodId.replace(/[^A-Za-z0-9_-]/g, "_")}`;
}

const REFERENCE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Short code an applicant quotes when checking their status, e.g. SRIS-26-7KQ3M. */
export function newReferenceCode(periodStartYear: number) {
  const bytes = randomBytes(5);

  const suffix = Array.from(
    bytes,
    (byte) => REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length],
  ).join("");

  return `SRIS-${String(periodStartYear).slice(-2)}-${suffix}`;
}

export function normalizeReferenceCode(value: string | undefined) {
  return (value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

/* ------------------------------------------------------------------ *
 * Renewal links
 *
 * A link carries the member key, an expiry and a purpose, signed with the
 * secret. It proves the holder received an email at the member's address; it
 * grants nothing else and expires quickly. Nothing is stored server-side.
 * ------------------------------------------------------------------ */

export const RENEWAL_LINK_MINUTES = 30;

type TokenPayload = { k: string; e: number; p: "renew" };

export function signRenewalToken(
  key: string,
  secret: string,
  now: Date,
  minutes = RENEWAL_LINK_MINUTES,
) {
  const payload: TokenPayload = {
    k: key,
    e: Math.floor(now.getTime() / 1000) + minutes * 60,
    p: "renew",
  };

  const body = base64url(JSON.stringify(payload));

  return `${body}.${base64url(hmac(secret, `token:${body}`))}`;
}

export type TokenCheck =
  | { ok: true; key: string }
  | { ok: false; reason: "malformed" | "invalid" | "expired" };

export function verifyRenewalToken(
  token: string,
  secret: string,
  now: Date,
): TokenCheck {
  const [body, signature, extra] = token.split(".");

  if (!body || !signature || extra !== undefined) {
    return { ok: false, reason: "malformed" };
  }

  const expected = base64url(hmac(secret, `token:${body}`));

  if (!safeEqual(signature, expected)) {
    return { ok: false, reason: "invalid" };
  }

  let payload: TokenPayload;

  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (payload.p !== "renew" || typeof payload.k !== "string") {
    return { ok: false, reason: "invalid" };
  }

  if (Math.floor(now.getTime() / 1000) > payload.e) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, key: payload.k };
}

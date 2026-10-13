"use server";

import { getCurrentPeriod } from "@/lib/membership/period-source";
import {
  clientKey,
  limited,
  membershipDeps,
  readForm,
  readProof,
  TOO_MANY_MESSAGE,
  UNAVAILABLE_MESSAGE,
} from "@/lib/membership/runtime";
import {
  lookupStatus,
  register,
  requestRenewalLink,
  submitRenewal,
} from "@/lib/membership/service";
import type { MembershipFormState } from "@/lib/membership/form-state";

const error = (message: string, raw?: Record<string, string>): MembershipFormState => ({
  status: "error",
  message,
  values: raw,
});

/*
 * Per-address limits are deliberately generous: at orientation a whole campus
 * can share one public address, so these only stop a flood from a single
 * source. The limits that protect people are per email (renewal links) and the
 * database itself, which refuses a second registration for the same email.
 */

/** The hidden field real people never fill in. A bot that does gets a
 *  success-looking answer and nothing is written. */
const botCaught = (raw: Record<string, string>): MembershipFormState | null =>
  raw.organisation ? { status: "success", message: "Thank you." } : null;

export async function registerAction(
  _previous: MembershipFormState,
  formData: FormData,
): Promise<MembershipFormState> {
  const raw = readForm(formData);

  const bot = botCaught(raw);

  if (bot) {
    return bot;
  }

  if (limited(`register:${await clientKey()}`, 40, 15)) {
    return error(TOO_MANY_MESSAGE, raw);
  }

  const deps = await membershipDeps();

  if (!deps) {
    return error(UNAVAILABLE_MESSAGE, raw);
  }

  return register(raw, await getCurrentPeriod(), deps, await readProof(formData));
}

export async function renewalLinkAction(
  _previous: MembershipFormState,
  formData: FormData,
): Promise<MembershipFormState> {
  const raw = readForm(formData);

  const bot = botCaught(raw);

  if (bot) {
    return bot;
  }

  // Per client, and per address so one inbox cannot be flooded with links.
  const email = (raw.email ?? "").trim().toLowerCase();

  if (
    limited(`renew-link:${await clientKey()}`, 30, 15) ||
    limited(`renew-link-to:${email}`, 3, 15)
  ) {
    return error(TOO_MANY_MESSAGE, raw);
  }

  const deps = await membershipDeps();

  if (!deps) {
    return error(UNAVAILABLE_MESSAGE, raw);
  }

  return requestRenewalLink(raw.email, await getCurrentPeriod(), deps);
}

export async function renewalSubmitAction(
  _previous: MembershipFormState,
  formData: FormData,
): Promise<MembershipFormState> {
  const raw = readForm(formData);

  const bot = botCaught(raw);

  if (bot) {
    return bot;
  }

  if (limited(`renew:${await clientKey()}`, 40, 15)) {
    return error(TOO_MANY_MESSAGE, raw);
  }

  const deps = await membershipDeps();

  if (!deps) {
    return error(UNAVAILABLE_MESSAGE, raw);
  }

  return submitRenewal(
    raw.token ?? "",
    raw,
    await getCurrentPeriod(),
    deps,
    await readProof(formData),
  );
}

export async function statusAction(
  _previous: MembershipFormState,
  formData: FormData,
): Promise<MembershipFormState> {
  const raw = readForm(formData);

  // Guessing reference codes is the only way to abuse this, so it is limited
  // tightly.
  if (limited(`status:${await clientKey()}`, 30, 10)) {
    return error(TOO_MANY_MESSAGE, raw);
  }

  const deps = await membershipDeps();

  if (!deps) {
    return error(UNAVAILABLE_MESSAGE, raw);
  }

  return lookupStatus(raw.referenceCode, raw.email, deps);
}

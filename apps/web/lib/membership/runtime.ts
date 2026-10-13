import "server-only";

import { headers } from "next/headers";

import { notifyList, sendEmail } from "@/lib/email";
import { rateLimited } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/seo";
import { privateStoreReady } from "@/sanity/lib/private-client";

import { secretUsable } from "./crypto";
import { MAX_PROOF_BYTES, type ProofInput } from "./proof";
import type { Deps } from "./service";
import { sanityStore } from "./sanity-store";

/** Shown whenever the site is not set up to hold member data safely. */
export const UNAVAILABLE_MESSAGE =
  "Online membership is temporarily unavailable. Please contact the society's executives and they will help you directly.";

/**
 * Wires the real store, mailer, clock and secret into the membership
 * service. Returns null, and logs why, when the site is not configured to
 * store personal data safely (no secret, no private dataset, or a dataset
 * that turns out to be publicly readable); callers then refuse the request.
 */
export async function membershipDeps(): Promise<Deps | null> {
  const secret = process.env.MEMBERSHIP_SECRET;

  if (!secretUsable(secret)) {
    console.error("[membership] MEMBERSHIP_SECRET is missing or shorter than 32 characters.");

    return null;
  }

  if (!(await privateStoreReady())) {
    console.error("[membership] The private Sanity dataset is not ready; refusing to continue.");

    return null;
  }

  return {
    store: sanityStore,
    secret,
    now: () => new Date(),
    send: sendEmail,
    notifyTo: notifyList(process.env.MEMBERSHIP_NOTIFY_TO),
    siteUrl,
  };
}

/** Best-effort client address, used only as a rate-limit key. */
export async function clientKey() {
  const requestHeaders = await headers();

  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

export const TOO_MANY_MESSAGE =
  "Too many attempts. Please wait a few minutes and try again, or contact the society's executives.";

export function limited(key: string, limit: number, minutes: number) {
  return rateLimited(key, { limit, windowMs: minutes * 60 * 1000 });
}

/**
 * The optional proof-of-payment file from a form, or undefined if none was
 * chosen. A file over the limit is not read into memory at all; it is passed
 * on with no bytes and the size check refuses it.
 */
export async function readProof(formData: FormData): Promise<ProofInput | undefined> {
  const file = formData.get("proof");

  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }

  if (file.size > MAX_PROOF_BYTES) {
    return { name: file.name, size: file.size, bytes: new Uint8Array() };
  }

  return {
    name: file.name,
    size: file.size,
    bytes: new Uint8Array(await file.arrayBuffer()),
  };
}

/** FormData to a plain object of strings, with each value capped in length. */
export function readForm(formData: FormData) {
  const raw: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) {
      raw[key] = value.slice(0, 2000);
    }
  }

  return raw;
}

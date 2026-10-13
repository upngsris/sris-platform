import type { EmailMessage } from "@/lib/email";

import { CATEGORIES, feeFor, isCategory } from "./categories";
import {
  memberId,
  memberKey,
  newReferenceCode,
  normalizeReferenceCode,
  registrationId,
  RENEWAL_LINK_MINUTES,
  safeEqual,
  signRenewalToken,
  verifyRenewalToken,
} from "./crypto";
import {
  applicantConfirmation,
  executiveNotification,
  renewalLink,
} from "./emails";
import type { MembershipFormState, Receipt, StatusResult } from "./form-state";
import { periodWindows } from "./period";
import { checkProof, type ProofInput } from "./proof";
import type { MembershipStore } from "./store";
import type {
  MemberCategory,
  MemberDoc,
  MemberProfile,
  MembershipPeriod,
  RegistrationDoc,
} from "./types";
import {
  normalizeEmail,
  termsAccepted,
  validatePayment,
  validateProfile,
  type RawInput,
} from "./validate";

/**
 * The membership rules, free of any framework or database so they can be
 * tested directly. The server actions wire in the real store, mailer, clock
 * and secret.
 */
export type Deps = {
  store: MembershipStore;
  secret: string;
  now: () => Date;
  /** Best-effort email; resolves to whether it was accepted for delivery. */
  send: (message: EmailMessage) => Promise<boolean>;
  /** Who in the society is told about each submission. */
  notifyTo: string[];
  /** Public origin, used to build the renewal link. */
  siteUrl: string;
};

const DECISION_WINDOW_MS = 24 * 60 * 60 * 1000;

export const SAVE_FAILED_MESSAGE =
  "Something went wrong saving your submission. Please try again, or contact the society's executives.";

export const CLOSED_MESSAGE =
  "Online registration is closed. If you would still like to join, please contact the society's executives about late registration.";

const error = (
  message: string,
  extra: Partial<MembershipFormState> = {},
): MembershipFormState => ({ status: "error", message, ...extra });

function periodStartYear(period: MembershipPeriod, now: Date) {
  const start = new Date(period.membershipStarts);

  return Number.isNaN(start.getTime()) ? now.getUTCFullYear() : start.getUTCFullYear();
}

function receiptFor(registration: RegistrationDoc, emailed: boolean): Receipt {
  return {
    referenceCode: registration.referenceCode,
    kind: registration.kind,
    category: registration.category,
    periodTitle: registration.periodTitle,
    fee: registration.fee,
    amountPaid: registration.payment.amountPaid,
    amountMatchesFee: registration.payment.amountMatchesFee,
    proofReceived: Boolean(registration.payment.proof),
    status: registration.status,
    decisionDueBy: registration.decisionDueBy,
    emailed,
  };
}

function pickValues(raw: RawInput) {
  const values: Record<string, string> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && key !== "terms") {
      values[key] = value;
    }
  }

  return values;
}

async function buildRegistration(args: {
  deps: Deps;
  period: MembershipPeriod;
  kind: "new" | "renewal";
  category: MemberCategory;
  profile: MemberProfile;
  payment: NonNullable<ReturnType<typeof validatePayment>["payment"]>;
  key: string;
  proof?: { assetId: string; fileName: string };
}): Promise<RegistrationDoc> {
  const { deps, period, kind, category, profile, payment, key, proof } = args;
  const now = deps.now();
  const fee = feeFor(category, period);

  return {
    _id: registrationId(key, period._id),
    _type: "membershipRegistration",
    referenceCode: newReferenceCode(periodStartYear(period, now)),
    kind,
    member: { _type: "reference", _ref: memberId(key) },
    periodId: period._id,
    periodTitle: period.title,
    category,
    fee,
    profile,
    payment: {
      ...payment,
      amountMatchesFee: payment.amountPaid === fee,
      ...(proof
        ? {
            proof: {
              _type: "file" as const,
              asset: { _type: "reference" as const, _ref: proof.assetId },
              fileName: proof.fileName,
            },
          }
        : {}),
    },
    status: "pending",
    submittedAt: now.toISOString(),
    decisionDueBy: new Date(now.getTime() + DECISION_WINDOW_MS).toISOString(),
  };
}

type UploadedProof = { assetId: string; fileName: string };

/**
 * Stores the proof file privately. Returns null when there is none, the
 * uploaded file's details on success, or "failed" if the upload did not work.
 */
async function storeProof(
  deps: Deps,
  proof: ProofInput | undefined,
): Promise<UploadedProof | null | "failed"> {
  if (!proof) {
    return null;
  }

  const check = checkProof(proof);

  if (!check.ok) {
    return "failed";
  }

  try {
    const assetId = await deps.store.uploadProof({
      filename: check.filename,
      contentType: check.contentType,
      bytes: proof.bytes,
    });

    return { assetId, fileName: check.filename };
  } catch (cause) {
    console.error("[membership] Could not upload proof of payment:", cause);

    return "failed";
  }
}

/** A file that was uploaded but not used must not be left behind. */
async function discardProof(deps: Deps, uploaded: UploadedProof | null) {
  if (!uploaded) {
    return;
  }

  try {
    await deps.store.deleteAsset(uploaded.assetId);
  } catch (cause) {
    console.error("[membership] Could not remove an unused upload:", cause);
  }
}

async function notify(
  deps: Deps,
  registration: RegistrationDoc,
  period: MembershipPeriod,
) {
  // Email problems are never the applicant's: their submission is already
  // saved. The receipt records whether the confirmation went out.
  const [emailed] = await Promise.all([
    deps.send(applicantConfirmation(registration, period)),
    deps.notifyTo.length > 0
      ? deps.send(executiveNotification(registration, period, deps.notifyTo))
      : Promise.resolve(false),
  ]);

  return emailed;
}

/* ------------------------------------------------------------------ */
/* New registration                                                    */
/* ------------------------------------------------------------------ */

export async function register(
  raw: RawInput,
  period: MembershipPeriod | null,
  deps: Deps,
  proof?: ProofInput,
): Promise<MembershipFormState> {
  const now = deps.now();
  const values = pickValues(raw);

  // Enforced here as well as in the page: a form left open in a tab, or a
  // hand-made request, must not get through once registration has closed.
  if (!period || periodWindows(period, now).registration !== "open") {
    return error(CLOSED_MESSAGE, { values });
  }

  if (!isCategory(raw.category)) {
    return error("Please choose a membership category.", { values });
  }

  const category = raw.category;

  const profileCheck = validateProfile(raw, category, now);
  const paymentCheck = validatePayment(raw, period, now);

  const fieldErrors = { ...profileCheck.errors, ...paymentCheck.errors };

  if (!termsAccepted(raw)) {
    fieldErrors.terms = "Please confirm you accept the membership terms.";
  }

  const proofCheck = proof ? checkProof(proof) : null;

  if (proofCheck && !proofCheck.ok) {
    fieldErrors.proof = proofCheck.message;
  }

  if (!profileCheck.profile || !paymentCheck.payment || Object.keys(fieldErrors).length > 0) {
    return error("Please check the highlighted fields.", { fieldErrors, values });
  }

  const key = memberKey(profileCheck.profile.email, deps.secret);

  // Friendly early answer; the transaction below is what actually guarantees
  // uniqueness, even if two submissions race.
  if (await deps.store.getMember(memberId(key))) {
    return error(
      "A membership already exists for that email address. If you were a member before, please renew instead; if you have already registered this year, check your status with your reference code.",
      { values },
    );
  }

  const uploaded = await storeProof(deps, proof);

  if (uploaded === "failed") {
    return error(
      "We could not upload your file. Please try again, or submit without it and send the receipt to the executives.",
      { fieldErrors: { proof: "The upload failed. Please choose the file again." }, values },
    );
  }

  const registration = await buildRegistration({
    deps,
    period,
    kind: "new",
    category,
    profile: profileCheck.profile,
    payment: paymentCheck.payment,
    key,
    proof: uploaded ?? undefined,
  });

  const member: MemberDoc = {
    ...profileCheck.profile,
    _id: memberId(key),
    _type: "member",
    category,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  let outcome: "created" | "exists";

  try {
    outcome = await deps.store.createMemberWithRegistration(member, registration);
  } catch (cause) {
    console.error("[membership] Could not save a registration:", cause);
    await discardProof(deps, uploaded);

    return error(SAVE_FAILED_MESSAGE, { values });
  }

  if (outcome === "exists") {
    await discardProof(deps, uploaded);

    return error(
      "A registration for that email address was just received. Check your status with your reference code, or contact the executives if you need help.",
      { values },
    );
  }

  const emailed = await notify(deps, registration, period);

  return { status: "success", receipt: receiptFor(registration, emailed) };
}

/* ------------------------------------------------------------------ */
/* Renewal                                                             */
/* ------------------------------------------------------------------ */

/**
 * Emails a renewal link to a member. The answer is the same whether or not
 * the address belongs to a member, so this cannot be used to find out who is
 * registered.
 */
export async function requestRenewalLink(
  emailRaw: string | undefined,
  period: MembershipPeriod | null,
  deps: Deps,
): Promise<MembershipFormState> {
  const now = deps.now();

  if (!period || periodWindows(period, now).renewals !== "open") {
    return error(
      "Renewals are closed. If you would still like to renew, please contact the society's executives about late renewal.",
    );
  }

  const email = normalizeEmail(emailRaw);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
    return error("Please enter the email address you registered with.", {
      fieldErrors: { email: "Please enter a valid email address." },
      values: { email: emailRaw ?? "" },
    });
  }

  const key = memberKey(email, deps.secret);
  const member = await deps.store.getMember(memberId(key));

  if (
    member &&
    (await deps.store.hasApprovedRegistration(member._id, period._id)) &&
    !(await deps.store.getRegistration(registrationId(key, period._id)))
  ) {
    const token = signRenewalToken(key, deps.secret, now);

    await deps.send(
      renewalLink(
        member.email,
        member.firstName,
        `${deps.siteUrl}/community/membership/renew/${token}`,
        RENEWAL_LINK_MINUTES,
      ),
    );
  }

  return {
    status: "success",
    message:
      "If that email address belongs to a member who can renew, we have sent a renewal link to it. The link is valid for 30 minutes. Check your spam folder if it does not arrive.",
  };
}

export type RenewalContext =
  | { state: "invalid"; reason: "malformed" | "invalid" | "expired" | "unknown" }
  | { state: "closed" }
  | {
      state: "already";
      referenceCode: string;
      periodTitle: string;
    }
  | {
      state: "ready";
      member: MemberDoc;
      fee: number;
      key: string;
    };

/** Resolves a renewal link to the member's saved profile. */
export async function loadRenewal(
  token: string,
  period: MembershipPeriod | null,
  deps: Deps,
): Promise<RenewalContext> {
  const now = deps.now();
  const check = verifyRenewalToken(token, deps.secret, now);

  if (!check.ok) {
    return { state: "invalid", reason: check.reason };
  }

  if (!period || periodWindows(period, now).renewals !== "open") {
    return { state: "closed" };
  }

  const member = await deps.store.getMember(memberId(check.key));

  if (!member) {
    return { state: "invalid", reason: "unknown" };
  }

  const existing = await deps.store.getRegistration(registrationId(check.key, period._id));

  if (existing) {
    return {
      state: "already",
      referenceCode: existing.referenceCode,
      periodTitle: existing.periodTitle,
    };
  }

  return { state: "ready", member, fee: feeFor(member.category, period), key: check.key };
}

export async function submitRenewal(
  token: string,
  raw: RawInput,
  period: MembershipPeriod | null,
  deps: Deps,
  proof?: ProofInput,
): Promise<MembershipFormState> {
  const now = deps.now();
  const values = pickValues(raw);
  const context = await loadRenewal(token, period, deps);

  if (context.state === "closed" || !period) {
    return error(
      "Renewals are closed. Please contact the society's executives about late renewal.",
      { values },
    );
  }

  if (context.state === "invalid") {
    return error(
      context.reason === "expired"
        ? "This renewal link has expired. Please request a new one."
        : "This renewal link is not valid. Please request a new one.",
      { values },
    );
  }

  if (context.state === "already") {
    return error(
      `You have already renewed for ${context.periodTitle} (reference ${context.referenceCode}).`,
      { values },
    );
  }

  const { member, key } = context;
  const definition = CATEGORIES[member.category];

  const profileCheck = validateProfile(raw, member.category, now, {
    existing: member,
    editable: definition.renewalEditable,
  });
  const paymentCheck = validatePayment(raw, period, now);

  const fieldErrors = { ...profileCheck.errors, ...paymentCheck.errors };

  if (!termsAccepted(raw)) {
    fieldErrors.terms = "Please confirm you accept the membership terms.";
  }

  const proofCheck = proof ? checkProof(proof) : null;

  if (proofCheck && !proofCheck.ok) {
    fieldErrors.proof = proofCheck.message;
  }

  if (!profileCheck.profile || !paymentCheck.payment || Object.keys(fieldErrors).length > 0) {
    return error("Please check the highlighted fields.", { fieldErrors, values });
  }

  const uploaded = await storeProof(deps, proof);

  if (uploaded === "failed") {
    return error(
      "We could not upload your file. Please try again, or submit without it and send the receipt to the executives.",
      { fieldErrors: { proof: "The upload failed. Please choose the file again." }, values },
    );
  }

  const registration = await buildRegistration({
    deps,
    period,
    kind: "renewal",
    category: member.category,
    profile: profileCheck.profile,
    payment: paymentCheck.payment,
    key,
    proof: uploaded ?? undefined,
  });

  // Only the fields a member may edit are written back to their profile.
  const changes: Partial<MemberProfile> & { updatedAt: string } = {
    updatedAt: now.toISOString(),
  };

  for (const name of definition.renewalEditable) {
    const value = profileCheck.profile[name];

    if (value !== undefined) {
      (changes as Record<string, unknown>)[name] = value;
    }
  }

  let outcome: "created" | "exists";

  try {
    outcome = await deps.store.renewMember(member._id, changes, registration);
  } catch (cause) {
    console.error("[membership] Could not save a renewal:", cause);
    await discardProof(deps, uploaded);

    return error(SAVE_FAILED_MESSAGE, { values });
  }

  if (outcome === "exists") {
    await discardProof(deps, uploaded);

    return error("A renewal for this period was just received. Check your status with your reference code.", { values });
  }

  const emailed = await notify(deps, registration, period);

  return { status: "success", receipt: receiptFor(registration, emailed) };
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

const NOT_FOUND =
  "We could not find a registration with that reference and email address. Check both and try again, or contact the society's executives.";

export async function lookupStatus(
  codeRaw: string | undefined,
  emailRaw: string | undefined,
  deps: Deps,
): Promise<MembershipFormState> {
  const code = normalizeReferenceCode(codeRaw);
  const email = normalizeEmail(emailRaw);

  if (!/^SRIS-\d{2}-[A-Z0-9]{5}$/.test(code) || !email) {
    return error(NOT_FOUND, { values: { referenceCode: codeRaw ?? "", email: emailRaw ?? "" } });
  }

  const registration = await deps.store.findRegistrationByCode(code);

  // The email must belong to the member the registration is linked to; a
  // wrong email looks exactly like a wrong code.
  if (
    !registration ||
    !safeEqual(registration.member._ref, memberId(memberKey(email, deps.secret)))
  ) {
    return error(NOT_FOUND, { values: { referenceCode: codeRaw ?? "", email: emailRaw ?? "" } });
  }

  const now = deps.now();

  const result: StatusResult = {
    referenceCode: registration.referenceCode,
    kind: registration.kind,
    category: registration.category,
    periodTitle: registration.periodTitle,
    status: registration.status,
    submittedAt: registration.submittedAt,
    decisionDueBy: registration.decisionDueBy,
    reviewedAt: registration.reviewedAt,
    overdue:
      registration.status === "pending" &&
      now > new Date(registration.decisionDueBy),
  };

  return { status: "success", statusResult: result };
}

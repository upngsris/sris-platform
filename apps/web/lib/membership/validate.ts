import { CATEGORIES, YEARS_OF_STUDY, type FieldDef } from "./categories";
import type {
  MemberCategory,
  MemberProfile,
  MembershipPeriod,
  PaymentSubmission,
} from "./types";

export type RawInput = Record<string, string | undefined>;

export type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._/#-]{2,59}$/;

/** UPNG opened in 1965; nobody graduated before then. */
const EARLIEST_GRADUATION_YEAR = 1966;

const SRIS_TIME_ZONE = "Pacific/Port_Moresby";

export function normalizeEmail(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function clean(value: string | undefined) {
  // Collapse whitespace and drop control characters; never trust the browser.
  return (value ?? "")
    .replace(/[\p{C}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when a value could be a payment card number: 13 to 19 digits that
 * pass the Luhn check. Card numbers must never be collected or stored, so
 * any free-text payment field that looks like one is refused.
 */
export function looksLikeCardNumber(value: string) {
  const digits = value.replace(/[\s-]/g, "");

  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let double = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (double) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

/** Today's date in Port Moresby, as YYYY-MM-DD. */
export function todayInPortMoresby(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SRIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function validateName(label: string, raw: string | undefined, errors: FieldErrors, key: string) {
  const value = clean(raw);

  if (value.length < 1 || value.length > 60 || !NAME_PATTERN.test(value)) {
    errors[key] = `Please enter your ${label}.`;
  }

  return value;
}

function validateField(
  field: FieldDef,
  raw: string | undefined,
  now: Date,
  errors: FieldErrors,
): string | number | undefined {
  const value = clean(raw);

  if (field.kind === "select") {
    if (!field.options?.includes(value)) {
      errors[field.name] = `Please choose your ${field.label.toLowerCase()}.`;

      return undefined;
    }

    return value;
  }

  if (field.kind === "year") {
    const year = Number(value);
    const latest = Number(todayInPortMoresby(now).slice(0, 4));

    if (!/^\d{4}$/.test(value) || year < EARLIEST_GRADUATION_YEAR || year > latest) {
      errors[field.name] = `Please enter a year between ${EARLIEST_GRADUATION_YEAR} and ${latest}.`;

      return undefined;
    }

    return year;
  }

  if (value.length < 2 || value.length > 100) {
    errors[field.name] = `Please enter your ${field.label.toLowerCase()} (2 to 100 characters).`;

    return undefined;
  }

  return value;
}

/**
 * Validates the profile part of a form for one category. For a renewal,
 * `existing` is the saved profile and only the fields in `editable` are read
 * from the form; everything else is carried over unchanged.
 */
export function validateProfile(
  raw: RawInput,
  category: MemberCategory,
  now: Date,
  options: { existing?: MemberProfile; editable?: readonly FieldDef["name"][] } = {},
): { profile?: MemberProfile; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const definition = CATEGORIES[category];
  const { existing, editable } = options;

  const firstName = existing
    ? existing.firstName
    : validateName("first name", raw.firstName, errors, "firstName");

  const lastName = existing
    ? existing.lastName
    : validateName("last name", raw.lastName, errors, "lastName");

  let email = existing?.email ?? "";

  if (!existing) {
    email = normalizeEmail(raw.email);

    if (!EMAIL_PATTERN.test(email) || email.length > 200) {
      errors.email = `Please enter a valid ${definition.emailLabel.toLowerCase()}.`;
    }
  }

  const profile: MemberProfile = { ...(existing ?? { firstName, lastName, email }) };

  profile.firstName = firstName;
  profile.lastName = lastName;
  profile.email = email;

  for (const field of definition.fields) {
    // On a renewal only the editable fields come from the form.
    if (existing && !editable?.includes(field.name)) {
      continue;
    }

    const value = validateField(field, raw[field.name], now, errors);

    if (value !== undefined) {
      (profile as Record<string, unknown>)[field.name] = value;
    }
  }

  return Object.keys(errors).length > 0 ? { errors } : { profile, errors };
}

export function validatePayment(
  raw: RawInput,
  period: Pick<MembershipPeriod, "paymentMethods">,
  now: Date,
): { payment?: PaymentSubmission; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const method = clean(raw.paymentMethod);
  const labels = (period.paymentMethods ?? []).map((entry) => entry.label);

  if (!labels.includes(method)) {
    errors.paymentMethod = "Please choose how you paid.";
  }

  const amountText = clean(raw.amountPaid);
  const amountPaid = Number(amountText);

  if (!/^\d{1,5}(\.\d{1,2})?$/.test(amountText) || !(amountPaid > 0) || amountPaid > 10000) {
    errors.amountPaid = "Please enter the amount you paid in kina, for example 15 or 15.50.";
  }

  const reference = clean(raw.paymentReference);

  if (looksLikeCardNumber(reference)) {
    errors.paymentReference =
      "That looks like a card number. Never enter card details here; use the receipt or transaction number from your bank or mobile-money payment.";
  } else if (!REFERENCE_PATTERN.test(reference)) {
    errors.paymentReference =
      "Please enter the receipt or transaction reference from your payment (3 to 60 letters, numbers or . _ / # -).";
  }

  const paidOn = clean(raw.paidOn);
  const today = todayInPortMoresby(now);

  const oldest = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000);
  const earliest = todayInPortMoresby(oldest);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn) || Number.isNaN(new Date(paidOn).getTime())) {
    errors.paidOn = "Please enter the date you paid.";
  } else if (paidOn > today) {
    errors.paidOn = "The payment date cannot be in the future.";
  } else if (paidOn < earliest) {
    errors.paidOn = "That payment date is too long ago. Please check it.";
  }

  const payerName = clean(raw.payerName);

  if (payerName && (payerName.length > 100 || looksLikeCardNumber(payerName))) {
    errors.payerName = "Please enter the name on the payment (up to 100 characters).";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    payment: {
      method,
      amountPaid,
      reference,
      paidOn,
      ...(payerName ? { payerName } : {}),
    },
    errors,
  };
}

export function termsAccepted(raw: RawInput) {
  return ["on", "yes", "true", "1"].includes((raw.terms ?? "").toLowerCase());
}

export { YEARS_OF_STUDY };

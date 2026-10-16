import type { MembershipPeriod } from "./types";

export type WindowState = "unconfigured" | "upcoming" | "open" | "closed";

export type PeriodWindows = {
  registration: WindowState;
  renewals: WindowState;
  registrationOpens: Date | null;
  registrationCloses: Date | null;
  renewalsOpen: Date | null;
  renewalsClose: Date | null;
};

function parse(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function stateFor(
  opens: Date | null,
  closes: Date | null,
  now: Date,
  override: MembershipPeriod["registrationOverride"],
): WindowState {
  // An executive can close registration at once, whatever the dates say.
  if (override === "closed") {
    return "closed";
  }

  if (override === "open") {
    return "open";
  }

  if (!opens || !closes || closes <= opens) {
    return "unconfigured";
  }

  if (now < opens) {
    return "upcoming";
  }

  return now < closes ? "open" : "closed";
}

/**
 * Whether registration and renewals are open, from the dates the executives
 * set. Renewals share the registration window unless they have their own.
 * No period at all, or one with unusable dates, never counts as open.
 */
export function periodWindows(
  period: MembershipPeriod | null,
  now: Date,
): PeriodWindows {
  if (!period) {
    return {
      registration: "unconfigured",
      renewals: "unconfigured",
      registrationOpens: null,
      registrationCloses: null,
      renewalsOpen: null,
      renewalsClose: null,
    };
  }

  const registrationOpens = parse(period.registrationOpens);
  const registrationCloses = parse(period.registrationCloses);
  const renewalsOpen = parse(period.renewalsOpen) ?? registrationOpens;
  const renewalsClose = parse(period.renewalsClose) ?? registrationCloses;

  const override = period.registrationOverride ?? "auto";

  // Without at least one way to pay, opening the form would collect
  // submissions nobody can act on.
  const canPay = (period.paymentMethods?.length ?? 0) > 0;

  const guard = (state: WindowState): WindowState =>
    state === "open" && !canPay ? "unconfigured" : state;

  return {
    registration: guard(
      stateFor(registrationOpens, registrationCloses, now, override),
    ),
    renewals: guard(stateFor(renewalsOpen, renewalsClose, now, override)),
    registrationOpens,
    registrationCloses,
    renewalsOpen,
    renewalsClose,
  };
}

import type { MemberCategory, RegistrationKind, RegistrationStatus } from "./types";

/** What the applicant is shown after submitting (registration or renewal). */
export type Receipt = {
  referenceCode: string;
  kind: RegistrationKind;
  category: MemberCategory;
  periodTitle: string;
  fee: number;
  amountPaid: number;
  amountMatchesFee: boolean;
  /** Whether a proof-of-payment file was uploaded with it. */
  proofReceived: boolean;
  status: RegistrationStatus;
  decisionDueBy: string;
  /** Whether a confirmation email could be sent. */
  emailed: boolean;
};

export type StatusResult = {
  referenceCode: string;
  kind: RegistrationKind;
  category: MemberCategory;
  periodTitle: string;
  status: RegistrationStatus;
  submittedAt: string;
  decisionDueBy: string;
  reviewedAt?: string;
  overdue: boolean;
};

export type MembershipFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echoed back so a failed submission does not wipe what was typed. */
  values?: Record<string, string>;
  receipt?: Receipt;
  statusResult?: StatusResult;
};

export const initialMembershipFormState: MembershipFormState = {
  status: "idle",
};

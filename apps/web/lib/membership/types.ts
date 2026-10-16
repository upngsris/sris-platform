export type MemberCategory = "students" | "staff" | "alumni" | "others";

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type RegistrationKind = "new" | "renewal";

export type PaymentMethod = {
  _key: string;
  label: string;
  accountName?: string;
  accountNumber?: string;
  instructions?: string;
};

/**
 * One academic year of membership, configured in the Studio by the
 * executives. Every date is stored as an ISO timestamp; nothing about the
 * academic calendar is hardcoded in the site.
 */
export type MembershipPeriod = {
  _id: string;
  title: string;
  academicYear?: string;

  registrationOpens: string;
  registrationCloses: string;

  /** Default to the registration window when omitted. */
  renewalsOpen?: string;
  renewalsClose?: string;

  membershipStarts: string;
  membershipEnds: string;

  /** `auto` follows the dates; the others let an executive open or close early. */
  registrationOverride?: "auto" | "open" | "closed";

  /** Overrides the default fee for a category (in kina). */
  fees?: Partial<Record<MemberCategory, number>>;

  paymentMethods?: PaymentMethod[];
  paymentNote?: string;
  termsNote?: string;
};

/** Profile fields kept for a member, whichever category they belong to. */
export type MemberProfile = {
  firstName: string;
  lastName: string;
  email: string;

  yearOfStudy?: string;
  school?: string;
  major?: string;

  department?: string;
  position?: string;

  graduationYear?: number;
  occupation?: string;
};

export type MemberDoc = MemberProfile & {
  _id: string;
  _type: "member";
  category: MemberCategory;
  createdAt: string;
  updatedAt: string;
};

export type PaymentSubmission = {
  method: string;
  amountPaid: number;
  reference: string;
  paidOn: string;
  payerName?: string;
  /** Optional photo or PDF of the receipt, stored as a private file asset. */
  proof?: {
    _type: "file";
    asset: { _type: "reference"; _ref: string };
    fileName: string;
  };
};

export type RegistrationDoc = {
  _id: string;
  _type: "membershipRegistration";
  referenceCode: string;
  kind: RegistrationKind;
  member: { _type: "reference"; _ref: string };
  /** The period lives in the public dataset, and references cannot cross
   *  datasets, so it is recorded by id and title instead. */
  periodId: string;
  periodTitle: string;
  category: MemberCategory;

  /** The fee in force when this was submitted, so later fee changes never
   *  rewrite history. */
  fee: number;
  profile: MemberProfile;
  payment: PaymentSubmission & { amountMatchesFee: boolean };

  status: RegistrationStatus;
  submittedAt: string;
  /** Applicants are told to expect a decision within 24 hours. */
  decisionDueBy: string;

  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
};

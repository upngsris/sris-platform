import type { MemberCategory, MembershipPeriod } from "./types";

export type FieldDef = {
  name:
    | "yearOfStudy"
    | "school"
    | "major"
    | "department"
    | "position"
    | "graduationYear"
    | "occupation";
  label: string;
  kind: "text" | "select" | "year";
  options?: readonly string[];
  hint?: string;
};

export type CategoryDef = {
  id: MemberCategory;
  label: string;
  summary: string;
  /** Default annual fee in kina; a period can override it. */
  defaultFee: number;
  emailLabel: string;
  emailHint?: string;
  /** Fields asked in addition to first name, last name and email. */
  fields: readonly FieldDef[];
  /** The fields a returning member may change when renewing. */
  renewalEditable: readonly FieldDef["name"][];
};

export const YEARS_OF_STUDY = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "5th year",
  "Postgraduate",
] as const;

export const CATEGORIES: Record<MemberCategory, CategoryDef> = {
  students: {
    id: "students",
    label: "Student",
    summary: "Currently enrolled at the University of Papua New Guinea.",
    defaultFee: 15,
    emailLabel: "Student email",
    fields: [
      { name: "yearOfStudy", label: "Year of study", kind: "select", options: YEARS_OF_STUDY },
      { name: "school", label: "School", kind: "text" },
      { name: "major", label: "Major / study field", kind: "text" },
    ],
    renewalEditable: ["yearOfStudy", "major"],
  },

  staff: {
    id: "staff",
    label: "Staff",
    summary: "University staff and academics.",
    defaultFee: 25,
    emailLabel: "Staff email",
    fields: [
      { name: "department", label: "Department", kind: "text" },
      { name: "position", label: "Role / position", kind: "text" },
    ],
    renewalEditable: [],
  },

  alumni: {
    id: "alumni",
    label: "Alumni",
    summary: "Graduates of the University of Papua New Guinea.",
    defaultFee: 25,
    emailLabel: "Personal or student email",
    fields: [
      { name: "graduationYear", label: "Graduation year", kind: "year" },
      { name: "occupation", label: "Occupation", kind: "text" },
    ],
    renewalEditable: [],
  },

  others: {
    id: "others",
    label: "Others",
    summary: "Anyone else who would like to support and take part in SRIS.",
    defaultFee: 30,
    emailLabel: "Personal email",
    fields: [{ name: "occupation", label: "Occupation", kind: "text" }],
    renewalEditable: [],
  },
};

export const CATEGORY_ORDER: readonly MemberCategory[] = [
  "students",
  "staff",
  "alumni",
  "others",
];

export function isCategory(value: unknown): value is MemberCategory {
  return typeof value === "string" && value in CATEGORIES;
}

/**
 * The fee for a category in a period: the period's own figure when the
 * executives set one, otherwise the standard fee. Always derived on the
 * server; a figure sent by the browser is never trusted.
 */
export function feeFor(
  category: MemberCategory,
  period: Pick<MembershipPeriod, "fees"> | null,
) {
  const configured = period?.fees?.[category];

  if (
    typeof configured === "number" &&
    Number.isFinite(configured) &&
    configured > 0
  ) {
    return configured;
  }

  return CATEGORIES[category].defaultFee;
}

/** Kina, as the society writes it: K15, K25 or K12.50. */
export function formatKina(amount: number) {
  return Number.isInteger(amount) ? `K${amount}` : `K${amount.toFixed(2)}`;
}

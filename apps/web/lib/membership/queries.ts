/**
 * The membership period in force: the most recently opened one. A period
 * created in advance for next year therefore takes over as soon as it is
 * published, and shows as "opens on …" until its registration date arrives.
 */
export const CURRENT_PERIOD_QUERY = `*[_type == "membershipPeriod"] | order(registrationOpens desc)[0]{
  _id,
  title,
  academicYear,
  registrationOpens,
  registrationCloses,
  renewalsOpen,
  renewalsClose,
  membershipStarts,
  membershipEnds,
  registrationOverride,
  fees,
  paymentMethods[]{ _key, label, accountName, accountNumber, instructions },
  paymentNote,
  termsNote
}`;

export const REGISTRATION_BY_CODE_QUERY = `*[_type == "membershipRegistration" && referenceCode == $code][0]`;

export const HAS_APPROVED_QUERY = `count(*[_type == "membershipRegistration" && member._ref == $memberId && status == "approved" && periodId != $periodId])`;

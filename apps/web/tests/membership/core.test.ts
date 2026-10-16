import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CATEGORIES, feeFor, formatKina } from "@/lib/membership/categories";
import {
  memberId,
  memberKey,
  newReferenceCode,
  registrationId,
  signRenewalToken,
  verifyRenewalToken,
} from "@/lib/membership/crypto";
import { periodWindows } from "@/lib/membership/period";
import {
  looksLikeCardNumber,
  validatePayment,
  validateProfile,
} from "@/lib/membership/validate";

import { NOW, period, SECRET, studentForm } from "./helpers";

describe("categories and fees", () => {
  it("charges K15 students, K25 staff and alumni, K30 others by default", () => {
    assert.equal(feeFor("students", null), 15);
    assert.equal(feeFor("staff", null), 25);
    assert.equal(feeFor("alumni", null), 25);
    assert.equal(feeFor("others", null), 30);
  });

  it("lets a period override a fee, and ignores nonsense overrides", () => {
    assert.equal(feeFor("students", { fees: { students: 20 } }), 20);
    assert.equal(feeFor("students", { fees: { students: -5 } }), 15);
    assert.equal(feeFor("students", { fees: { students: Number.NaN } }), 15);
  });

  it("formats kina the way the society writes it", () => {
    assert.equal(formatKina(15), "K15");
    assert.equal(formatKina(12.5), "K12.50");
  });

  it("asks each category for exactly the specified fields", () => {
    const names = (c: keyof typeof CATEGORIES) => CATEGORIES[c].fields.map((f) => f.name);
    assert.deepEqual(names("students"), ["yearOfStudy", "school", "major"]);
    assert.deepEqual(names("staff"), ["department", "position"]);
    assert.deepEqual(names("alumni"), ["graduationYear", "occupation"]);
    assert.deepEqual(names("others"), ["occupation"]);
    assert.deepEqual(CATEGORIES.students.renewalEditable, ["yearOfStudy", "major"]);
  });
});

describe("registration window", () => {
  const w = (p: typeof period | null, at: string) => periodWindows(p, new Date(at));

  it("is upcoming, open, then closed by the configured dates", () => {
    assert.equal(w(period, "2026-02-01T00:00:00Z").registration, "upcoming");
    assert.equal(w(period, "2026-02-20T00:00:00Z").registration, "open");
    assert.equal(w(period, "2026-07-20T00:00:00Z").registration, "closed");
  });

  it("is never open without a period, or with unusable dates", () => {
    assert.equal(w(null, "2026-02-20T00:00:00Z").registration, "unconfigured");
    assert.equal(
      w({ ...period, registrationCloses: "2026-01-01T00:00:00Z" }, "2026-02-20T00:00:00Z").registration,
      "unconfigured",
    );
  });

  it("will not open when there is no way to pay", () => {
    assert.equal(w({ ...period, paymentMethods: [] }, "2026-02-20T00:00:00Z").registration, "unconfigured");
  });

  it("honours an executive's manual override", () => {
    assert.equal(w({ ...period, registrationOverride: "closed" }, "2026-02-20T00:00:00Z").registration, "closed");
    assert.equal(w({ ...period, registrationOverride: "open" }, "2026-09-01T00:00:00Z").registration, "open");
  });

  it("lets renewals follow their own dates when given", () => {
    const p = { ...period, renewalsOpen: "2026-01-15T00:00:00Z", renewalsClose: "2026-03-01T00:00:00Z" };
    assert.equal(w(p, "2026-02-01T00:00:00Z").renewals, "open");
    assert.equal(w(p, "2026-02-01T00:00:00Z").registration, "upcoming");
    assert.equal(w(p, "2026-04-01T00:00:00Z").renewals, "closed");
  });
});

describe("validation", () => {
  it("accepts a complete student profile and normalises the email", () => {
    const { profile, errors } = validateProfile(studentForm, "students", NOW);
    assert.deepEqual(errors, {});
    assert.equal(profile?.email, "anna.kila@students.upng.ac.pg");
    assert.equal(profile?.yearOfStudy, "2nd year");
  });

  it("rejects each missing or malformed field with its own message", () => {
    const { errors } = validateProfile(
      { ...studentForm, firstName: "", email: "nope", yearOfStudy: "9th year", school: "", major: "x" },
      "students",
      NOW,
    );
    assert.deepEqual(Object.keys(errors).sort(), ["email", "firstName", "major", "school", "yearOfStudy"]);
  });

  it("checks graduation year is a plausible year", () => {
    const ok = (year: string) => validateProfile(
      { firstName: "A", lastName: "B", email: "a@b.org", graduationYear: year, occupation: "Teacher" },
      "alumni",
      NOW,
    ).errors;
    assert.deepEqual(ok("2019"), {});
    assert.ok(ok("1900").graduationYear);
    assert.ok(ok("2999").graduationYear);
    assert.ok(ok("abcd").graduationYear);
  });

  it("detects card numbers but not receipt numbers", () => {
    assert.equal(looksLikeCardNumber("4111 1111 1111 1111"), true);
    assert.equal(looksLikeCardNumber("4111-1111-1111-1111"), true);
    assert.equal(looksLikeCardNumber("BSP-884213"), false);
    assert.equal(looksLikeCardNumber("1234567890123"), false); // fails Luhn
  });

  it("refuses a payment reference that looks like a card number", () => {
    const { errors } = validatePayment({ ...studentForm, paymentReference: "4111 1111 1111 1111" }, period, NOW);
    assert.match(errors.paymentReference, /card number/i);
  });

  it("validates payment method, amount and date", () => {
    const bad = validatePayment(
      { paymentMethod: "Cheque", amountPaid: "-3", paymentReference: "x", paidOn: "2099-01-01" },
      period,
      NOW,
    ).errors;
    assert.deepEqual(Object.keys(bad).sort(), ["amountPaid", "paidOn", "paymentMethod", "paymentReference"]);
  });
});

describe("identifiers and renewal links", () => {
  it("derives the same id for the same email, a different one otherwise, and hides the email", () => {
    const a = memberKey("a@example.org", SECRET);
    assert.equal(a, memberKey("a@example.org", SECRET));
    assert.notEqual(a, memberKey("b@example.org", SECRET));
    assert.notEqual(a, memberKey("a@example.org", SECRET + "x"));
    assert.ok(!memberId(a).includes("example"));
  });

  it("makes a registration id per member per period, with no dots", () => {
    const k = memberKey("a@example.org", SECRET);
    assert.notEqual(registrationId(k, "p1"), registrationId(k, "p2"));
    assert.ok(!registrationId(k, "drafts.p.1").includes("."));
  });

  it("makes readable reference codes", () => {
    assert.match(newReferenceCode(2026), /^SRIS-26-[2-9A-HJKMNP-Z]{5}$/);
  });

  it("accepts a fresh link and rejects tampered, wrong-secret and expired ones", () => {
    const key = memberKey("a@example.org", SECRET);
    const token = signRenewalToken(key, SECRET, NOW);

    assert.deepEqual(verifyRenewalToken(token, SECRET, NOW), { ok: true, key });

    const [body, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ k: memberKey("x@example.org", SECRET), e: 9999999999, p: "renew" })).toString("base64url");
    assert.equal(verifyRenewalToken(`${forged}.${sig}`, SECRET, NOW).ok, false);
    assert.equal(verifyRenewalToken(token, SECRET + "x", NOW).ok, false);
    assert.equal(verifyRenewalToken(`${body}.`, SECRET, NOW).ok, false);
    assert.equal(verifyRenewalToken("garbage", SECRET, NOW).ok, false);

    const later = new Date(NOW.getTime() + 31 * 60 * 1000);
    assert.deepEqual(verifyRenewalToken(token, SECRET, later), { ok: false, reason: "expired" });
  });
});

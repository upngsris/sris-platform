import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { memberId, memberKey, registrationId, signRenewalToken } from "@/lib/membership/crypto";
import {
  CLOSED_MESSAGE,
  loadRenewal,
  lookupStatus,
  register,
  requestRenewalLink,
  submitRenewal,
} from "@/lib/membership/service";

import { makeDeps, NOW, period, SECRET, studentForm } from "./helpers";

const staffForm = {
  category: "staff",
  firstName: "Caroline",
  lastName: "Mera",
  email: "c.mera@upng.ac.pg",
  department: "Biology",
  position: "Lecturer",
  paymentMethod: "Mobile money",
  amountPaid: "25",
  paymentReference: "MM-55120",
  paidOn: "2026-02-19",
  terms: "on",
};

describe("registering", () => {
  it("stores a pending registration with the server-derived fee", async () => {
    const t = makeDeps();
    // The browser tries to name its own fee; it must be ignored.
    const result = await register({ ...studentForm, fee: "1" }, period, t.deps);

    assert.equal(result.status, "success");
    assert.equal(result.receipt?.status, "pending");
    assert.equal(result.receipt?.fee, 15);
    assert.equal(result.receipt?.kind, "new");
    assert.match(result.receipt!.referenceCode, /^SRIS-26-/);

    const [reg] = [...t.registrations.values()];
    assert.equal(reg.status, "pending");
    assert.equal(reg.fee, 15);
    assert.equal(reg.payment.amountMatchesFee, true);
    assert.equal(reg.category, "students");
    // decision window is 24 hours
    assert.equal(new Date(reg.decisionDueBy).getTime() - new Date(reg.submittedAt).getTime(), 24 * 3600 * 1000);
    assert.equal(t.members.size, 1);
  });

  it("charges each category its fee", async () => {
    const t = makeDeps();
    const staff = await register(staffForm, period, t.deps);
    assert.equal(staff.receipt?.fee, 25);

    const alumni = await register(
      { ...studentForm, category: "alumni", email: "al@example.org", graduationYear: "2020", occupation: "Engineer", amountPaid: "25" },
      period, t.deps,
    );
    assert.equal(alumni.receipt?.fee, 25);

    const other = await register(
      { ...studentForm, category: "others", email: "o@example.org", occupation: "Nurse", amountPaid: "30" },
      period, t.deps,
    );
    assert.equal(other.receipt?.fee, 30);
  });

  it("flags a payment that does not match the fee instead of rejecting it", async () => {
    const t = makeDeps();
    const result = await register({ ...studentForm, amountPaid: "10" }, period, t.deps);
    assert.equal(result.status, "success");
    assert.equal(result.receipt?.amountMatchesFee, false);
  });

  it("emails the applicant and the executives, and survives email failure", async () => {
    const ok = makeDeps();
    await register(studentForm, period, ok.deps);
    assert.deepEqual(ok.sent.map((m) => m.to[0]).sort(), ["anna.kila@students.upng.ac.pg", "execs@example.org"]);

    const down = makeDeps({ send: async () => false });
    const result = await register(studentForm, period, down.deps);
    assert.equal(result.status, "success");
    assert.equal(result.receipt?.emailed, false);
    assert.equal(down.registrations.size, 1);
  });

  it("refuses everything when registration is closed, even with a valid form", async () => {
    const t = makeDeps();
    const closed = { ...period, registrationCloses: "2026-02-15T00:00:00Z" };
    const result = await register(studentForm, closed, t.deps);
    assert.equal(result.status, "error");
    assert.equal(result.message, CLOSED_MESSAGE);
    assert.equal(t.writes(), 0);

    assert.equal((await register(studentForm, null, t.deps)).message, CLOSED_MESSAGE);
  });

  it("returns field errors and keeps what was typed", async () => {
    const t = makeDeps();
    const result = await register({ ...studentForm, email: "bad", terms: "" }, period, t.deps);
    assert.equal(result.status, "error");
    assert.ok(result.fieldErrors?.email);
    assert.ok(result.fieldErrors?.terms);
    assert.equal(result.values?.firstName, "Anna");
    assert.equal(t.writes(), 0);
  });

  it("rejects an unknown category", async () => {
    const t = makeDeps();
    assert.equal((await register({ ...studentForm, category: "vip" }, period, t.deps)).status, "error");
  });

  it("prevents a second registration for the same email, however it is typed", async () => {
    const t = makeDeps();
    assert.equal((await register(studentForm, period, t.deps)).status, "success");

    const again = await register({ ...studentForm, email: "  ANNA.KILA@students.upng.ac.pg " }, period, t.deps);
    assert.equal(again.status, "error");
    assert.match(again.message!, /already exists/i);
    assert.equal(t.registrations.size, 1);
  });

  it("lets only one of two simultaneous submissions through", async () => {
    const t = makeDeps();
    const results = await Promise.all([
      register(studentForm, period, t.deps),
      register(studentForm, period, t.deps),
      register(studentForm, period, t.deps),
    ]);
    assert.equal(results.filter((r) => r.status === "success").length, 1);
    assert.equal(t.members.size, 1);
    assert.equal(t.registrations.size, 1);
  });

  it("does not store anything that looks like a card number", async () => {
    const t = makeDeps();
    const result = await register({ ...studentForm, paymentReference: "4111111111111111" }, period, t.deps);
    assert.equal(result.status, "error");
    assert.ok(result.fieldErrors?.paymentReference);
    assert.equal(t.writes(), 0);
  });
});

/** Registers a student, approves them (as an executive would), and returns the pieces. */
async function approvedStudent(periodId = "period-2025") {
  const t = makeDeps();
  const lastYear = { ...period, _id: periodId, title: "2025" };
  await register(studentForm, lastYear, makeDeps({ store: t.store }).deps);
  for (const r of t.registrations.values()) r.status = "approved";
  const key = memberKey("anna.kila@students.upng.ac.pg", SECRET);
  return { t, key };
}

describe("renewing", () => {
  it("emails a link only to an eligible member, but answers everyone the same way", async () => {
    const { t } = await approvedStudent();
    t.sent.length = 0;

    const member = await requestRenewalLink("anna.kila@students.upng.ac.pg", period, t.deps);
    const stranger = await requestRenewalLink("nobody@example.org", period, t.deps);

    assert.equal(member.status, "success");
    assert.equal(member.message, stranger.message);
    assert.equal(t.sent.length, 1);
    assert.equal(t.sent[0].to[0], "anna.kila@students.upng.ac.pg");
    assert.match(t.sent[0].text, /https:\/\/example\.org\/community\/membership\/renew\//);
  });

  it("sends no link to someone who never had an approved membership", async () => {
    const t = makeDeps();
    await register(studentForm, { ...period, _id: "period-2025" }, makeDeps({ store: t.store }).deps); // still pending
    t.sent.length = 0;
    await requestRenewalLink("anna.kila@students.upng.ac.pg", period, t.deps);
    assert.equal(t.sent.length, 0);
  });

  it("is closed outside the renewal window", async () => {
    const { t } = await approvedStudent();
    const closed = { ...period, registrationCloses: "2026-02-15T00:00:00Z" };
    assert.equal((await requestRenewalLink("anna.kila@students.upng.ac.pg", closed, t.deps)).status, "error");
  });

  it("lets a student update year and major, keeps everything else, and links the renewal to the member", async () => {
    const { t, key } = await approvedStudent();
    const token = signRenewalToken(key, SECRET, NOW);

    const context = await loadRenewal(token, period, t.deps);
    assert.equal(context.state, "ready");

    const result = await submitRenewal(
      token,
      {
        // Attempts to change fields that must stay fixed are ignored.
        firstName: "Hacker", email: "other@example.org", school: "Law", category: "staff",
        yearOfStudy: "3rd year", major: "Chemistry",
        paymentMethod: "Bank transfer", amountPaid: "15", paymentReference: "BSP-991204", paidOn: "2026-02-19", terms: "on",
      },
      period,
      t.deps,
    );

    assert.equal(result.status, "success");
    assert.equal(result.receipt?.kind, "renewal");
    assert.equal(result.receipt?.fee, 15);

    const member = t.members.get(memberId(key))!;
    assert.equal(member.yearOfStudy, "3rd year");
    assert.equal(member.major, "Chemistry");
    assert.equal(member.firstName, "Anna");
    assert.equal(member.email, "anna.kila@students.upng.ac.pg");
    assert.equal(member.school, "Natural & Physical Sciences");
    assert.equal(member.category, "students");
    assert.equal(t.members.size, 1);

    const renewal = t.registrations.get(registrationId(key, "period-2026"))!;
    assert.equal(renewal.member._ref, memberId(key));
    assert.equal(renewal.kind, "renewal");
    assert.equal(renewal.status, "pending");
    assert.equal(t.registrations.size, 2); // last year's record is untouched
  });

  it("retains all details for staff, who have nothing to edit", async () => {
    const t = makeDeps();
    await register(staffForm, { ...period, _id: "period-2025" }, makeDeps({ store: t.store }).deps);
    for (const r of t.registrations.values()) r.status = "approved";
    const key = memberKey("c.mera@upng.ac.pg", SECRET);

    const result = await submitRenewal(
      signRenewalToken(key, SECRET, NOW),
      { department: "Law", paymentMethod: "Mobile money", amountPaid: "25", paymentReference: "MM-77310", paidOn: "2026-02-19", terms: "on" },
      period,
      t.deps,
    );
    assert.equal(result.status, "success");
    assert.equal(t.members.get(memberId(key))!.department, "Biology");
  });

  it("allows only one renewal per period", async () => {
    const { t, key } = await approvedStudent();
    const token = signRenewalToken(key, SECRET, NOW);
    const form = { yearOfStudy: "3rd year", major: "Biology", paymentMethod: "Bank transfer", amountPaid: "15", paymentReference: "BSP-100200", paidOn: "2026-02-19", terms: "on" };

    const [a, b] = await Promise.all([submitRenewal(token, form, period, t.deps), submitRenewal(token, form, period, t.deps)]);
    assert.equal([a, b].filter((r) => r.status === "success").length, 1);

    const again = await loadRenewal(token, period, t.deps);
    assert.equal(again.state, "already");
  });

  it("rejects bad, forged and expired links", async () => {
    const { t, key } = await approvedStudent();
    assert.equal((await loadRenewal("junk", period, t.deps)).state, "invalid");
    assert.equal((await loadRenewal(signRenewalToken(key, SECRET + "x", NOW), period, t.deps)).state, "invalid");

    const expired = signRenewalToken(key, SECRET, new Date(NOW.getTime() - 3600 * 1000));
    const ctx = await loadRenewal(expired, period, t.deps);
    assert.deepEqual(ctx, { state: "invalid", reason: "expired" });

    const result = await submitRenewal(expired, {}, period, t.deps);
    assert.match(result.message!, /expired/i);
  });

  it("will not renew once the window has closed, even with a valid link", async () => {
    const { t, key } = await approvedStudent();
    const closed = { ...period, registrationCloses: "2026-02-15T00:00:00Z" };
    assert.deepEqual(await loadRenewal(signRenewalToken(key, SECRET, NOW), closed, t.deps), { state: "closed" });
  });
});

describe("checking status", () => {
  it("shows the status to the right email only", async () => {
    const t = makeDeps();
    const done = await register(studentForm, period, t.deps);
    const code = done.receipt!.referenceCode;

    const ok = await lookupStatus(code.toLowerCase(), "ANNA.KILA@students.upng.ac.pg", t.deps);
    assert.equal(ok.status, "success");
    assert.equal(ok.statusResult?.status, "pending");
    assert.equal(ok.statusResult?.overdue, false);

    const wrongEmail = await lookupStatus(code, "someone.else@example.org", t.deps);
    const wrongCode = await lookupStatus("SRIS-26-AAAAA", "anna.kila@students.upng.ac.pg", t.deps);
    assert.equal(wrongEmail.status, "error");
    assert.equal(wrongEmail.message, wrongCode.message); // cannot tell which was wrong
    assert.equal(wrongEmail.statusResult, undefined);
  });

  it("reports an approved decision and an overdue pending one", async () => {
    const t = makeDeps();
    const done = await register(studentForm, period, t.deps);
    const code = done.receipt!.referenceCode;

    const late = makeDeps({ store: t.store, now: () => new Date(NOW.getTime() + 30 * 3600 * 1000) });
    assert.equal((await lookupStatus(code, "anna.kila@students.upng.ac.pg", late.deps)).statusResult?.overdue, true);

    for (const r of t.registrations.values()) { r.status = "approved"; r.reviewedAt = NOW.toISOString(); }
    const result = await lookupStatus(code, "anna.kila@students.upng.ac.pg", t.deps);
    assert.equal(result.statusResult?.status, "approved");
    assert.equal(result.statusResult?.overdue, false);
  });

  it("never returns personal details in the status result", async () => {
    const t = makeDeps();
    const done = await register(studentForm, period, t.deps);
    const result = await lookupStatus(done.receipt!.referenceCode, "anna.kila@students.upng.ac.pg", t.deps);
    const text = JSON.stringify(result);
    for (const secret of ["Kila", "BSP-884213", "Biology", "students.upng"]) {
      assert.ok(!text.includes(secret), `leaked ${secret}`);
    }
  });
});

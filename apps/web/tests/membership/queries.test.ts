import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluate, parse } from "groq-js";

import {
  CURRENT_PERIOD_QUERY,
  HAS_APPROVED_QUERY,
  REGISTRATION_BY_CODE_QUERY,
} from "@/lib/membership/queries";

async function run(query: string, dataset: unknown[], params: Record<string, unknown> = {}) {
  const value = await evaluate(parse(query, { params }), { dataset: dataset as never, params });

  return value.get();
}

const dataset = [
  { _id: "p25", _type: "membershipPeriod", title: "2025", registrationOpens: "2025-02-10T00:00:00Z", registrationCloses: "2025-07-20T00:00:00Z", membershipStarts: "2025-02-10", membershipEnds: "2025-12-05", paymentMethods: [{ _key: "a", label: "Bank" }] },
  { _id: "p26", _type: "membershipPeriod", title: "2026", registrationOpens: "2026-02-10T00:00:00Z", registrationCloses: "2026-07-20T00:00:00Z", membershipStarts: "2026-02-10", membershipEnds: "2026-12-04", fees: { students: 20 }, paymentMethods: [{ _key: "a", label: "Bank", accountNumber: "1", secretField: "x" }], paymentNote: "n" },
  { _id: "r1", _type: "membershipRegistration", referenceCode: "SRIS-25-AAAAA", member: { _ref: "m1" }, periodId: "p25", status: "approved" },
  { _id: "r2", _type: "membershipRegistration", referenceCode: "SRIS-26-BBBBB", member: { _ref: "m1" }, periodId: "p26", status: "pending" },
  { _id: "r3", _type: "membershipRegistration", referenceCode: "SRIS-26-CCCCC", member: { _ref: "m2" }, periodId: "p26", status: "approved" },
];

describe("GROQ queries", () => {
  it("picks the most recently opened period and projects only the configured fields", async () => {
    const period = (await run(CURRENT_PERIOD_QUERY, dataset)) as Record<string, unknown>;
    assert.equal(period._id, "p26");
    assert.deepEqual(period.fees, { students: 20 });
    const method = (period.paymentMethods as Record<string, unknown>[])[0];
    assert.equal(method.label, "Bank");
    assert.equal(method.accountNumber, "1");
    assert.ok(!("secretField" in method), "unlisted fields must not be returned");
  });

  it("returns null when no period exists", async () => {
    assert.equal(await run(CURRENT_PERIOD_QUERY, []), null);
  });

  it("finds a registration by its reference code", async () => {
    const found = (await run(REGISTRATION_BY_CODE_QUERY, dataset, { code: "SRIS-26-BBBBB" })) as { _id: string };
    assert.equal(found._id, "r2");
    assert.equal(await run(REGISTRATION_BY_CODE_QUERY, dataset, { code: "SRIS-26-ZZZZZ" }), null);
  });

  it("counts a member's approved registrations from other periods only", async () => {
    assert.equal(await run(HAS_APPROVED_QUERY, dataset, { memberId: "m1", periodId: "p26" }), 1);
    assert.equal(await run(HAS_APPROVED_QUERY, dataset, { memberId: "m2", periodId: "p26" }), 0);
    assert.equal(await run(HAS_APPROVED_QUERY, dataset, { memberId: "m1", periodId: "p25" }), 0);
  });
});

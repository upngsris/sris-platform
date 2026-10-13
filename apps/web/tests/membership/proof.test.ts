import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkProof, detectProofKind, MAX_PROOF_BYTES, safeFilename } from "@/lib/membership/proof";
import { register, submitRenewal } from "@/lib/membership/service";
import { memberKey, signRenewalToken } from "@/lib/membership/crypto";

import { jpgBytes, makeDeps, NOW, pdfBytes, period, pngBytes, proofFile, SECRET, studentForm } from "./helpers";

describe("proof of payment: file checks", () => {
  it("recognises PDF, PNG, JPEG and WebP by their bytes", () => {
    assert.equal(detectProofKind(pdfBytes()), "pdf");
    assert.equal(detectProofKind(pngBytes()), "png");
    assert.equal(detectProofKind(jpgBytes()), "jpg");
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 1, 2]);
    assert.equal(detectProofKind(webp), "webp");
  });

  it("refuses programs, scripts and other types, whatever they are called", () => {
    const exe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 1, 2, 3]); // "MZ", a Windows program
    const html = new TextEncoder().encode("<html><script>alert(1)</script></html>");
    const svg = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'><script/></svg>");
    for (const [name, bytes] of [["receipt.jpg", exe], ["receipt.png", html], ["receipt.pdf", svg], ["receipt.jpg", new Uint8Array()]] as const) {
      const check = checkProof(proofFile(name, bytes));
      assert.equal(check.ok, false, name);
    }
  });

  it("refuses a file over the size limit", () => {
    const big = new Uint8Array(MAX_PROOF_BYTES + 1);
    big.set(pdfBytes());
    const check = checkProof({ name: "big.pdf", size: big.length, bytes: big });
    assert.equal(check.ok, false);
    assert.match((check as { message: string }).message, /too large/i);
  });

  it("stores a safe filename with the extension of what the file really is", () => {
    assert.equal(safeFilename("../../etc/passwd.jpg", "png"), "passwd.png");
    assert.equal(safeFilename("My Receipt (final)!.PDF", "pdf"), "My-Receipt-final.pdf");
    assert.equal(safeFilename("....", "jpg"), "proof-of-payment.jpg");
    assert.equal(safeFilename("a".repeat(200) + ".png", "png").length, 64);
  });
});

describe("proof of payment: registering", () => {
  it("is optional", async () => {
    const t = makeDeps();
    const result = await register(studentForm, period, t.deps);
    assert.equal(result.status, "success");
    assert.equal(result.receipt?.proofReceived, false);
    assert.equal(t.assets.size, 0);
    assert.equal([...t.registrations.values()][0].payment.proof, undefined);
  });

  it("stores the file privately and links it to the registration", async () => {
    const t = makeDeps();
    const result = await register(studentForm, period, t.deps, proofFile("Receipt 12.PNG", pngBytes()));
    assert.equal(result.status, "success");
    assert.equal(result.receipt?.proofReceived, true);

    const reg = [...t.registrations.values()][0];
    assert.equal(reg.payment.proof?.fileName, "Receipt-12.png");
    assert.equal(t.assets.get(reg.payment.proof!.asset._ref)?.contentType, "image/png");
    assert.match(t.sent.map((m) => m.text).join("\n"), /Proof of payment: uploaded \(Receipt-12\.png\)/);
  });

  it("says when no proof was uploaded in the executives' email", async () => {
    const t = makeDeps();
    await register(studentForm, period, t.deps);
    assert.match(t.sent.find((m) => m.to[0] === "execs@example.org")!.text, /Proof of payment: none uploaded/);
  });

  it("rejects a bad file before saving or uploading anything", async () => {
    const t = makeDeps();
    const result = await register(studentForm, period, t.deps, proofFile("x.jpg", new Uint8Array([0x4d, 0x5a, 1, 2])));
    assert.equal(result.status, "error");
    assert.ok(result.fieldErrors?.proof);
    assert.equal(t.assets.size, 0);
    assert.equal(t.writes(), 0);
  });

  it("reports a bad file together with other field errors", async () => {
    const t = makeDeps();
    const result = await register({ ...studentForm, email: "bad" }, period, t.deps, proofFile("x.jpg", new Uint8Array([1, 2, 3])));
    assert.deepEqual(Object.keys(result.fieldErrors!).sort(), ["email", "proof"]);
  });

  it("does not leave an orphaned file when the registration is a duplicate", async () => {
    const t = makeDeps();
    await register(studentForm, period, t.deps, proofFile("a.pdf", pdfBytes()));
    assert.equal(t.assets.size, 1);

    const again = await register(studentForm, period, t.deps, proofFile("b.pdf", pdfBytes()));
    assert.equal(again.status, "error");
    assert.equal(t.assets.size, 1, "the second upload must not be kept");
  });

  it("does not leave an orphaned file when saving fails, and does not crash", async () => {
    const t = makeDeps();
    t.flags.failCreate = true;
    const result = await register(studentForm, period, t.deps, proofFile("a.jpg", jpgBytes()));
    assert.equal(result.status, "error");
    assert.match(result.message!, /try again/i);
    assert.equal(t.assets.size, 0);
  });

  it("fails cleanly, saving nothing, if the upload itself fails", async () => {
    const t = makeDeps();
    t.flags.failUpload = true;
    const result = await register(studentForm, period, t.deps, proofFile("a.jpg", jpgBytes()));
    assert.equal(result.status, "error");
    assert.ok(result.fieldErrors?.proof);
    assert.equal(t.writes(), 0);
  });

  it("keeps the same file kind rules for renewals", async () => {
    const t = makeDeps();
    await register(studentForm, { ...period, _id: "period-2025" }, makeDeps({ store: t.store }).deps);
    for (const r of t.registrations.values()) r.status = "approved";
    const token = signRenewalToken(memberKey("anna.kila@students.upng.ac.pg", SECRET), SECRET, NOW);
    const form = { yearOfStudy: "3rd year", major: "Biology", paymentMethod: "Bank transfer", amountPaid: "15", paymentReference: "BSP-100200", paidOn: "2026-02-19", terms: "on" };

    const bad = await submitRenewal(token, form, period, t.deps, proofFile("x.png", new Uint8Array([9, 9, 9])));
    assert.equal(bad.status, "error");
    assert.equal(t.assets.size, 0);

    const ok = await submitRenewal(token, form, period, t.deps, proofFile("renewal.pdf", pdfBytes()));
    assert.equal(ok.status, "success");
    assert.equal(ok.receipt?.proofReceived, true);
    assert.equal(t.assets.size, 1);
  });
});

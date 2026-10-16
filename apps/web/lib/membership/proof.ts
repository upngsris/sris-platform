/**
 * Proof of payment: an optional photo, screenshot or PDF of the receipt.
 *
 * A receipt is personal data, so the file goes to the private dataset, never
 * the public one. Files are judged by their actual bytes, not by the name or
 * the type the browser claims, so a script renamed to receipt.jpg is refused.
 */

/** Kept under 4.5 MB, the request-body ceiling of common serverless hosts. */
export const MAX_PROOF_BYTES = 4 * 1024 * 1024;

export const PROOF_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";

export const PROOF_HINT = "PDF, JPG, PNG or WebP, up to 4 MB.";

export type ProofInput = {
  name: string;
  size: number;
  bytes: Uint8Array;
};

export type ProofKind = "pdf" | "jpg" | "png" | "webp";

const CONTENT_TYPE: Record<ProofKind, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((value, index) => bytes[offset + index] === value);

/** What the bytes actually are, or null if it is none of the allowed types. */
export function detectProofKind(bytes: Uint8Array): ProofKind | null {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return "pdf"; // %PDF-
  }

  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "png";
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return "jpg";
  }

  // RIFF....WEBP
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "webp";
  }

  return null;
}

/** A filename that is safe to store: no path, no odd characters, right extension. */
export function safeFilename(name: string, kind: ProofKind) {
  const base = name
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[^.]*$/, "")
    .replace(/[^A-Za-z0-9._ -]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 60);

  return `${base || "proof-of-payment"}.${kind}`;
}

export type ProofCheck =
  | { ok: true; filename: string; contentType: string; kind: ProofKind }
  | { ok: false; message: string };

export function checkProof(file: ProofInput): ProofCheck {
  if (file.size > MAX_PROOF_BYTES || file.bytes.length > MAX_PROOF_BYTES) {
    return {
      ok: false,
      message: "That file is too large. Please upload one under 4 MB (a smaller photo or a PDF).",
    };
  }

  const kind = detectProofKind(file.bytes);

  if (!kind) {
    return {
      ok: false,
      message: "Please upload a PDF, JPG, PNG or WebP file. Other file types cannot be accepted.",
    };
  }

  return {
    ok: true,
    kind,
    contentType: CONTENT_TYPE[kind],
    filename: safeFilename(file.name, kind),
  };
}

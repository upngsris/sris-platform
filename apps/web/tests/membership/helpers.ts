import type { Deps } from "@/lib/membership/service";
import type { MembershipStore } from "@/lib/membership/store";
import type {
  MemberDoc,
  MembershipPeriod,
  RegistrationDoc,
} from "@/lib/membership/types";

export const SECRET = "test-secret-test-secret-test-secret-123456";

export const NOW = new Date("2026-02-20T02:00:00Z"); // 12:00 in Port Moresby

export const period: MembershipPeriod = {
  _id: "period-2026",
  title: "2026",
  registrationOpens: "2026-02-10T00:00:00Z",
  registrationCloses: "2026-07-20T00:00:00Z",
  membershipStarts: "2026-02-10",
  membershipEnds: "2026-12-04",
  paymentMethods: [
    { _key: "a", label: "Bank transfer", accountName: "UPNG SRIS", accountNumber: "123" },
    { _key: "b", label: "Mobile money" },
  ],
};

/** In-memory store with the same all-or-nothing behaviour as the real one. */
export function memoryStore() {
  const members = new Map<string, MemberDoc>();
  const registrations = new Map<string, RegistrationDoc>();
  let writes = 0;

  const assets = new Map<string, { filename: string; contentType: string; size: number }>();
  const flags = { failUpload: false, failCreate: false };
  let assetCounter = 0;

  const store: MembershipStore = {
    async uploadProof(file) {
      if (flags.failUpload) {
        throw new Error("upload failed");
      }
      assetCounter += 1;
      const id = `file-${assetCounter}`;
      assets.set(id, { filename: file.filename, contentType: file.contentType, size: file.bytes.length });
      return id;
    },
    async deleteAsset(assetId) {
      assets.delete(assetId);
    },
    async getMember(id) {
      return members.get(id) ?? null;
    },
    async getRegistration(id) {
      return registrations.get(id) ?? null;
    },
    async findRegistrationByCode(code) {
      return [...registrations.values()].find((r) => r.referenceCode === code) ?? null;
    },
    async hasApprovedRegistration(memberId, excludePeriodId) {
      return [...registrations.values()].some(
        (r) => r.member._ref === memberId && r.status === "approved" && r.periodId !== excludePeriodId,
      );
    },
    async createMemberWithRegistration(member, registration) {
      if (flags.failCreate) {
        throw new Error("database down");
      }
      if (members.has(member._id) || registrations.has(registration._id)) {
        return "exists";
      }
      members.set(member._id, member);
      registrations.set(registration._id, registration);
      writes += 1;
      return "created";
    },
    async renewMember(memberId, changes, registration) {
      const member = members.get(memberId);
      if (!member || registrations.has(registration._id)) {
        return "exists";
      }
      members.set(memberId, { ...member, ...changes });
      registrations.set(registration._id, registration);
      writes += 1;
      return "created";
    },
  };

  return { store, members, registrations, assets, flags, writes: () => writes };
}

export function makeDeps(overrides: Partial<Deps> = {}) {
  const mem = memoryStore();
  const sent: { to: string[]; subject: string; text: string }[] = [];

  const deps: Deps = {
    store: mem.store,
    secret: SECRET,
    now: () => NOW,
    send: async (message) => {
      sent.push({ to: message.to, subject: message.subject, text: message.text });
      return true;
    },
    notifyTo: ["execs@example.org"],
    siteUrl: "https://example.org",
    ...overrides,
  };

  return { deps, sent, ...mem };
}

export const studentForm = {
  category: "students",
  firstName: "Anna",
  lastName: "Kila",
  email: "Anna.Kila@students.upng.ac.pg",
  yearOfStudy: "2nd year",
  school: "Natural & Physical Sciences",
  major: "Biology",
  paymentMethod: "Bank transfer",
  amountPaid: "15",
  paymentReference: "BSP-884213",
  paidOn: "2026-02-19",
  terms: "on",
};

/** Smallest byte strings that start like each allowed file type. */
export const pngBytes = () =>
  new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(64).fill(1)]);

export const pdfBytes = () =>
  new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, ...new Array(64).fill(2)]);

export const jpgBytes = () => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array(64).fill(3)]);

export const proofFile = (name: string, bytes: Uint8Array) => ({ name, size: bytes.length, bytes });

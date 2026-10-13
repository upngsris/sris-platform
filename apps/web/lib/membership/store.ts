import type {
  MemberDoc,
  MemberProfile,
  RegistrationDoc,
} from "./types";

/**
 * Everything the membership logic needs from the database. The real
 * implementation talks to the private Sanity dataset (sanity-store.ts); tests
 * use an in-memory one. Each write that must be all-or-nothing is a single
 * method so it can be a single transaction.
 */
export interface MembershipStore {
  /** Stores a proof-of-payment file privately; resolves to its asset id. */
  uploadProof(file: {
    filename: string;
    contentType: string;
    bytes: Uint8Array;
  }): Promise<string>;

  /** Removes an uploaded file that ended up not being used (best effort). */
  deleteAsset(assetId: string): Promise<void>;

  getMember(id: string): Promise<MemberDoc | null>;

  getRegistration(id: string): Promise<RegistrationDoc | null>;

  findRegistrationByCode(code: string): Promise<RegistrationDoc | null>;

  /** True if the member has an approved registration in any other period. */
  hasApprovedRegistration(
    memberId: string,
    excludePeriodId: string,
  ): Promise<boolean>;

  /**
   * Creates a member and their first registration together. Resolves to
   * "exists" without writing anything if either id is already taken, which is
   * what stops two submissions for the same email from both succeeding.
   */
  createMemberWithRegistration(
    member: MemberDoc,
    registration: RegistrationDoc,
  ): Promise<"created" | "exists">;

  /**
   * Records a renewal: updates the member's editable profile fields and adds
   * the new registration together, or does neither ("exists") if this member
   * already has a registration for the period.
   */
  renewMember(
    memberId: string,
    changes: Partial<MemberProfile> & { updatedAt: string },
    registration: RegistrationDoc,
  ): Promise<"created" | "exists">;
}

import "server-only";

import { privateClient } from "@/sanity/lib/private-client";

import { HAS_APPROVED_QUERY, REGISTRATION_BY_CODE_QUERY } from "./queries";

import type { MembershipStore } from "./store";
import type { MemberDoc, RegistrationDoc } from "./types";

function isConflict(error: unknown) {
  const candidate = error as { statusCode?: number; message?: string };

  return (
    candidate?.statusCode === 409 ||
    /already exists/i.test(candidate?.message ?? "")
  );
}

export const sanityStore: MembershipStore = {
  async uploadProof({ filename, contentType, bytes }) {
    // Assets in a private dataset are private too: only signed-in project
    // members (the executives, in the Studio) can open them.
    const asset = await privateClient.assets.upload("file", Buffer.from(bytes), {
      filename,
      contentType,
    });

    return asset._id;
  },

  async deleteAsset(assetId) {
    await privateClient.delete(assetId);
  },

  async getMember(id) {
    return (await privateClient.getDocument<MemberDoc>(id)) ?? null;
  },

  async getRegistration(id) {
    return (await privateClient.getDocument<RegistrationDoc>(id)) ?? null;
  },

  async findRegistrationByCode(code) {
    return (
      (await privateClient.fetch<RegistrationDoc | null>(
        REGISTRATION_BY_CODE_QUERY,
        { code },
      )) ?? null
    );
  },

  async hasApprovedRegistration(memberId, excludePeriodId) {
    const count = await privateClient.fetch<number>(
      HAS_APPROVED_QUERY,
      { memberId, periodId: excludePeriodId },
    );

    return count > 0;
  },

  async createMemberWithRegistration(member, registration) {
    try {
      await privateClient
        .transaction()
        .create(member)
        .create(registration)
        .commit();

      return "created";
    } catch (error) {
      if (isConflict(error)) {
        return "exists";
      }

      throw error;
    }
  },

  async renewMember(memberId, changes, registration) {
    try {
      await privateClient
        .transaction()
        .patch(memberId, { set: changes })
        .create(registration)
        .commit();

      return "created";
    } catch (error) {
      if (isConflict(error)) {
        return "exists";
      }

      throw error;
    }
  },
};

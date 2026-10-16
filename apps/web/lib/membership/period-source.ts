import { sanityFetch } from "@/sanity/lib/fetch";

import { CURRENT_PERIOD_QUERY } from "./queries";
import type { MembershipPeriod } from "./types";

/**
 * The current membership period from the public dataset (it holds dates,
 * fees and payment instructions, nothing personal). Cached and refreshed by
 * the publish webhook like all other content; a failed fetch counts as "no
 * period", which keeps registration closed.
 */
export async function getCurrentPeriod(): Promise<MembershipPeriod | null> {
  try {
    return (await sanityFetch<MembershipPeriod | null>({ query: CURRENT_PERIOD_QUERY })) ?? null;
  } catch (error) {
    console.error("[membership] Could not load the membership period:", error);

    return null;
  }
}

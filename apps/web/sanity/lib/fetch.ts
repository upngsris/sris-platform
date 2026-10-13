import { sanityClient } from "./client";

/**
 * Every content fetch carries this tag. The publish webhook
 * (app/api/revalidate/route.ts) expires it, so an edit in the Studio shows
 * up on the live site within seconds instead of waiting for the timed
 * revalidation below, which stays as a safety net if a webhook is missed.
 */
export const SANITY_CACHE_TAG = "sanity";

export async function sanityFetch<T>({
  query,
  params = {},
}: {
  query: string;
  params?: Record<string, unknown>;
}) {
  return sanityClient.fetch<T>(query, params, {
    next: {
      revalidate: 3000,
      tags: [SANITY_CACHE_TAG],
    },
  });
}

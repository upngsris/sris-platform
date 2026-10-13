import { createClient } from "next-sanity";

/**
 * SANITY_API_HOST points the clients at a different API host. It exists so a
 * local stand-in can be used in automated tests; leave it unset in production.
 */
const apiHost = process.env.SANITY_API_HOST;

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-08-01",
  useCdn: !apiHost,
  perspective: "published",
  ...(apiHost ? { apiHost, useProjectHostname: false } : {}),
});

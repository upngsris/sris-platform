import "server-only";

import { createClient } from "next-sanity";

/**
 * Client for the PRIVATE Sanity dataset.
 *
 * The public dataset (NEXT_PUBLIC_SANITY_DATASET) can be read by anyone who
 * queries Sanity's API, which is right for the website's own content but
 * wrong for personal data. Member profiles, payment references and contact
 * enquiries are therefore written only to a separate dataset created with
 * private visibility:
 *
 *   npx sanity dataset create <name> --visibility private
 *
 * and named in SANITY_PRIVATE_DATASET. Nothing is stored unless that dataset
 * is configured, is not the public one, and is confirmed not to be publicly
 * readable (see privateStoreReady).
 */
const token = process.env.SANITY_API_WRITE_TOKEN;
const dataset = process.env.SANITY_PRIVATE_DATASET;
const publicDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const apiHost = process.env.SANITY_API_HOST;
const apiVersion = "2026-08-01";

/** True when the settings are present and name a different dataset. */
export const privateStoreConfigured = Boolean(
  token && dataset && dataset !== publicDataset,
);

export const privateClient = createClient({
  projectId,
  dataset: dataset ?? "private-dataset-not-configured",
  apiVersion,
  useCdn: false,
  token,
  ...(apiHost ? { apiHost, useProjectHostname: false } : {}),
});

let verified: Promise<boolean> | null = null;

async function probePrivate() {
  const base = apiHost ?? `https://${projectId}.api.sanity.io`;

  const url = `${base}/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent("count(*)")}`;

  try {
    // No token on purpose: this is what any stranger could do.
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      console.error(
        `[private-store] Dataset "${dataset}" answers anonymous queries, so it is PUBLIC. ` +
          "Refusing to store personal data in it. Create a private dataset: " +
          "npx sanity dataset create <name> --visibility private",
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error("[private-store] Could not verify the dataset is private:", error);

    return false;
  }
}

/**
 * Whether personal data may be written. Fails closed: not configured, same as
 * the public dataset, publicly readable, or unverifiable all mean "no".
 * A positive result is remembered for the life of the server instance; a
 * negative one is rechecked on the next call.
 */
export async function privateStoreReady() {
  if (!privateStoreConfigured) {
    return false;
  }

  verified ??= probePrivate();

  const ok = await verified;

  if (!ok) {
    verified = null;
  }

  return ok;
}

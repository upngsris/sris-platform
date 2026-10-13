/**
 * One-off migration: move Markdown that was typed into `event.summary` over
 * to the new Portable Text `event.description`, and leave `summary` as the
 * short plain sentence the listings expect.
 *
 * Dry run by default — prints what it would write and changes nothing.
 * Pass --apply to commit the patches.
 *
 *   node scripts/migrate-event-descriptions.mjs
 *   SANITY_API_WRITE_TOKEN=... node scripts/migrate-event-descriptions.mjs --apply
 *
 * It talks to the HTTP API directly rather than importing @sanity/client, so
 * it runs from the repo root without depending on workspace resolution.
 *
 * Only events with no `description` are selected, so running it twice is
 * harmless and it will never overwrite copy an editor has since rewritten.
 * It patches published documents; if an event has an open draft in the
 * Studio, that draft keeps its old text until it is discarded or published.
 */

import {
  deriveSummary,
  markdownToPortableText,
  resetKeys,
} from "./markdown-to-portable-text.mjs";

const apply = process.argv.includes("--apply");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "1emtwm5v";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = "2026-08-01";

if (apply && !token) {
  console.error(
    "SANITY_API_WRITE_TOKEN is required to --apply.\n" +
      "Create an Editor token at sanity.io/manage → API → Tokens, then re-run.",
  );
  process.exit(1);
}

const base = `https://${projectId}.api.sanity.io/v${apiVersion}/data`;

const query = `*[_type == "event" && !defined(description) && defined(summary)]{
  _id, title, summary
} | order(startsAt asc)`;

const queryResponse = await fetch(
  `${base}/query/${dataset}?query=${encodeURIComponent(query)}`,
);

if (!queryResponse.ok) {
  console.error(
    `Query failed: ${queryResponse.status} ${await queryResponse.text()}`,
  );
  process.exit(1);
}

const {result: events} = await queryResponse.json();

if (!events || events.length === 0) {
  console.log("Nothing to migrate — every event already has a description.");
  process.exit(0);
}

const mutations = [];

for (const event of events) {
  resetKeys();

  const description = markdownToPortableText(event.summary);
  const summary = deriveSummary(description);

  console.log(`\n${"-".repeat(66)}\n${event.title}  (${event._id})`);
  console.log(`\n  summary -> ${summary}`);
  console.log("\n  description ->");

  for (const b of description) {
    const text = b.children.map((s) => s.text).join("");
    const marked = b.children.some((s) => s.marks.includes("strong"));
    const label = b.listItem ? `${b.listItem} item` : b.style;

    console.log(
      `    [${label.padEnd(11)}]${marked ? "*" : " "} ${text}`,
    );
  }

  mutations.push({
    patch: {
      id: event._id,
      setIfMissing: {description},
      ...(summary ? {set: {summary}} : {}),
    },
  });
}

console.log(`\n${"-".repeat(66)}`);
console.log("  * = contains bold text\n");

if (!apply) {
  console.log(
    `Dry run — ${events.length} event(s) would be updated. ` +
      "Re-run with --apply to write.",
  );
  process.exit(0);
}

const mutateResponse = await fetch(`${base}/mutate/${dataset}`, {
  method: "POST",

  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },

  body: JSON.stringify({mutations}),
});

if (!mutateResponse.ok) {
  console.error(
    `Mutation failed: ${mutateResponse.status} ${await mutateResponse.text()}`,
  );
  process.exit(1);
}

console.log(
  `Updated ${events.length} event(s). Review them in the Studio.`,
);

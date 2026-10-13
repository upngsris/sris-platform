/**
 * One-off migration: move laboratory practicals out of `learningItem`
 * (kind "Laboratory Practical") into the dedicated `laboratoryPractical`
 * document type.
 *
 * Each practical is copied across — title, slug, summary and image — with the
 * disciplines listed in `assignments`. Any document referencing the old item
 * (the homepage's Featured learning) is repointed to the new one, then the old
 * Learning Item and any open draft of it are deleted — all in one transaction,
 * so nothing is duplicated and nothing is lost if the write fails. Old /learn/items/<slug> links
 * redirect to the new page, because the slug is kept.
 *
 * Dry run by default — prints what it would write and changes nothing.
 * Pass --apply to commit.
 *
 *   node scripts/move-lab-practicals.mjs
 *   SANITY_API_WRITE_TOKEN=... node scripts/move-lab-practicals.mjs --apply
 *
 * Members, methodology and the write-up are new fields with nothing to copy;
 * fill them in the Studio afterwards.
 */

const apply = process.argv.includes("--apply");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "1emtwm5v";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = "2026-08-01";

/** Practical title → discipline values (see apps/web/lib/disciplines.ts). */
const assignments = {
  "Introduction to Microscopy": ["biology"],
};

if (apply && !token) {
  console.error(
    "SANITY_API_WRITE_TOKEN is required to --apply.\n" +
      "Create an Editor token at sanity.io/manage → API → Tokens, then re-run.",
  );
  process.exit(1);
}

const base = `https://${projectId}.api.sanity.io/v${apiVersion}/data`;

const query = `*[
  _type == "learningItem"
  && kind == "Laboratory Practical"
  && !(_id in path("drafts.**"))
]{
  _id, title, slug, summary, image,
  "referencedBy": *[references(^._id)]{ _id, _type, featuredLearning }
} | order(title asc)`;

const queryResponse = await fetch(
  // raw perspective so references held by unpublished drafts are found too.
  `${base}/query/${dataset}?perspective=raw&query=${encodeURIComponent(query)}`,
  token ? {headers: {Authorization: `Bearer ${token}`}} : undefined,
);

if (!queryResponse.ok) {
  console.error(
    `Query failed: ${queryResponse.status} ${await queryResponse.text()}`,
  );
  process.exit(1);
}

const {result: items} = await queryResponse.json();

if (!items || items.length === 0) {
  console.log("Nothing to migrate — no Learning Items of kind Laboratory Practical.");
  process.exit(0);
}

const mutations = [];
let moved = 0;

for (const item of items) {
  const disciplines = assignments[item.title];

  if (!disciplines) {
    console.log(
      `Skipping "${item.title}" (${item._id}) — add it to \`assignments\` with its disciplines first.`,
    );
    continue;
  }

  const newId = `laboratoryPractical-${item._id}`;

  console.log(
    `${item.title}\n  ${item._id} (learningItem) -> ${newId} (laboratoryPractical)\n  disciplines: ${disciplines.join(", ")}`,
  );

  const repoints = [];

  for (const doc of item.referencedBy ?? []) {
    const refs = (doc.featuredLearning ?? []).filter(
      (ref) => ref._ref === item._id,
    );

    if (doc._type !== "homePage" || refs.length === 0) {
      console.error(
        `  "${doc._id}" (${doc._type}) references this item somewhere the script does not handle — remove that reference in the Studio, then re-run.`,
      );
      process.exit(1);
    }

    console.log(`  repoint ${doc._id} featuredLearning -> ${newId}`);

    repoints.push({
      patch: {
        id: doc._id,
        set: Object.fromEntries(
          refs.map((ref) => [
            `featuredLearning[_key=="${ref._key}"]._ref`,
            newId,
          ]),
        ),
      },
    });
  }

  mutations.push(
    {
      createIfNotExists: {
        _id: newId,
        _type: "laboratoryPractical",
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        disciplines,
        ...(item.image?.asset ? {featuredImage: item.image} : {}),
      },
    },
    ...repoints,
    {delete: {id: item._id}},
    {delete: {id: `drafts.${item._id}`}},
  );

  moved += 1;
}

if (moved === 0) {
  process.exit(0);
}

if (!apply) {
  console.log(
    `\nDry run — ${moved} practical(s) would be moved. Re-run with --apply to write.`,
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
  `\nMoved ${moved} practical(s). Add members, methodology and write-up in the Studio.`,
);

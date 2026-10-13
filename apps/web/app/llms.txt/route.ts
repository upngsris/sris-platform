import { routes } from "@/lib/route";
import { absoluteUrl, clampDescription, site } from "@/lib/seo";

import { sanityFetch } from "@/sanity/lib/fetch";
import { LLMS_QUERY } from "@/sanity/lib/queries";

type Entry = { title: string; slug: string; summary?: string };

type LlmsData = Record<
  | "research"
  | "opportunities"
  | "practicals"
  | "learningItems"
  | "events"
  | "newsletters",
  Entry[] | undefined
>;

/*
 * /llms.txt (https://llmstxt.org): a plain Markdown map of the site for
 * language-model tools — what the society is, its main sections, and its
 * current content, each with an absolute link. Built from the same Sanity
 * content as the pages, and cached on the same schedule as their fetches.
 */
export async function GET() {
  const data = await sanityFetch<LlmsData>({ query: LLMS_QUERY });

  const link = (title: string, path: string, note?: string) =>
    `- [${title}](${absoluteUrl(path)})${note ? `: ${clampDescription(note, 200)}` : ""}`;

  const section = (
    heading: string,
    entries: Entry[] | undefined,
    toPath: (slug: string) => string,
  ) =>
    entries?.length
      ? [
          `## ${heading}`,
          "",
          ...entries.map((entry) =>
            link(entry.title, toPath(entry.slug), entry.summary),
          ),
          "",
        ]
      : [];

  const lines = [
    `# ${site.name} (${site.shortName})`,
    "",
    `> ${site.description}`,
    "",
    "SRIS is a student-led society in the School of Natural & Physical Sciences at the University of Papua New Guinea, Waigani Campus, Port Moresby. Students join research projects, laboratory practicals, workshops and events, and share what they learn with each other.",
    "",
    "## Main pages",
    "",
    link("Home", routes.home),
    link(
      "About SRIS",
      routes.about.index,
      "Who the society is and what it does.",
    ),
    link("Mission & Vision", routes.about.missionVision),
    link(
      "Our Team",
      routes.about.team,
      "Current student leadership and staff patrons.",
    ),
    link(
      "Research Projects",
      routes.explore.research.index,
      "Student-led research and investigations.",
    ),
    link(
      "Projects to Join",
      routes.explore.projectsToJoin.index,
      "Open project positions for students.",
    ),
    link(
      "Learn & Do",
      routes.learn.index,
      "Skills Track, laboratory practicals and knowledge sharing.",
    ),
    link("Laboratory Practicals", routes.learn.laboratoryPracticals),
    link("Newsletter", routes.learn.newsletter.index),
    link(
      "Events",
      routes.community.events.index,
      "Workshops, talks and the events calendar.",
    ),
    link(
      "Membership",
      routes.community.membership,
      "How to join and take part.",
    ),
    link("Student Showcase", routes.community.showcase.index),
    link("Collaborations", routes.community.collaborations),
    link("Contact", routes.about.contact),
    "",
    ...section(
      "Research projects",
      data?.research,
      routes.explore.research.detail,
    ),
    ...section(
      "Projects to join",
      data?.opportunities,
      routes.explore.projectsToJoin.detail,
    ),
    ...section(
      "Laboratory practicals",
      data?.practicals,
      routes.learn.laboratoryPractical,
    ),
    ...section("Learning activities", data?.learningItems, routes.learn.detail),
    ...section("Events", data?.events, routes.community.events.detail),
    ...section(
      "Newsletter issues",
      data?.newsletters,
      routes.learn.newsletter.detail,
    ),
    "## Optional",
    "",
    link("Sitemap", "/sitemap.xml", "Every public URL on the site."),
    link("Privacy", routes.privacy),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

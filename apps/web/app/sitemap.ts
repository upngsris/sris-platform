import type { MetadataRoute } from "next";

import { routes } from "@/lib/route";
import { absoluteUrl } from "@/lib/seo";

import { sanityFetch } from "@/sanity/lib/fetch";
import { SITEMAP_QUERY } from "@/sanity/lib/queries";

type Entry = { slug: string; _updatedAt: string };

type SitemapData = {
  research: Entry[];
  opportunities: Entry[];
  learningItems: Entry[];
  practicals: Entry[];
  newsletters: Entry[];
  events: Entry[];
  stories: Entry[];
  people: Entry[];
  archiveYears: number[];
};

/*
 * Section pages first, then every CMS document with its own page. Search,
 * status and error pages are left out on purpose: they are noindex.
 */
const STATIC_PAGES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: routes.home, priority: 1, changeFrequency: "weekly" },

  { path: routes.about.index, priority: 0.8, changeFrequency: "monthly" },
  {
    path: routes.about.missionVision,
    priority: 0.6,
    changeFrequency: "yearly",
  },
  { path: routes.about.team, priority: 0.7, changeFrequency: "monthly" },
  { path: routes.about.teamArchive, priority: 0.4, changeFrequency: "yearly" },
  { path: routes.about.contact, priority: 0.6, changeFrequency: "yearly" },

  {
    path: routes.explore.research.index,
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    path: routes.explore.projectsToJoin.index,
    priority: 0.8,
    changeFrequency: "weekly",
  },

  { path: routes.learn.index, priority: 0.8, changeFrequency: "weekly" },
  { path: routes.learn.skills, priority: 0.6, changeFrequency: "monthly" },
  {
    path: routes.learn.knowledgeSharing,
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: routes.learn.laboratoryPracticals,
    priority: 0.7,
    changeFrequency: "weekly",
  },
  {
    path: routes.learn.newsletter.index,
    priority: 0.6,
    changeFrequency: "monthly",
  },

  {
    path: routes.community.events.index,
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    path: routes.community.membership,
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: routes.community.membershipRegister,
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: routes.community.membershipRenew,
    priority: 0.5,
    changeFrequency: "monthly",
  },
  {
    path: routes.community.showcase.index,
    priority: 0.7,
    changeFrequency: "weekly",
  },
  {
    path: routes.community.collaborations,
    priority: 0.6,
    changeFrequency: "monthly",
  },

  { path: routes.privacy, priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await sanityFetch<SitemapData>({ query: SITEMAP_QUERY });

  const documents = (
    entries: Entry[] | undefined,
    toPath: (slug: string) => string,
    priority: number,
  ): MetadataRoute.Sitemap =>
    (entries ?? []).map((entry) => ({
      url: absoluteUrl(toPath(entry.slug)),
      lastModified: entry._updatedAt,
      priority,
    }));

  // The archive opens on its latest term, which is already listed as the
  // bare archive URL; earlier terms each get their own entry.
  const [, ...olderYears] = [...(data?.archiveYears ?? [])].sort(
    (a, b) => b - a,
  );

  return [
    ...STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
      url: absoluteUrl(path),
      priority,
      changeFrequency,
    })),

    ...documents(data?.research, routes.explore.research.detail, 0.7),
    ...documents(
      data?.opportunities,
      routes.explore.projectsToJoin.detail,
      0.7,
    ),
    ...documents(data?.learningItems, routes.learn.detail, 0.6),
    ...documents(data?.practicals, routes.learn.laboratoryPractical, 0.6),
    ...documents(data?.newsletters, routes.learn.newsletter.detail, 0.5),
    ...documents(data?.events, routes.community.events.detail, 0.6),
    ...documents(data?.stories, routes.community.showcase.detail, 0.5),
    ...documents(data?.people, routes.about.teamMember, 0.4),

    ...olderYears.map((year) => ({
      url: absoluteUrl(`${routes.about.teamArchive}?year=${year}`),
      priority: 0.3,
    })),
  ];
}

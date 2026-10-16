import { routes } from "@/lib/route";

/** Shared between the server search and the browser — no server imports here. */

export const SEARCH_MIN_CHARS = 2;
export const SUGGESTION_LIMIT = 6;
export const RESULT_LIMIT = 40;
export const SEARCH_DEBOUNCE_MS = 250;

export const SEARCH_TYPES = [
  "research",
  "opportunity",
  "learning",
  "practical",
  "event",
  "story",
  "person",
  "newsletter",
  "page",
] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

export type SearchResult = {
  id: string;
  type: SearchType;
  title: string;
  href: string;
  excerpt?: string;
  meta?: string;
};

export const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  research: "Research",
  opportunity: "Projects to join",
  learning: "Learn & Do",
  practical: "Lab practicals",
  event: "Events",
  story: "Student stories",
  person: "People",
  newsletter: "Newsletter",
  page: "Pages",
};

/**
 * Sections of the site that are not Sanity documents. Without these, searching
 * for "membership" or "mission" would return nothing even though the pages
 * exist — so the index covers the whole site, not just the CMS.
 */
export type StaticPageEntry = {
  title: string;
  href: string;
  excerpt: string;
  keywords: string;
};

export const STATIC_PAGES: StaticPageEntry[] = [
  {
    title: "About SRIS",
    href: routes.about.index,
    excerpt:
      "Why the Science, Research and Innovation Society exists and how it supports learning beyond the classroom.",
    keywords: "about society history purpose overview",
  },
  {
    title: "Mission & Vision",
    href: routes.about.missionVision,
    excerpt:
      "The purpose, principles and long-term direction of SRIS.",
    keywords: "mission vision values principles direction",
  },
  {
    title: "Our Team",
    href: routes.about.team,
    excerpt:
      "The students, staff and representatives supporting the society.",
    keywords: "team executive committee patronage coordinators leadership",
  },
  {
    title: "Leadership archive",
    href: routes.about.teamArchive,
    excerpt:
      "Previous student leaders and representatives, with certificates for past terms.",
    keywords: "archive previous past leadership certificates alumni",
  },
  {
    title: "Contact Us",
    href: routes.about.contact,
    excerpt:
      "Get in touch with SRIS for enquiries, participation and collaboration.",
    keywords: "contact email enquiry message phone location",
  },
  {
    title: "Research Projects",
    href: routes.explore.research.index,
    excerpt:
      "Student-led scientific research, investigations and practical work.",
    keywords:
      "research projects investigations science physics chemistry biology environmental science mathematics computer science earth sciences disciplines",
  },
  {
    title: "Projects to Join",
    href: routes.explore.projectsToJoin.index,
    excerpt:
      "Active projects where students can contribute, learn and collaborate.",
    keywords: "join participate opportunities volunteer apply",
  },
  {
    title: "Skills Track",
    href: routes.learn.skills,
    excerpt:
      "Practical scientific, technical and research skills.",
    keywords: "skills training practical technical learn",
  },
  {
    title: "Knowledge Sharing",
    href: routes.learn.knowledgeSharing,
    excerpt:
      "Students and contributors sharing concepts through experience.",
    keywords: "knowledge sharing peer teaching talks",
  },
  {
    title: "Laboratory Practicals",
    href: routes.learn.laboratoryPracticals,
    excerpt:
      "Hands-on laboratory activities beyond formal coursework.",
    keywords: "laboratory practical lab experiments",
  },
  {
    title: "Newsletter",
    href: routes.learn.newsletter.index,
    excerpt:
      "Ideas, activities and discoveries from across the SRIS community.",
    keywords: "newsletter news articles issues updates",
  },
  {
    title: "Events",
    href: routes.community.events.index,
    excerpt:
      "Workshops, talks, practical sessions and the full-year events calendar.",
    keywords: "events calendar workshops talks sessions schedule",
  },
  {
    title: "Membership",
    href: routes.community.membership,
    excerpt:
      "Register or renew your SRIS membership online: fees, key dates and terms.",
    keywords: "membership join member sign up register renew renewal fees payment alumni staff student",
  },
  {
    title: "Student Showcase",
    href: routes.community.showcase.index,
    excerpt:
      "Student projects, experiences, achievements and practical work.",
    keywords: "showcase students stories achievements",
  },
  {
    title: "Collaborations",
    href: routes.community.collaborations,
    excerpt:
      "Opportunities for students, organisations and partners to work with SRIS.",
    keywords: "collaboration partners organisations industry",
  },
];

export function routesSearchHref(query: string) {
  return `${routes.search}?q=${encodeURIComponent(query)}`;
}

export function normaliseQuery(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
}

export function isSearchable(query: string) {
  return query.length >= SEARCH_MIN_CHARS;
}

/** Simple substring match for the code-owned page list. */
export function matchStaticPages(query: string): SearchResult[] {
  const needle = query.toLowerCase();

  return STATIC_PAGES.filter((page) =>
    `${page.title} ${page.excerpt} ${page.keywords}`
      .toLowerCase()
      .includes(needle),
  ).map((page) => ({
    id: `page:${page.href}`,
    type: "page" as const,
    title: page.title,
    href: page.href,
    excerpt: page.excerpt,
    meta: "Page",
  }));
}

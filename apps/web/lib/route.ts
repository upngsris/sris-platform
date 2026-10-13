export const routes = {
  home: "/",

  about: {
    index: "/about",
    missionVision: "/about/mission-vision",

    team: "/about/team",

    teamArchive: "/about/team/archive",

    teamMember: (slug: string) =>
      `/about/team/people/${slug}`,

    contact: "/about/contact",
  },

  explore: {
    index: "/explore",

    research: {
      index: "/explore/research",

      detail: (slug: string) =>
        `/explore/research/${slug}`,
    },

    projectsToJoin: {
      index: "/explore/projects-to-join",

      detail: (slug: string) =>
        `/explore/projects-to-join/${slug}`,
    },
  },

learn: {
  index: "/learn",

  skills: "/learn/skills",

  knowledgeSharing:
    "/learn/knowledge-sharing",

  laboratoryPracticals:
    "/learn/laboratory-practicals",

  /* Lands on the list itself, already filtered to one discipline. */
  laboratoryPracticalsFor: (discipline: string) =>
    `/learn/laboratory-practicals?discipline=${discipline}#activities`,

  laboratoryPractical: (slug: string) =>
    `/learn/laboratory-practicals/${slug}`,

  news: "/learn/news",

  newsletter: {
    index: "/learn/newsletter",

    detail: (slug: string) =>
      `/learn/newsletter/${slug}`,
  },

  detail: (slug: string) =>
    `/learn/items/${slug}`,
},

  community: {
    index: "/community",

    events: {
      index: "/community/events",

      detail: (slug: string) =>
        `/community/events/${slug}`,
    },

    membership: "/community/membership",
    membershipRegister: "/community/membership/register",
    membershipRenew: "/community/membership/renew",
    membershipStatus: "/community/membership/status",

    showcase: {
      index: "/community/showcase",

      detail: (slug: string) =>
        `/community/showcase/${slug}`,
    },

    collaborations:
      "/community/collaborations",
  },

  search: "/search",

  privacy: "/privacy",
} as const;
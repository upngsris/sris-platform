import { routes } from "@/lib/route";

export type NavigationLink = {
  title: string;
  description: string;
  href: string;
};

export type NavigationGroup = {
  name: string;
  intro: string;
  links: NavigationLink[];
};

export const navigation: NavigationGroup[] = [
  {
    name: "About",
    intro:
      "Learn about SRIS, why it exists, the people behind it and how to get in touch.",
    links: [
      {
        title: "About SRIS",
        description:
          "Discover why SRIS exists and how it supports learning beyond the classroom.",
        href: routes.about.index,
      },
      {
        title: "Mission & Vision",
        description:
          "Explore the purpose, principles and long-term direction of SRIS.",
        href: routes.about.missionVision,
      },
      {
        title: "Our Team",
        description:
          "Meet the students, staff and representatives supporting the society.",
        href: routes.about.team,
      },
      {
        title: "Contact Us",
        description:
          "Get in touch with SRIS for enquiries, participation and collaboration.",
        href: routes.about.contact,
      },
    ],
  },

  {
    name: "Explore",
    intro:
      "Discover student research, practical investigations and opportunities to turn ideas into real work.",
    links: [
      {
        title: "Research Projects",
        description:
          "Explore student-led scientific research, investigations and practical work.",
        href: routes.explore.research.index,
      },
      {
        title: "Projects to Join",
        description:
          "Find active projects where students can contribute, learn and collaborate.",
        href: routes.explore.projectsToJoin.index,
      },
    ],
  },

  {
    name: "Learn & Do",
    intro:
      "Build useful skills, explore laboratory activities and put scientific ideas into practice.",
    links: [
      {
        title: "Skills Track",
        description:
          "Develop practical scientific, technical and research skills.",
        href: routes.learn.skills,
      },
      {
        title: "Knowledge Sharing",
        description:
          "Learn from students and contributors sharing concepts through experience.",
        href: routes.learn.knowledgeSharing,
      },
      {
        title: "Laboratory Practicals",
        description:
          "Explore hands-on laboratory activities beyond formal coursework.",
        href: routes.learn.laboratoryPracticals,
      },
      {
        title: "News & Articles",
        description:
          "Read scientific articles, educational content and updates from SRIS.",
        href: routes.learn.newsletter.index,
      },
    ],
  },

  {
    name: "Community",
    intro:
      "Connect with students, participate in events and become part of the wider SRIS community.",
    links: [
      {
        title: "Events",
        description:
          "Explore workshops, talks, practical sessions and upcoming SRIS activities.",
        href: routes.community.events.index,
      },
      {
        title: "Membership",
        description:
          "Learn how to become an SRIS member and participate in the society.",
        href: routes.community.membership,
      },
      {
        title: "Student Showcase",
        description:
          "Discover student projects, experiences, achievements and practical work.",
        href: routes.community.showcase.index,
      },
      {
        title: "Collaborations",
        description:
          "Explore opportunities for students, organisations and partners to work with SRIS.",
        href: routes.community.collaborations,
      },
    ],
  },
];
import type { AboutMilestone } from "@/sanity/lib/types";

/*
 * Default "Our journey" milestones, adapted from the original sris.info
 * About page. Shown until editors add a timeline to the About SRIS
 * document in the Studio.
 */
export const defaultAboutTimeline: AboutMilestone[] = [
  {
    _key: "foundation",
    period: "2023",
    title: "Foundation",
    description:
      "Science students and faculty advisors founded SRIS to give scientific research and innovation at UPNG a home of its own.",
  },
  {
    _key: "first-initiatives",
    period: "Early 2024",
    title: "First initiatives",
    description:
      "The first laboratory practical sessions and workshops put classroom theory into hands-on practice.",
  },
  {
    _key: "expansion",
    period: "Mid 2024",
    title: "Expansion",
    description:
      "Membership grew across several science departments, and the society's first collaborative research projects got under way.",
  },
  {
    _key: "professional-development",
    period: "Late 2024",
    title: "Professional development",
    description:
      "Professional coaching sessions and networking events began preparing members for careers in science.",
  },
  {
    _key: "ambitious-projects",
    period: "2025",
    title: "Ambitious projects",
    description:
      "SRIS launched its first amateur rocket project and began developing the Smart Farm initiative.",
  },
];

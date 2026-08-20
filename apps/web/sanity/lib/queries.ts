import { defineQuery } from "next-sanity";

export const HOME_INTRO_QUERY = defineQuery(`
  *[_type == "homePage"][0] {
    hero {
      eyebrow,
      heading,
      summary,
      image {
        asset,
        alt
      },
      primaryCta {
        label,
        href
      },
      secondaryCta {
        label,
        href
      }
    },

    about {
      eyebrow,
      heading,
      lead,
      body
    },

    "featuredResearch": featuredResearch-> {
      _id,
      title,
      "slug": slug.current,
      discipline,
      year,
      summary,
      coverImage {
        asset,
        alt
      }
    },
    "featuredOpportunities": featuredOpportunities[]-> {
      _id,
      title,
      "slug": slug.current,
      discipline,
      level,
      summary,
      applicationStatus
    },

    "featuredLearning": featuredLearning[]-> {
      _id,
      title,
      "slug": slug.current,
      kind,
      summary,

      image {
        asset,
        alt
      }
    },

    "featuredStory": featuredStory-> {
      _id,
      title,
      "slug": slug.current,
      quote,
      studentName,
      discipline,

      image {
        asset,
        alt
      }
    },

    "featuredEvents": featuredEvents[]-> {
      _id,
      title,
      "slug": slug.current,
      startsAt,
      endsAt,
      venue,
      summary,
      image {
        asset,
        alt
      }
    },
    membershipCta {
      eyebrow,
      heading,
      body,

      cta {
        label,
        href
      }
    }
  }
`);


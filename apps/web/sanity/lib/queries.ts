import {defineQuery} from "next-sanity";

export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage"][0] {
    title,

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

    featuredResearch-> {
      _id,
      title,
      "slug": slug.current,
      discipline,
      year,
      summary,
      status,

      coverImage {
        asset,
        alt
      }
    },

    featuredOpportunities[]-> {
      _id,
      title,
      "slug": slug.current,
      discipline,
      level,
      summary,
      applicationStatus,
      publishedAt
    },

    featuredLearning[]-> {
      _id,
      _type,
      title,
      "slug": slug.current,
      "kind": select(
        _type == "laboratoryPractical" => "Laboratory Practical",
        kind
      ),
      summary,

      "image": select(
        _type == "laboratoryPractical" => featuredImage { asset, alt },
        image { asset, alt }
      )
    },

    featuredStory-> {
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

    featuredEvents[]-> {
      _id,
      title,
      "slug": slug.current,
      startsAt,
      endsAt,
      venue,
      summary,
      "isPast": coalesce(endsAt, startsAt) < now(),

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

export const RESEARCH_PROJECTS_QUERY = defineQuery(`
  *[
    _type == "researchProject"
    && status != "Draft"
  ]
  | order(year desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    discipline,
    year,
    summary,
    status,

    coverImage {
      asset,
      alt
    }
  }
`);

export const RESEARCH_PROJECT_QUERY = defineQuery(`
  *[
    _type == "researchProject"
    && slug.current == $slug
    && status != "Draft"
  ][0] {
    _id,
    title,
    "slug": slug.current,
    discipline,
    year,
    summary,
    status,

    coverImage {
      asset,
      alt
    }
  }
`);

export const PROJECT_OPPORTUNITIES_QUERY = defineQuery(`
  *[
    _type == "projectOpportunity"
  ]
  | order(
      select(
        applicationStatus == "Applications open" => 0,
        applicationStatus == "Positions available" => 1,
        applicationStatus == "Closed" => 2,
        3
      ) asc,
      publishedAt desc,
      title asc
    ) {
    _id,
    title,
    "slug": slug.current,
    discipline,
    level,
    summary,
    applicationStatus,
    publishedAt
  }
`);

export const PROJECT_OPPORTUNITY_QUERY = defineQuery(`
  *[
    _type == "projectOpportunity"
    && slug.current == $slug
  ][0] {
    _id,
    title,
    "slug": slug.current,
    discipline,
    level,
    summary,
    applicationStatus,
    publishedAt
  }
`);

export const UPCOMING_EVENTS_QUERY = defineQuery(`
  *[
    _type == "event"
    && coalesce(endsAt, startsAt) >= now()
  ]
  | order(startsAt asc) {
    _id,
    title,
    "slug": slug.current,
    startsAt,
    endsAt,
    venue,
    summary,
    admission,
    registrationUrl,
    "isPast": false,

    image {
      asset,
      alt
    }
  }
`);

export const PAST_EVENTS_QUERY = defineQuery(`
  *[
    _type == "event"
    && coalesce(endsAt, startsAt) < now()
  ]
  | order(startsAt desc) {
    _id,
    title,
    "slug": slug.current,
    startsAt,
    endsAt,
    venue,
    summary,
    admission,
    registrationUrl,
    "isPast": true,

    image {
      asset,
      alt
    }
  }
`);

/**
 * Whole-year calendar dataset for /community/events.
 *
 * `today` is GROQ's own clock so the calendar can choose its opening year and
 * month without a Date.now() call during React render — the same reason the
 * upcoming/past split is computed with now() rather than in the browser.
 */
export const EVENTS_CALENDAR_QUERY = defineQuery(`
  {
    "today": now(),

    "events": *[
      _type == "event"
    ]
    | order(startsAt asc) {
      _id,
      title,
      "slug": slug.current,
      startsAt,
      endsAt,
      venue,
      summary,
      "isPast": coalesce(endsAt, startsAt) < now()
    }
  }
`);

export const EVENT_QUERY = defineQuery(`
  *[
    _type == "event"
    && slug.current == $slug
  ][0] {
    _id,
    title,
    "slug": slug.current,
    startsAt,
    endsAt,
    venue,
    summary,
    address,
    organiser,
    admission,
    registrationUrl,
    tags,
    "isPast": coalesce(endsAt, startsAt) < now(),

    // Only the detail page renders the full programme; listings carry the
    // summary alone so a long description never rides along in a calendar
    // or card payload.
    description,

    image {
      asset,
      alt
    },

    gallery[] {
      _key,
      asset,
      alt,
      caption
    }
  }
`);

/**
 * "Other events" on an event page: what is coming up first, then the most
 * recent past events. Merged and trimmed on the page.
 */
export const RELATED_EVENTS_QUERY = defineQuery(`
  {
    "upcoming": *[
      _type == "event"
      && slug.current != $slug
      && coalesce(endsAt, startsAt) >= now()
    ]
    | order(startsAt asc) [0...6] {
      _id,
      title,
      "slug": slug.current,
      startsAt,
      venue,
      admission,
      "isPast": false,
      image { asset, alt }
    },

    "past": *[
      _type == "event"
      && slug.current != $slug
      && coalesce(endsAt, startsAt) < now()
    ]
    | order(startsAt desc) [0...6] {
      _id,
      title,
      "slug": slug.current,
      startsAt,
      venue,
      admission,
      "isPast": true,
      image { asset, alt }
    }
  }
`);

export const STUDENT_STORIES_QUERY = defineQuery(`
  *[
    _type == "studentStory"
  ]
  | order(_createdAt desc, title asc) {
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
  }
`);

export const STUDENT_STORY_QUERY = defineQuery(`
  *[
    _type == "studentStory"
    && slug.current == $slug
  ][0] {
    _id,
    title,
    "slug": slug.current,
    quote,
    studentName,
    discipline,

    image {
      asset,
      alt
    },

    story[] {
      ...,

      _type == "image" => {
        "dimensions": asset->metadata.dimensions { width, height }
      }
    }
  }
`);

export const LEARNING_ITEMS_QUERY = defineQuery(`
  *[
    _type == "learningItem"
    && kind != "Laboratory Practical"
  ]
  | order(kind asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    kind,
    summary,

    image {
      asset,
      alt
    }
  }
`);

export const LEARNING_ITEMS_BY_KIND_QUERY = defineQuery(`
  *[
    _type == "learningItem"
    && kind == $kind
  ]
  | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    kind,
    summary,

    image {
      asset,
      alt
    }
  }
`);

export const LEARNING_ITEM_QUERY = defineQuery(`
  *[
    _type == "learningItem"
    && slug.current == $slug
  ][0] {
    _id,
    title,
    "slug": slug.current,
    kind,
    summary,

    image {
      asset,
      alt
    }
  }
`);

/* ---------------------------------------------------------
   Laboratory practicals
   --------------------------------------------------------- */

export const LAB_PRACTICALS_QUERY = defineQuery(`
  *[
    _type == "laboratoryPractical"
    && defined(slug.current)
  ]
  | order(coalesce(conductedOn, _createdAt) desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    "disciplines": coalesce(disciplines, []),
    summary,
    conductedOn,

    featuredImage {
      asset,
      alt
    }
  }
`);

export const LAB_PRACTICAL_QUERY = defineQuery(`
  *[
    _type == "laboratoryPractical"
    && slug.current == $slug
  ][0] {
    _id,
    title,
    "slug": slug.current,
    "disciplines": coalesce(disciplines, []),
    summary,
    conductedOn,

    featuredImage {
      asset,
      alt,
      "dimensions": asset->metadata.dimensions { width, height }
    },

    location,
    "materials": coalesce(materials, []),

    members[] {
      _key,
      name,
      role
    },

    methodology[] {
      _key,
      title,
      instructions,

      image {
        asset,
        alt,
        caption,
        "dimensions": asset->metadata.dimensions { width, height }
      }
    },

    body[] {
      ...,

      _type == "image" => {
        "dimensions": asset->metadata.dimensions { width, height }
      }
    }
  }
`);

export const ABOUT_PAGE_QUERY = defineQuery(`
  *[_type == "aboutPage"][0] {
    eyebrow,
    heading,
    introduction,
    storyHeading,
    story,

    image {
      asset,
      alt
    },

    mission,
    vision,

    principles[] {
      _key,
      title,
      description
    },

    timeline[] {
      _key,
      period,
      title,
      description
    },

    seo {
      title,
      description
    }
  }
`);

export const CONTACT_PAGE_QUERY = defineQuery(`
  *[_type == "contactPage"][0] {
    eyebrow,
    heading,
    introduction,
    email,
    phone,
    location,
    locationDetail,
    officeHours,
    mapUrl,
    latitude,
    longitude,
    enquiryHeading,
    enquiryText,

    seo {
      title,
      description
    }
  }
`);

export const TEAM_PAGE_QUERY = defineQuery(`
  *[_type == "teamPage"][0] {
    eyebrow,
    heading,
    introduction,

    patronageHeading,
    executiveHeading,
    committeeHeading,
    coordinatorHeading,
    founderHeading,

    archiveHeading,
    archiveIntroduction,

    termCertificates[] {
      _key,
      termYear,
      label,
      "fileUrl": file.asset->url
    },

    seo {
      title,
      description
    }
  }
`);

export const CURRENT_TEAM_ASSIGNMENTS_QUERY = defineQuery(`
  *[
    _type == "teamAssignment"
    && status == "current"
    && group != "founder"
  ]
  | order(
      select(
        group == "patronage" => 0,
        group == "executive" => 1,
        group == "committee" => 2,
        group == "coordinator" => 3,
        4
      ) asc,
      sortOrder asc,
      person->fullName asc
    ) {
    _id,
    group,
    role,
    committee,
    discipline,
    termYear,
    status,
    termStart,
    termEnd,
    sortOrder,

    "person": person-> {
      _id,
      fullName,
      "slug": slug.current,

      portrait {
        asset,
        alt
      },

      professionalTitle,
      programme,
      department,
      biography,
      quote,
      showContactLinks,

      socialLinks {
        linkedin,
        facebook,
        instagram,
        whatsapp
      }
    }
  }
`);

/**
 * Founders and pioneer executives.
 *
 * Matches either the Founder leadership group or the Founder status. Other
 * statuses are ignored: a founding term is history, so it belongs on the team
 * page permanently rather than moving into the archive when the assignment is
 * marked archived.
 */
export const FOUNDING_TEAM_ASSIGNMENTS_QUERY = defineQuery(`
  *[
    _type == "teamAssignment"
    && (group == "founder" || status == "founder")
  ]
  | order(termYear asc, sortOrder asc, person->fullName asc) {
    _id,
    group,
    role,
    committee,
    discipline,
    termYear,
    status,
    termStart,
    termEnd,
    sortOrder,

    "person": person-> {
      _id,
      fullName,
      "slug": slug.current,

      portrait {
        asset,
        alt
      },

      professionalTitle,
      programme,
      department,
      quote
    }
  }
`);

/**
 * Every archived term year, one entry per assignment. The archive page counts
 * these to build its year filter, so the list stays a handful of integers
 * rather than whole team records.
 */
export const ARCHIVED_TEAM_YEARS_QUERY = defineQuery(`
  *[
    _type == "teamAssignment"
    && status == "archived"
    && group != "founder"
    && defined(termYear)
  ].termYear
`);

/** One archived leadership team, ordered exactly as the current team page. */
export const ARCHIVED_TEAM_BY_YEAR_QUERY = defineQuery(`
  *[
    _type == "teamAssignment"
    && status == "archived"
    && group != "founder"
    && termYear == $year
  ]
  | order(
      select(
        group == "patronage" => 0,
        group == "executive" => 1,
        group == "committee" => 2,
        group == "coordinator" => 3,
        4
      ) asc,
      sortOrder asc,
      person->fullName asc
    ) {
    _id,
    group,
    role,
    committee,
    discipline,
    termYear,
    status,
    termStart,
    termEnd,
    sortOrder,

    "person": person-> {
      _id,
      fullName,
      "slug": slug.current,

      portrait {
        asset,
        alt
      },

      professionalTitle,
      programme,
      department,
      quote
    }
  }
`);

/**
 * Site-wide search.
 *
 * One round trip returns a capped slice of each content type, so the browser
 * never receives the dataset — only the handful of matches it asked for.
 *
 * `contactSubmission` is deliberately absent: those are private enquiries and
 * must never surface in search.
 */
export const SEARCH_QUERY = defineQuery(`
  {
    "research": *[
      _type == "researchProject"
      && (
        title match $term
        || tags[] match $term
        || summary match $term
        || discipline match $term
      )
    ] | order(year desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      "excerpt": summary,
      "meta": discipline
    },

    "opportunity": *[
      _type == "projectOpportunity"
      && (
        title match $term
        || tags[] match $term
        || summary match $term
        || discipline match $term
        || level match $term
      )
    ] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      "excerpt": summary,
      "meta": discipline
    },

    "learning": *[
      _type == "learningItem"
      && (
        title match $term
        || tags[] match $term
        || summary match $term
        || kind match $term
      )
    ] [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      "excerpt": summary,
      "meta": kind
    },

    "practical": *[
      _type == "laboratoryPractical"
      && (
        title match $term
        || tags[] match $term
        || summary match $term
        || location match $term
        || disciplines[] match $term
      )
    ] | order(coalesce(conductedOn, _createdAt) desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      "excerpt": summary,
      "meta": location
    },

    "event": *[
      _type == "event"
      && (
        title match $term
        || tags[] match $term
        || summary match $term
        || venue match $term
      )
    ] | order(startsAt desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      "excerpt": summary,
      "meta": venue
    },

    "story": *[
      _type == "studentStory"
      && (
        title match $term
        || tags[] match $term
        || quote match $term
        || studentName match $term
        || discipline match $term
      )
    ] [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      "excerpt": quote,
      "meta": studentName
    },

    "person": *[
      _type == "person"
      && (
        fullName match $term
        || professionalTitle match $term
        || programme match $term
        || department match $term
      )
    ] | order(fullName asc) [0...$limit] {
      _id,
      "title": fullName,
      "slug": slug.current,
      "excerpt": coalesce(professionalTitle, programme),
      "meta": department
    },

    "newsletter": *[
      _type == "newsletterIssue"
      && (
        title match $term
        || tags[] match $term
        || summary match $term
        || newsBriefs[].headline match $term
      )
    ] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      "excerpt": summary,
      "meta": "Issue " + string(issueNumber)
    }
  }
`);

export const TEAM_PEOPLE_QUERY = defineQuery(`
  *[_type == "person"] {
    _id,
    "slug": slug.current
  }
`);

export const TEAM_PERSON_QUERY = defineQuery(`
  *[
    _type == "person"
    && slug.current == $slug
  ][0] {
    _id,
    fullName,
    "slug": slug.current,

    portrait {
      asset,
      alt
    },

    professionalTitle,
    programme,
    department,
    biography,
    quote,
    showContactLinks,

    socialLinks {
      linkedin,
      facebook,
      instagram,
      whatsapp
    },

    "assignments":
      *[
        _type == "teamAssignment"
        && references(^._id)
      ]
      | order(termYear desc, sortOrder asc) {
        _id,
        group,
        role,
        committee,
        discipline,
        termYear,
        status,
        termStart,
        termEnd,
        sortOrder,
        contributions,

        certificate.asset != null => {
          "certificate": {
            "url": certificate.asset->url,
            "mimeType": certificate.asset->mimeType
          }
        },

        "person": {
          "_id": ^._id,
          "fullName": ^.fullName,
          "slug": ^.slug.current,
          "portrait": ^.portrait,
          "professionalTitle": ^.professionalTitle,
          "programme": ^.programme,
          "department": ^.department
        }
      }
  }
`);

export const NEWSLETTER_ISSUES_QUERY = defineQuery(`
  *[
    _type == "newsletterIssue"
  ]
  | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    issueNumber,
    publishedAt,
    summary,
    featured,

    coverImage {
      asset,
      alt
    },

    tags,

    // Brief teasers for the listing's news columns; the full text and
    // galleries only ride along on the issue page.
    "briefs": newsBriefs[] {
      _key,
      headline,
      category,
      image { asset, alt },
      "excerpt": pt::text(body)
    },

    "pdfUrl": pdfFile.asset->url,

    seo {
      title,
      description
    }
  }
`);

export const NEWSLETTER_ISSUE_QUERY = defineQuery(`
  *[
    _type == "newsletterIssue"
    && slug.current == $slug
  ][0] {
    _id,
    title,
    "slug": slug.current,
    issueNumber,
    publishedAt,
    summary,
    featured,

    coverImage {
      asset,
      alt
    },

    tags,

    editor-> {
      fullName,
      "slug": slug.current,
      professionalTitle,
      portrait { asset, alt }
    },

    newsBriefs[] {
      _key,
      headline,
      category,

      image {
        asset,
        alt,
        caption
      },

      body[] {
        ...,

        _type == "image" => {
          "dimensions": asset->metadata.dimensions { width, height }
        }
      },

      gallery[] {
        _key,
        asset,
        alt,
        caption,
        "dimensions": asset->metadata.dimensions { width, height }
      }
    },

    "pdfUrl": pdfFile.asset->url,

    seo {
      title,
      description
    }
  }
`);

export const COLLABORATIONS_PAGE_QUERY = defineQuery(`
  *[
    _type == "collaborationsPage"
  ][0] {
    eyebrow,
    heading,
    introduction,

    opportunities[] {
      _key,
      title,
      description
    },

    partnerHeading,
    partnerText,

    ctaLabel,

    seo {
      title,
      description
    }
  }
`);
/*
 * Every document that renders its own page, for app/sitemap.ts. The filters
 * mirror each detail query, so the sitemap never lists a URL that 404s:
 * a research project in Draft, for instance, has no public page.
 */
export const SITEMAP_QUERY = defineQuery(`
  {
    "research": *[
      _type == "researchProject"
      && defined(slug.current)
      && status != "Draft"
    ] { "slug": slug.current, _updatedAt },

    "opportunities": *[
      _type == "projectOpportunity" && defined(slug.current)
    ] { "slug": slug.current, _updatedAt },

    "learningItems": *[
      _type == "learningItem" && defined(slug.current)
    ] { "slug": slug.current, _updatedAt },

    "practicals": *[
      _type == "laboratoryPractical" && defined(slug.current)
    ] { "slug": slug.current, _updatedAt },

    "newsletters": *[
      _type == "newsletterIssue" && defined(slug.current)
    ] { "slug": slug.current, _updatedAt },

    "events": *[
      _type == "event" && defined(slug.current)
    ] { "slug": slug.current, _updatedAt },

    "stories": *[
      _type == "studentStory" && defined(slug.current)
    ] { "slug": slug.current, _updatedAt },

    "people": *[
      _type == "person" && defined(slug.current)
    ] { "slug": slug.current, _updatedAt },

    // Same filter as ARCHIVED_TEAM_YEARS_QUERY: only terms with people in
    // them, since an empty year renders an empty-state page.
    "archiveYears": array::unique(*[
      _type == "teamAssignment"
      && status == "archived"
      && group != "founder"
      && defined(termYear)
    ].termYear)
  }
`);

/* Titles and one-line summaries for /llms.txt, newest first. */
export const LLMS_QUERY = defineQuery(`
  {
    "research": *[
      _type == "researchProject"
      && defined(slug.current)
      && status != "Draft"
    ] | order(year desc) { title, "slug": slug.current, summary },

    "opportunities": *[
      _type == "projectOpportunity" && defined(slug.current)
    ] | order(publishedAt desc) { title, "slug": slug.current, summary },

    "practicals": *[
      _type == "laboratoryPractical" && defined(slug.current)
    ] | order(_createdAt desc) { title, "slug": slug.current, summary },

    "learningItems": *[
      _type == "learningItem" && defined(slug.current)
    ] | order(_createdAt desc) { title, "slug": slug.current, summary },

    "events": *[
      _type == "event" && defined(slug.current)
    ] | order(startsAt desc) [0...20] { title, "slug": slug.current, summary },

    "newsletters": *[
      _type == "newsletterIssue" && defined(slug.current)
    ] | order(publishedAt desc) { title, "slug": slug.current, summary }
  }
`);

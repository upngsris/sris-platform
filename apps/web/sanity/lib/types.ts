import type {SanityImageSource} from "@sanity/image-url";
import type {PortableTextBlock} from "next-sanity";
import type {Discipline} from "@/lib/disciplines";

export type SanityImage = {
  asset?: SanityImageSource;
  alt?: string;
  /** Original pixel size, from asset->metadata.dimensions. */
  dimensions?: {
    width: number;
    height: number;
  };
};

export type SeoData = {
  title?: string;
  description?: string;
};

export type HeroData = {
  eyebrow?: string;
  heading?: string;
  summary?: string;
  image?: SanityImage;

  primaryCta?: {
    label?: string;
    href?: string;
  };

  secondaryCta?: {
    label?: string;
    href?: string;
  };
};

export type AboutData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  body?: string;
};

export type MembershipCtaData = {
  eyebrow?: string;
  heading?: string;
  body?: string;

  cta?: {
    label?: string;
    href?: string;
  };
};

export type AboutPrinciple = {
  _key: string;
  title: string;
  description: string;
};

export type AboutMilestone = {
  _key: string;
  period: string;
  title: string;
  description: string;
};

export type AboutPageData = {
  eyebrow: string;
  heading: string;
  introduction: string;

  storyHeading: string;
  story: string;

  image?: SanityImage;

  mission: string;
  vision: string;

  principles: AboutPrinciple[];

  timeline?: AboutMilestone[];

  seo?: SeoData;
};

export type ContactPageData = {
  eyebrow: string;
  heading: string;
  introduction: string;

  email: string;
  phone?: string;

  location: string;
  locationDetail?: string;

  officeHours?: string;

  /** Map overrides. Latitude and longitude are only honoured together. */
  mapUrl?: string;
  latitude?: number;
  longitude?: number;

  enquiryHeading: string;
  enquiryText: string;

  seo?: SeoData;
};

export type ResearchProjectStatus =
  | "Draft"
  | "Active"
  | "Completed"
  | "Archived";

export type ResearchProject = {
  _id: string;
  title: string;
  slug: string;
  discipline: string;
  year: number;
  summary: string;
  coverImage?: SanityImage;
  status: ResearchProjectStatus;
};

export type ProjectOpportunityStatus =
  | "Applications open"
  | "Positions available"
  | "Closed";

export type ProjectOpportunity = {
  _id: string;
  title: string;
  slug: string;
  discipline: string;
  level: string;
  summary: string;
  applicationStatus: ProjectOpportunityStatus;
  publishedAt: string;
};

export type LearningItemKind =
  | "Skills Track"
  | "Knowledge Sharing";

export type LearningItem = {
  _id: string;
  title: string;
  slug: string;
  kind: LearningItemKind;
  summary: string;
  image?: SanityImage;
};

/** A homepage Learn & Do feature: a Learning Item or a Laboratory Practical. */
export type FeaturedLearning = {
  _id: string;
  _type: "learningItem" | "laboratoryPractical";
  title: string;
  slug: string;
  kind?: string;
  summary?: string;
  image?: SanityImage;
};

export type CaptionedImage = SanityImage & {
  caption?: string;
};

export type LaboratoryPracticalSummary = {
  _id: string;
  title: string;
  slug: string;
  disciplines: Discipline[];
  summary: string;
  conductedOn?: string;
  featuredImage?: SanityImage;
};

export type LaboratoryPracticalMember = {
  _key: string;
  name?: string;
  role?: string;
};

export type LaboratoryPracticalStep = {
  _key: string;
  title: string;
  instructions?: PortableTextBlock[];
  image?: CaptionedImage;
};

export type LaboratoryPractical = LaboratoryPracticalSummary & {
  location?: string;
  materials: string[];
  members?: LaboratoryPracticalMember[] | null;
  methodology?: LaboratoryPracticalStep[] | null;
  body?: PortableTextBlock[] | null;
};

export type StudentStoryData = {
  _id: string;
  title: string;
  slug: string;
  quote: string;
  studentName: string;
  discipline: string;
  image?: SanityImage;
  /** The full story; only fetched on the story page. */
  story?: PortableTextBlock[] | null;
};

export type EventGalleryImage = SanityImage & {
  _key: string;
  caption?: string;
};

export type EventData = {
  _id: string;
  title: string;
  slug: string;
  startsAt: string;
  endsAt?: string;
  venue: string;

  /** Plain teaser for listings, search and link previews. Never formatted. */
  summary?: string;

  /** Card badge and register-button note, e.g. "Free". */
  admission?: string | null;
  registrationUrl?: string | null;

  /** Only selected by EVENT_QUERY. */
  address?: string | null;
  organiser?: string | null;
  tags?: string[] | null;

  image?: SanityImage;
  isPast?: boolean;

  /**
   * The full programme as Portable Text. Only selected by EVENT_QUERY —
   * listings do not carry it, and neither do they carry the gallery.
   */
  description?: PortableTextBlock[];

  gallery?: EventGalleryImage[];
};

/**
 * Calendar payload for the events page. `today` is GROQ's now(), used to pick
 * the opening year/month without reading a clock during render.
 */
export type RelatedEventsData = {
  upcoming: EventData[];
  past: EventData[];
};

export type EventsCalendarData = {
  today: string;
  events: EventData[];
};

export type HomePageData = {
  hero?: HeroData;
  about?: AboutData;
  featuredResearch?: ResearchProject;
  featuredOpportunities?: ProjectOpportunity[];
  featuredLearning?: FeaturedLearning[];
  featuredStory?: StudentStoryData;
  featuredEvents?: EventData[];
  membershipCta?: MembershipCtaData;
};

export type TeamAssignmentGroup =
  | "patronage"
  | "executive"
  | "committee"
  | "coordinator"
  | "founder";

export type TeamAssignmentStatus =
  | "current"
  | "archived"
  | "founder";

export type PersonSocialLinks = {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
};

export type PersonData = {
  _id: string;
  fullName: string;
  slug: string;

  portrait?: SanityImage;

  professionalTitle?: string;
  programme?: string;
  department?: string;

  biography?: string;
  quote?: string;

  showContactLinks?: boolean;

  socialLinks?: PersonSocialLinks;
};

export type TeamAssignment = {
  _id: string;

  person: PersonData;

  group: TeamAssignmentGroup;

  role: string;

  committee?: string;
  discipline?: string;

  termYear: number;

  status: TeamAssignmentStatus;

  termStart?: string;
  termEnd?: string;

  sortOrder: number;

  /** Only fetched for the profile page's leadership history. */
  contributions?: PortableTextBlock[];

  /** Only fetched for the profile page. */
  certificate?: AssignmentCertificate;
};

/** A leader's certificate for one role and term: a PDF or an image file. */
export type AssignmentCertificate = {
  url: string;
  mimeType?: string;
};

/** One past leadership team's certificate, linked from the archive page. */
export type TermCertificate = {
  _key: string;
  termYear: number;
  label?: string;
  fileUrl?: string;
};

export type TeamPageData = {
  eyebrow: string;
  heading: string;
  introduction: string;

  patronageHeading: string;
  executiveHeading: string;
  committeeHeading: string;
  coordinatorHeading: string;

  /** Optional so the page still renders before the field is published. */
  founderHeading?: string;

  archiveHeading: string;
  archiveIntroduction: string;

  termCertificates?: TermCertificate[];

  seo?: SeoData;
};

export type TeamPersonPageData = PersonData & {
  assignments: TeamAssignment[];
};

export type NewsBrief = {
  _key: string;
  headline: string;
  category?: string | null;
  image?: CaptionedImage | null;
  body?: PortableTextBlock[] | null;
  gallery?: (CaptionedImage & {_key: string})[] | null;
};

export type NewsBriefTeaser = {
  _key: string;
  headline: string;
  category?: string | null;
  image?: SanityImage | null;
  excerpt?: string | null;
};

export type NewsletterIssue = {
  _id: string;

  title: string;
  slug: string;

  issueNumber: number;
  publishedAt: string;

  summary: string;

  coverImage?: SanityImage;

  tags?: string[] | null;

  /** Teasers, only fetched by NEWSLETTER_ISSUES_QUERY. */
  briefs?: NewsBriefTeaser[] | null;

  /** Only fetched by NEWSLETTER_ISSUE_QUERY. */
  newsBriefs?: NewsBrief[] | null;

  editor?: {
    fullName: string;
    slug?: string | null;
    professionalTitle?: string | null;
    portrait?: SanityImage | null;
  } | null;

  pdfUrl?: string;

  featured?: boolean;

  seo?: SeoData;
};

export type CollaborationOpportunity = {
  _key: string;

  title: string;
  description: string;
};

export type CollaborationsPageData = {
  eyebrow: string;
  heading: string;
  introduction: string;

  opportunities: CollaborationOpportunity[];

  partnerHeading: string;
  partnerText: string;

  ctaLabel: string;

  seo?: SeoData;
};
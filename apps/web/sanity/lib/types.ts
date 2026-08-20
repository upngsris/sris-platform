export type SanityImage = {
  asset?: unknown;
  alt?: string;
};

export type HomeIntroData = {
  hero?: {
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

  about?: {
    eyebrow?: string;
    heading?: string;
    lead?: string;
    body?: string;
  };

  featuredResearch?: {
    _id: string;
    title: string;
    slug: string;
    discipline?: string;
    year?: number;
    summary?: string;
    coverImage?: SanityImage;
  };

  featuredOpportunities?: Array<{
  _id: string;
  title: string;
  slug: string;
  discipline?: string;
  level?: string;
  summary?: string;
  applicationStatus?: string;
}>;

featuredLearning?: Array<{
  _id: string;
  title: string;
  slug: string;
  kind?: string;
  summary?: string;
  image?: SanityImage;
}>;

featuredStory?: {
  _id: string;
  title?: string;
  slug: string;
  quote: string;
  studentName?: string;
  discipline?: string;
  image?: SanityImage;
};

featuredEvents?: Array<{
  _id: string;
  title: string;
  slug: string;
  startsAt: string;
  endsAt?: string;
  venue?: string;
  summary?: string;
  image?: SanityImage;
}>;
membershipCta?: {
  eyebrow?: string;
  heading?: string;
  body?: string;

  cta?: {
    label?: string;
    href?: string;
  };
};
};
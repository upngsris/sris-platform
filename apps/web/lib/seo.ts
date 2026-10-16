import type { Metadata } from "next";

import type { SanityImageSource } from "@sanity/image-url";

import { urlFor } from "@/sanity/lib/image";

/*
 * One place for everything a search engine or link preview reads: the
 * production origin, the society's name, and the per-page metadata shape.
 */

/**
 * The public origin. Set NEXT_PUBLIC_SITE_URL in each environment; on Vercel
 * the production domain is picked up automatically. Canonical URLs, the
 * sitemap and Open Graph images are all absolute, so a wrong value here
 * points every one of them at the wrong host.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

if (process.env.NODE_ENV === "production" && siteUrl.includes("localhost")) {
  // Canonical URLs, the sitemap and social previews would all point at
  // localhost. Set NEXT_PUBLIC_SITE_URL before deploying.
  console.warn(
    "[seo] NEXT_PUBLIC_SITE_URL is not set; absolute URLs will use " + siteUrl,
  );
}

export const site = {
  name: "Science, Research & Innovation Society",
  shortName: "UPNG SRIS",
  legalName: "UPNG Science, Research and Innovation Society",
  description:
    "A student-led community for practical science, research, innovation and knowledge sharing at the University of Papua New Guinea.",
  locale: "en_PG",
  logo: "/images/brand/sris-lockup.png",
  emblem: "/icons/icon-512.png",
  ogImage: {
    url: "/images/og-image.png",
    width: 1200,
    height: 630,
    alt: "Science, Research & Innovation Society, University of Papua New Guinea",
  },
} as const;

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

/**
 * Search results show roughly 155–160 characters. Descriptions that come
 * from body copy are cut at a word boundary so a snippet never ends mid-word.
 */
export function clampDescription(
  value: string | undefined | null,
  limit = 160,
) {
  if (!value) {
    return undefined;
  }

  const collapsed = value.replace(/\s+/g, " ").trim();

  if (collapsed.length <= limit) {
    return collapsed;
  }

  const clipped = collapsed.slice(0, limit - 1);
  const lastSpace = clipped.lastIndexOf(" ");

  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).replace(/[,;:.\s]+$/, "")}…`;
}

/** A 1200×630 crop of a Sanity image, the size link previews expect. */
export function shareImage(
  image: { asset?: SanityImageSource; alt?: string } | undefined | null,
  fallbackAlt: string,
) {
  if (!image?.asset) {
    return undefined;
  }

  return {
    url: urlFor(image.asset)
      .width(1200)
      .height(630)
      .fit("crop")
      .auto("format")
      .url(),
    width: 1200,
    height: 630,
    alt: image.alt || fallbackAlt,
  };
}

type PageMetadataInput = {
  title: string;
  description?: string | null;
  /** Route path, e.g. "/about". Becomes the canonical URL. */
  path: string;
  image?: ReturnType<typeof shareImage>;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  noIndex?: boolean;
};

/**
 * Metadata for one page. Next merges metadata shallowly, so a page that sets
 * `openGraph` replaces the root layout's object wholesale; building every
 * page's metadata here keeps the site name, locale and fallback share image
 * on each of them.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  noIndex,
}: PageMetadataInput): Metadata {
  const summary = clampDescription(description) ?? site.description;
  const images = [image ?? site.ogImage];

  return {
    title,
    description: summary,

    alternates: {
      canonical: path,
    },

    openGraph: {
      type,
      url: path,
      siteName: site.name,
      locale: site.locale,
      title,
      description: summary,
      images,
      ...(publishedTime && type === "article" ? { publishedTime } : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      images: images.map((entry) => entry.url),
    },

    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

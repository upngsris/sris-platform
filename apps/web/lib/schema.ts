import { routes } from "@/lib/route";
import { absoluteUrl, clampDescription, siteUrl } from "@/lib/seo";

import { urlFor } from "@/sanity/lib/image";
import type { EventData, PersonData, SanityImage } from "@/sanity/lib/types";

/*
 * schema.org builders for the detail pages. Each one references the
 * Organization declared once in the root layout by @id, rather than
 * repeating the society's details on every page.
 */

const organization = { "@id": `${siteUrl}/#organization` };

function imageUrl(image: SanityImage | undefined) {
  return image?.asset
    ? urlFor(image.asset).width(1200).auto("format").url()
    : undefined;
}

export function eventSchema(event: EventData, description?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    url: absoluteUrl(routes.community.events.detail(event.slug)),
    description: clampDescription(description ?? event.summary, 300),
    image: imageUrl(event.image),
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Port Moresby",
        addressRegion: "National Capital District",
        addressCountry: "PG",
      },
    },
    organizer: organization,
  };
}

export function personSchema(person: PersonData) {
  const url = absoluteUrl(routes.about.teamMember(person.slug));

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      name: person.fullName,
      url,
      image: imageUrl(person.portrait),
      jobTitle: person.professionalTitle,
      description: clampDescription(person.biography, 300),
      affiliation: organization,
      // Only profiles the person chose to show on the page, and never the
      // WhatsApp link, which is a phone number rather than a profile.
      sameAs: person.showContactLinks
        ? [
            person.socialLinks?.linkedin,
            person.socialLinks?.facebook,
            person.socialLinks?.instagram,
          ].filter((link): link is string => Boolean(link?.startsWith("http")))
        : [],
    },
  };
}

export function articleSchema({
  type = "Article",
  title,
  path,
  description,
  image,
  datePublished,
  author,
}: {
  type?: "Article" | "NewsArticle" | "LearningResource";
  title: string;
  path: string;
  description?: string;
  image?: SanityImage;
  datePublished?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    headline: title,
    name: title,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    description: clampDescription(description, 300),
    image: imageUrl(image),
    datePublished,
    author: author ? { "@type": "Person", name: author } : organization,
    publisher: organization,
  };
}

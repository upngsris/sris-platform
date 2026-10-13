import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import "./globals.css";
import "./lpi.css";
import "./states.css";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { SRIS_LOCATION } from "@/lib/contact";
import { routes } from "@/lib/route";
import { absoluteUrl, pageMetadata, site, siteUrl } from "@/lib/seo";
import { socials } from "@/lib/socials";

/*
 * Open Sans is the typeface for the whole site, as on lpi.org.
 */
const lpi = Open_Sans({
  subsets: ["latin"],
  variable: "--font-lpi",
  display: "swap",
});

/*
 * Site-wide defaults. metadataBase turns every relative canonical and image
 * URL into an absolute one; pages build their own entries with pageMetadata().
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: site.shortName,
  ...pageMetadata({
    title: "UPNG SRIS | Science, Research & Innovation Society",
    description: site.description,
    path: "/",
  }),

  // No site-wide canonical: a page that did not set its own (a 404, a status
  // page) would otherwise claim to be the homepage. app/page.tsx sets "/".
  alternates: undefined,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: site.name,
      alternateName: [site.shortName, site.legalName],
      url: absoluteUrl("/"),
      logo: absoluteUrl(site.emblem),
      description: site.description,
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "University of Papua New Guinea",
        url: "https://www.upng.ac.pg",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: SRIS_LOCATION.name,
        addressLocality: "Port Moresby",
        addressRegion: "National Capital District",
        addressCountry: "PG",
      },
      sameAs: Object.values(socials),
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: site.name,
      alternateName: site.shortName,
      url: absoluteUrl("/"),
      inLanguage: "en",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${absoluteUrl(routes.search)}?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${lpi.variable}`}>
        <JsonLd data={organizationSchema} />

        <SiteHeader />

        {children}

        <SiteFooter />

        <ScrollReveal />
      </body>
    </html>
  );
}

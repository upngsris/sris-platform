import type {Metadata} from "next";

import {Breadcrumb} from "@/components/ui/breadcrumb";
import {ContactForm} from "@/components/contact/contact-form";

import {
  SRIS_LOCATION,
  mapDirectionsUrl,
  mapEmbedSrc,
} from "@/lib/contact";

import {sanityFetch} from "@/sanity/lib/fetch";
import {CONTACT_PAGE_QUERY} from "@/sanity/lib/queries";

import type {ContactPageData} from "@/sanity/lib/types";

import styles from "../about.module.css";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/route";
import { socials } from "@/lib/socials";

export async function generateMetadata(): Promise<Metadata> {
  const page =
    await sanityFetch<ContactPageData | null>({
      query: CONTACT_PAGE_QUERY,
    });

  return pageMetadata({
    title:
      page?.seo?.title ??
      "Contact SRIS | UPNG",

    description:
      page?.seo?.description ??
      page?.introduction ??
      "Contact the Science, Research and Innovation Society at the University of Papua New Guinea.",
    path: routes.about.contact,
  });
}

/**
 * Resolves what the page shows from the Contact document, falling back to the
 * known campus location.
 *
 * The page used to render a form and nothing else whenever that document was
 * missing — no address, no map, no way to reach anyone. Everything that can be
 * stated without a CMS entry is now stated; only details the society alone can
 * supply, the email address and phone number, stay conditional.
 */
function resolveDetails(page: ContactPageData | null) {
  const hasCoordinates =
    typeof page?.latitude === "number" &&
    typeof page?.longitude === "number";

  return {
    location: page?.location ?? SRIS_LOCATION.name,
    locationDetail:
      page?.locationDetail ?? SRIS_LOCATION.address,

    latitude: hasCoordinates
      ? page.latitude!
      : SRIS_LOCATION.latitude,

    longitude: hasCoordinates
      ? page.longitude!
      : SRIS_LOCATION.longitude,

    mapUrl: page?.mapUrl ?? SRIS_LOCATION.mapUrl,
  };
}

const socialChannels = [
  { label: "Facebook", href: socials.facebook },
  { label: "Instagram", href: socials.instagram },
  { label: "LinkedIn", href: socials.linkedin },
  { label: "YouTube", href: socials.youtube },
  { label: "TikTok", href: socials.tiktok },
  { label: "X", href: socials.x },
];

export default async function ContactPage() {
  const page =
    await sanityFetch<ContactPageData | null>({
      query: CONTACT_PAGE_QUERY,
    });

  const details = resolveDetails(page);

  /* Numbered in render order so adding or dropping a row cannot leave a gap. */
  const rows: {label: string; content: React.ReactNode}[] = [];

  if (page?.email) {
    rows.push({
      label: "Email",
      content: (
        <a
          href={`mailto:${page.email}`}
          className={styles.contactPrimary}
        >
          {page.email}
        </a>
      ),
    });
  }

  if (page?.phone) {
    rows.push({
      label: "Phone",
      content: (
        <a
          href={`tel:${normalisePhone(page.phone)}`}
          className={styles.contactPrimary}
        >
          {page.phone}
        </a>
      ),
    });
  }

  rows.push({
    label: "Location",
    content: (
      <>
        <p className={styles.contactPrimary}>
          {details.location}
        </p>

        <p className="body muted">
          {details.locationDetail}
        </p>
      </>
    ),
  });

  if (page?.officeHours) {
    rows.push({
      label: "Contact hours",
      content: (
        <p className={styles.contactPrimary}>
          {page.officeHours}
        </p>
      ),
    });
  }

  rows.push({
    label: "Social media",
    content: (
      <>
        <p className="body muted">
          Follow SRIS or send us a message on our official channels.
        </p>

        <ul className={styles.socialList}>
          {socialChannels.map((channel) => (
            <li key={channel.label}>
              <a
                href={channel.href}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.contactPrimary}
              >
                {channel.label}
              </a>
            </li>
          ))}
        </ul>
      </>
    ),
  });

  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <Breadcrumb trail={[{label: "Contact"}]} />

          <div className="pageHeroGrid">
            <div data-reveal>
              <p className="eyebrow blue">
                {page?.eyebrow ?? "Contact"}
              </p>

              <h1>
                {page?.heading ??
                  "Get in touch with SRIS."}
              </h1>
            </div>

            <p className="lead" data-reveal>
              {page?.introduction ??
                "Send the society a message and we will reply to your email address."}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.contactDetails}>
        <div className="shell">
          <div className={styles.contactList}>
            {rows.map((row, index) => (
              <ContactItem
                key={row.label}
                index={String(index + 1).padStart(2, "0")}
                label={row.label}
              >
                {row.content}
              </ContactItem>
            ))}
          </div>
        </div>
      </section>

      <FindUs details={details} />

      <EnquiryForm />

      <section className="bandBlue">
        <div className="shell bandGrid">
          <div data-reveal>
            <p className="eyebrow soft">
              Enquiries
            </p>

            <h2>
              {page?.enquiryHeading ??
                "Tell us what you are working on."}
            </h2>
          </div>

          <div className={styles.enquiryCopy} data-reveal>
            <p className="lead">
              {page?.enquiryText ??
                "Whether you are a student looking to join a project, a lecturer proposing a collaboration or an organisation exploring partnership, the society would like to hear from you."}
            </p>

            {page?.email && (
              <a
                href={`mailto:${page.email}`}
                className="button buttonLight"
              >
                <span>Email SRIS</span>
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function FindUs({
  details,
}: {
  details: ReturnType<typeof resolveDetails>;
}) {
  return (
    <section className={styles.mapSection}>
      <div className="shell">
        <div className="pageHeading" data-reveal>
          <div>
            <p className="eyebrow blue">Find us</p>

            <h2>Where to find the society.</h2>
          </div>

          <p>
            SRIS is based on the University of Papua New Guinea
            Waigani campus. Use the map to plan your visit.
          </p>
        </div>

        <div className={styles.mapPanel} data-reveal>
          <div className={styles.mapFrame}>
            {/*
              * Keyless embed, so nothing here depends on a Maps API key.
              * It is lazy so a third-party frame never blocks first paint,
              * and the address in the list above is the answer for anyone
              * the frame never reaches.
              */}
            <iframe
              title={`Map showing ${details.location}`}
              src={mapEmbedSrc({
                latitude: details.latitude,
                longitude: details.longitude,
              })}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className={styles.mapActions}>
            <a
              className="button"
              href={mapDirectionsUrl({
                latitude: details.latitude,
                longitude: details.longitude,
              })}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span>Get directions</span>
              <span aria-hidden="true">→</span>
            </a>

            <a
              className={styles.mapLink}
              href={details.mapUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Open in Google Maps
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function EnquiryForm() {
  return (
    <section className={styles.formSection}>
      <div className="shell">
        <div className="pageHeading" data-reveal>
          <div>
            <p className="eyebrow blue">Send a message</p>

            <h2>Write to the society.</h2>
          </div>

          <p>
            Questions about membership, projects, collaboration
            or events — send SRIS a message and the team will
            respond by email.
          </p>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formIntro} data-reveal>
            <p className="eyebrow blue">What to expect</p>

            <h2>We read every enquiry.</h2>

            <p>
              Messages reach the SRIS executive team. Replies
              are usually sent within a few days during the
              academic year.
            </p>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function ContactItem({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <article className={styles.contactItem} data-reveal>
      <span className={styles.contactIndex}>
        {index}
      </span>

      <p className="eyebrow blue">
        {label}
      </p>

      <div>{children}</div>
    </article>
  );
}

function normalisePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

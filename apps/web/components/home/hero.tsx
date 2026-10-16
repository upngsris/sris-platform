import Link from "next/link";

import { SanityImage } from "@/components/sanity/sanity-image";

import type { HeroData } from "@/sanity/lib/types";

type Props = {
  data?: HeroData;
};

export function Hero({ data }: Props) {
  if (!data?.heading) {
    return null;
  }

  const hasImage = Boolean(data.image?.asset);

  return (
    <section className={hasImage ? "lpi-hero has-image" : "lpi-hero"}>
      {hasImage && (
        <div className="lpi-hero-image">
          <SanityImage
            image={data.image}
            fallbackAlt="SRIS students participating in practical learning"
            sizes="100vw"
            width={2000}
            height={900}
            priority
          />
        </div>
      )}

      <div className="lpi-container">
        <div className="lpi-hero-body">
          <h1>{toSentenceCase(data.heading)}</h1>

          {data.summary && <p className="lpi-lead">{data.summary}</p>}

          {(data.primaryCta?.label || data.secondaryCta?.label) && (
            <div className="lpi-hero-actions">
              {data.primaryCta?.label && data.primaryCta.href && (
                <Link href={data.primaryCta.href} className="lpi-button">
                  {data.primaryCta.label}
                </Link>
              )}

              {data.secondaryCta?.label && data.secondaryCta.href && (
                <Link
                  href={data.secondaryCta.href}
                  className="lpi-button is-ghost"
                >
                  {data.secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Headings are sometimes entered in caps in the studio. Normalise shouted
 * copy to sentence case while leaving mixed-case headings as written.
 */
function toSentenceCase(value: string) {
  const isShouted = value === value.toUpperCase();

  if (!isShouted) {
    return value;
  }

  return value
    .toLowerCase()
    .replace(/(^|[.!?]\s+)([a-z])/g, (_match, prefix: string, letter: string) =>
      `${prefix}${letter.toUpperCase()}`,
    );
}

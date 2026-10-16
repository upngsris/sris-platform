import Link from "next/link";

import { SanityImage } from "@/components/sanity/sanity-image";

import type { SanityImage as SanityImageData } from "@/sanity/lib/types";

export type Tone = "primary" | "support" | "deep" | "accent" | "interactive";

type CardProps = {
  /** Brand colour for the card's top edge and photo panel. */
  tone?: Tone;
  /** Small heading above the title, like "Events" / "News" on lpi.org. */
  label: string;
  title: string;
  href?: string;
  linkLabel?: string;
  summary?: string;
  meta?: string;
  image?: SanityImageData;
  /** Shown on a yellow panel when there is no photograph. */
  badge?: { primary: string; secondary?: string };
  children?: React.ReactNode;
};

export function LpiCard({
  tone = "primary",
  label,
  title,
  href,
  linkLabel = "Learn more",
  summary,
  meta,
  image,
  badge,
  children,
}: CardProps) {
  const hasMedia = Boolean(image?.asset) || Boolean(badge);

  const media = (
    <span className="lpi-card-media">
      {image?.asset ? (
        <SanityImage
          image={image}
          fallbackAlt={title}
          sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 33vw"
          width={1000}
          height={600}
        />
      ) : (
        badge && (
          <span className="lpi-card-badge" aria-hidden="true">
            <strong>{badge.primary}</strong>

            {badge.secondary && <span>{badge.secondary}</span>}
          </span>
        )
      )}
    </span>
  );

  return (
    <article className="lpi-card" data-tone={tone}>
      {hasMedia &&
        (href ? (
          <Link href={href} tabIndex={-1} aria-hidden="true">
            {media}
          </Link>
        ) : (
          media
        ))}

      <div className="lpi-card-text">
        <h3>{label}</h3>

        <p>
          <strong>{title}</strong>
        </p>

        {summary && <p>{summary}</p>}

        {meta && <p className="lpi-card-meta">{meta}</p>}

        {children}

        {href && (
          <Link href={href} className="lpi-link">
            {linkLabel}
          </Link>
        )}
      </div>
    </article>
  );
}

export function LpiGrid({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`lpi-grid is-n${Math.min(Math.max(count, 1), 3)}`}>
      {children}
    </div>
  );
}

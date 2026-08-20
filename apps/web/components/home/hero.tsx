import Image from "next/image";
import Link from "next/link";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { TextLink } from "@/components/ui/text-link";

import { urlFor } from "@/sanity/lib/image";
import type { HomeIntroData } from "@/sanity/lib/types";

type Props = {
  data?: HomeIntroData["hero"];
};

export function Hero({ data }: Props) {
  const eyebrow =
    data?.eyebrow ?? "Science · Research · Innovation";

  const heading =
    data?.heading ?? "GO BEYOND THE CLASSROOM.";

  const summary =
    data?.summary ??
    "Explore ideas. Test them. Build things. Share what you discover.";

  const primaryLabel =
    data?.primaryCta?.label ?? "Explore projects";

  const primaryHref =
    data?.primaryCta?.href ?? "/explore/research";

  const secondaryLabel =
    data?.secondaryCta?.label ?? "Become a member";

  const secondaryHref =
    data?.secondaryCta?.href ?? "/community/membership";

  const heroImageUrl = data?.image?.asset
    ? urlFor(data.image)
        .width(1920)
        .height(1080)
        .fit("crop")
        .auto("format")
        .url()
    : null;

  return (
    <section className="hero">
      {heroImageUrl ? (
        <Image
          src={heroImageUrl}
          alt={
            data?.image?.alt ||
            "SRIS students participating in practical learning"
          }
          fill
          priority
          sizes="100vw"
          className="heroImage"
        />
      ) : (
        <ImagePlaceholder
          label="Future SRIS documentary photography"
        />
      )}

      <div className="overlay" />

      <div className="shell heroContent">
        <div className="heroCopy">
          <p className="eyebrow">{eyebrow}</p>

          <h1>{heading}</h1>

          <p className="lead">{summary}</p>

          <div className="row">
            <Link className="button" href={primaryHref}>
              {primaryLabel}
              <span>→</span>
            </Link>

            <TextLink href={secondaryHref}>
              {secondaryLabel}
            </TextLink>
          </div>
        </div>

        <div className="heroIndex">
          <span>UPNG</span>
          <b>01</b>

          <small>
            Student-led science
            <br />
            in practice
          </small>
        </div>
      </div>
    </section>
  );
}
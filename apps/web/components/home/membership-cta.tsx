import Link from "next/link";

import type { HomeIntroData } from "@/sanity/lib/types";

type Props = {
  data?: HomeIntroData["membershipCta"];
};

export function MembershipCTA({ data }: Props) {
  const eyebrow =
    data?.eyebrow ?? "Membership";

  const heading =
    data?.heading ?? "Your next idea could start here.";

  const body =
    data?.body ??
    "Join students who want to explore further, build practical skills and contribute to work beyond lectures.";

  const ctaLabel =
    data?.cta?.label ?? "Become an SRIS member";

  const ctaHref =
    data?.cta?.href ?? "/community/membership";

  return (
    <section className="membership section">
      <div className="shell membershipGrid">
        <div>
          <p className="eyebrow soft">
            {eyebrow}
          </p>

          <h2>{heading}</h2>
        </div>

        <div className="membershipCopy">
          <p className="lead">
            {body}
          </p>

          <Link
            href={ctaHref}
            className="button"
          >
            <span>{ctaLabel}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
import Image from "next/image";
import Link from "next/link";

import type { MembershipCtaData } from "@/sanity/lib/types";

type Props = {
  data?: MembershipCtaData;
};

export function MembershipCta({ data }: Props) {
  if (!data?.heading) {
    return null;
  }

  return (
    <section className="lpi-band">
      <div className="lpi-container lpi-band-inner">
        <div className="lpi-band-text">
          {data.eyebrow && <p>{data.eyebrow}</p>}

          <h2>{data.heading}</h2>

          {data.body && <p>{data.body}</p>}

          {data.cta?.label && data.cta.href && (
            <p>
              <Link href={data.cta.href} className="lpi-button">
                {data.cta.label}
              </Link>
            </p>
          )}
        </div>

        <div className="lpi-band-logo">
          <Image
            src="/images/brand/sris-lockup-reversed.png"
            alt=""
            width={239}
            height={96}
            quality={70}
          />
        </div>
      </div>
    </section>
  );
}

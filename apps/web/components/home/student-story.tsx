import Link from "next/link";

import { SanityImage } from "@/components/sanity/sanity-image";

import { routes } from "@/lib/route";

import type { StudentStoryData } from "@/sanity/lib/types";

type Props = {
  data?: StudentStoryData;
};

export function StudentStory({ data }: Props) {
  if (!data) {
    return null;
  }

  return (
    <section className="lpi-section lpi-white">
      <div className="lpi-container">
        <div className="lpi-quote">
          {data.image?.asset && (
            <div className="lpi-quote-photo">
              <SanityImage
                image={data.image}
                fallbackAlt={`${data.studentName ?? "SRIS student"} participating in an SRIS activity`}
                sizes="(max-width: 767px) 100vw, 320px"
                width={640}
                height={800}
              />
            </div>
          )}

          <div className="lpi-quote-text">
            <blockquote>&ldquo;{data.quote}&rdquo;</blockquote>

            {data.studentName && <p>- {data.studentName}</p>}

            {data.discipline && <p>{data.discipline}</p>}

            <p>
              <Link
                href={routes.community.showcase.detail(data.slug)}
                className="lpi-link"
              >
                Read their story
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

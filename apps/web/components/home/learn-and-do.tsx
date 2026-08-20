import Image from "next/image";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { TextLink } from "@/components/ui/text-link";

import { urlFor } from "@/sanity/lib/image";
import type {
  HomeIntroData,
  SanityImage,
} from "@/sanity/lib/types";

type Props = {
  data?: HomeIntroData["featuredLearning"];
};

const fallbackLearning = [
  {
    _id: "fallback-python",
    title: "Python for Data Analysis",
    slug: "python-for-data-analysis",
    kind: "Skills Track",
    summary:
      "Build practical skills for exploring and interpreting scientific datasets.",
  },
  {
    _id: "fallback-microscopy",
    title: "Introduction to Microscopy",
    slug: "introduction-to-microscopy",
    kind: "Laboratory Practical",
    summary:
      "Learn fundamental microscopy techniques through practical laboratory work.",
  },
];

export function LearnAndDo({ data }: Props) {
  const items =
    data && data.length > 0
      ? data
      : fallbackLearning;

  const primary = items[0];
  const secondary = items[1];

  return (
    <section className="learn section">
      <div className="shell">
        {/* Section heading */}
        <div className="sectionHead">
          <div>
            <p className="eyebrow blue">
              Learn & Do
            </p>

            <h2>
              Learn something.
              <br />
              Then do something with it.
            </h2>
          </div>

          <p className="lead muted">
            Skills become meaningful when students can
            immediately put them to work.
          </p>
        </div>

        <div className="learnGrid">
          {/* Primary learning item */}
          {primary && (
            <article className="learnPrimary">
              <LearningImage
                image={primary.image}
                alt={primary.title}
                label="Skills track photography"
              />

              <div className="learnCopy">
                <p className="eyebrow blue">
                  {primary.kind ?? "Skills Track"}
                </p>

                <h3>{primary.title}</h3>

                {primary.summary && (
                  <p className="body muted">
                    {primary.summary}
                  </p>
                )}

                <TextLink
                  href={`/learn/${primary.slug}`}
                >
                  Explore learning activity
                </TextLink>
              </div>
            </article>
          )}

          {/* Secondary learning item */}
          {secondary && (
            <article className="learnSecondary">
              <LearningImage
                image={secondary.image}
                alt={secondary.title}
                label="Laboratory practical photography"
              />

              <p className="eyebrow blue">
                {secondary.kind ??
                  "Laboratory Practical"}
              </p>

              <h3>{secondary.title}</h3>

              <TextLink
                href={`/learn/${secondary.slug}`}
              >
                Explore practical
              </TextLink>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

/*
 * Shared image renderer for Learn & Do cards.
 *
 * If Sanity has an image, render it through next/image.
 * Otherwise retain the original prototype placeholder.
 */
type LearningImageProps = {
  image?: SanityImage;
  alt: string;
  label: string;
};

function LearningImage({
  image,
  alt,
  label,
}: LearningImageProps) {
  if (!image?.asset) {
    return (
      <ImagePlaceholder
        label={label}
        className="learningImage"
      />
    );
  }

  const imageUrl = urlFor(image)
    .width(1200)
    .height(800)
    .fit("crop")
    .auto("format")
    .url();

  return (
    <div className="learningImage">
      <Image
        src={imageUrl}
        alt={image.alt || alt}
        fill
        sizes="(max-width: 900px) 100vw, 60vw"
        className="learningImageAsset"
      />
    </div>
  );
}
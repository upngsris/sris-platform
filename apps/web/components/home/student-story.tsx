import Image from "next/image";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { TextLink } from "@/components/ui/text-link";

import { urlFor } from "@/sanity/lib/image";
import type { HomeIntroData } from "@/sanity/lib/types";

type Props = {
  data?: HomeIntroData["featuredStory"];
};

export function StudentStory({ data }: Props) {
  const quote =
    data?.quote ??
    "Research changed how I think about science.";

  const studentName =
    data?.studentName ?? "Student Name";

  const discipline =
    data?.discipline ?? "Environmental Science";

  const slug =
    data?.slug ?? "#";

  const storyHref =
    slug === "#"
      ? "/community/showcase"
      : `/community/showcase/${slug}`;

  const storyImageUrl = data?.image?.asset
    ? urlFor(data.image)
        .width(1920)
        .height(1080)
        .fit("crop")
        .auto("format")
        .url()
    : null;

  return (
    <section className="studentStory">

      {/* Background image */}
      {storyImageUrl ? (
        <Image
          src={storyImageUrl}
          alt={
            data?.image?.alt ??
            `${studentName} participating in an SRIS activity`
          }
          fill
          sizes="100vw"
          className="studentStoryImage"
        />
      ) : (
        <ImagePlaceholder
          label="Documentary student portrait"
        />
      )}

      {/* Readability overlay */}
      <div className="overlay" />

      {/* Story content */}
      <div className="shell storyCopy">

        <p className="eyebrow">
          Student stories · 01
        </p>

        <blockquote>
          “{quote}”
        </blockquote>

        <div>
          <p>{studentName}</p>

          <span>{discipline}</span>
        </div>

        <TextLink href={storyHref}>
          Read their story
        </TextLink>

      </div>
    </section>
  );
}
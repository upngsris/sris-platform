import Image from "next/image";

import { urlFor } from "@/sanity/lib/image";
import type { SanityImage as SanityImageData } from "@/sanity/lib/types";

type SanityImageProps = {
  image?: SanityImageData;

  fallbackAlt?: string;

  className?: string;

  sizes?: string;

  priority?: boolean;

  width?: number;
  height?: number;

  quality?: number;
};

export function SanityImage({
  image,
  fallbackAlt = "",
  className,
  sizes = "100vw",
  priority = false,
  width = 1600,
  height = 1000,
  quality = 85,
}: SanityImageProps) {
  if (!image?.asset) {
    return null;
  }

  // `auto("format")` negotiates on the request's Accept header, which the
  // Next image optimizer does not send — so a PNG source came back as a
  // multi-megabyte PNG and the optimizer timed out fetching it. Asking Sanity
  // for WebP directly keeps the upstream payload small.
  const src = urlFor(image)
    .width(width)
    .height(height)
    .fit("crop")
    .format("webp")
    .quality(quality)
    .url();

  return (
    <Image
      src={src}
      alt={image.alt || fallbackAlt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
    />
  );
}
type SanityImageFullProps = {
  image?: SanityImageData;

  fallbackAlt?: string;

  className?: string;

  sizes?: string;

  priority?: boolean;

  /** Widest rendition requested from Sanity; never upscaled past the original. */
  maxWidth?: number;

  quality?: number;
};

/**
 * Shows the whole photograph at its own aspect ratio — no crop, no hotspot,
 * no fixed frame. Needs `dimensions` (asset->metadata.dimensions) in the
 * query so the browser reserves the right space before the image loads.
 */
export function SanityImageFull({
  image,
  fallbackAlt = "",
  className,
  sizes = "100vw",
  priority = false,
  maxWidth = 1900,
  quality = 85,
}: SanityImageFullProps) {
  if (!image?.asset) {
    return null;
  }

  // Without metadata, assume 3:2 for layout; the image itself is still uncropped.
  const original = image.dimensions ?? { width: 1500, height: 1000 };

  const width = Math.min(original.width, maxWidth);
  const height = Math.round((width / original.width) * original.height);

  const src = urlFor(image)
    .width(width)
    .fit("max")
    .format("webp")
    .quality(quality)
    .url();

  return (
    <Image
      src={src}
      alt={image.alt || fallbackAlt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className ? `fullImage ${className}` : "fullImage"}
    />
  );
}

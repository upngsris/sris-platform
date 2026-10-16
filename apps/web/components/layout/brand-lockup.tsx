import Image from "next/image";

type BrandLockupProps = {
  /** "reversed" is for dark grounds such as the navy footer. */
  variant?: "default" | "reversed";
  /** Load the mark eagerly. Use only where the lockup is above the fold. */
  priority?: boolean;
};

const MARKS = {
  default: { src: "/images/brand/sris-mark.png", width: 240, height: 241 },
  reversed: {
    src: "/images/brand/sris-mark-reversed.png",
    width: 184,
    height: 185,
  },
} as const;

/**
 * SRIS lockup: the woven mark, "UPNG" set vertically, a rule, then the
 * society name. Only the mark is an image. The wording is live text, so it
 * stays sharp at any size and follows the site's typeface; the visible
 * pieces are hidden from assistive technology in favour of one plain name.
 */
export function BrandLockup({
  variant = "default",
  priority = false,
}: BrandLockupProps) {
  const mark = MARKS[variant];

  return (
    <span
      className={
        variant === "reversed"
          ? "brand-lockup brand-lockup--reversed"
          : "brand-lockup"
      }
    >
      <span className="sr-only">
        UPNG Science, Research &amp; Innovation Society
      </span>

      <Image
        src={mark.src}
        alt=""
        width={mark.width}
        height={mark.height}
        className="brand-lockup-mark"
        priority={priority}
        quality={70}
      />

      <span className="brand-lockup-upng" aria-hidden="true">
        <span>U</span>
        <span>P</span>
        <span>N</span>
        <span>G</span>
      </span>

      <span className="brand-lockup-rule" aria-hidden="true" />

      <span className="brand-lockup-name" aria-hidden="true">
        <span>Science</span>
        <span>Research &amp;</span>
        <span>Innovation</span>
        <span>Society</span>
      </span>
    </span>
  );
}

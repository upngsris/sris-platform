import {PortableText, type PortableTextComponents} from "next-sanity";

import {SanityImageFull} from "@/components/sanity/sanity-image";
import type {CaptionedImage} from "@/sanity/lib/types";

import type {PortableTextBlock} from "next-sanity";

/**
 * Renders a Portable Text field.
 *
 * Editors previously typed Markdown into plain `text` fields, which the site
 * printed literally — asterisks, hashes and all — because a textarea carries
 * no structure. Hierarchy now lives in the document, so headings, emphasis
 * and lists arrive as real blocks and are rendered as real elements here.
 *
 * The component map is deliberately closed: it mirrors exactly the styles,
 * lists and marks the Studio schema offers, so nothing an editor can produce
 * falls through to an unstyled default.
 */
const components: PortableTextComponents = {
  /* Images placed within the text (laboratory practical write-ups), shown
     whole at their own aspect ratio rather than cropped to a frame. */
  types: {
    image: ({value}: {value: CaptionedImage}) => {
      if (!value?.asset) {
        return null;
      }

      return (
        <figure className="richTextFigure">
          <div className="richTextImage">
            <SanityImageFull
              image={value}
              // Content saved before alt text became required still has a
              // caption that describes the photograph.
              fallbackAlt={value.caption}
              sizes="(max-width: 900px) 100vw, 720px"
              maxWidth={1440}
            />
          </div>

          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      );
    },
  },

  block: {
    normal: ({children}) => <p>{children}</p>,
    blockquote: ({children}) => (
      <blockquote>{children}</blockquote>
    ),
  },

  list: {
    bullet: ({children}) => <ul>{children}</ul>,
    number: ({children}) => <ol>{children}</ol>,
  },

  listItem: {
    bullet: ({children}) => <li>{children}</li>,
    number: ({children}) => <li>{children}</li>,
  },

  marks: {
    strong: ({children}) => <strong>{children}</strong>,
    em: ({children}) => <em>{children}</em>,

    link: ({value, children}) => {
      const href =
        typeof value?.href === "string" ? value.href : undefined;

      if (!href) {
        return <>{children}</>;
      }

      /* Only http(s) links leave the site; mailto: and tel: stay in place. */
      const isExternal = /^https?:\/\//i.test(href);

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer noopener" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

type Props = {
  value?: PortableTextBlock[];
  className?: string;
  /**
   * The level the field's top-most heading renders at: 2 under a page's h1,
   * 4 inside a section headed by an h3. Editors pick H2 or H3 by look, so a
   * field that opens on an H3 would otherwise skip a level in the outline.
   */
  headingLevel?: 2 | 3 | 4;
};

/**
 * Shifts the field's H2/H3 styles so the highest one used lands on
 * `headingLevel`, keeping their relative order and capping at h6.
 */
function headingComponents(
  value: PortableTextBlock[],
  headingLevel: number,
): PortableTextComponents["block"] {
  const used = value
    .map((block) => block.style)
    .filter((style): style is "h2" | "h3" => style === "h2" || style === "h3")
    .map((style) => Number(style[1]));

  const offset = headingLevel - (used.length ? Math.min(...used) : 2);

  const tag = (level: number) =>
    `h${Math.min(level + offset, 6)}` as HeadingTag;

  const H2 = tag(2);
  const H3 = tag(3);

  return {
    ...(components.block as object),
    // data-heading keeps the size the editor picked, whatever the tag.
    h2: ({children}) => <H2 data-heading="h2">{children}</H2>,
    h3: ({children}) => <H3 data-heading="h3">{children}</H3>,
  };
}

export function RichText({value, className, headingLevel = 2}: Props) {
  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div className={className ? `richText ${className}` : "richText"}>
      <PortableText
        value={value}
        components={{
          ...components,
          block: headingComponents(value, headingLevel),
        }}
      />
    </div>
  );
}

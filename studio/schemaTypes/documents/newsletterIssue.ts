import {defineArrayMember, defineField, defineType} from "sanity";

import {altTextField, captionField, richTextBlocks} from "../fields/rich-text";
import {tagsField} from "../fields/tags";
import {slugify, validateSlug} from "../fields/slug"

export const newsletterIssue = defineType({
  name: "newsletterIssue",
  title: "Newsletter Issue",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Issue title",
      type: "string",
      validation: (Rule) =>
        Rule.required().max(140),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",

      options: {
        source: "title",
        maxLength: 96,
        slugify,
      },

      validation: (Rule) => Rule.required().custom(validateSlug),
    }),

    defineField({
      name: "issueNumber",
      title: "Issue number",
      type: "number",

      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(1),
    }),

    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "date",

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "editor",
      title: "Edited by",
      type: "reference",

      description:
        "The member who put this issue together. Shown as \"Written by\" on the issue page.",

      to: [{type: "person"}],
    }),

    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,

      validation: (Rule) =>
        Rule.required().max(500),
    }),

    tagsField(),

    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",

          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as
                | {asset?: unknown}
                | undefined;

              if (
                parent?.asset &&
                !value
              ) {
                return "Alternative text is required when a cover image is used.";
              }

              return true;
            }),
        }),
      ],
    }),

    defineField({
      name: "newsBriefs",
      title: "News briefs",
      type: "array",

      description:
        "The short news items in this issue, shown in order on the issue page. Each brief has a headline, optional photograph, the story text and an optional photo gallery.",

      of: [
        defineArrayMember({
          name: "newsBrief",
          title: "News brief",
          type: "object",

          fields: [
            defineField({
              name: "headline",
              title: "Headline",
              type: "string",

              validation: (Rule) =>
                Rule.required().max(140),
            }),

            defineField({
              name: "category",
              title: "Category",
              type: "string",

              description:
                "The label shown on this brief in the newsletter listings.",

              options: {
                list: [
                  "News",
                  "Research",
                  "Events",
                  "Community",
                  "Achievements",
                  "Announcements",
                ],
              },

              initialValue: "News",
            }),

            defineField({
              name: "image",
              title: "Photograph",
              type: "image",

              options: {
                hotspot: true,
              },

              fields: [altTextField, captionField],
            }),

            defineField({
              name: "body",
              title: "Story",
              type: "array",

              description:
                "The news itself. Use the Image button to place photographs within the text.",

              of: richTextBlocks(false),

              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "gallery",
              title: "Photo gallery",
              type: "array",

              description:
                "Additional photographs shown beneath the story.",

              of: [
                defineArrayMember({
                  type: "image",

                  options: {
                    hotspot: true,
                  },

                  fields: [altTextField, captionField],
                }),
              ],

              options: {
                layout: "grid",
              },
            }),
          ],

          preview: {
            select: {
              title: "headline",
              subtitle: "category",
              media: "image",
            },
          },
        }),
      ],
    }),

    defineField({
      name: "pdfFile",
      title: "Newsletter PDF",
      type: "file",

      options: {
        accept: "application/pdf",
      },
    }),

    defineField({
      name: "featured",
      title: "Featured issue",
      type: "boolean",

      initialValue: false,
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],

  orderings: [
    {
      title: "Newest first",

      name: "publishedAtDesc",

      by: [
        {
          field: "publishedAt",
          direction: "desc",
        },
      ],
    },
  ],

  preview: {
    select: {
      title: "title",
      issueNumber: "issueNumber",
      publishedAt: "publishedAt",
      media: "coverImage",
    },

    prepare({
      title,
      issueNumber,
      publishedAt,
      media,
    }) {
      return {
        title,
        subtitle: `Issue ${issueNumber ?? "—"} · ${
          publishedAt ?? "No publication date"
        }`,
        media,
      };
    },
  },
});
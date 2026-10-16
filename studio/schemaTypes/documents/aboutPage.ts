import {defineField, defineType} from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About SRIS",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      initialValue: "About SRIS",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "About SRIS",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "heading",
      title: "Page heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "introduction",
      title: "Introduction",
      type: "text",
      rows: 4,
      validation: (Rule) =>
        Rule.required().max(500),
    }),

    defineField({
      name: "storyHeading",
      title: "Why SRIS exists — heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "story",
      title: "Why SRIS exists",
      type: "text",
      rows: 8,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "image",
      title: "About image",
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

              if (parent?.asset && !value) {
                return "Alternative text is required when an image is used.";
              }

              return true;
            }),
        }),
      ],
    }),

    defineField({
      name: "mission",
      title: "Mission",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "vision",
      title: "Vision",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "principles",
      title: "Core principles",
      type: "array",
      validation: (Rule) =>
        Rule.required().min(3).max(6),

      of: [
        {
          type: "object",
          name: "principle",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) =>
                Rule.required(),
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
              validation: (Rule) =>
                Rule.required().max(300),
            }),
          ],

          preview: {
            select: {
              title: "title",
              subtitle: "description",
            },
          },
        },
      ],
    }),

    defineField({
      name: "timeline",
      title: "Our journey — timeline",
      description:
        "Milestones in order, oldest first. Leave empty to show the default SRIS timeline.",
      type: "array",
      validation: (Rule) => Rule.max(12),

      of: [
        {
          type: "object",
          name: "milestone",
          fields: [
            defineField({
              name: "period",
              title: "When",
              description: "A year or a span, e.g. \"2023\" or \"Mid 2024\".",
              type: "string",
              validation: (Rule) =>
                Rule.required().max(24),
            }),

            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) =>
                Rule.required(),
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
              validation: (Rule) =>
                Rule.required().max(300),
            }),
          ],

          preview: {
            select: {
              title: "title",
              subtitle: "period",
            },
          },
        },
      ],
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],

  preview: {
    prepare() {
      return {
        title: "About SRIS",
        subtitle:
          "Institutional story, mission and vision",
      };
    },
  },
});
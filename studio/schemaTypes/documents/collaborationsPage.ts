import {defineField, defineType} from "sanity";

export const collaborationsPage = defineType({
  name: "collaborationsPage",
  title: "Collaborations Page",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",

      initialValue: "Collaborations",

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",

      initialValue:
        "Community · Collaborations",

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "heading",
      title: "Page heading",
      type: "string",

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "introduction",
      title: "Introduction",
      type: "text",

      rows: 5,

      validation: (Rule) =>
        Rule.required().max(650),
    }),

    defineField({
      name: "opportunities",
      title: "Ways to collaborate",
      type: "array",

      validation: (Rule) =>
        Rule.required().min(2).max(8),

      of: [
        {
          type: "object",
          name: "collaborationOpportunity",

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

              rows: 4,

              validation: (Rule) =>
                Rule.required().max(450),
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
      name: "partnerHeading",
      title: "Partner section heading",
      type: "string",

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "partnerText",
      title: "Partner section text",
      type: "text",

      rows: 5,

      validation: (Rule) =>
        Rule.required().max(650),
    }),

    defineField({
      name: "ctaLabel",
      title: "Contact CTA label",
      type: "string",

      initialValue: "Contact SRIS",

      validation: (Rule) =>
        Rule.required(),
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
        title: "Collaborations",
        subtitle:
          "Community partnership page",
      };
    },
  },
});
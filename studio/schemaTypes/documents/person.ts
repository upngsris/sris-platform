import {defineField, defineType} from "sanity";
import {slugify, validateSlug} from "../fields/slug"

export const person = defineType({
  name: "person",
  title: "Person",
  type: "document",

  fields: [
    defineField({
      name: "fullName",
      title: "Full name",
      type: "string",
      validation: (Rule) =>
        Rule.required().max(120),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "fullName",
        maxLength: 96,
        slugify,
      },
      validation: (Rule) => Rule.required().custom(validateSlug),
    }),

    defineField({
      name: "portrait",
      title: "Portrait",
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
                return "Alternative text is required when a portrait is used.";
              }

              return true;
            }),
        }),
      ],
    }),

    defineField({
      name: "professionalTitle",
      title: "Professional title",
      description:
        "Primarily for staff, patrons, matrons or professional members.",
      type: "string",
    }),

    defineField({
      name: "programme",
      title: "Programme / field of study",
      description:
        "Primarily for student leaders and coordinators.",
      type: "string",
    }),

    defineField({
      name: "department",
      title: "Department / division",
      type: "string",
    }),

    defineField({
      name: "biography",
      title: "Biography",
      type: "text",
      rows: 8,
      validation: (Rule) => Rule.max(1800),
    }),

    defineField({
      name: "quote",
      title: "Message or quotation",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.max(500),
    }),

    defineField({
      name: "showContactLinks",
      title: "Show public contact links",
      description:
        "Enable only when the person has agreed to have these links shown publicly.",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "socialLinks",
      title: "Public social links",
      type: "object",

      hidden: ({parent}) =>
        parent?.showContactLinks !== true,

      fields: [
        defineField({
          name: "linkedin",
          title: "LinkedIn",
          type: "url",
        }),

        defineField({
          name: "facebook",
          title: "Facebook",
          type: "url",
        }),

        defineField({
          name: "instagram",
          title: "Instagram",
          type: "url",
        }),

        defineField({
          name: "whatsapp",
          title: "WhatsApp link",
          description:
            "Use a complete public WhatsApp URL if this person has consented to sharing it.",
          type: "url",
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: "fullName",
      subtitle: "professionalTitle",
      media: "portrait",
    },

    prepare({
      title,
      subtitle,
      media,
    }) {
      return {
        title,
        subtitle:
          subtitle || "SRIS person profile",
        media,
      };
    },
  },
});
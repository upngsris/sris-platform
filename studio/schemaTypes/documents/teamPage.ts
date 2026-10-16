import {defineArrayMember, defineField, defineType} from "sanity";

export const teamPage = defineType({
  name: "teamPage",
  title: "Our Team Page",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      initialValue: "Our Team",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "About · Our Team",
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
        Rule.required().max(600),
    }),

    defineField({
      name: "patronageHeading",
      title: "Patronage heading",
      type: "string",
      initialValue: "Guidance and support",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "executiveHeading",
      title: "Executive heading",
      type: "string",
      initialValue: "Student leadership",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "committeeHeading",
      title: "Committee heading",
      type: "string",
      initialValue: "Committees",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "coordinatorHeading",
      title: "Coordinator heading",
      type: "string",
      initialValue: "Discipline coordinators",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "founderHeading",
      title: "Founders heading",
      type: "string",

      description:
        'Heading for the "Founders & Pioneer Executives" section.',

      initialValue: "Founders & Pioneer Executives",

      validation: (Rule) => Rule.max(120),
    }),

    defineField({
      name: "archiveHeading",
      title: "Archive heading",
      type: "string",
      initialValue: "Previous leadership",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "archiveIntroduction",
      title: "Archive introduction",
      type: "text",
      rows: 3,
      validation: (Rule) =>
        Rule.required().max(500),
    }),

    defineField({
      name: "termCertificates",
      title: "Leadership term certificates",
      type: "array",

      description:
        "Certificates for past leadership teams. Each entry adds a link to that year on the leadership archive page.",

      of: [
        defineArrayMember({
          type: "object",
          name: "termCertificate",
          title: "Term certificate",

          fields: [
            defineField({
              name: "termYear",
              title: "Term year",
              type: "number",

              validation: (Rule) =>
                Rule.required()
                  .integer()
                  .min(1990)
                  .max(2100),
            }),

            defineField({
              name: "label",
              title: "Link label",
              type: "string",

              description:
                'Optional. Defaults to "View certificates".',

              validation: (Rule) => Rule.max(80),
            }),

            defineField({
              name: "file",
              title: "Certificate file",
              type: "file",

              description:
                "PDF or image containing the certificates for this leadership team.",

              options: {
                accept: "application/pdf,image/*",
              },

              validation: (Rule) => Rule.required(),
            }),
          ],

          preview: {
            select: {
              termYear: "termYear",
              label: "label",
            },

            prepare({termYear, label}) {
              return {
                title: `${termYear ?? "Year"} certificates`,
                subtitle: label ?? "View certificates",
              };
            },
          },
        }),
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
        title: "Our Team",
        subtitle:
          "Team page editorial content",
      };
    },
  },
});
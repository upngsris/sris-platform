import {defineArrayMember, defineField, defineType} from "sanity";

const currentYear = new Date().getFullYear();

const STATUS_LABELS: Record<string, string> = {
  current: "Current",
  archived: "Archived",
  founder: "Founder",
};

export const teamAssignment = defineType({
  name: "teamAssignment",
  title: "Team Assignment",
  type: "document",

  fields: [
    defineField({
      name: "person",
      title: "Person",
      type: "reference",

      to: [
        {
          type: "person",
        },
      ],

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "group",
      title: "Leadership group",
      type: "string",

      options: {
        list: [
          {
            title: "Patronage",
            value: "patronage",
          },
          {
            title: "Executive",
            value: "executive",
          },
          {
            title: "Committee",
            value: "committee",
          },
          {
            title: "Discipline Coordinator",
            value: "coordinator",
          },
          {
            title: "Founder / Pioneer Executive",
            value: "founder",
          },
        ],

        layout: "radio",
      },

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "role",
      title: "Role",
      type: "string",

      options: {
        list: [
          {
            title: "Patron",
            value: "Patron",
          },
          {
            title: "Matron",
            value: "Matron",
          },
          {
            title: "President",
            value: "President",
          },
          {
            title: "Male Vice-President",
            value: "Male Vice-President",
          },
          {
            title: "Female Vice-President",
            value: "Female Vice-President",
          },
          {
            title: "Secretary",
            value: "Secretary",
          },
          {
            title: "Treasurer",
            value: "Treasurer",
          },
          {
            title: "Committee Member",
            value: "Committee Member",
          },
          {
            title: "Discipline Coordinator",
            value: "Discipline Coordinator",
          },
        ],
      },

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "committee",
      title: "Committee",
      type: "string",

      hidden: ({parent}) =>
        parent?.group !== "committee",

      options: {
        list: [
          {
            title: "Fundraising",
            value: "Fundraising",
          },
          {
            title: "Events",
            value: "Events",
          },
          {
            title: "Projects",
            value: "Projects",
          },
        ],
      },

      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as
            | {group?: string}
            | undefined;

          if (
            parent?.group === "committee" &&
            !value
          ) {
            return "Committee is required for committee assignments.";
          }

          return true;
        }),
    }),

    defineField({
      name: "discipline",
      title: "Discipline",
      type: "string",

      hidden: ({parent}) =>
        parent?.group !== "coordinator",

      options: {
        list: [
          "Physics",
          "Chemistry",
          "Biology",
          "Environmental Science",
          "Mathematics, Statistics & Computer Science",
          "Earth Sciences",
        ],
      },

      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as
            | {group?: string}
            | undefined;

          if (
            parent?.group === "coordinator" &&
            !value
          ) {
            return "Discipline is required for coordinator assignments.";
          }

          return true;
        }),
    }),

    defineField({
      name: "termYear",
      title: "Term year",
      type: "number",

      initialValue: currentYear,

      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(2020)
          .max(2100),
    }),

    defineField({
      name: "status",
      title: "Assignment status",
      type: "string",

      description:
        "Current appears on the Our Team page, Archived in the leadership archive, and Founder in the Founders & Pioneer Executives section.",

      initialValue: "current",

      options: {
        layout: "radio",

        list: [
          {
            title: "Current",
            value: "current",
          },
          {
            title: "Archived",
            value: "archived",
          },
          {
            title: "Founder",
            value: "founder",
          },
        ],
      },

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "termStart",
      title: "Term start",
      type: "date",
    }),

    defineField({
      name: "termEnd",
      title: "Term end",
      type: "date",

      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as
            | {
                termStart?: string;
              }
            | undefined;

          if (
            value &&
            parent?.termStart &&
            value < parent.termStart
          ) {
            return "Term end cannot be before the term start.";
          }

          return true;
        }),
    }),

    defineField({
      name: "certificate",
      title: "Leadership certificate",
      type: "file",

      description:
        "Optional. The certificate issued for this role and term, as a PDF or image. It opens in a view-only window on the person's profile page.",

      options: {
        accept: "application/pdf,image/*",
      },
    }),

    defineField({
      name: "contributions",
      title: "Leadership contributions",
      type: "array",

      description:
        "What this person achieved in this role — use the bulleted list for individual contributions. Shown on their profile under Leadership and service history. Do not type Markdown such as ** or - — it is shown literally.",

      of: [
        defineArrayMember({
          type: "block",

          styles: [
            {title: "Body", value: "normal"},
            {title: "Sub-heading", value: "h3"},
          ],

          lists: [
            {title: "Bulleted", value: "bullet"},
            {title: "Numbered", value: "number"},
          ],

          marks: {
            decorators: [
              {title: "Bold", value: "strong"},
              {title: "Italic", value: "em"},
            ],

            annotations: [
              defineField({
                name: "link",
                title: "Link",
                type: "object",

                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",

                    validation: (Rule) =>
                      Rule.required().uri({
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  }),
                ],
              }),
            ],
          },
        }),
      ],
    }),

    defineField({
      name: "sortOrder",
      title: "Display order",
      description:
        "Lower numbers appear first within their leadership group.",
      type: "number",

      initialValue: 10,

      validation: (Rule) =>
        Rule.required().integer().min(0),
    }),
  ],

  preview: {
    select: {
      name: "person.fullName",
      role: "role",
      group: "group",
      year: "termYear",
      status: "status",
      media: "person.portrait",
    },

    prepare({
      name,
      role,
      year,
      status,
      media,
    }) {
      return {
        title:
          name || "Unnamed team assignment",

        subtitle: `${role || "Role"} · ${year || "Year"} · ${
          STATUS_LABELS[status as string] ?? "Current"
        }`,

        media,
      };
    },
  },
});
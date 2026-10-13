import {defineField, defineType} from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact SRIS",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      initialValue: "Contact SRIS",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "Contact SRIS",
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
      name: "email",
      title: "Email address",
      type: "string",

      validation: (Rule) =>
        Rule.required().email(),
    }),

    defineField({
      name: "phone",
      title: "Phone number",
      type: "string",
    }),

    defineField({
      name: "location",
      title: "Location",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "locationDetail",
      title: "Location detail",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "officeHours",
      title: "Contact / office hours",
      type: "string",
    }),

    defineField({
      name: "mapUrl",
      title: "Map link",
      type: "url",

      description:
        "Google Maps link for the society's location. Open the place in Google Maps, choose Share, and copy the link. Shown as the \u201cOpen in Google Maps\u201d button.",
    }),

    defineField({
      name: "latitude",
      title: "Map latitude",
      type: "number",

      description:
        "Right-click the exact spot in Google Maps and click the coordinates to copy them \u2014 the first number is the latitude. Leave blank to use the default campus location.",

      validation: (Rule) => Rule.min(-90).max(90),
    }),

    defineField({
      name: "longitude",
      title: "Map longitude",
      type: "number",

      description:
        "The second of the two copied coordinates. Set both, or neither \u2014 one on its own is ignored.",

      validation: (Rule) => Rule.min(-180).max(180),
    }),

    defineField({
      name: "enquiryHeading",
      title: "Enquiry heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "enquiryText",
      title: "Enquiry guidance",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
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
        title: "Contact SRIS",
        subtitle:
          "Public contact information and enquiry guidance",
      };
    },
  },
});
import {defineField, defineType} from 'sanity'
export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      initialValue: 'SRIS Homepage',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'hero',
      type: 'object',
      fields: [
        defineField({name: 'eyebrow', type: 'string'}),
        defineField({name: 'heading', type: 'string', validation: (r) => r.required()}),
        defineField({name: 'summary', type: 'text', rows: 3}),
        defineField({
          name: 'image',
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', type: 'string'})],
        }),
        defineField({
          name: 'primaryCta',
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string'}),
            defineField({name: 'href', type: 'string'}),
          ],
        }),
        defineField({
          name: 'secondaryCta',
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string'}),
            defineField({name: 'href', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'about',
      type: 'object',
      fields: [
        defineField({name: 'eyebrow', type: 'string'}),
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'lead', type: 'text', rows: 3}),
        defineField({name: 'body', type: 'text', rows: 3}),
      ],
    }),
    defineField({
      name: 'featuredResearch',
      title: 'Featured research',
      type: 'reference',
      to: [{type: 'researchProject'}],
    }),
    defineField({
      name: 'featuredOpportunities',
      title: 'Projects to join',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'projectOpportunity'}]}],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: 'featuredLearning',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'learningItem'}]}],
      validation: (r) => r.max(3),
    }),
    defineField({name: 'featuredStory', type: 'reference', to: [{type: 'studentStory'}]}),
    defineField({
      name: 'featuredEvents',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'event'}]}],
      validation: (r) => r.max(4),
    }),
    defineField({
    name: "membershipCta",
    title: "Membership CTA",
    type: "object",
    fields: [
        defineField({
        name: "eyebrow",
        title: "Eyebrow",
        type: "string",
        initialValue: "Membership",
        }),

        defineField({
        name: "heading",
        title: "Heading",
        type: "string",
        validation: (Rule) => Rule.required(),
        }),

        defineField({
        name: "body",
        title: "Body",
        type: "text",
        rows: 3,
        validation: (Rule) => Rule.required(),
        }),

        defineField({
        name: "cta",
        title: "Call to Action",
        type: "object",
        fields: [
            defineField({
            name: "label",
            title: "Label",
            type: "string",
            validation: (Rule) => Rule.required(),
            }),

            defineField({
            name: "href",
            title: "URL",
            type: "string",
            validation: (Rule) => Rule.required(),
            }),
        ],
        }),
    ],
    }),
  ],
})

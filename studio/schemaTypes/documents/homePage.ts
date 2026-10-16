import {defineField, defineType} from 'sanity'

const internalPathValidation = (value: string | undefined) => {
  if (!value) {
    return true
  }

  if (!value.startsWith('/')) {
    return 'Internal links must begin with "/"'
  }

  if (value.startsWith('//')) {
    return 'Use a relative internal path, not a protocol-relative URL'
  }

  return true
}

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',

  description:
    'Controls the editorial content and featured items displayed on the SRIS homepage.',

  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',

      description:
        'Used inside Sanity Studio only. This is not displayed as the homepage heading.',

      initialValue: 'SRIS Homepage',

      validation: (Rule) =>
        Rule.required()
          .min(3)
          .max(80),
    }),

    /* =====================================================
       HERO
       ===================================================== */

    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',

      description:
        'Primary homepage message and hero photography.',

      validation: (Rule) =>
        Rule.required(),

      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow',
          type: 'string',

          description:
            'Small introductory label above the main heading.',

          validation: (Rule) =>
            Rule.max(80),
        }),

        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',

          validation: (Rule) =>
            Rule.required()
              .min(5)
              .max(100),
        }),

        defineField({
          name: 'summary',
          title: 'Summary',
          type: 'text',
          rows: 3,

          validation: (Rule) =>
            Rule.required()
              .min(20)
              .max(240),
        }),

        defineField({
          name: 'image',
          title: 'Hero image',
          type: 'image',

          description:
            'Use documentary-style SRIS photography with enough negative space for hero text.',

          options: {
            hotspot: true,
          },

          validation: (Rule) =>
            Rule.required(),

          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',

              description:
                'Describe the meaningful content of the image for accessibility.',

              validation: (Rule) =>
                Rule.required()
                  .min(5)
                  .max(160),
            }),
          ],
        }),

        defineField({
          name: 'primaryCta',
          title: 'Primary call to action',
          type: 'object',

          validation: (Rule) =>
            Rule.required(),

          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',

              validation: (Rule) =>
                Rule.required()
                  .min(2)
                  .max(40),
            }),

            defineField({
              name: 'href',
              title: 'Internal path',
              type: 'string',

              description:
                'Example: /explore/research',

              validation: (Rule) =>
                Rule.required()
                  .custom(internalPathValidation),
            }),
          ],
        }),

        defineField({
          name: 'secondaryCta',
          title: 'Secondary call to action',
          type: 'object',

          description:
            'Optional secondary action displayed beside the primary CTA.',

          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',

              validation: (Rule) =>
                Rule.required()
                  .min(2)
                  .max(40),
            }),

            defineField({
              name: 'href',
              title: 'Internal path',
              type: 'string',

              description:
                'Example: /community/membership',

              validation: (Rule) =>
                Rule.required()
                  .custom(internalPathValidation),
            }),
          ],
        }),
      ],
    }),

    /* =====================================================
       ABOUT
       ===================================================== */

    defineField({
      name: 'about',
      title: 'About SRIS introduction',
      type: 'object',

      description:
        'Short homepage introduction explaining the purpose of SRIS.',

      validation: (Rule) =>
        Rule.required(),

      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow',
          type: 'string',

          validation: (Rule) =>
            Rule.max(80),
        }),

        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',

          validation: (Rule) =>
            Rule.required()
              .min(5)
              .max(120),
        }),

        defineField({
          name: 'lead',
          title: 'Lead paragraph',
          type: 'text',
          rows: 3,

          validation: (Rule) =>
            Rule.required()
              .min(20)
              .max(300),
        }),

        defineField({
          name: 'body',
          title: 'Supporting text',
          type: 'text',
          rows: 3,

          validation: (Rule) =>
            Rule.required()
              .min(20)
              .max(400),
        }),
      ],
    }),

    /* =====================================================
       FEATURED CONTENT
       ===================================================== */

    defineField({
      name: 'featuredResearch',
      title: 'Featured research',
      type: 'reference',

      description:
        'Select the primary research project featured on the homepage.',

      to: [
        {
          type: 'researchProject',
        },
      ],

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: 'featuredOpportunities',
      title: 'Projects to join',
      type: 'array',

      description:
        'Select and order up to two project opportunities. The order here controls the homepage order.',

      of: [
        {
          type: 'reference',
          to: [
            {
              type: 'projectOpportunity',
            },
          ],
        },
      ],

      validation: (Rule) =>
        Rule.max(2)
          .unique()
          .error(
            'The homepage design supports a maximum of 2 unique project opportunities.',
          ),
    }),

    defineField({
      name: 'featuredLearning',
      title: 'Featured learning',
      type: 'array',

      description:
        'Select up to two learning items or laboratory practicals. The first becomes the primary feature and the second the secondary feature.',

      of: [
        {
          type: 'reference',
          to: [
            {
              type: 'learningItem',
            },
            {
              type: 'laboratoryPractical',
            },
          ],
        },
      ],

      validation: (Rule) =>
        Rule.max(2)
          .unique()
          .error(
            'The Learn & Do homepage layout supports a maximum of 2 unique items.',
          ),
    }),

    defineField({
      name: 'featuredStory',
      title: 'Featured student story',
      type: 'reference',

      description:
        'Optional student story displayed as the large documentary-style feature.',

      to: [
        {
          type: 'studentStory',
        },
      ],
    }),

    defineField({
      name: 'featuredEvents',
      title: 'Featured events',
      type: 'array',

      description:
        'Select and order up to three events for the homepage.',

      of: [
        {
          type: 'reference',
          to: [
            {
              type: 'event',
            },
          ],
        },
      ],

      validation: (Rule) =>
        Rule.max(3)
          .unique()
          .error(
            'The homepage event layout supports a maximum of 3 unique events.',
          ),
    }),

    /* =====================================================
       MEMBERSHIP CTA
       ===================================================== */

    defineField({
      name: 'membershipCta',
      title: 'Membership CTA',
      type: 'object',

      description:
        'Homepage call to action encouraging visitors to become SRIS members.',

      validation: (Rule) =>
        Rule.required(),

      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow',
          type: 'string',

          initialValue: 'Membership',

          validation: (Rule) =>
            Rule.max(60),
        }),

        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',

          validation: (Rule) =>
            Rule.required()
              .min(5)
              .max(120),
        }),

        defineField({
          name: 'body',
          title: 'Body',
          type: 'text',
          rows: 3,

          validation: (Rule) =>
            Rule.required()
              .min(20)
              .max(300),
        }),

        defineField({
          name: 'cta',
          title: 'Call to Action',
          type: 'object',

          validation: (Rule) =>
            Rule.required(),

          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',

              validation: (Rule) =>
                Rule.required()
                  .min(2)
                  .max(40),
            }),

            defineField({
              name: 'href',
              title: 'Internal path',
              type: 'string',

              description:
                'Example: /community/membership',

              validation: (Rule) =>
                Rule.required()
                  .custom(internalPathValidation),
            }),
          ],
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'hero.heading',
      media: 'hero.image',
    },

    prepare({title, subtitle, media}) {
      return {
        title: title || 'SRIS Homepage',
        subtitle: subtitle || 'Homepage configuration',
        media,
      }
    },
  },
})
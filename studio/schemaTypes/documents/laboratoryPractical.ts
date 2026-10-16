import {defineArrayMember, defineField, defineType} from 'sanity'

import {altTextField, captionField, richTextBlocks} from '../fields/rich-text'
import {tagsField} from '../fields/tags'

import {disciplineOptions} from '../disciplines'
import {slugify, validateSlug} from '../fields/slug'

export const laboratoryPractical = defineType({
  name: 'laboratoryPractical',
  title: 'Laboratory Practical',
  type: 'document',

  description:
    'A laboratory practical, experiment or hands-on session run by SRIS students, listed on Learn & Do → Laboratory Practicals.',

  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'people', title: 'Members'},
    {name: 'method', title: 'Methodology'},
    {name: 'article', title: 'Write-up'},
  ],

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'overview',

      validation: (Rule) => Rule.required().min(4).max(120),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',

      options: {
        source: 'title',
        maxLength: 96,
        slugify,
      },

      validation: (Rule) => Rule.required().custom(validateSlug),
    }),

    defineField({
      name: 'disciplines',
      title: 'Disciplines',
      type: 'array',
      group: 'overview',

      description:
        'The disciplines this practical belongs to. The website filters practicals by these.',

      of: [{type: 'string'}],

      options: {
        list: disciplineOptions,
        layout: 'grid',
      },

      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Choose at least one discipline.')
          .unique(),
    }),

    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      group: 'overview',

      description:
        'One or two plain sentences shown on listing cards, in search results and in link previews.',

      validation: (Rule) => Rule.required().min(30).max(300),
    }),

    tagsField({group: 'overview'}),

    defineField({
      name: 'conductedOn',
      title: 'Date conducted',
      type: 'date',
      group: 'overview',

      description: 'When the practical or session took place. Used to order the list.',
    }),

    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'overview',

      description: 'Example: UPNG Biology Teaching Laboratory.',

      validation: (Rule) => Rule.max(120),
    }),

    defineField({
      name: 'featuredImage',
      title: 'Featured image',
      type: 'image',
      group: 'overview',

      description: 'Shown on the listing card and at the top of the practical page.',

      options: {
        hotspot: true,
      },

      fields: [altTextField],
    }),

    defineField({
      name: 'members',
      title: 'Members',
      type: 'array',
      group: 'people',

      description:
        'Presenters, students and staff who ran or took part in the practical. Type each name as it should appear on the website.',

      of: [
        defineArrayMember({
          type: 'object',
          name: 'member',
          title: 'Member',

          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',

              validation: (Rule) => Rule.required().max(120),
            }),

            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',

              description: 'Optional. Examples: Presenter, Lead, Facilitator, Demonstrator, Participant.',

              validation: (Rule) => Rule.max(80),
            }),
          ],

          preview: {
            select: {
              title: 'name',
              subtitle: 'role',
            },

            prepare({title, subtitle}) {
              return {
                title: title || 'Unnamed member',
                subtitle,
              }
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'materials',
      title: 'Equipment & materials',
      type: 'array',
      group: 'method',

      description: 'Optional. One item per line, e.g. "Compound light microscope".',

      of: [{type: 'string'}],
    }),

    defineField({
      name: 'methodology',
      title: 'Methodology',
      type: 'array',
      group: 'method',

      description:
        'The steps of the experiment, practical or session, in order. They are numbered automatically on the website.',

      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          title: 'Step',

          fields: [
            defineField({
              name: 'title',
              title: 'Step title',
              type: 'string',

              description: 'Example: Prepare the slide.',

              validation: (Rule) => Rule.required().max(120),
            }),

            defineField({
              name: 'instructions',
              title: 'Instructions',
              type: 'array',

              of: richTextBlocks(false),
            }),

            defineField({
              name: 'image',
              title: 'Step image',
              type: 'image',

              description: 'Optional photograph of this step.',

              options: {
                hotspot: true,
              },

              fields: [altTextField, captionField],
            }),
          ],

          preview: {
            select: {
              title: 'title',
              media: 'image',
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'body',
      title: 'Write-up',
      type: 'array',
      group: 'article',

      description:
        'The full article: aims, background, observations and results. Use the Image button to place photographs within the text.',

      of: richTextBlocks(true),
    }),
  ],

  orderings: [
    {
      title: 'Date conducted, newest first',
      name: 'conductedOnDesc',
      by: [{field: 'conductedOn', direction: 'desc'}],
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],

  preview: {
    select: {
      title: 'title',
      disciplines: 'disciplines',
      conductedOn: 'conductedOn',
      media: 'featuredImage',
    },

    prepare({title, disciplines, conductedOn, media}) {
      const disciplineNames = (disciplines as string[] | undefined)
        ?.map(
          (value) =>
            disciplineOptions.find((option) => option.value === value)?.title ?? value,
        )
        .join(', ')

      return {
        title,
        subtitle: [disciplineNames, conductedOn].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})

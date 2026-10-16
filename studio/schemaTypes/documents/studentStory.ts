import {defineField, defineType} from 'sanity'

import {richTextBlocks} from '../fields/rich-text'

import {tagsField} from '../fields/tags'
import {slugify, validateSlug} from '../fields/slug'

export const studentStory = defineType({
  name: 'studentStory',
  title: 'Student Story',
  type: 'document',

  description:
    'Student experiences, reflections and stories showing practical learning through SRIS.',

  fields: [
    defineField({
      name: 'title',
      title: 'Story title',
      type: 'string',

      validation: (Rule) =>
        Rule.required()
          .min(5)
          .max(140),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',

      options: {
        source: 'title',
        maxLength: 96,
        slugify,
      },

      validation: (Rule) => Rule.required().custom(validateSlug),
    }),

    defineField({
      name: 'quote',
      title: 'Featured quotation',
      type: 'text',
      rows: 3,

      description:
        'Primary quotation displayed prominently on the homepage or story card.',

      validation: (Rule) =>
        Rule.required()
          .min(15)
          .max(500),
    }),

    defineField({
      name: 'story',
      title: 'Full story',
      type: 'array',

      description:
        'The complete story, shown on the story page beneath the featured quotation. Use Heading and Sub-heading for sections, and the Image button to place photographs within the text.',

      of: richTextBlocks(true),
    }),

    tagsField(),

    defineField({
      name: 'studentName',
      title: 'Student name',
      type: 'string',

      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(100),
    }),

    defineField({
      name: 'discipline',
      title: 'Discipline',
      type: 'string',

      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(80),
    }),

    defineField({
      name: 'image',
      title: 'Student image',
      type: 'image',

      description:
        'Optional during the photography-placeholder phase. Prefer documentary-style images rather than formal studio portraits.',

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',

          validation: (Rule) =>
            Rule.required()
              .min(5)
              .max(160),
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      studentName: 'studentName',
      discipline: 'discipline',
      media: 'image',
    },

    prepare({
      title,
      studentName,
      discipline,
      media,
    }) {
      const metadata = [
        studentName,
        discipline,
      ].filter(Boolean)

      return {
        title,
        subtitle: metadata.join(' · '),
        media,
      }
    },
  },
})
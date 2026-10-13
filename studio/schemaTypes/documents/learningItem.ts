import {defineField, defineType} from 'sanity'

import {tagsField} from '../fields/tags'
import {slugify, validateSlug} from '../fields/slug'

export const learningItem = defineType({
  name: 'learningItem',
  title: 'Learning Item',
  type: 'document',

  description:
    'Skills tracks and student knowledge-sharing activities. Laboratory practicals have their own document type.',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',

      validation: (Rule) =>
        Rule.required()
          .min(4)
          .max(120),
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
      name: 'kind',
      title: 'Learning type',
      type: 'string',

      options: {
        list: [
          {
            title: 'Skills Track',
            value: 'Skills Track',
          },
          {
            title: 'Knowledge Sharing',
            value: 'Knowledge Sharing',
          },
        ],

        layout: 'radio',
      },

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,

      validation: (Rule) =>
        Rule.required()
          .min(30)
          .max(500),
    }),

    tagsField(),

    defineField({
      name: 'image',
      title: 'Feature image',
      type: 'image',

      description:
        'Optional while SRIS photography is still being collected.',

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
      kind: 'kind',
      media: 'image',
    },

    prepare({
      title,
      kind,
      media,
    }) {
      return {
        title,
        subtitle: kind || 'Learning item',
        media,
      }
    },
  },
})
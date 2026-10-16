import {defineField, defineType} from 'sanity'

import {tagsField} from '../fields/tags'
import {slugify, validateSlug} from '../fields/slug'

export const researchProject = defineType({
  name: 'researchProject',
  title: 'Research Project',
  type: 'document',

  description:
    'Student research projects, investigations and completed research activities.',

  fields: [
    defineField({
      name: 'title',
      title: 'Project title',
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
      name: 'discipline',
      title: 'Discipline',
      type: 'string',

      description:
        'Primary scientific discipline associated with the project.',

      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(80),
    }),

    defineField({
      name: 'year',
      title: 'Project year',
      type: 'number',

      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(2000)
          .max(2100),
    }),

    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,

      description:
        'Short summary used on homepage features and research listing pages.',

      validation: (Rule) =>
        Rule.required()
          .min(40)
          .max(500),
    }),

    tagsField(),

    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',

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

          validation: (Rule) =>
            Rule.required()
              .min(5)
              .max(160),
        }),
      ],
    }),

    defineField({
      name: 'status',
      title: 'Project lifecycle status',
      type: 'string',

      description:
        'This describes the research project lifecycle and is separate from Sanity draft/published status.',

      options: {
        list: [
          {
            title: 'Draft / Planning',
            value: 'Draft',
          },
          {
            title: 'Active',
            value: 'Active',
          },
          {
            title: 'Completed',
            value: 'Completed',
          },
          {
            title: 'Archived',
            value: 'Archived',
          },
        ],

        layout: 'radio',
      },

      validation: (Rule) =>
        Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      discipline: 'discipline',
      year: 'year',
      status: 'status',
      media: 'coverImage',
    },

    prepare({
      title,
      discipline,
      year,
      status,
      media,
    }) {
      const metadata = [
        discipline,
        year,
        status,
      ].filter(Boolean)

      return {
        title,
        subtitle: metadata.join(' · '),
        media,
      }
    },
  },
})
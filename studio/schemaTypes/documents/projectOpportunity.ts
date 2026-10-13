import {defineField, defineType} from 'sanity'

import {tagsField} from '../fields/tags'
import {slugify, validateSlug} from '../fields/slug'

export const projectOpportunity = defineType({
  name: 'projectOpportunity',
  title: 'Project Opportunity',
  type: 'document',

  description:
    'Open opportunities for students to participate in SRIS research, practical work or projects.',

  fields: [
    defineField({
      name: 'title',
      title: 'Opportunity title',
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

      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(80),
    }),

    defineField({
      name: 'level',
      title: 'Participation level',
      type: 'string',

      description:
        'Examples: Beginner friendly, Intermediate, Field + laboratory.',

      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(80),
    }),

    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,

      description:
        'Short explanation of what participants will do and learn.',

      validation: (Rule) =>
        Rule.required()
          .min(30)
          .max(500),
    }),

    tagsField(),

    defineField({
      name: 'applicationStatus',
      title: 'Application status',
      type: 'string',

      options: {
        list: [
          {
            title: 'Open',
            value: 'Open',
          },
          {
            title: 'Available',
            value: 'Available',
          },
          {
            title: 'Closed',
            value: 'Closed',
          },
        ],

        layout: 'radio',
      },

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',

      description:
        'Editorial publication date for the opportunity.',

      validation: (Rule) =>
        Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      discipline: 'discipline',
      level: 'level',
      applicationStatus: 'applicationStatus',
    },

    prepare({
      title,
      discipline,
      level,
      applicationStatus,
    }) {
      const metadata = [
        discipline,
        level,
        applicationStatus,
      ].filter(Boolean)

      return {
        title,
        subtitle: metadata.join(' · '),
      }
    },
  },
})
import {defineArrayMember, defineField, defineType} from 'sanity';

import {tagsField} from '../fields/tags';
import {slugify, validateSlug} from '../fields/slug'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',

  description:
    'SRIS workshops, talks, laboratory sessions, showcases and community activities.',

  fields: [
    defineField({
      name: 'title',
      title: 'Event title',
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
      name: 'startsAt',
      title: 'Starts at',
      type: 'datetime',

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: 'endsAt',
      title: 'Ends at',
      type: 'datetime',

      validation: (Rule) =>
        Rule.custom((endsAt, context) => {
          if (!endsAt) {
            return true
          }

          const startsAt =
            context.document?.startsAt

          if (
            !startsAt ||
            typeof startsAt !== 'string'
          ) {
            return true
          }

          const start =
            new Date(startsAt).getTime()

          const end =
            new Date(endsAt).getTime()

          if (
            Number.isNaN(start) ||
            Number.isNaN(end)
          ) {
            return true
          }

          return end > start
            ? true
            : 'Event end time must be after the start time.'
        }),
    }),

    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',

      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(160),
    }),

    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',

      description:
        'Optional street address for the map on the event page. Leave empty for events on the UPNG Waigani campus — the map then searches for the venue at UPNG.',

      validation: (Rule) => Rule.max(200),
    }),

    defineField({
      name: 'organiser',
      title: 'Organiser',
      type: 'string',

      description:
        'Shown as "By …" beneath the event title. Leave empty for events SRIS runs itself.',

      validation: (Rule) => Rule.max(100),
    }),

    defineField({
      name: 'admission',
      title: 'Admission',
      type: 'string',

      description:
        'Short label shown on event cards and beside the register button, such as "Free", "K10" or "Members only".',

      validation: (Rule) => Rule.max(30),
    }),

    defineField({
      name: 'registrationUrl',
      title: 'Registration link',
      type: 'url',

      description:
        'Optional sign-up form. When set, upcoming events show a Register button.',

      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https', 'mailto'],
        }),
    }),

    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,

      description:
        'One or two plain sentences. This is the line that appears in the events calendar, on cards, in search results and in link previews, so it must read on its own and carry no formatting. Write the full programme in Description below.',

      validation: (Rule) =>
        Rule.max(240).warning(
          'Listings show roughly 200 characters. Longer summaries are cut off — move the detail into Description.',
        ),
    }),

    tagsField(),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',

      description:
        'The full event programme. Use Sub-heading for section titles, bold for labels such as Facilitator, and the list buttons for what attendees will learn. Do not type Markdown such as ** or ### — it is shown literally.',

      of: [
        defineArrayMember({
          type: 'block',

          styles: [
            {title: 'Body', value: 'normal'},
            {title: 'Heading', value: 'h2'},
            {title: 'Sub-heading', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],

          lists: [
            {title: 'Bulleted', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],

          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],

            annotations: [
              defineField({
                name: 'link',
                title: 'Link',
                type: 'object',

                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',

                    validation: (Rule) =>
                      Rule.required().uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
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
      name: 'image',
      title: 'Event image',
      type: 'image',

      description:
        'Optional event photography or promotional image.',

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
    defineField({
      name: 'gallery',
      title: 'Event gallery',
      type: 'array',

      description:
        'Photographs from the event. Add these after the event has taken place — they appear in a gallery on the event page.',

      options: {
        layout: 'grid',
      },

      of: [
        defineArrayMember({
          type: 'image',
          title: 'Photograph',

          options: {
            hotspot: true,
          },

          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',

              description:
                'Describe what is happening in the photograph for screen reader users.',

              validation: (Rule) =>
                Rule.required()
                  .min(5)
                  .max(160),
            }),

            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',

              description:
                'Optional caption shown beneath the photograph.',

              validation: (Rule) =>
                Rule.max(160),
            }),
          ],
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      startsAt: 'startsAt',
      venue: 'venue',
      media: 'image',
    },

    prepare({
      title,
      startsAt,
      venue,
      media,
    }) {
      let dateLabel = ''

      if (startsAt) {
        const date = new Date(startsAt)

        if (!Number.isNaN(date.getTime())) {
          dateLabel =
            date.toLocaleDateString('en', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
        }
      }

      const metadata = [
        dateLabel,
        venue,
      ].filter(Boolean)

      return {
        title,
        subtitle: metadata.join(' · '),
        media,
      }
    },
  },
})
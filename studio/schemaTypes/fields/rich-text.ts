import {defineArrayMember, defineField} from 'sanity'

/**
 * Alt text is required on every image that is actually used. Written as a
 * custom rule so an empty image slot does not block publishing.
 */
export const altTextField = defineField({
  name: 'alt',
  title: 'Alternative text',
  type: 'string',

  description: 'Describe what the photograph shows for screen reader users.',

  validation: (Rule) =>
    Rule.custom((value, context) => {
      const parent = context.parent as {asset?: unknown} | undefined

      if (parent?.asset && !value) {
        return 'Alternative text is required when an image is used.'
      }

      return true
    }).max(160),
})

export const captionField = defineField({
  name: 'caption',
  title: 'Caption',
  type: 'string',

  description: 'Optional caption shown beneath the photograph.',

  validation: (Rule) => Rule.max(200),
})

/**
 * Rich text for article-style fields (practical write-ups and steps, student
 * stories). Mirrors the block styles the website's RichText component
 * renders, plus inline images with alt text and an optional caption.
 */
export const richTextBlocks = (withHeadings: boolean) => [
  defineArrayMember({
    type: 'block',

    styles: withHeadings
      ? [
          {title: 'Body', value: 'normal'},
          {title: 'Heading', value: 'h2'},
          {title: 'Sub-heading', value: 'h3'},
          {title: 'Quote', value: 'blockquote'},
        ]
      : [{title: 'Body', value: 'normal'}],

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

  defineArrayMember({
    type: 'image',
    title: 'Image',

    options: {
      hotspot: true,
    },

    fields: [altTextField, captionField],
  }),
]

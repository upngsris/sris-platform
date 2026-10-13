import {defineField, defineType} from 'sanity'

/**
 * Enquiries submitted through the contact form on the website.
 *
 * These documents are created by the site, not by editors — the fields are
 * here so enquiries can be read, triaged and archived inside the Studio.
 */
export const contactSubmission = defineType({
  name: 'contactSubmission',
  title: 'Contact enquiry',
  type: 'document',

  description:
    'Enquiries sent through the contact form on the website.',

  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',

      readOnly: true,

      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(100),
    }),

    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',

      readOnly: true,

      validation: (Rule) =>
        Rule.required().email(),
    }),

    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'string',

      readOnly: true,
    }),

    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',

      readOnly: true,

      validation: (Rule) =>
        Rule.max(140),
    }),

    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 8,

      readOnly: true,

      validation: (Rule) =>
        Rule.required()
          .min(10)
          .max(2000),
    }),

    defineField({
      name: 'submittedAt',
      title: 'Submitted at',
      type: 'datetime',

      readOnly: true,

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',

      description:
        'Track whether this enquiry has been dealt with.',

      initialValue: 'new',

      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'In progress', value: 'inProgress'},
          {title: 'Closed', value: 'closed'},
        ],

        layout: 'radio',
      },

      validation: (Rule) =>
        Rule.required(),
    }),
  ],

  orderings: [
    {
      title: 'Newest first',
      name: 'submittedAtDesc',
      by: [{field: 'submittedAt', direction: 'desc'}],
    },
  ],

  preview: {
    select: {
      title: 'name',
      subject: 'subject',
      submittedAt: 'submittedAt',
      status: 'status',
    },

    prepare({title, subject, submittedAt, status}) {
      let dateLabel = ''

      if (submittedAt) {
        const date = new Date(submittedAt)

        if (!Number.isNaN(date.getTime())) {
          dateLabel = date.toLocaleDateString('en', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        }
      }

      const statusLabel =
        status === 'closed'
          ? 'Closed'
          : status === 'inProgress'
            ? 'In progress'
            : 'New'

      const metadata = [
        statusLabel,
        dateLabel,
        subject,
      ].filter(Boolean)

      return {
        title,
        subtitle: metadata.join(' · '),
      }
    },
  },
})

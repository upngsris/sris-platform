import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * One academic year of membership. The website reads the most recently
 * opened period to decide whether registration and renewals are open, what
 * the fees are and how members pay. Nothing about the academic calendar is
 * fixed in the website's code: create a new period each year and publish it.
 *
 * This lives in the public content dataset because it holds no personal data.
 */
export const membershipPeriod = defineType({
  name: 'membershipPeriod',
  title: 'Membership period',
  type: 'document',

  description:
    'The dates, fees and payment instructions for one academic year. Create a new one each year at orientation.',

  groups: [
    {name: 'dates', title: 'Dates', default: true},
    {name: 'fees', title: 'Fees'},
    {name: 'payment', title: 'Payment'},
    {name: 'terms', title: 'Terms'},
  ],

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'dates',
      description: 'Shown to members, for example 2026.',
      validation: (Rule) => Rule.required().max(40),
    }),

    defineField({
      name: 'academicYear',
      title: 'Academic year label',
      type: 'string',
      group: 'dates',
      description: 'Optional wording for the academic year, for example "Academic year 2026".',
    }),

    defineField({
      name: 'registrationOpens',
      title: 'Registration opens',
      type: 'datetime',
      group: 'dates',
      description: 'Academic-year orientation. Port Moresby time.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'registrationCloses',
      title: 'Registration closes',
      type: 'datetime',
      group: 'dates',
      description: 'The beginning of Semester 2. Port Moresby time.',
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          const opens = (context.document as {registrationOpens?: string} | undefined)
            ?.registrationOpens

          if (value && opens && new Date(value) <= new Date(opens)) {
            return 'Registration must close after it opens.'
          }

          return true
        }),
    }),

    defineField({
      name: 'renewalsOpen',
      title: 'Renewals open',
      type: 'datetime',
      group: 'dates',
      description: 'Leave empty to use the registration dates. Renewals normally open at orientation.',
    }),

    defineField({
      name: 'renewalsClose',
      title: 'Renewals close',
      type: 'datetime',
      group: 'dates',
      description: 'Leave empty to use the registration closing date.',
    }),

    defineField({
      name: 'membershipStarts',
      title: 'Membership starts',
      type: 'date',
      group: 'dates',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'membershipEnds',
      title: 'Membership ends',
      type: 'date',
      group: 'dates',
      description: 'Membership lasts one academic year.',
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          const starts = (context.document as {membershipStarts?: string} | undefined)
            ?.membershipStarts

          if (value && starts && value <= starts) {
            return 'Membership must end after it starts.'
          }

          return true
        }),
    }),

    defineField({
      name: 'registrationOverride',
      title: 'Open or close early',
      type: 'string',
      group: 'dates',
      initialValue: 'auto',
      description:
        'Automatic follows the dates above. Choose Closed to stop online registration and renewals immediately, or Open to keep them open past the closing date.',
      options: {
        list: [
          {title: 'Automatic (follow the dates)', value: 'auto'},
          {title: 'Closed now', value: 'closed'},
          {title: 'Open now', value: 'open'},
        ],
        layout: 'radio',
      },
    }),

    defineField({
      name: 'fees',
      title: 'Fees (kina)',
      type: 'object',
      group: 'fees',
      description:
        'Leave a field empty to use the standard fee: students K15, staff K25, alumni K25, others K30.',
      fields: [
        defineField({name: 'students', title: 'Students', type: 'number', validation: (Rule) => Rule.positive()}),
        defineField({name: 'staff', title: 'Staff', type: 'number', validation: (Rule) => Rule.positive()}),
        defineField({name: 'alumni', title: 'Alumni', type: 'number', validation: (Rule) => Rule.positive()}),
        defineField({name: 'others', title: 'Others', type: 'number', validation: (Rule) => Rule.positive()}),
      ],
    }),

    defineField({
      name: 'paymentMethods',
      title: 'Ways to pay',
      type: 'array',
      group: 'payment',
      description:
        'Registration only opens when at least one is listed. These are shown to applicants; never put anything secret here.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'paymentMethod',
          fields: [
            defineField({name: 'label', title: 'Method', type: 'string', description: 'For example Bank transfer or Mobile money.', validation: (Rule) => Rule.required().max(60)}),
            defineField({name: 'accountName', title: 'Account name', type: 'string'}),
            defineField({name: 'accountNumber', title: 'Account / number', type: 'string'}),
            defineField({name: 'instructions', title: 'Extra instructions', type: 'text', rows: 3}),
          ],
          preview: {select: {title: 'label', subtitle: 'accountName'}},
        }),
      ],
      validation: (Rule) => Rule.min(1).error('Add at least one way to pay.'),
    }),

    defineField({
      name: 'paymentNote',
      title: 'Payment note',
      type: 'text',
      rows: 3,
      group: 'payment',
      description: 'Shown under the payment methods, for example what to write as the payment reference.',
    }),

    defineField({
      name: 'termsNote',
      title: 'Extra terms',
      type: 'text',
      rows: 4,
      group: 'terms',
      description: 'Optional. Added to the end of the standard membership terms.',
    }),
  ],

  preview: {
    select: {title: 'title', opens: 'registrationOpens', closes: 'registrationCloses'},
    prepare({title, opens, closes}) {
      const day = (value?: string) => (value ? value.slice(0, 10) : '?')

      return {title: `Membership ${title ?? ''}`, subtitle: `Registration ${day(opens)} to ${day(closes)}`}
    },
  },
})

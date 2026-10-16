import {defineField, defineType} from 'sanity'

/**
 * One membership registration or renewal for one academic year, with the
 * payment details the member submitted. The website creates it with the
 * status "pending"; an executive checks the payment and approves or rejects
 * it here.
 *
 * Only the decision fields are editable. Everything the member submitted is
 * read-only so a record cannot be rewritten after the fact, and the fee is a
 * snapshot, so later fee changes never alter an old record.
 *
 * Personal data: this type belongs to the PRIVATE records dataset only.
 */
const ro = {readOnly: true}

export const membershipRegistration = defineType({
  name: 'membershipRegistration',
  title: 'Registration',
  type: 'document',

  description:
    'A new registration or a renewal, with the payment details to check. Set the decision under "Decision".',

  groups: [
    {name: 'decision', title: 'Decision', default: true},
    {name: 'member', title: 'Member'},
    {name: 'payment', title: 'Payment'},
  ],

  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'decision',
      initialValue: 'pending',
      description:
        'Pending means the payment has not been checked yet. Decisions are due within 24 hours of submission.',
      options: {
        list: [
          {title: 'Pending approval', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'reviewedAt',
      title: 'Decided on',
      type: 'datetime',
      group: 'decision',
      description: 'Set this when you approve or reject.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const status = (context.document as {status?: string} | undefined)?.status

          if (status && status !== 'pending' && !value) {
            return 'Add the date and time of the decision.'
          }

          return true
        }),
    }),

    defineField({
      name: 'reviewedBy',
      title: 'Decided by',
      type: 'string',
      group: 'decision',
      description: 'Your name.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const status = (context.document as {status?: string} | undefined)?.status

          if (status && status !== 'pending' && !value) {
            return 'Add who made the decision.'
          }

          return true
        }),
    }),

    defineField({
      name: 'reviewNotes',
      title: 'Notes',
      type: 'text',
      rows: 3,
      group: 'decision',
      description: 'Optional. For other executives; never shown to the member.',
    }),

    defineField({name: 'referenceCode', title: 'Reference code', type: 'string', group: 'member', ...ro}),
    defineField({name: 'kind', title: 'Type', type: 'string', group: 'member', ...ro, description: 'new or renewal'}),
    defineField({name: 'category', title: 'Category', type: 'string', group: 'member', ...ro}),
    defineField({name: 'periodTitle', title: 'Academic year', type: 'string', group: 'member', ...ro}),
    defineField({name: 'member', title: 'Member', type: 'reference', to: [{type: 'member'}], group: 'member', ...ro}),
    defineField({name: 'periodId', title: 'Period id', type: 'string', group: 'member', ...ro, description: 'Which membership period this belongs to.'}),

    defineField({
      name: 'profile',
      title: 'Details at submission',
      type: 'object',
      group: 'member',
      ...ro,
      fields: [
        defineField({name: 'firstName', type: 'string'}),
        defineField({name: 'lastName', type: 'string'}),
        defineField({name: 'email', type: 'string'}),
        defineField({name: 'yearOfStudy', type: 'string'}),
        defineField({name: 'school', type: 'string'}),
        defineField({name: 'major', type: 'string'}),
        defineField({name: 'department', type: 'string'}),
        defineField({name: 'position', type: 'string'}),
        defineField({name: 'graduationYear', type: 'number'}),
        defineField({name: 'occupation', type: 'string'}),
      ],
    }),

    defineField({name: 'fee', title: 'Fee due (kina)', type: 'number', group: 'payment', ...ro}),

    defineField({
      name: 'payment',
      title: 'Payment submitted',
      type: 'object',
      group: 'payment',
      ...ro,
      description:
        'Check the receipt number against the society account. A mismatch with the fee is flagged below.',
      fields: [
        defineField({name: 'method', title: 'Method', type: 'string'}),
        defineField({name: 'amountPaid', title: 'Amount paid (kina)', type: 'number'}),
        defineField({name: 'amountMatchesFee', title: 'Matches the fee?', type: 'boolean'}),
        defineField({name: 'reference', title: 'Receipt / transaction number', type: 'string'}),
        defineField({name: 'paidOn', title: 'Paid on', type: 'string'}),
        defineField({name: 'payerName', title: 'Name on the payment', type: 'string'}),
        defineField({
          name: 'proof',
          title: 'Proof of payment (receipt photo or PDF)',
          type: 'file',
          description:
            'Optional file the member uploaded. It is stored privately: only signed-in project members can open it. Check it against the society account.',
          fields: [defineField({name: 'fileName', title: 'File name', type: 'string'})],
        }),
      ],
    }),

    defineField({name: 'submittedAt', title: 'Submitted', type: 'datetime', group: 'payment', ...ro}),
    defineField({name: 'decisionDueBy', title: 'Decision due by', type: 'datetime', group: 'payment', ...ro}),
  ],

  orderings: [
    {title: 'Oldest first', name: 'submittedAsc', by: [{field: 'submittedAt', direction: 'asc'}]},
    {title: 'Newest first', name: 'submittedDesc', by: [{field: 'submittedAt', direction: 'desc'}]},
  ],

  preview: {
    select: {
      first: 'profile.firstName',
      last: 'profile.lastName',
      code: 'referenceCode',
      status: 'status',
      kind: 'kind',
      fee: 'fee',
    },
    prepare({first, last, code, status, kind, fee}) {
      const label: Record<string, string> = {
        pending: 'PENDING',
        approved: 'Approved',
        rejected: 'Rejected',
      }

      return {
        title: `${first ?? ''} ${last ?? ''}`.trim() || code,
        subtitle: `${label[status as string] ?? status} · ${kind ?? ''} · K${fee ?? '?'} · ${code ?? ''}`,
      }
    },
  },
})

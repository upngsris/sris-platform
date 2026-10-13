import {defineField, defineType} from 'sanity'

/**
 * A member's saved profile, created by the website when they first register
 * and updated when they renew. It is read-only in the Studio: members change
 * their own details (year of study, major) through the renewal form.
 *
 * Personal data: this type belongs to the PRIVATE records dataset only.
 */
const ro = {readOnly: true}

export const member = defineType({
  name: 'member',
  title: 'Member',
  type: 'document',

  description: 'A registered member. Created and updated by the website.',

  fields: [
    defineField({name: 'category', title: 'Category', type: 'string', ...ro}),
    defineField({name: 'firstName', title: 'First name', type: 'string', ...ro}),
    defineField({name: 'lastName', title: 'Last name', type: 'string', ...ro}),
    defineField({name: 'email', title: 'Email', type: 'string', ...ro}),

    defineField({name: 'yearOfStudy', title: 'Year of study', type: 'string', ...ro}),
    defineField({name: 'school', title: 'School', type: 'string', ...ro}),
    defineField({name: 'major', title: 'Major / study field', type: 'string', ...ro}),

    defineField({name: 'department', title: 'Department', type: 'string', ...ro}),
    defineField({name: 'position', title: 'Role / position', type: 'string', ...ro}),

    defineField({name: 'graduationYear', title: 'Graduation year', type: 'number', ...ro}),
    defineField({name: 'occupation', title: 'Occupation', type: 'string', ...ro}),

    defineField({name: 'createdAt', title: 'Registered', type: 'datetime', ...ro}),
    defineField({name: 'updatedAt', title: 'Profile last updated', type: 'datetime', ...ro}),
  ],

  preview: {
    select: {first: 'firstName', last: 'lastName', category: 'category', email: 'email'},
    prepare({first, last, category, email}) {
      return {title: `${first ?? ''} ${last ?? ''}`.trim(), subtitle: `${category ?? ''} · ${email ?? ''}`}
    },
  },
})

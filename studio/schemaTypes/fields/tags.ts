import {defineArrayMember, defineField} from 'sanity'

/**
 * Search tags, shared by every article-style document. Site search matches
 * them alongside the title and summary, so a post can be found by words that
 * never appear in its visible copy.
 */
export function tagsField(options: {group?: string} = {}) {
  return defineField({
    name: 'tags',
    title: 'Search tags',
    type: 'array',
    group: options.group,

    description:
      'Keywords people might search for that are not already in the title or summary: techniques, equipment, topics, places, organisms. Type a tag and press Enter. Example: staining, onion cells, light microscope.',

    of: [
      defineArrayMember({
        type: 'string',

        validation: (Rule) => Rule.min(2).max(40),
      }),
    ],

    options: {
      layout: 'tags',
    },

    validation: (Rule) =>
      Rule.unique().max(15).warning('Keep to 15 tags or fewer so each one stays meaningful.'),
  })
}

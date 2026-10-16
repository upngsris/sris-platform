import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {privateSchemaTypes, publicSchemaTypes} from './schemaTypes'
import {recordsStructure} from './structure'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1emtwm5v'

/**
 * Two workspaces over two datasets:
 *
 *  - Content (/content): the website's pages, events, people, and the
 *    membership periods. Public dataset.
 *  - Private records (/records): members, registrations awaiting approval and
 *    contact enquiries. A PRIVATE dataset that only signed-in project members
 *    can read. It must be created once (docs/membership.md):
 *      npx sanity dataset create private-records --visibility private
 */
export default defineConfig([
  {
    name: 'content',
    title: 'UPNG SRIS: Content',
    basePath: '/content',

    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

    plugins: [structureTool(), visionTool()],

    schema: {types: publicSchemaTypes},
  },

  {
    name: 'records',
    title: 'UPNG SRIS: Private records',
    basePath: '/records',

    projectId,
    dataset: process.env.SANITY_STUDIO_PRIVATE_DATASET || 'private-records',

    plugins: [structureTool({structure: recordsStructure}), visionTool()],

    schema: {types: privateSchemaTypes},
  },
])

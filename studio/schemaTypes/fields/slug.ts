import type {SlugValue} from 'sanity'

/**
 * URL slugs: lowercase ASCII letters, digits and single hyphens — nothing
 * that needs percent-encoding in a link or reads differently once shared.
 * "Paver (Brick) & Tiles: Phase 2" becomes "paver-brick-and-tiles-phase-2".
 */
export function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/, '')
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Rejects a hand-typed slug that slugify() would not have produced. */
export function validateSlug(value: SlugValue | undefined) {
  const current = value?.current

  if (!current || SLUG_PATTERN.test(current)) {
    return true
  }

  return `Use lowercase letters, numbers and single hyphens only, for example "${slugify(current) || 'my-page'}". Click Generate to fix it.`
}

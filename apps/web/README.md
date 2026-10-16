# SRIS Production Phase 1

This package converts the approved V4 homepage prototype into maintainable Next.js components while preserving the visual direction.

## What changed
- `page.tsx` is now composition-only.
- Header, footer and each homepage section are separate components.
- Navigation data is centralized in `data/navigation.ts`.
- Real `next/link` routes replace placeholder anchors.
- Mobile navigation is now a viewport panel with body scroll locking.
- Mobile stats use a 2×2 layout.
- Shared `TextLink` and `ImagePlaceholder` primitives reduce duplication.
- Static editorial content remains local for now; Sanity integration is deliberately deferred to Phase 2.

## Copy into `apps/web`
Copy the contents of this package into `apps/web`, preserving your existing `app/layout.tsx`.

Recommended first:
```bash
git add .
git commit -m "feat: approve SRIS homepage prototype v4"
git checkout -b feat/production-homepage
```

Then copy the files and run:
```bash
pnpm dev
```

## Important
The navigation routes are now explicit. Some destinations may 404 until those pages are scaffolded. That is intentional and makes the information architecture concrete before Sanity integration.

## Next phase
Phase 2 should define Sanity schemas and GROQ for:
- homepage editorial settings
- research projects
- projects to join
- events
- skills tracks / learning content
- student stories / showcase
- people/team

Keep route structure, design tokens and navigation definitions in code unless a genuine editorial requirement emerges.

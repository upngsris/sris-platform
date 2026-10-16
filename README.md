# UPNG SRIS website

The website for the Science, Research & Innovation Society at the University
of Papua New Guinea.

| Folder | What it is |
|---|---|
| `apps/web` | The public website (Next.js, deployed to visitors) |
| `studio` | Sanity Studio, where editors manage content |
| `packages/*` | Shared lint and TypeScript config |

Content (people, events, research, stories, newsletter) lives in
[Sanity](https://www.sanity.io). The site reads published content, and a
webhook refreshes it when an editor publishes.

## Run it locally

```bash
cd apps/web
cp .env.example .env.local     # fill in the values
pnpm install
pnpm dev                       # http://localhost:3000
```

The Studio:

```bash
cd studio
pnpm install
pnpm dev                       # http://localhost:3333
```

## Checks

From `apps/web`:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

These also run in CI on every pull request.

## Deploying

See [`apps/web/docs/deployment.md`](apps/web/docs/deployment.md): environment
variables, hosting, contact-form email, the Sanity publish webhook, security
headers and the go-live checklist.

Membership registration and renewal, including the private dataset it needs
and how executives approve payments, is in
[`apps/web/docs/membership.md`](apps/web/docs/membership.md). Other notes are
in `apps/web/docs/`.

## Where things are

- Pages: `apps/web/app/`
- Components: `apps/web/components/`
- Colours, type and state styling: `apps/web/app/globals.css` (design
  tokens), `lpi.css` (layout), `states.css` (hover, focus, errors, alerts)
- Content queries and types: `apps/web/sanity/lib/`
- Content models: `studio/schemaTypes/`

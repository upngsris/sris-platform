# Deployment guide

How to take the SRIS website live and keep it running. The site is a Next.js
app (`apps/web`) that reads content from Sanity. The Studio (`studio/`) is a
separate app that editors use.

## 1. Before the first deploy

- [ ] Choose the production domain and set `NEXT_PUBLIC_SITE_URL` to it
      (no trailing slash). Without it the sitemap, canonical links and social
      previews point at localhost.
- [ ] Fill in the environment variables below.
- [ ] Verify your sending domain in Resend (step 3).
- [ ] Create the **private** Sanity dataset and set `SANITY_PRIVATE_DATASET`,
      `SANITY_API_WRITE_TOKEN` and `MEMBERSHIP_SECRET` (see `membership.md`).
      Without it, contact enquiries and membership are not stored.
- [ ] Create the Sanity publish webhook (step 4).
- [ ] Review the content checklist (step 7).

### Environment variables

Copy `apps/web/.env.example`; every variable is explained there. Set them in
the hosting dashboard, never in git.

| Variable | Needed | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | Public address |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | yes | Where content lives |
| `SANITY_REVALIDATE_SECRET` | yes | Signs the publish webhook |
| `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` | for email | Contact-form notifications |
| `SANITY_PRIVATE_DATASET` | for storage | Private dataset for personal data (`membership.md`) |
| `SANITY_API_WRITE_TOKEN` | for storage | Editor token; reads and writes the private dataset |
| `MEMBERSHIP_SECRET` | for membership | 32+ characters; identifiers and renewal links |
| `MEMBERSHIP_NOTIFY_TO` | optional | Who is emailed about registrations (default `CONTACT_TO`) |
| `MAINTENANCE_MODE` | optional | `true` serves a 503 maintenance page |
| `ENABLE_STATUS_TEST_ROUTES` | never in production | Exposes error-page test URLs |

## 2. Hosting

Any host that runs Node 22 works. On Vercel:

- **Root Directory:** `apps/web`
- **Install command:** `pnpm install --frozen-lockfile`
- **Build command:** `pnpm build`
- Add the environment variables above, then attach the domain.

`apps/web` has its own `pnpm-lock.yaml`; keep it committed. `pnpm audit`
and Dependabot read it.

## 3. Contact-form email (Resend)

1. Create an account at <https://resend.com> and add your domain.
2. Add the DNS records Resend shows (SPF and DKIM). Wait until the domain
   shows **Verified**.
3. Create an API key and set `RESEND_API_KEY`.
4. Set `CONTACT_FROM` to an address on the verified domain and `CONTACT_TO` to
   the inbox(es) that should be notified.

How it behaves: each message is saved to the private Sanity dataset first (if
`SANITY_PRIVATE_DATASET` and `SANITY_API_WRITE_TOKEN` are set), then emailed. If the email provider is down
the visitor still sees success because the message is kept in Sanity; the
failure is written to the server log. If *neither* works the visitor sees an
error and their text is preserved. Replying to a notification email replies
to the visitor, not to the no-reply sender.

Spam protection: a hidden honeypot field and a limit of five messages per
ten minutes per client (per server instance). For a hard cross-instance
limit add a platform rule (Vercel WAF, Cloudflare) in front of
`/about/contact`.

To use another provider, replace `sendEmail` in `lib/email.ts`.

### Upload size on your host

Membership proof-of-payment uploads are capped at 4 MB, and the server-action
body limit is set to 5 MB in `next.config.ts`. Vercel's serverless functions
accept request bodies up to about 4.5 MB, which is why the cap is 4 MB. A host
with a lower limit will reject larger photos before the site can explain why.

## 4. Sanity publish webhook

Without this, edits appear after the timed cache (about 50 minutes). With it
they appear within seconds.

1. Generate a secret: `openssl rand -base64 32`, and set it as
   `SANITY_REVALIDATE_SECRET` on the host.
2. Open <https://www.sanity.io/manage> → your project → **API → Webhooks →
   Create webhook** and enter:

| Field | Value |
|---|---|
| Name | `Website revalidate` |
| URL | `https://<your-domain>/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | *(leave empty to refresh on every document type)* |
| Projection | `{_type, "slug": slug.current}` |
| HTTP method | `POST` |
| Drafts | off (do not trigger for draft changes) |
| Secret | the value from step 1 |

3. Save, then publish any document in the Studio. The webhook's delivery log
   in Sanity should show `200` with `{"ok":true,"revalidated":"sanity"}`.

The route rejects unsigned requests with `401`. All content fetches carry the
cache tag `sanity` (`sanity/lib/fetch.ts`); the webhook expires that tag and
refreshes the page cache. The 50-minute timer stays as a safety net.

## 5. Sanity Studio

```bash
cd studio
pnpm install
pnpm run deploy    # hosts the Studio on <name>.sanity.studio
```

The Studio has two workspaces, at `/content` (website content and membership
periods) and `/records` (private records and the approval queue); see
`membership.md`.

Add the Studio URL (and your production domain) under **API → CORS origins**
if you use any browser-side Sanity calls. Invite editors under **Members**.

## 6. Security headers

`next.config.ts` sets HSTS, a Content-Security-Policy, `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and
`Cross-Origin-Opener-Policy` on every response.

Check after deploying:

```bash
curl -sI https://<your-domain>/ | grep -iE "content-security|strict-transport|x-frame|x-content|referrer|permissions"
```

If a new third-party service is added (analytics, a video embed, a font
host), allow its origin in `contentSecurityPolicy` or the browser will block
it. Scripts currently allow `'unsafe-inline'` because Next.js inlines small
bootstrap scripts. A nonce-based policy is stricter but forces every page to
render on demand (no static pages); see the Next.js guide
`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`.

HSTS is not marked `preload`. Add `; preload` and submit the domain at
hstspreload.org only once HTTPS is permanent for it and every subdomain.

## 7. Content checklist

These cannot be fixed in code:

- [ ] Replace or unpublish the test profile "Dr. Caroline Mera" (its text says
      it is a fictional profile) and any other sample people, stories,
      events or newsletter authors, in the Studio.
- [ ] Add real figures to the homepage stats in
      `components/home/about-intro.tsx` (a stat with `value: null` is hidden).
- [ ] Create the Contact document in the Studio with the society's real email,
      phone and address.
- [ ] Confirm the privacy page (`/privacy`) still matches what the site does.

## 8. After going live

- [ ] Submit a test message through the contact form and confirm both the
      Sanity document and the email arrive.
- [ ] Publish a small edit and confirm it appears without waiting.
- [ ] Open `/sitemap.xml` and `/robots.txt` and confirm they show the real
      domain.
- [ ] Add uptime monitoring and error tracking (for example UptimeRobot and
      Sentry); none is configured yet.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and push to `main`:
lint, type-check, production build, and a dependency audit that fails on a
critical advisory. Make it a required check in the repository's branch
protection settings. Dependabot (`.github/dependabot.yml`) opens weekly
update pull requests.

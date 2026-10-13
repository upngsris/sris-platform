# Membership: how it works and how to run it

Online membership registration and renewal for the society. Applicants pick a
category, pay by bank transfer or mobile money, and submit the payment
details. Executives check the payment in the Sanity Studio and approve it.
There is no card payment: the site never asks for or stores card numbers or
passwords.

## Setup, once

### 1. Create the private dataset (required)

The website's normal content lives in a **public** Sanity dataset that anyone
can read through Sanity's API. Member profiles, payment references and contact
enquiries are personal data, so they go in a separate **private** dataset:

```bash
cd studio
npx sanity login
npx sanity dataset create private-records --visibility private
```

Then in the hosting dashboard set:

| Variable | Value |
|---|---|
| `SANITY_PRIVATE_DATASET` | `private-records` (the name you created) |
| `SANITY_API_WRITE_TOKEN` | An **Editor** token (sanity.io/manage → API → Tokens) |
| `MEMBERSHIP_SECRET` | 32+ random characters (`openssl rand -base64 48`). Set once and keep it |
| `MEMBERSHIP_NOTIFY_TO` | Executive inbox(es) to be emailed about each submission (falls back to `CONTACT_TO`) |
| `RESEND_API_KEY`, `CONTACT_FROM` | As in `deployment.md`; used for confirmations and renewal links |

The site **refuses to store anything** (and tells applicants to contact the
executives) if the private dataset is not set, is the same as the public one,
or answers anonymous queries, so a mistake here fails safe instead of leaking.
The reason is written to the server log.

Re-deploy the Studio (`pnpm run deploy` in `studio/`). It now has two
workspaces:

- **Content** (`/content`): pages, events, people and **Membership periods**.
- **Private records** (`/records`): **Registrations awaiting approval**,
  approved and rejected registrations, members and contact enquiries.

### 2. Who can approve

Approval happens in the *Private records* workspace, so anyone who can open it
can approve. Access is controlled by Sanity project membership
(sanity.io/manage → Members): invite only the executives, with the Editor
role, and use Viewer for anyone who should read but not decide. Every change
is recorded in each document's revision history, with who made it.

Sanity's finer-grained custom roles are an Enterprise feature; if the society
needs more than "executive or not", that is the route.

## Each academic year

At orientation, in the Studio → **Content → Membership period** → create:

| Field | Meaning |
|---|---|
| Title / academic year | Shown to members, e.g. `2027` |
| Registration opens | Academic-year orientation |
| Registration closes | Beginning of Semester 2 |
| Renewals open / close | Optional. Default to the registration dates |
| Membership starts / ends | The academic year (membership lasts one year) |
| Open or close early | Automatic follows the dates. **Closed now** stops everything at once |
| Fees | Optional overrides. Standard fees: students K15, staff K25, alumni K25, others K30 |
| Ways to pay | At least one is required, or registration will not open |
| Payment note, extra terms | Optional |

Publish it. The site uses the most recently *opened* period, so you can
create next year's period in advance: it shows "opens on …" until its date.
No date is built into the code.

## What members experience

1. **Register** (`/community/membership/register`): choose Student, Staff,
   Alumni or Others. The page shows that category's fee and fields, and the
   payment instructions. After paying, the member enters the amount, date and
   receipt/transaction number, accepts the terms and submits.
2. They get a **reference code** (e.g. `SRIS-27-7KQ3M`) on screen and by
   email. Status is **Pending approval for up to 24 hours**.
3. **Status** (`/community/membership/status`): reference code + email shows
   Pending / Approved / Not approved. A wrong code or wrong email gives the
   same answer, and no personal details are shown.
4. **Renew** (`/community/membership/renew`): the member enters their email.
   If they have an approved membership, a secure link is emailed (valid 30
   minutes, one per address per few minutes). It opens a form with their saved
   details; students can update year of study and major; everyone submits new
   payment details. The renewal is a new record linked to the same member, and
   last year's record is untouched. The page answers identically for unknown
   addresses, so it cannot be used to discover who is a member.
5. **After closing**: the forms are removed and the page says online
   registration is closed and to contact the executives about late
   registration, with links to the contact form and the team page.
   Registrations that arrive after closing are also refused by the server.

## What executives do

1. You receive an email for each submission (and see it in **Private records →
   Registrations awaiting approval**, oldest first; the decision is due within
   24 hours).
2. Check the receipt/transaction number and amount against the society's
   account. A mismatch with the fee is flagged on the record and in the email.
3. Open the registration, set **Status** to Approved or Rejected, fill in
   **Decided on** and **Decided by**, optionally add notes (never shown to the
   member), and publish.
4. Late registrations and corrections to details other than year of study and
   major are handled by an executive directly (the member records are
   read-only in the Studio so history cannot be rewritten).

## What is stored

In the private dataset only:

- **Member**: category, name, email, and the category's profile fields.
  Identified by an opaque id derived from the email and `MEMBERSHIP_SECRET`,
  which also makes a second registration for the same email impossible.
- **Registration** (one per member per academic year, new or renewal):
  reference code, fee at the time, profile snapshot, payment method, amount,
  date and receipt number, an optional **proof-of-payment file**, status, and
  the decision.

Never stored: card numbers (entries that look like one are rejected), PINs or
passwords, or any payment credentials.

### Proof-of-payment uploads

The payment section has an optional file field for a photo, screenshot or PDF
of the receipt.

- **Allowed:** PDF, JPG, PNG and WebP, up to **4 MB**. The limit sits under the
  roughly 4.5 MB request ceiling of common serverless hosts; raise
  `MAX_PROOF_BYTES` (`lib/membership/proof.ts`) and
  `experimental.serverActions.bodySizeLimit` (`next.config.ts`) together only
  if your host allows larger bodies.
- **Checked by content, not name.** The server reads the file's first bytes, so
  a program or script renamed `receipt.jpg` is refused. The filename is
  cleaned and given the extension of what the file really is.
- **Stored privately.** The file is a Sanity asset in the *private* dataset,
  so it is not reachable from the public dataset or by link; executives open
  it from the registration record (Private records → Registration → Payment →
  Proof of payment).
- **No orphans.** If a registration is a duplicate or fails to save, the
  uploaded file is deleted again.
- **Not scanned for malware.** Files are type-checked but not virus-scanned;
  open them only in the Studio's viewer or a trusted app. If that matters to
  the society, add a scanning step before storing.
- It is optional: the receipt number is still what executives match against
  the account, and the registration says whether a file came with it.

## Limits and honest caveats

- Rate limits are per server instance (see `lib/rate-limit.ts`) and per email
  for renewal links. For hard limits across instances add a platform rule.
- Email delivery depends on Resend. If it fails, the submission is still saved
  and visible in the Studio; the applicant is told if their confirmation could
  not be sent.
- Approving a registration does not email the applicant yet; they use the
  status page. A Sanity webhook to send an approval email is a natural next
  step.
- Changing `MEMBERSHIP_SECRET` invalidates all outstanding renewal links and
  makes existing members' identifiers unreachable (a new registration for the
  same email would be allowed). Keep it stable.
- Student email addresses are not restricted to a university domain, because
  the society has not specified one.

## For developers

- Rules and logic: `lib/membership/` (pure, unit-tested: `pnpm test`).
- Pages: `app/community/membership/` · Forms: `components/membership/`.
- Database access is behind `lib/membership/store.ts`; the Sanity version is
  `sanity-store.ts`, using `sanity/lib/private-client.ts`.
- Studio schemas: `studio/schemaTypes/documents/` (`membershipPeriod`,
  `member`, `membershipRegistration`); workspaces in `studio/sanity.config.ts`.

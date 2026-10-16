# HTTP status pages

The site has a branded page for each of these HTTP status codes. Every page
returns its **real** status code, not `200`, so browsers, search engines and
monitoring tools see the right result.

| Code | Meaning               | Page / file                                  | Triggered by                                            |
| ---- | --------------------- | -------------------------------------------- | ------------------------------------------------------- |
| 400  | Bad Request           | `app/status/[code]` via `proxy.ts`           | A URL path with broken percent-encoding                 |
| 401  | Unauthorized          | `app/unauthorized.tsx`                       | `unauthorized()` from `next/navigation`                 |
| 403  | Forbidden             | `app/forbidden.tsx`                          | `forbidden()` from `next/navigation`                    |
| 404  | Not Found             | `app/not-found.tsx`                          | Unknown URLs, or `notFound()`                           |
| 500  | Internal Server Error | `app/error.tsx`, `app/global-error.tsx`      | Any uncaught error while rendering a page               |
| 502  | Bad Gateway           | `public/errors/502.html` (+ `/status/502`)   | Your gateway, when the Next.js app is unreachable       |
| 503  | Service Unavailable   | `app/status/[code]` via `proxy.ts` (+ `public/errors/503.html`) | `MAINTENANCE_MODE=true`, or your gateway |

The wording for every page lives in one place: `lib/status.ts`. The standalone
gateway pages in `public/errors/` copy the 502 and 503 wording by hand, because
they must work when the app is down. Update both if you change it.

## Test URLs

`/status-test/<code>` triggers each page on demand:

```
/status-test/400   /status-test/401   /status-test/403   /status-test/404
/status-test/500   /status-test/502   /status-test/503
```

They are **on in development** (`next dev`) and **off in production** (they
answer 404) unless you start the server with `ENABLE_STATUS_TEST_ROUTES=true`.
Leave that off on the live site.

In every test below, check two things:

1. **The page:** the big code, the heading and the buttons match the table.
2. **The status code:** run the `curl` command and check the first number.

`curl -s -o /dev/null -w '%{http_code}\n' <url>` prints only the status code.
The examples use `http://localhost:3000`; replace it with your server's
address.

---

## 400 Bad Request

**What triggers it:** `proxy.ts` answers 400 when a URL path can't be decoded,
e.g. a link that was cut off in the middle of a `%` sequence. Query strings
(`?q=...`) are not checked: the pages already cope with bad encoding there.

**Test it:**

1. Open `/status-test/400` in the browser. You should see the **400 · Bad
   Request** page, with *Back to homepage* and *Contact SRIS* buttons.
2. Check a real malformed URL:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:3000/learn/%E0%A4%A'
   ```

   Expected: `400`.
3. Check that a normal URL is unaffected:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:3000/learn'
   ```

   Expected: `200`.

## 401 Unauthorized

**What triggers it:** a page or Server Action calling `unauthorized()` when the
visitor isn't signed in. The site has no sign-in yet, so nothing calls it
today. It's ready for when members' areas are added. It needs
`experimental.authInterrupts`, which is enabled in `next.config.ts`.

```ts
import { unauthorized } from "next/navigation";

if (!session) {
  unauthorized();
}
```

**Test it:**

1. Open `/status-test/401`. You should see the **401 · Unauthorized** page.
2. Check the status code:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/status-test/401
   ```

   Expected: `401`.

When a sign-in page exists, add its button to `app/unauthorized.tsx`.

## 403 Forbidden

**What triggers it:** `forbidden()`, for a visitor who is signed in but not
allowed to see the page (e.g. a member opening an admin page). It uses the same
`authInterrupts` setting as 401.

**Test it:**

1. Open `/status-test/403`. You should see the **403 · Forbidden** page.
2. Check the status code:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/status-test/403
   ```

   Expected: `403`.

## 404 Not Found

**What triggers it:** any URL that doesn't exist, and any page that calls
`notFound()`, e.g. a research project or event whose slug isn't in Sanity.

**Test it:**

1. Open any made-up URL, e.g. `/this-page-does-not-exist`. You should see the
   **404 · Not Found** page with a working search box.
2. Open a missing item under a real section, e.g.
   `/learn/laboratory-practicals/no-such-practical`. You should get the same page.
3. Check the status code:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/this-page-does-not-exist
   ```

   Expected: `404`.
4. Type in the page's search box. Suggestions should appear, just as they do in
   the header.

## 500 Internal Server Error

**What triggers it:** an uncaught error while rendering a page, such as a
crash in a component.

- `app/error.tsx` handles errors in any page, and keeps the site header and footer.
- `app/global-error.tsx` handles errors in the root layout itself (the
  header, footer or fonts). It replaces the whole document, so it has no site
  navigation.

In production, the page shows a **reference number** (the error's *digest*).
The same number appears in the server log next to the full error, so a report
from a visitor can be matched to the log.

**Test it — in production mode.** In `next dev`, Next.js covers the page with
its developer error overlay. Close the overlay to see the page underneath, but
the production check below is the real test.

```bash
cd apps/web
pnpm build
ENABLE_STATUS_TEST_ROUTES=true pnpm start
```

1. Open `/status-test/500`. You should see the **500 · Internal Server Error**
   page, with *Try again* and *Back to homepage*, and a line reading *quote
   reference 1234567890*.
2. Check the server terminal. It should show
   `Error: Status test: intentional 500 ...` with `digest: '1234567890'`, the
   same number as the page.
3. Check the status code:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/status-test/500
   ```

   Expected: `500`.
4. Check that the error's message isn't sent to the browser: the page should
   not show *"Status test: intentional 500"*.
5. Click **Try again**. The page re-renders; the test route fails again, so
   you stay on the 500 page. On a real, temporary error, this recovers the page.

Stop the server and restart it **without** `ENABLE_STATUS_TEST_ROUTES` when done.

## 502 Bad Gateway

**What triggers it:** a gateway in front of the site, such as a reverse proxy,
load balancer or CDN, when the Next.js server behind it is down or returns
garbage. The app can't produce a real 502 itself, because at that moment it's
the thing that failed. So there are two versions:

- **`public/errors/502.html`:** a standalone page with no scripts, web fonts or
  external files. Configure your gateway to serve it for 502 errors (see
  [Gateway set-up](#gateway-set-up)). It's also reachable at `/errors/502.html`
  for previewing.
- **`/status/502`:** the same content inside the site, for previewing with the
  site header and footer.

**Test it:**

1. Open `/status-test/502`. You should see the **502 · Bad Gateway** page.
2. Open `/errors/502.html`. You should see the standalone version: a navy
   panel on a light background, no site header.
3. Check the status code of the in-site version:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/status-test/502
   ```

   Expected: `502`. The `/errors/502.html` preview answers `200`, because
   it's a plain file; the gateway supplies the 502 when it serves it.
4. **Gateway test (after set-up):** stop the Next.js server and load the site
   through the gateway. You should see the standalone 502 page, and the status
   should be `502`.

## 503 Service Unavailable (maintenance mode)

**What triggers it:** setting `MAINTENANCE_MODE=true` in the site's
environment. `proxy.ts` then answers **every page** with the 503 page and these
headers:

- `Retry-After: 3600`, which tells browsers and search engines to come back in
  an hour, so the outage doesn't hurt search rankings.
- `Cache-Control: no-store`, which stops any cache from keeping the maintenance
  page after the site is back.

Images, CSS and scripts keep loading, so the maintenance page is styled.
`public/errors/503.html` is the standalone version for when the app itself is
down, e.g. during a deploy.

**Test it:**

1. Open `/status-test/503`. You should see the **503 · Service Unavailable**
   page with a single *Try again* button and no *Where to next* links.
2. Turn on maintenance mode against a production build:

   ```bash
   cd apps/web
   pnpm build
   MAINTENANCE_MODE=true pnpm start
   ```

3. Open `/`, `/learn` and `/about/contact`. Every page should show the 503 page.
4. Check the status and headers:

   ```bash
   curl -sI http://localhost:3000/
   ```

   Expected: `HTTP/1.1 503 Service Unavailable`, `retry-after: 3600` and
   `cache-control: no-store`.
5. Restart without `MAINTENANCE_MODE` and check that `/` answers `200` again.

To put the **live** site into maintenance, set `MAINTENANCE_MODE=true` in the
hosting provider's environment variables and redeploy or restart. Remove it,
and redeploy or restart, to bring the site back.

---

## Gateway set-up

This only applies if the site runs behind your own reverse proxy or load
balancer. Configure it to serve the standalone pages when the app can't answer.
Example for **nginx**, where `/var/www/sris-errors` holds a copy of
`apps/web/public/errors/`:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_intercept_errors on;

    error_page 502 504 /errors/502.html;
    error_page 503     /errors/503.html;
}

location /errors/ {
    alias /var/www/sris-errors/;
    internal;
}
```

Test it by stopping the Next.js process and reloading the site. You should see
the standalone 502 page, and `curl -sI` should report `502`.

On managed hosting such as Vercel, the platform serves its own page when the
app is unreachable, and these standalone files are not used.

## Checklist before going live

- [ ] `ENABLE_STATUS_TEST_ROUTES` is **not** set in production, so
      `/status-test/500` answers `404`.
- [ ] `MAINTENANCE_MODE` is **not** set, unless you mean it.
- [ ] A made-up URL returns the 404 page with status `404`.
- [ ] If there's a gateway, stopping the app shows the 502 page.

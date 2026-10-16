/**
 * Copy for the site's HTTP status pages, shared by the Next.js special files
 * (not-found, error, forbidden, unauthorized) and the /status/[code] routes the
 * proxy rewrites to. The standalone gateway pages in public/errors/ repeat the
 * 502 and 503 copy by hand, because they must work with the app offline.
 */
export type StatusCode = 400 | 401 | 403 | 404 | 500 | 502 | 503;

export type StatusContent = {
  code: StatusCode;
  /** The standard reason phrase, shown in the eyebrow and page title. */
  reason: string;
  heading: string;
  message: string;
};

export const STATUS_CONTENT: Record<StatusCode, StatusContent> = {
  400: {
    code: 400,
    reason: "Bad Request",
    heading: "That request didn’t make sense to us.",
    message:
      "The link or information we received was malformed — often a link that was cut off or only partly copied. Check the address, or start again from the homepage.",
  },
  401: {
    code: 401,
    reason: "Unauthorized",
    heading: "You need to sign in to see this page.",
    message:
      "This page is only available to signed-in SRIS members and administrators. If you think you should have access, contact the society.",
  },
  403: {
    code: 403,
    reason: "Forbidden",
    heading: "You don’t have access to this page.",
    message:
      "You’re signed in, but your account isn’t allowed to view this page. If you think that’s a mistake, contact the society and we’ll look into it.",
  },
  404: {
    code: 404,
    reason: "Not Found",
    heading: "We couldn’t find that page.",
    message:
      "It may have moved, been unpublished, or the link may be wrong. Try searching the site, or head back to the homepage.",
  },
  500: {
    code: 500,
    reason: "Internal Server Error",
    heading: "Something went wrong on our side.",
    message:
      "The page failed to load because of a problem with the site, not anything you did. Try again in a moment — if it keeps happening, let us know.",
  },
  502: {
    code: 502,
    reason: "Bad Gateway",
    heading: "We couldn’t reach one of our services.",
    message:
      "The site relies on other services to load its content, and one of them sent back an invalid response. This is usually temporary — please try again shortly.",
  },
  503: {
    code: 503,
    reason: "Service Unavailable",
    heading: "SRIS is briefly offline for maintenance.",
    message:
      "We’re making improvements to the website and will be back shortly. Thank you for your patience.",
  },
};

/** Codes served by the /status/[code] route (the rest use Next special files). */
export const ROUTED_STATUS_CODES = [400, 502, 503] as const;

export function statusTitle(code: StatusCode) {
  return `${code} ${STATUS_CONTENT[code].reason} | UPNG SRIS`;
}

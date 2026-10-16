import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy, allow-listed to what the site actually loads:
 * its own origin, Sanity's image/file CDN, and the Google Maps embeds on the
 * contact and event pages.
 *
 * Scripts allow 'unsafe-inline' because Next.js writes small inline
 * bootstrap scripts into every page. The stricter alternative is a
 * per-request nonce, but nonces require every page to be rendered on demand,
 * which would give up this site's prerendered (static) pages. The policy
 * still blocks scripts from any other origin, plugins (`object-src`), base
 * tag hijacking, form posts to other sites and framing of this site. See
 * docs/deployment.md if you later want to move to nonces.
 *
 * Development additionally needs eval and websockets for hot reloading.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src https://www.google.com https://maps.google.com https://cdn.sanity.io",
  "media-src 'self' https://cdn.sanity.io",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // One year, subdomains included. Not marked `preload`: that is a
  // near-permanent commitment, so opt in deliberately once HTTPS is final.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // The framework name and version are not the visitor's business.
  poweredByHeader: false,

  experimental: {
    // Enables forbidden() / unauthorized() and their 403 / 401 pages
    // (app/forbidden.tsx, app/unauthorized.tsx).
    authInterrupts: true,

    serverActions: {
      // Server Actions accept 1 MB by default, which a phone photo of a
      // receipt exceeds. Proof-of-payment uploads are capped at 4 MB in
      // lib/membership/proof.ts; this leaves room for the form fields.
      bodySizeLimit: "5mb",
    },
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  /*
   * /explore and /community are URL sections with no page of their own.
   * Someone trimming a URL back lands on the section's main list instead
   * of a 404. Temporary, so a hub page can replace either one later.
   */
  async redirects() {
    return [
      { source: "/explore", destination: "/explore/research", permanent: false },
      { source: "/community", destination: "/community/events", permanent: false },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    qualities: [70, 85],

    // AVIF first: typically a fifth to a third smaller than WebP at the same
    // quality. Browsers without it fall back to WebP. Encoding is slower, but
    // only on the first request for each size; the result is cached.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
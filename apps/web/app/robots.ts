import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

/*
 * Everything public is crawlable. The API, search results and the status
 * pages are kept out: they are machine endpoints or noindex views, and
 * crawling them only spends crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/search",
          "/status/",
          "/status-test/",
          "/community/membership/renew/",
          "/community/membership/status",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

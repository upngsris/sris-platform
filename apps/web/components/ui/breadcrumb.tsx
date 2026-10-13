import { Fragment } from "react";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";

import { routes } from "@/lib/route";
import { absoluteUrl } from "@/lib/seo";

export type Crumb = {
  label: string;
  href?: string;
};

/**
 * Institutional wayfinding: every interior page states where it sits.
 * The final crumb is the current page and is never a link.
 */
export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  const crumbs: Crumb[] = [{ label: "Home", href: routes.home }, ...trail];

  // The same trail as BreadcrumbList structured data. The current page has
  // no link, and schema.org lets the last item omit its URL.
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href && index < crumbs.length - 1
        ? { item: absoluteUrl(crumb.href) }
        : {}),
    })),
  };

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <JsonLd data={schema} />

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <Fragment key={`${crumb.label}-${index}`}>
            {crumb.href && !isLast ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span aria-current="page">{crumb.label}</span>
            )}

            {!isLast && <i aria-hidden="true">›</i>}
          </Fragment>
        );
      })}
    </nav>
  );
}

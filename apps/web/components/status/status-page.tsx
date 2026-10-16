import Link from "next/link";

import { routes } from "@/lib/route";
import { STATUS_CONTENT, type StatusCode } from "@/lib/status";

type Props = {
  code: StatusCode;
  /** Primary actions; defaults to a link home. */
  actions?: React.ReactNode;
  /** Extra content under the actions, e.g. a search field or error reference. */
  children?: React.ReactNode;
  /** The "Where to next" links; off when the rest of the site is unavailable. */
  showLinks?: boolean;
};

const helpfulLinks = [
  {
    title: "Learn & Do",
    description: "Skills, laboratory practicals and knowledge sharing.",
    href: routes.learn.index,
  },
  {
    title: "Events",
    description: "Workshops, sessions and what’s coming up.",
    href: routes.community.events.index,
  },
  {
    title: "About SRIS",
    description: "Who we are and what the society does.",
    href: routes.about.index,
  },
  {
    title: "Contact us",
    description: "Get in touch if something isn’t working.",
    href: routes.about.contact,
  },
];

/**
 * Shared layout for every HTTP status page: the navy page hero carrying the
 * code and explanation, then a row of places to go next. Server-safe, so the
 * client error boundary can render it too.
 */
export function StatusPage({
  code,
  actions,
  children,
  showLinks = true,
}: Props) {
  const content = STATUS_CONTENT[code];

  return (
    <main className="statusPage">
      <section className="pageHero">
        <div className="shell">
          <div className="statusGrid">
            <p className="statusCode" aria-hidden="true">
              {code}
            </p>

            <div className="statusCopy">
              <p className="eyebrow blue">
                Error {code} · {content.reason}
              </p>

              <h1>{content.heading}</h1>

              <p className="lead">{content.message}</p>

              <div className="statusActions">
                {actions ?? (
                  <Link href={routes.home} className="button">
                    <span>Back to homepage</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>

              {children}
            </div>
          </div>
        </div>
      </section>

      {showLinks && (
        <section className="section">
          <div className="shell">
            <p className="eyebrow blue">Where to next</p>

            <div className="statusLinks">
              {helpfulLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <b>{link.title}</b>
                  <span>{link.description}</span>
                  <i aria-hidden="true">→</i>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

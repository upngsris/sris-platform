"use client";

import type { SVGProps } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navigation } from "@/data/navigation";
import { routes } from "@/lib/route";

/**
 * A link is current on its own page and, for section pages with detail
 * routes beneath them, on those too. /about is the section root, so it only
 * matches exactly or every About page would light it up.
 */
function isCurrent(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  return href !== routes.about.index && pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="lpi lpi-header">
      <div className="lpi-top">
        <div className="lpi-container lpi-top-inner">
          <p>
            University of Papua New Guinea · School of Natural &amp; Physical
            Sciences
          </p>

          <ul>
            <li>
              <Link href={routes.search}>Search</Link>
            </li>

            <li>
              <Link href={routes.about.index}>About the society</Link>
            </li>

            <li>
              <Link href={routes.about.contact}>Contact</Link>
            </li>

            <li className="alt">
              <Link href={routes.learn.skills}>Skills Track</Link>
            </li>

            <li className="alt">
              <Link href={routes.community.events.index}>Events</Link>
            </li>

            <li className="altred">
              <Link href={routes.community.membership}>Join SRIS</Link>
            </li>
          </ul>
        </div>
      </div>

      <nav className="lpi-bar" aria-label="Primary navigation">
        <div className="lpi-container lpi-bar-inner">
          <Link
            href={routes.home}
            className="lpi-logo"
            aria-label="UPNG SRIS Home"
          >
            <Image
              src="/images/brand/sris-lockup.png"
              alt="Science, Research & Innovation Society"
              width={176}
              height={70}
              priority
              quality={70}
            />
          </Link>

          <ul className="lpi-menu">
            {navigation.map((group) => (
              <li key={group.name}>
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-current={
                    group.links.some((link) => isCurrent(pathname, link.href))
                      ? "true"
                      : undefined
                  }
                >
                  {group.name}

                  <span aria-hidden="true">▾</span>
                </button>

                <div className="lpi-drop">
                  <div className="lpi-container lpi-drop-inner">
                    <div className="lpi-drop-intro">
                      <GroupIcon name={group.name} aria-hidden="true" />

                      <p>{group.intro}</p>
                    </div>

                    {group.links.map((link) => (
                      <Link
                        href={link.href}
                        key={link.href}
                        aria-current={
                          isCurrent(pathname, link.href) ? "page" : undefined
                        }
                        // The header persists across navigations, so a focused
                        // link would hold the menu open on the next page.
                        onClick={(event) => event.currentTarget.blur()}
                      >
                        <b>{link.title}</b>

                        <span>{link.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            className="lpi-toggle"
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? (
              <CloseIcon aria-hidden="true" />
            ) : (
              <MenuIcon aria-hidden="true" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div id="mobile-navigation" className="lpi-mobile">
            {navigation.map((group) => {
              const isExpanded = expanded === group.name;

              return (
                <div key={group.name} className="lpi-mobile-group">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-current={
                      group.links.some((link) => isCurrent(pathname, link.href))
                        ? "true"
                        : undefined
                    }
                    onClick={() => setExpanded(isExpanded ? null : group.name)}
                  >
                    <span className="lpi-mobile-label">
                      <GroupIcon name={group.name} aria-hidden="true" />

                      {group.name}
                    </span>

                    <span className="lpi-mobile-chevron" aria-hidden="true">
                      <ChevronIcon data-open={isExpanded} />
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="lpi-mobile-links">
                      {group.links.map((link) => (
                        <Link
                          href={link.href}
                          key={link.href}
                          aria-current={
                            isCurrent(pathname, link.href) ? "page" : undefined
                          }
                          onClick={() => setMobileOpen(false)}
                        >
                          {link.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="lpi-mobile-extra">
              <Link href={routes.search} onClick={() => setMobileOpen(false)}>
                Search
              </Link>

              <Link
                href={routes.about.contact}
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </Link>

              <Link
                href={routes.learn.skills}
                onClick={() => setMobileOpen(false)}
              >
                Skills Track
              </Link>

              <Link
                href={routes.community.events.index}
                onClick={() => setMobileOpen(false)}
              >
                Events
              </Link>

              <Link
                className="lpi-mobile-join"
                href={routes.community.membership}
                onClick={() => setMobileOpen(false)}
              >
                Join SRIS
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      {...props}
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      {...props}
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const groupIcons: Record<string, string[]> = {
  // person with an info badge
  About: [
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1",
  ],
  // compass
  Explore: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
    "m15.5 8.5-2 5-5 2 2-5 5-2Z",
  ],
  // flask
  "Learn & Do": [
    "M9 3h6",
    "M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3",
    "M7.5 15h9",
  ],
  // connected people
  Community: [
    "M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M6.5 20a5.5 5.5 0 0 1 11 0",
    "M4 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    "M20 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  ],
};

function GroupIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: string }) {
  return (
    <svg
      className="lpi-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {(groupIcons[name] ?? []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

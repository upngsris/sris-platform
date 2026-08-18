"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navigation } from "@/data/navigation";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  return (
    <header className="header">
      <div className="topline" />
      <div className="shell nav">
        <Link href="/" className="siteIdentity" aria-label="UPNG SRIS Home">
          <Image
            src="/images/brand/sris-logo.png"
            alt="Science, Research and Innovation Society logo"
            width={52}
            height={52}
            priority
            className="siteLogo"
          />

          <div className="identityText">
            <span className="institutionName">
              University of Papua New Guinea
            </span>

            <span className="societyName desktopSocietyName">
              Science, Research and Innovation Society
            </span>

            <span className="mobileSocietyName">
              UPNG SRIS
            </span>
          </div>
        </Link>
        <nav className="desktopNav" aria-label="Primary navigation">
          {navigation.map((g) => (
            <div className="navItem" key={g.name}>
              <button type="button">
                {g.name}
                <span aria-hidden>⌄</span>
              </button>
              <div className="mega">
                <div className="shell megaGrid">
                  <div className="megaIntro">
                    <p className="eyebrow blue">{g.name}</p>
                    <h3>{g.intro}</h3>
                  </div>
                  <div className="megaLinks">
                    {g.links.map((l, i) => (
                      <Link href={l.href} key={l.title}>
                        <small>{String(i + 1).padStart(2, "0")}</small>
                        <div>
                          <b>{l.title}</b>
                          <span>{l.description}</span>
                        </div>
                        <i aria-hidden>→</i>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </nav>
        <div className="navright">
          <button type="button">Search</button>
          <Link className="button" href="/community/membership">
            Join SRIS <span>→</span>
          </Link>
        </div>
        <button
          className="menuButton"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? "CLOSE" : "MENU"}
        </button>
      </div>
      {mobileOpen && (
        <div id="mobile-navigation" className="mobilePanel">
          <div className="shell mobileInner">
            <nav aria-label="Mobile navigation">
              {navigation.map((g) => (
                <div className="mobileGroup" key={g.name}>
                  <button
                    type="button"
                    aria-expanded={expanded === g.name}
                    onClick={() =>
                      setExpanded(expanded === g.name ? null : g.name)
                    }
                  >
                    {g.name}
                    <span>{expanded === g.name ? "−" : "+"}</span>
                  </button>
                  {expanded === g.name && (
                    <div className="mobileLinks">
                      {g.links.map((l) => (
                        <Link
                          href={l.href}
                          key={l.title}
                          onClick={() => setMobileOpen(false)}
                        >
                          {l.title}
                          <span>→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <Link
              className="button mobileJoin"
              href="/community/membership"
              onClick={() => setMobileOpen(false)}
            >
              Become a member <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect } from "react";

import "./globals.css";
import "./lpi.css";
import "./states.css";

import { STATUS_CONTENT, statusTitle } from "@/lib/status";

/**
 * 500 for failures in the root layout itself. It replaces the whole document,
 * so it carries its own <html> and <body>, has no site header or footer, and
 * uses plain anchors: client navigation can't be trusted when the layout is
 * what broke.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const content = STATUS_CONTENT[500];

  return (
    <html lang="en">
      <body>
        <title>{statusTitle(500)}</title>

        <main className="statusPage statusStandalone">
          <section className="pageHero">
            <div className="shell">
              <div className="statusGrid">
                <p className="statusCode" aria-hidden="true">
                  500
                </p>

                <div className="statusCopy">
                  <p className="eyebrow blue">Error 500 · {content.reason}</p>

                  <h1>{content.heading}</h1>

                  <p className="lead">{content.message}</p>

                  <div className="statusActions">
                    <button
                      type="button"
                      className="button"
                      onClick={() => retry()}
                    >
                      <span>Try again</span>
                      <span aria-hidden="true">↻</span>
                    </button>

                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href="/" className="button buttonGhost">
                      <span>Back to homepage</span>
                    </a>
                  </div>

                  {error.digest && (
                    <p className="statusReference">
                      If you contact us about this, quote reference{" "}
                      <code>{error.digest}</code>.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}

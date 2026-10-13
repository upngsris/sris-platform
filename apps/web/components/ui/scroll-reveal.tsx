"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveals elements marked with `data-reveal` as they scroll into view.
 *
 * Elements are hidden by CSS before paint, but only when scripting is
 * enabled and the visitor has not asked for reduced motion (see the
 * SCROLL REVEAL block in globals.css). That keeps the page fully readable
 * without JavaScript.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      root.classList.add("reveal-off");

      targets.forEach((target) => {
        target.classList.add("is-revealed");
      });

      return;
    }

    root.classList.remove("reveal-off");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-revealed");

          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.08,
      },
    );

    targets.forEach((target) => {
      // Anything already on screen at load reveals immediately.
      const box = target.getBoundingClientRect();

      if (box.top < window.innerHeight * 0.92) {
        target.classList.add("is-revealed");

        return;
      }

      observer.observe(target);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

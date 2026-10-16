import type { CSSProperties, SVGProps } from "react";
import Link from "next/link";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { navigation } from "@/data/navigation";
import { routes } from "@/lib/route";
import { socials } from "@/lib/socials";

type SocialLink = {
  label: string;
  href: string;
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  /* Official brand colour, shown on the icon on hover. */
  brand: string;
};

const socialLinks: SocialLink[] = [
  {
    label: "Facebook",
    href: socials.facebook,
    icon: FacebookIcon,
    brand: "#1877F2",
  },
  {
    label: "Instagram",
    href: socials.instagram,
    icon: InstagramIcon,
    brand: "#E4405F",
  },
  {
    label: "LinkedIn",
    href: socials.linkedin,
    icon: LinkedInIcon,
    brand: "#0A66C2",
  },
  {
    label: "YouTube",
    href: socials.youtube,
    icon: YouTubeIcon,
    brand: "#FF0000",
  },
  {
    label: "TikTok",
    href: socials.tiktok,
    icon: TikTokIcon,
    brand: "#000000",
  },
  {
    label: "X",
    href: socials.x,
    icon: XIcon,
    brand: "#000000",
  },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell footerMain">
        <div className="footerBrand">
          <p className="eyebrow">
            University of Papua New Guinea
          </p>

          <h2>
            <BrandLockup variant="reversed" />
          </h2>

          <p className="body">
            A student-led platform for practical learning,
            research, collaboration and scientific exploration
            beyond the classroom.
          </p>

          <Link
            href={routes.community.membership}
            className="textlink"
          >
            <span>Become a member</span>
            <i aria-hidden="true">→</i>
          </Link>
        </div>

        <div className="footerNavigation">
          {navigation.map((group) => (
            <div
              className="footerGroup"
              key={group.name}
            >
              <p className="footerGroupTitle">
                {group.name}
              </p>

              <nav
                aria-label={`${group.name} footer navigation`}
              >
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                  >
                    {link.title}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="shell footerSocialRow">
        <div>
          <p className="footerSocialLabel">
            Follow SRIS
          </p>

          <p className="footerSocialIntro">
            Connect with SRIS across our social platforms.
          </p>
        </div>

        <div
          className="footerSocialLinks"
          aria-label="SRIS social media"
        >
          {socialLinks.map((social) => {
            const Icon = social.icon;

            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`SRIS on ${social.label}`}
                data-social={social.label.toLowerCase()}
                style={
                  { "--brand": social.brand } as CSSProperties
                }
              >
                <span
                  className="footerSocialIcon"
                  aria-hidden="true"
                >
                  <Icon />
                </span>

                <span className="footerSocialName">
                  {social.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="shell footerBottom">
        <p>
          © {currentYear} Science, Research and Innovation
          Society.
        </p>

        <div className="footerLegal">
          <Link href={routes.privacy}>
            Privacy
          </Link>

          <span aria-hidden="true">•</span>

          <span>
            University of Papua New Guinea
          </span>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   SOCIAL ICONS
   ========================================================= */

function FacebookIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a23 23 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1v2H7.8v3h2.7v8h3.1Z" />
    </svg>
  );
}

function InstagramIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function LinkedInIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M6.5 8.1H3.3V21h3.2V8.1ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.6c0-3.9-2.1-5.8-4.8-5.8a4.2 4.2 0 0 0-3.8 2.1V8.1H9.2V21h3.2v-6.4c0-1.7.3-3.3 2.4-3.3s2.1 1.9 2.1 3.4V21H20v-7.4Z" />
    </svg>
  );
}

function YouTubeIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M22.1 7.1a3 3 0 0 0-2.1-2.2C18.1 4.4 12 4.4 12 4.4s-6.1 0-8 .5A3 3 0 0 0 1.9 7C1.4 9 1.4 12 1.4 12s0 3.1.5 5a3 3 0 0 0 2.1 2.1c1.9.5 8 .5 8 .5s6.1 0 8-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5 .5-5s0-3.1-.5-4.9ZM9.9 15.3V8.7l5.7 3.3-5.7 3.3Z" />
    </svg>
  );
}

function TikTokIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M14.2 3h3a4.8 4.8 0 0 0 3.3 3.4v3A8.1 8.1 0 0 1 17.2 8v6.8A6.2 6.2 0 1 1 11 8.6c.4 0 .8 0 1.2.1v3.1a3.2 3.2 0 1 0 2 3V3Z" />
    </svg>
  );
}

function XIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M18.9 3H22l-6.8 7.8L23.2 21H17l-4.9-6.4L6.5 21H3.4l7.2-8.3L3 3h6.4l4.4 5.8L18.9 3Zm-1.1 16h1.7L8.5 4.9H6.7L17.8 19Z" />
    </svg>
  );
}
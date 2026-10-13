import type { SVGProps } from "react";

import { absoluteUrl } from "@/lib/seo";

type Props = {
  /** Site-relative path of the page being shared. */
  path: string;
  title: string;
  className?: string;
};

/**
 * Plain share links — no third-party scripts, nothing loads until a
 * visitor clicks.
 */
export function ShareLinks({ path, title, className }: Props) {
  const url = encodeURIComponent(absoluteUrl(path));
  const text = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      icon: FacebookIcon,
    },
    {
      label: "X",
      href: `https://x.com/intent/post?url=${url}&text=${text}`,
      icon: XIcon,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      icon: LinkedInIcon,
    },
    {
      label: "email",
      href: `mailto:?subject=${text}&body=${url}`,
      icon: MailIcon,
    },
  ];

  return (
    <ul className={className}>
      {links.map(({ label, href, icon: Icon }) => (
        <li key={label}>
          <a
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={`Share on ${label}`}
            data-network={label.toLowerCase()}
          >
            <Icon aria-hidden="true" focusable="false" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a23 23 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1v2H7.8v3h2.7v8h3.1Z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.5 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5 21H1.9l7.2-8.3L1.4 3h6.4l4.4 5.8L17.5 3Zm-1.1 16.2h1.7L6.9 4.7H5.1l11.3 14.5Z" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.5 8.1H3.3V21h3.2V8.1ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.6c0-3.9-2.1-5.8-4.8-5.8a4.2 4.2 0 0 0-3.8 2.1V8.1H9.2V21h3.2v-6.4c0-1.7.3-3.3 2.4-3.3s2.1 1.9 2.1 3.4V21H20v-7.4Z" />
    </svg>
  );
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  );
}

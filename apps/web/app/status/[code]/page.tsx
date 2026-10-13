import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusPage } from "@/components/status/status-page";

import { routes } from "@/lib/route";
import {
  ROUTED_STATUS_CODES,
  statusTitle,
  type StatusCode,
} from "@/lib/status";

/**
 * 400, 502 and 503 have no Next.js special file, so they live here and the
 * proxy (proxy.ts) rewrites to them with the matching HTTP status. Visiting
 * /status/503 directly also goes through the proxy, so it never answers 200.
 */
type PageProps = {
  params: Promise<{ code: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return ROUTED_STATUS_CODES.map((code) => ({ code: String(code) }));
}

function toCode(value: string) {
  const code = Number(value) as StatusCode;

  return (ROUTED_STATUS_CODES as readonly number[]).includes(code)
    ? code
    : null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const code = toCode((await params).code);

  return {
    title: code ? statusTitle(code) : undefined,
    robots: { index: false },
  };
}

export default async function StatusCodePage({ params }: PageProps) {
  const code = toCode((await params).code);

  if (!code) {
    notFound();
  }

  // Maintenance: no links into a site that is offline.
  if (code === 503) {
    return (
      <StatusPage
        code={503}
        showLinks={false}
        actions={
          <Link href={routes.home} className="button">
            <span>Try again</span>
            <span aria-hidden="true">↻</span>
          </Link>
        }
      />
    );
  }

  return (
    <StatusPage
      code={code}
      actions={
        <>
          <Link href={routes.home} className="button">
            <span>Back to homepage</span>
            <span aria-hidden="true">→</span>
          </Link>

          <Link href={routes.about.contact} className="button buttonGhost">
            <span>Contact SRIS</span>
          </Link>
        </>
      }
    />
  );
}

import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { SANITY_CACHE_TAG } from "@/sanity/lib/fetch";

/**
 * Sanity publish webhook.
 *
 * Sanity POSTs here whenever a document is created, updated or deleted. The
 * request is signed with SANITY_REVALIDATE_SECRET; anything unsigned or
 * wrongly signed is rejected before any cache is touched.
 *
 * Setup (Sanity dashboard → API → Webhooks) is in docs/deployment.md.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "SANITY_REVALIDATE_SECRET is not set." },
      { status: 500 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<{
      _type?: string;
    }>(request, secret);

    if (!isValidSignature) {
      return NextResponse.json(
        { ok: false, message: "Invalid signature." },
        { status: 401 },
      );
    }

    // `expire: 0` drops the cached data immediately. updateTag would do the
    // same but is only available inside Server Actions, not route handlers.
    revalidateTag(SANITY_CACHE_TAG, { expire: 0 });

    // The prerendered HTML for static pages is cached separately from the
    // data behind it, so the whole route tree is refreshed too.
    revalidatePath("/", "layout");

    return NextResponse.json({
      ok: true,
      revalidated: SANITY_CACHE_TAG,
      type: body?._type ?? null,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Could not process the webhook." },
      { status: 400 },
    );
  }
}

/** A GET tells a person who opens the URL in a browser what it is. */
export function GET() {
  return NextResponse.json(
    { ok: false, message: "This endpoint accepts signed POST requests from Sanity." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

/**
 * Small in-memory rate limiter for the contact form.
 *
 * It is per server instance, so on a serverless host each warm instance keeps
 * its own count. That is enough to stop a single client hammering the form;
 * for a hard guarantee across instances put a platform rule in front (for
 * example Vercel WAF or Cloudflare) or move the counter to a shared store.
 */
const hits = new Map<string, number[]>();

export function rateLimited(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
) {
  const now = Date.now();

  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);

    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [entry, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) {
        hits.delete(entry);
      }
    }
  }

  return false;
}

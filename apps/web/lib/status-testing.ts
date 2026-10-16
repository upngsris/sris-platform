/**
 * The /status-test/* routes deliberately trigger each error page. They are on
 * in development and off in production unless ENABLE_STATUS_TEST_ROUTES=true,
 * so a live site never exposes URLs that throw on demand.
 *
 * Kept free of server-only imports because proxy.ts reads it too.
 */
export function statusTestRoutesEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_STATUS_TEST_ROUTES === "true"
  );
}

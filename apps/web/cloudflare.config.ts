import { bindings, defineConfig, defineWorker } from "cf/config";

/*
 * One config, two Workers. `--mode staging` deploys staging; the default
 * (production) mode deploys the live site.
 */
const targets = {
  staging: {
    name: "sris-staging",
    domains: ["staging.upngsris.com"],
    kvId: "ff91044f28184903a088c581305ebd80" as string | undefined,
  },
  production: {
    name: "sris-production",
    domains: ["upngsris.com"],
    kvId: "bc5d41c7ee3246539f09c97b692b7dd2" as string | undefined,
  },
};

export default defineConfig({
  worker: defineWorker(({ mode }) => {
    const target = mode === "staging" ? targets.staging : targets.production;

    return {
      name: target.name,
      entrypoint: "vinext/server/fetch-handler",
      compatibilityDate: "2026-09-28",
      compatibilityFlags: ["nodejs_compat"],
      workersDev: false,
      previewUrls: false,
      domains: target.domains,
      assets: {
        htmlHandling: "none",
        notFoundHandling: "none",
        runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
      },
      env: {
        ASSETS: bindings.assets(),
        VINEXT_KV_CACHE: bindings.kv(target.kvId ? { id: target.kvId } : {}),
      },
    };
  }),
});
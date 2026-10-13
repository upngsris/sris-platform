import type { MetadataRoute } from "next";

/*
 * Carries the large emblem sizes for Android home screens and install
 * prompts. The browser-tab and Apple icons come from the icon*.png,
 * apple-icon.png and favicon.ico files beside this one.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UPNG SRIS | Science, Research & Innovation Society",
    short_name: "UPNG SRIS",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#18789e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

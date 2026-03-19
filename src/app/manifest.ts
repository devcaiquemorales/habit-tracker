import type { MetadataRoute } from "next";

/**
 * Web app manifest — Next serves this at `/manifest.webmanifest` and injects `<link rel="manifest">`.
 * Keeps install prompts, standalone display, and icon list in one typed module.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habit Tracker — Visual habits & heatmaps",
    short_name: "Habit Tracker",
    description:
      "Build consistency with daily check-ins and GitHub-style heatmaps. Track habits offline-friendly; install for a focused, app-like experience.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#16141f",
    theme_color: "#16141f",
    categories: ["lifestyle", "health", "productivity"],
    icons: [
      {
        src: "/pwa-icons/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icons/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icons/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

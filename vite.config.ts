import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "StaleWhileRevalidate",
            options: {cacheName: "google-fonts-stylesheets"},
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst", // Font files rarely change
            options: {
              cacheName: "google-fonts-webfonts",
              cacheableResponse: {statuses: [0, 200]},
            },
          },
        ],
      },
      includeAssets: ["favicon.png", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png"],
      manifest: {
        name: "FlipFlop App",
        short_name: "FlipFlop",
        description: "Offline-first flashcard study application",
        theme_color: "#4F46E5",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-180x180.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});

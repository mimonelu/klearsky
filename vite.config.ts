import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"
// Rollup Visualizer
import { visualizer } from "rollup-plugin-visualizer"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      includeAssets: [
        "robots.txt"
      ],
      manifest: {
        id: "klearsky",
        name: "Klearsky",
        short_name: "Klearsky",
        scope: "/",
        start_url: "/",
        categories: [
          "entertainment",
          "news",
          "social networking"
        ],
        description: "The web client for Bluesky.",
        display: "minimal-ui",
        display_override: [ "minimal-ui", "standalone" ],
        background_color: "#808080",
        icons: [
          {
            src: "favicon.svg",
            sizes: "48x48",
            type: "image/svg+xml"
          }, {
            src: "favicon.svg",
            sizes: "72x72",
            type: "image/svg+xml"
          }, {
            src: "favicon.svg",
            sizes: "96x96",
            type: "image/svg+xml"
          }, {
            src: "favicon.svg",
            sizes: "144x144",
            type: "image/svg+xml"
          }, {
            src: "favicon.svg",
            sizes: "168x168",
            type: "image/svg+xml"
          }, {
            src: "favicon.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          }
        ]
      },
      registerType: "autoUpdate",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  // Cloudflare 向け環境変数
  base: process.env.VUE_APP_BASE || "/klearsky",

  build: {
    // for `TypeError: xx is not a constructor`
    // SEE: stackoverflow.com/a/73470097
    commonjsOptions: { include: [] },

    outDir: "docs",

    // Rollup Visualizer
    rollupOptions: {
      plugins: [
        visualizer({
          filename: "coproduct/stats.html",
        }),
      ],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // NOTICE: 実体のある CSS を読み込まないこと
        additionalData: "@import '@/scss/_variables.scss';",
      },
    },
    postcss: {
      plugins: [
        require("autoprefixer"),
      ],
    },
  },

  // for `TypeError: xx is not a constructor`
  // SEE: stackoverflow.com/a/73470097
  optimizeDeps: {
    disabled: false,
  },
})

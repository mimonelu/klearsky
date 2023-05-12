import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
// Rollup Visualizer
import { visualizer } from "rollup-plugin-visualizer"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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

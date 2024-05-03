import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// Minify HTML
import { createHtmlPlugin } from "vite-plugin-html"

// Rollup Visualizer
import { visualizer } from "rollup-plugin-visualizer"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    // Minify HTML
    createHtmlPlugin({
      minify: true,
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
    // commonjsOptions: { include: [] },

    chunkSizeWarningLimit: 600,

    outDir: "docs",

    rollupOptions: {
      output: {
        manualChunks (id: string) {
          if (id.includes("@atproto_api"))
            return "atproto-api"
          if (id.includes("node_modules"))
            return "vendor"
        },
      },

      // Rollup Visualizer
      plugins: [
        visualizer({
          filename: "coproduct/stats.html",
        }),
      ],
    },
  },

  // ビルドプロダクションでは開発用のオブジェクトをドロップ
  esbuild: {
    drop: process.env.NODE_ENV === "production"
      ? ["console", "debugger"]
      : [],
  },

  css: {
    preprocessorOptions: {
      scss: {
        // NOTICE: 実体のある CSS を読み込まないこと
        additionalData: "@use 'sass:math'; @import '@/scss/_variables.scss';",
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
  /*
  optimizeDeps: {
    disabled: false,
  },
  */
})

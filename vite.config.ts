import { fileURLToPath, URL } from "node:url"
import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"

// Minify HTML
import { createHtmlPlugin } from "vite-plugin-html"

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
  base: process.env.VITE_BASE_PATH || "/",

  build: {
    chunkSizeWarningLimit: 1000,

    outDir: "docs",

    rollupOptions: {
      output: {
        manualChunks (id: string) {
          // Vue関連を分離
          if (id.includes("vue")) {
            return "vue"
          }
          // その他のnode_modules
          if (id.includes("node_modules")) {
            return "vendor"
          }
        },
      },
      treeshake: {
        moduleSideEffects: (id) => {
          // Logger は除外
          if (id.includes("composables/logger")) {
            return true
          }

          return false
        },
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
  },

  // ビルドプロダクションでは開発用のオブジェクトをドロップ
  esbuild: {
    drop: process.env.NODE_ENV === "production"
      ? ["console", "debugger"]
      : [],
  },

  // Android Studio から `10.0.2.2:5173` で localhost にアクセスするために必要
  server: {
    host: "0.0.0.0",
    port: 5173,
  },

  css: {
    preprocessorOptions: {
      scss: {
        // NOTICE: 実体のある CSS を読み込まないこと
        additionalData: "@use 'sass:map'; @use 'sass:math'; @import '@/scss/_variables.scss';",

        // 下記の警告を抑制
        // * `Deprecation Warning [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.`
        // * `Deprecation Warning [legacy-js-api]: The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0.`
        // * `Deprecation Warning [mixed-decls]: Sass's behavior for declarations that appear after nested rules will be changing to match the behavior specified by CSS in an upcoming version. To keep the existing behavior, move the declaration above the nested rule. To opt into the new behavior, wrap the declaration in \`& {}\`.`
        // SEE: https://sass-lang.com/documentation/js-api/interfaces/deprecations/
        silenceDeprecations: ["import", "legacy-js-api", "mixed-decls"],
      },
    },
  },
})

import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "/klear-sky",
  build: {
    // for `TypeError: xx is not a constructor`
    // SEE: stackoverflow.com/a/73470097
    commonjsOptions: { include: [] },

    outDir: "docs",
  },
  css: {
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

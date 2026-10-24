import js from "@eslint/js"
import pluginVue from "eslint-plugin-vue"
import { withVueTs, vueTsConfigs } from "@vue/eslint-config-typescript"
import globals from "globals"

export default withVueTs(
  {
    ignores: ["docs/**", "dist/**", "dist-ssr/**", "coverage/**"],
  },
  js.configs.recommended,
  pluginVue.configs["flat/essential"],
  vueTsConfigs.base,
  vueTsConfigs.eslintRecommended,
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { caughtErrors: "none" }],
      "vue/multi-word-component-names": "off",
    },
  },
)

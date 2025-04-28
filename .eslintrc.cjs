module.exports = {
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  root: true,
  rules: {
    "vue/multi-word-component-names": "off",
  },
}

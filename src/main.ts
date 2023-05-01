import "@/scss/main.scss"

// Firefox における Intl.Segmenter 関連のエラーへの暫定対応
// TODO: 折を見て削除すること
import "@/composables/vendor/intl-segmenter-polyfill.min.js"

import { createApp } from "vue"
import App from "@/App.vue"
import i18n from "@/plugins/i18n"
import router from "@/router"

// Messages - Json
import en from "@/consts/messages/en.json"
import ja from "@/consts/messages/ja.json"

const app = createApp(App)
app.use(router)

// Messages - Setup
const messages = { en, ja }
app.use(i18n, messages)

app.mount("#app")

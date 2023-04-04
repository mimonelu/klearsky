import "@/scss/main.scss"

// Firefox における Intl.Segmenter 関連のエラーへの暫定対応
// TODO: 折を見て削除すること
import "@/composables/vendor/intl-segmenter-polyfill.min.js"

import { createApp } from "vue"
import App from "@/App.vue"
import messages from "@/consts/messages.json"
import i18n from "@/plugins/i18n"
import router from "@/router"

const app = createApp(App)
app.use(router)
app.use(i18n, messages)
app.mount("#app")

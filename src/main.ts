import "@/scss/main.scss"

import { createApp } from "vue"
import PortalVue from "portal-vue"
import App from "@/App.vue"
import i18n from "@/plugins/i18n"
import router from "@/router"

// 翻訳
import translationEn from "@/consts/translations/en.json"
import translationJa from "@/consts/translations/ja.json"

const app = createApp(App)
app.use(router)
app.use(PortalVue)

// 翻訳
const translations = {
  en: translationEn,
  ja: translationJa,
}
app.use(i18n, translations)

app.mount("#app")

// Sass
import "@/scss/main.scss"

import { createApp } from "vue"
import router from "@/router"
import App from "@/App.vue"

// ポータル
import PortalVue from "portal-vue"

// 翻訳
import i18n from "@/plugins/i18n"
import translationEn from "@/translations/en.json"
import translationJa from "@/translations/ja.json"

// 交差オブザーバー
import IntersectionObserverDirective from "@/plugins/intersection-observer-directive"

const app = createApp(App)
app.use(router)

// ポータル
app.use(PortalVue)

// 翻訳
app.use(i18n, {
  en: translationEn,
  ja: translationJa,
})

// 交差オブザーバー
app.directive("intersection-observer", IntersectionObserverDirective)

app.mount("#app")

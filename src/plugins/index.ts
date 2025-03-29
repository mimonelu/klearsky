import { type App } from "vue"
import router from "@/router"
import PortalVue from "portal-vue"
import i18n from "@/plugins/i18n"
import translationEn from "@/translations/en"
import translationFr from "@/translations/fr"
import translationJa from "@/translations/ja"
import IntersectionObserverDirective from "@/plugins/intersection-observer-directive"

export function registerPlugins (app: App) {
  // ルーター
  app.use(router)

  // ポータル
  app.use(PortalVue)

  // 翻訳
  app.use(i18n, {
    en: translationEn(),
    fr: translationFr(),
    ja: translationJa(),
  })

  // 交差オブザーバー
  app.directive("intersection-observer", IntersectionObserverDirective)
}

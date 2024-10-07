import type { App } from "vue"
import Util from "@/composables/util"

interface TITranslationMap {
  [k: string]: {
    [k: string]: string
  }
}

// 翻訳
export default {
  install(app: App, translationMap: TITranslationMap) {
    let currentLanguage = Util.getUserLanguage() ?? "en"

    app.provide("$setCurrentLanguage", (newLanguage: string) => {
      currentLanguage = newLanguage
    })

    app.provide("$getCurrentLanguage", (): string => {
      return currentLanguage
    })

    function $t (key: string): string {
      return translationMap[currentLanguage]?.[key] ?? translationMap.en?.[key] ?? key
    }
    app.config.globalProperties.$t = $t
    app.provide("$t", $t)
  },
}

import type { App } from "vue"
import Util from "@/composables/util"

type TTTranslations = {
  [k: string]: {
    [k: string]: string
  }
}

export default {
  install(app: App, translations: TTTranslations) {
    let currentLanguage = Util.getUserLanguage()

    const $setCurrentLanguage = (newLanguage: string) => {
      currentLanguage = newLanguage
    }
    app.provide("$setCurrentLanguage", $setCurrentLanguage)

    const $getCurrentLanguage = (): string => currentLanguage
    app.provide("$getCurrentLanguage", $getCurrentLanguage)

    const $t = (key: string): string => {
      const translation = translations[currentLanguage] ?? translations.en
      return translation[key] ?? translations.en[key] ?? key
    }
    app.config.globalProperties.$t = $t
    app.provide("$t", $t)
  },
}

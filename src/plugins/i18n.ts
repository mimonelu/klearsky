import type { App } from "vue"
import Util from "@/composables/util"

declare const window: {
  navigator: any
}

type Messages = {
  [k: string]: {
    [k: string]: string
  }
}

export default {
  install(app: App, messages: Messages) {
    let currentLanguage = Util.getUserLanguage()

    const $setI18n = (newLanguage: string) => {
      currentLanguage = newLanguage
    }
    app.provide("$setI18n", $setI18n)

    const $getI18n = (): string => currentLanguage
    app.provide("$getI18n", $getI18n)

    const $t = (key: string): string => {
      const message = messages[currentLanguage] ?? messages.en
      return message[key] ?? messages.en[key] ?? key
    }
    app.config.globalProperties.$t = $t
    app.provide("$t", $t)
  },
}

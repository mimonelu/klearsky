import type { App } from "vue"

declare const window: {
  navigator: any;
}

type Messages = {
  [k: string]: {
    [k: string]: string;
  };
}

export default {
  install (app: App, messages: Messages) {
    const $t = (key: string): string => {
      const language = window.navigator.language
      const message = messages[language] ?? messages.en
      return message[key] ?? messages.en[key] ?? key
    }
    app.config.globalProperties.$t = $t
    app.provide("$t", $t)
  }
}

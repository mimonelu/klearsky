import type { App } from "vue"

type Messages = {
  [key: string]: {
    [key: string]: string;
  };
}

declare const window: {
  navigator: any;
}

export default {
  install (app: App, messages: Messages) {
    app.config.globalProperties.$t = (key: string): string => {
      const language = window.navigator.language
      const message = messages[language] ?? messages.en
      return message[key] ?? messages.en[key] ?? ""
    }
  }
}

import "@/scss/main.scss"
import { createApp } from "vue"
import App from "@/App.vue"
import messages from "@/consts/messages.json"
import i18n from "@/plugins/i18n"
import router from "@/router"

// Firefox における Intl.Segmenter 関連のエラーへの暫定対応
// TODO: ライブラリがアップデートされ次第必ず削除すること
if ((Intl as any).Segmenter == null)
  (Intl as any).Segmenter = class {
    segment (text: string) {
      return text.split("")
    }
  }

const app = createApp(App)
app.use(router)
app.use(i18n, messages)
app.mount("#app")

// Sass
import "@/scss/main.scss"

// Logger
import "@/composables/logger"

import { createApp } from "vue"
import App from "@/App.vue"
import { registerPlugins } from "@/plugins"

const app = createApp(App)

// プラグインの登録
registerPlugins(app)

// アプリケーションのマウント
app.mount("#app")

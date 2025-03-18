// Sass
import "@/scss/main.scss"

import { createApp } from "vue"
import App from "@/App.vue"
import { registerPlugins } from "@/plugins"

const app = createApp(App)

// プラグインの登録
registerPlugins(app)

// アプリケーションのマウント
app.mount("#app")

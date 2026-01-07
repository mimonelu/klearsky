import "@/scss/main.scss"

import "@/composables/util/polyfills"
import "@/composables/logger"
import { createApp } from "vue"
import App from "@/App.vue"
import { registerPlugins } from "@/plugins"

const app = createApp(App)
registerPlugins(app)
app.mount("#app")

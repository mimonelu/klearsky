import "@/scss/main.scss"

import { createApp } from "vue"
import PortalVue from "portal-vue"
import App from "@/App.vue"
import i18n from "@/plugins/i18n"
import router from "@/router"

// Messages - Json
import en from "@/consts/messages/en.json"
import ja from "@/consts/messages/ja.json"

const app = createApp(App)
app.use(router)
app.use(PortalVue)

// Messages - Setup
const messages = { en, ja }
app.use(i18n, messages)

app.mount("#app")

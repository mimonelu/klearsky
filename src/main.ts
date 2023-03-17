import "@/scss/main.scss"
import { createApp } from "vue"
import App from "@/App.vue"
import messages from "@/consts/messages.json"
import i18n from "@/plugins/i18n"
import router from "@/router"

const app = createApp(App)
app.use(router)
app.use(i18n, messages)
app.mount("#app")

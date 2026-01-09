import { inject, provide, ref } from "vue"
import { useRouter } from "vue-router"
import { state } from "@/composables/main-state"
import { useMainViewNavigation } from "./useMainViewNavigation"
import { useMainViewSettings } from "./useMainViewSettings"
import { useMainViewAuth } from "./useMainViewAuth"
import { registerMainViewLifecycle } from "./useMainViewLifecycle"

export function useMainView () {
  const router = useRouter()
  const $t = inject("$t") as (key: string) => string
  state.$setCurrentLanguage = inject("$setCurrentLanguage") as Function
  state.$getCurrentLanguage = inject("$getCurrentLanguage") as Function

  const loginPopup = ref(null)
  const dropFiles = ref(null)

  provide("state", state)

  const navigation = useMainViewNavigation(router, $t)
  state.updatePageTitle = navigation.updatePageTitle

  const settings = useMainViewSettings()
  const auth = useMainViewAuth({
    router,
    $t,
    loginPopup,
    moveToDefaultHome: navigation.moveToDefaultHome,
    processPage: navigation.processPage,
    changeSetting: settings.changeSetting,
  })

  const removeRouteGuards = navigation.setupRouteGuards()

  registerMainViewLifecycle({
    router,
    autoLogin: auth.autoLogin,
    clearUpdateJwtInterval: auth.clearUpdateJwtInterval,
    removeRouteGuards,
  })

  function closeSendPostPopup (done: boolean, hidden: boolean) {
    state.closeSendPostPopup(done, hidden)
  }

  return {
    loginPopup,
    dropFiles,
    signUp: auth.signUp,
    manualLogin: auth.manualLogin,
    saveSetting: settings.saveSetting,
    changeSetting: settings.changeSetting,
    closeSendPostPopup,
  }
}

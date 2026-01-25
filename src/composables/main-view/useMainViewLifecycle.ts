import { onBeforeMount, onBeforeUnmount, onMounted, onUnmounted } from "vue"
import type { Router } from "vue-router"
import hotkeys from "hotkeys-js"
import { state } from "@/composables/main-state"
import Util from "@/composables/util"

type Options = {
  router: Router
  autoLogin: () => Promise<void>
  clearUpdateJwtInterval: () => void
  removeRouteGuards: () => void
}

export function registerMainViewLifecycle (options: Options) {
  const {
    router,
    autoLogin,
    clearUpdateJwtInterval,
    removeRouteGuards,
  } = options

  const beforeUnloadHandler = () => {
    state.myWorker?.close()
  }
  window.addEventListener("beforeunload", beforeUnloadHandler)

  onBeforeMount(() => {
    hotkeys("n", { keyup: true }, (event: any) => {
      if (event.type === "keyup" &&
        !state.repostUsersPopupDisplay &&
        !state.quoteRepostsPopupDisplay &&
        !state.likeUsersPopupDisplay &&
        !state.imagePopupProps.display &&
        !state.sendPostPopupProps.visibility &&
        !state.loginPopupAutoDisplay) {
        state.openSendPostPopup({ type: "post" })
      }
    })
  })

  onMounted(async () => {
    // URLにエラーパラメータが含まれていたらクリーニング（OAuthキャンセル時など）
    if (location.search && new URLSearchParams(location.search).has("error")) {
      history.replaceState(null, "", location.pathname + location.hash)
    }

    state.currentPath = router.currentRoute.value.path
    state.currentQuery = router.currentRoute.value.query
    state.settings = Util.loadStorage("settings") ?? {}
    state.updateAtprotoProxy(state.settings[state.atp.data.did]?.atprotoProxyAppBsky)
    state.loaderDisplay = true
    await autoLogin()
    state.loaderDisplay = false
    state.updatePageTitle()
    state.mounted = true
  })

  onBeforeUnmount(() => {
    hotkeys.unbind("n")
  })

  onUnmounted(() => {
    clearUpdateJwtInterval()
    state.clearNotificationInterval()
    state.clearTimelineInterval()
    state.endChatListTimer()
    removeRouteGuards()
    window.removeEventListener("beforeunload", beforeUnloadHandler)
  })
}

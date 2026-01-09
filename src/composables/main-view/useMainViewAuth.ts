import type { Ref } from "vue"
import type { Router } from "vue-router"
import { state } from "@/composables/main-state"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"
import { useMainViewBootstrap } from "./useMainViewBootstrap"

type Options = {
  router: Router
  $t: Function
  loginPopup: Ref<unknown>
  moveToDefaultHome: () => Promise<void>
  processPage: (pageName?: null | string) => Promise<void>
  changeSetting: () => void
}

type IntervalHandle = ReturnType<typeof setInterval>

export function useMainViewAuth (options: Options) {
  const {
    router,
    $t,
    loginPopup,
    moveToDefaultHome,
    processPage,
    changeSetting,
  } = options

  let updateJwtTimer: IntervalHandle | null = null

  const { processAfterLogin } = useMainViewBootstrap({
    router,
    moveToDefaultHome,
    processPage,
    changeSetting,
    onRefreshSession,
    setupUpdateJwtInterval,
  })

  async function signUp (
    service: string,
    email: string,
    identifier: string,
    password: string,
    authFactorToken?: string,
    inviteCode?: string
  ) {
    state.loaderDisplay = true
    const response = await state.atp.signUp(
      service,
      email,
      identifier,
      password,
      inviteCode
    )
    state.loaderDisplay = false
    if (response instanceof Error) {
      state.openErrorPopup(response, $t("getSessionError"))
      return
    }
    state.loaderDisplay = true
    await Util.wait(1000)
    state.loaderDisplay = false
    state.loginPopupDisplay = false
    await manualLogin(
      service,
      email,
      identifier,
      password,
      authFactorToken
    )
  }

  async function autoLogin () {
    if (state.atp.hasLogin()) {
      await processAfterLogin()
    } else if (state.atp.canLogin()) {
      const response = await state.atp.login(
        undefined,
        undefined,
        undefined,
        undefined,
        onRefreshSession
      )
      if (response instanceof Error) {
        const errorMessage = typeof(response.message) === "string"
          ? $t(response.message)
          : response
        state.openErrorPopup(errorMessage, "MainView/autoLogin")
        return
      }
      await processAfterLogin()
    }
  }

  async function manualLogin (
    service: string,
    _email: string,
    identifier: string,
    password: string,
    authFactorToken?: string
  ) {
    state.loaderDisplay = true
    const response = await state.atp.login(
      service,
      identifier,
      password,
      authFactorToken,
      onRefreshSession
    )
    state.loaderDisplay = false
    if (response instanceof Error) {
      if (response.message === "AuthFactorTokenRequired") {
        (loginPopup.value as any)?.setHasAuthFactorToken(true)
        return
      }
      if (!state.atp.hasLogin()) {
        state.openErrorPopup($t("getSessionError"), "MainView/manualLogin")
        return
      }
    }
    state.loginPopupDisplay = false
    state.loaderDisplay = true
    await processAfterLogin()
    state.loaderDisplay = false
  }

  function onRefreshSession () {
    state.myWorker?.setSessionCache("session", state.atp.session)
  }

  function clearUpdateJwtInterval () {
    if (updateJwtTimer != null) {
      clearInterval(updateJwtTimer)
      updateJwtTimer = null
    }
  }

  function setupUpdateJwtInterval () {
    clearUpdateJwtInterval()
    updateJwtTimer = setInterval(() => {
      state.atp.updateJwt(onRefreshSession)
    }, CONSTS.INTERVAL_OF_UPDATE_JWT)
  }

  return {
    signUp,
    autoLogin,
    manualLogin,
    clearUpdateJwtInterval,
  }
}

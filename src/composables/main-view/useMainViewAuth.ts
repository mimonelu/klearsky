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
    if (response instanceof Error) {
      state.loaderDisplay = false
      state.openErrorPopup(response, $t("getSessionError"))
      return
    }
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

  // OAuth自動ログイン試行
  async function tryOAuthAutoLogin (): Promise<boolean> {
    try {
      // 期待するDIDを渡して、そのアカウントのセッションを復元
      const targetDid = state.mySession?.did
      const oauthSession = await state.atp.initOAuth(targetDid || undefined)
      if (oauthSession != null) {
        state.mySession!.updateSession(oauthSession, "oauth", oauthSession.__service)
        return true
      }
    } catch (error) {
      $warn("tryOAuthAutoLogin", error)
      // OAuthセッション復元失敗時はエラーを通知
      state.openErrorPopup($t("oauthSessionRestoreError"), "MainView/tryOAuthAutoLogin")

      // セッションを無効化（アカウント履歴は残す）
      state.mySession?.invalidateCurrentSession()
    }
    return false
  }

  async function autoLogin () {
    const currentAuthType = state.mySession?.authType
    const hasOAuthCallback = new URLSearchParams(location.search).has("code")

    // OAuthコールバックまたはOAuthセッションの復元を試行
    if (currentAuthType === "oauth" || hasOAuthCallback) {
      const oauthLoggedIn = await tryOAuthAutoLogin()
      if (oauthLoggedIn) {
        await processAfterLogin()
        return
      }
    }

    // パスワード認証フロー
    if (state.atp.hasLogin()) {
      // ログイン済み
      await processAfterLogin()
    } else if (state.atp.canLogin()) {
      // ログイン可能
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
        // 自動ログイン失敗時はLoginPopupを表示
        state.loginPopupDisplay = true
        return
      }
      await processAfterLogin()
    } else {
      // セッションは存在するがJWTがない場合（ログアウト済み）
      const session = state.atp.data.sessions[state.atp.data.did]
      if (session && (session.active === false || !session.refreshJwt)) {
        state.openErrorPopup($t("noSessionError"), "MainView/autoLogin")

        // セッションを無効化（アカウント履歴は残す）
        state.mySession?.invalidateCurrentSession()
      }
    }
  }

  // OAuthログイン開始
  async function oauthLogin (handle: string) {
    state.loaderDisplay = true
    try {
      if (state.atp.oauthClient == null) {
        await state.atp.initOAuth()
      }
      await state.atp.oauthClient!.signIn(handle, {
        signal: new AbortController().signal,
      })
      // リダイレクトされるため、この後のコードは実行されない
    } catch (error) {
      state.loaderDisplay = false
      const errorMessage = (error as Error)?.message ?? ""
      // エラーメッセージをローカライズ
      if (errorMessage.includes("Failed to resolve identity")) {
        state.openErrorPopup($t("oauthResolveIdentityError"), "MainView/oauthLogin")
      } else {
        state.openErrorPopup(error as Error, "MainView/oauthLogin")
      }
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
    if (response instanceof Error) {
      if (response.message === "AuthFactorTokenRequired") {
        state.loaderDisplay = false
        ;(loginPopup.value as any)?.setHasAuthFactorToken(true)
        return
      }
      if (!state.atp.hasLogin()) {
        state.loaderDisplay = false
        state.openErrorPopup($t("getSessionError"), "MainView/manualLogin")
        return
      }
    }
    state.loginPopupDisplay = false
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

  async function setAccountToLoginForm (session: TTSession) {
    await (loginPopup.value as any)?.setAccountToLoginForm(session)
  }

  return {
    signUp,
    autoLogin,
    manualLogin,
    oauthLogin,
    clearUpdateJwtInterval,
    setAccountToLoginForm,
  }
}

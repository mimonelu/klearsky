import { AtpAgent, CredentialSession, type AtpPersistSessionHandler } from "@atproto/api"
import { state } from "@/composables/main-state"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

/**
 * パスワード認証用のエージェントを作成
 *
 * トークンの保持・更新は CredentialSession に一本化している
 * 更新されたトークンは persistSession 経由で MySession に保存し、他タブへ共有する
 */
export default function (
  this: TIAtpWrapper,
  service: string,
  pdsUrl?: string,
  onSessionExpired?: () => void
): boolean {
  const url = Util.safeUrl(pdsUrl ?? service)
  if (url == null) {
    $error("createAgentWithPassword", "url == null")
    return false
  }

  // 一度でもセッションを確立したか（自動ログイン時の失敗と、利用中の失効を区別するため）
  let established = false

  const persistSession: AtpPersistSessionHandler = (event, session) => {
    $log("persistSession", `event: ${event}`)
    if (session == null) {
      $warn("persistSession", "session == null")
      if (event === "expired") {
        onExpired()
      }
      return
    }

    // JWT強制削除 - ログインバージョンを設定
    (session as TTSession).__loggedinVersion = CONSTS.LOGGEDIN_VERSION

    // MySessionでセッション管理
    // ログイン（create）以外はトークン更新等によるものなので、ユーザー操作によらない更新として扱う
    state.mySession?.updateSession(session as TTSession, "password", service, {
      background: event !== "create",
    })

    // セッションの確立・更新時は他タブへ共有
    if (event === "create" || event === "update") {
      established = true
      state.myWorker?.setSessionCache("session", state.mySession?.current)
    }
  }

  // refreshJwt が失効した場合
  const onExpired = () => {
    const current = state.mySession?.current
    if (current == null) {
      return
    }

    // 他タブで更新された新しいトークンが保存されていれば、それでセッションを再開する
    // 再開に失敗した場合に再試行しないよう、先に MySession を更新しておく
    const stored: undefined | TTSession = Util.loadStorage("atp")?.sessions?.[current.did]
    if (
      stored?.accessJwt != null &&
      stored.refreshJwt != null &&
      Util.isNewerJwt(stored.refreshJwt, current.refreshJwt)
    ) {
      state.mySession?.updateSession(stored, "password", service, { background: true })
      credentialSession.resumeSession({
        active: true,
        accessJwt: stored.accessJwt,
        refreshJwt: stored.refreshJwt,
        did: stored.did,
        email: stored.email,
        emailAuthFactor: stored.emailAuthFactor,
        emailConfirmed: stored.emailConfirmed,
        handle: stored.handle,
        status: stored.status,
      })
        .catch((error) => {
          $warn("persistSession", "Failed to resume with stored session", error)
        })
      return
    }

    // 自動ログイン時の失敗は呼び出し元で処理する
    if (established) {
      onSessionExpired?.()
    }
  }

  const credentialSession = new CredentialSession(
    url,
    this.fetchWrapper.bind(this),
    persistSession
  )
  this.agent = new AtpAgent(credentialSession)
  // authType は MySession.updateSession() で設定される（persistSession 経由）
  return this.agent != null
}

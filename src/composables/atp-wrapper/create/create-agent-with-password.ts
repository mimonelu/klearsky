import { AtpAgent, CredentialSession, type AtpPersistSessionHandler } from "@atproto/api"
import { state } from "@/composables/main-state"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

export default function (
  this: TIAtpWrapper,
  service: string,
  pdsUrl?: string
): boolean {
  const url = Util.safeUrl(pdsUrl ?? service)
  if (url == null) {
    $error("createAgentWithPassword", "url == null")
    return false
  }
  const persistSession: AtpPersistSessionHandler = (event, session) => {
    $log("persistSession", `event: ${event}`)
    if (session == null) {
      $warn("persistSession", "session == null")
      return
    }

    // JWT強制削除 - ログインバージョンを設定
    (session as TTSession).__loggedinVersion = CONSTS.LOGGEDIN_VERSION

    // MySessionでセッション管理
    state.mySession?.updateSession(session as TTSession, "password", service)
  }
  const session = new CredentialSession(
    url,
    this.fetchWrapper.bind(this),
    persistSession
  )
  this.agent = new AtpAgent(session)
  // authType は MySession.updateSession() で設定される（persistSession 経由）
  return this.agent != null
}

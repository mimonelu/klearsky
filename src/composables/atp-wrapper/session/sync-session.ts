import { state } from "@/composables/main-state"
import Util from "@/composables/util"

/**
 * 他タブで更新されたセッションを反映
 *
 * パスワード認証の場合はエージェントのトークンも差し替え、
 * 使用済みの refreshJwt で更新を試みないようにする
 * 手元より古いトークンは反映しない（新しいトークンを使用済みのもので上書きしてしまうため）
 */
export default function (this: TIAtpWrapper, session: TTSession) {
  const authType = session.__authType ?? "password"

  // OAuth認証の場合はライブラリがトークンを管理するため、セッション情報のみ反映
  if (authType === "oauth") {
    state.mySession?.updateSession(session, authType, session.__service)
    return
  }

  if (Util.isNewerJwt(state.mySession?.current?.refreshJwt, session.refreshJwt)) {
    return
  }
  state.mySession?.updateSession(session, authType, session.__service)

  // エージェントのトークンを差し替え
  // 未ログイン時と更新中は差し替えない（ログイン処理・更新処理と競合するため）
  const credentialSession = this.agent?.sessionManager
  const agentSession = credentialSession?.session
  if (
    credentialSession == null ||
    agentSession == null ||
    credentialSession.refreshSessionPromise != null ||
    agentSession.did !== session.did ||
    session.accessJwt == null ||
    session.refreshJwt == null ||
    !Util.isNewerJwt(session.refreshJwt, agentSession.refreshJwt)
  ) {
    return
  }
  credentialSession.session = {
    ...agentSession,
    accessJwt: session.accessJwt,
    refreshJwt: session.refreshJwt,
  }
}

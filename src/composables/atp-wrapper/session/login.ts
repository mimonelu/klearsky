import type { AtpAgentLoginOpts, ComAtprotoServerCreateSession } from "@atproto/api"
import { state } from "@/composables/main-state"

export default async function (
  this: TIAtpWrapper,
  service?: string,
  identifier?: string,
  password?: string,
  authFactorToken?: string,
  onSessionExpired?: () => void
): Promise<Error | undefined> {
  // MySessionからセッション取得（フォールバックとして従来のthis.dataも参照）
  const session = state.mySession?.current ?? this.data.sessions[this.data.did]
  service ??= session?.__service ?? "https://bsky.social"
  if (!this.createAgentWithPassword(service, session?.__pdsUrl, onSessionExpired)) {
    return Error("noAgentError")
  }

  // 自動ログイン
  if (identifier == null || password == null) {
    if (session == null) {
      return Error("noSessionError")
    }

    // resumeSession は必ずトークンを更新するため、事前の updateJwt は不要
    const responseOfResumeSession = await this.resumeSession(session)
    if (responseOfResumeSession instanceof Error) {
      return responseOfResumeSession
    }

    // MySessionでセッション管理
    state.mySession?.updateSession(responseOfResumeSession as TTSession, "password", service)

  // 新規ログイン
  } else {
    if (this.agent == null) {
      return Error("noAgentError")
    }
    const options: AtpAgentLoginOpts = {
      identifier,
      password,
      authFactorToken,
    }
    const response: Error | ComAtprotoServerCreateSession.Response =
      await this.agent.login(options)
        .then((value) => value)
        .catch((error) => error)
    $log("login", response)
    if (response instanceof Error) {
      // 2FAエラー - トークン要求
      if ('error' in response && response.error === "AuthFactorTokenRequired") {
        return Error("AuthFactorTokenRequired")
      }

      // 通常エラー
      return Error("getSessionError")
    }

    // persistSession コールバックで MySession.updateSession が呼ばれ、自動保存される
  }
}

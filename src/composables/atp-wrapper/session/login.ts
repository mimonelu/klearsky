import type { AtpAgentLoginOpts, ComAtprotoServerCreateSession } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  service?: string,
  identifier?: string,
  password?: string,
  authFactorToken?: string,
  onRefreshSession?: () => void
): Promise<Error | undefined> {
  const session = this.data.sessions[this.data.did]
  service ??= session?.__service ?? "https://bsky.social"
  if (!this.createAgent(service, session?.__pdsUrl)) {
    return Error("noAgentError")
  }

  // 自動ログイン
  if (identifier == null || password == null) {
    if (session == null) {
      return Error("noSessionError")
    }
    const responseOfUpdateJwt = await this.updateJwt(onRefreshSession)

    // 自動ログイン時に有効なセッションがないケースはスルー
    if (responseOfUpdateJwt instanceof Error &&
        responseOfUpdateJwt.message !== "noSessionError"
    ) {
      return responseOfUpdateJwt
    }

    const responseOfResumeSession = await this.resumeSession(session)
    if (responseOfResumeSession instanceof Error) {
      return responseOfResumeSession
    }

    const responseOfResetSession = this.resetSession(responseOfResumeSession, service)
    if (responseOfResetSession instanceof Error) {
      return responseOfResetSession
    }

  // 新規ログイン
  } else {
    if (this.agent == null) {
      return Error("noAgentError")
    }
    const optinos: AtpAgentLoginOpts = {
      identifier,
      password,
      authFactorToken,
    }
    const response: Error | ComAtprotoServerCreateSession.Response =
      await this.agent.login(optinos)
        .then((value) => value)
        .catch((error) => error)
    console.log("[klearsky/login]", response)
    if (response instanceof Error) {
      // 2FAエラー - トークン要求
      if ((response as any).error === "AuthFactorTokenRequired") {
        return Error("AuthFactorTokenRequired")
      }

      // 通常エラー
      return Error("getSessionError")
    }

    // ここで persistSession が入る
  }

  Util.saveStorage("atp", this.data)
}

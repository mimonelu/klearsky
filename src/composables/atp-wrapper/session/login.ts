import type { AtpAgentLoginOpts, BskyAgent, ComAtprotoServerCreateSession } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  service?: string,
  identifier?: string,
  password?: string,
  onRefreshSession?: () => void
): Promise<undefined | Error> {
  if (!window.navigator.onLine) return Error("offlineError")

  const session = this.data.sessions[this.data.did]
  service ??= session.__service ?? "https://bsky.social"
  if (!this.createAgent(service)) return Error("noAgentError")
  if (this.agent == null) return Error("noAgentError")

  // 自動ログイン
  if (identifier == null || password == null) {
    if (session == null) return Error("noSessionError")
    const responseOfUpdateJwt = await this.updateJwt(onRefreshSession)

    // 自動ログイン時に有効なセッションがないケースはスルー
    if (responseOfUpdateJwt instanceof Error &&
        responseOfUpdateJwt.message !== "noSessionError") return responseOfUpdateJwt

    const responseOfResumeSession = await this.resumeSession(session)
    if (responseOfResumeSession instanceof Error) return responseOfResumeSession

  // 新規ログイン
  } else {
    const optinos: AtpAgentLoginOpts = {
      identifier,
      password,
    }
    const response: Error | ComAtprotoServerCreateSession.Response =
      await (this.agent as BskyAgent).login(optinos)
        .then((value: ComAtprotoServerCreateSession.Response) => value)
        .catch((error: any) => error)
    console.log("[klearsky/login]", response)
    if (response instanceof Error) return Error("getSessionError")
  }

  // ここで persistSession が入る

  Util.saveStorage("atp", this.data)
}

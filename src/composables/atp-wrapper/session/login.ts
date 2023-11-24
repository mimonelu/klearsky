import type { AtpAgentLoginOpts, BskyAgent, ComAtprotoServerCreateSession } from "@atproto/api"
import { jwtDecode } from "jwt-decode"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  service?: string,
  identifier?: string,
  password?: string
): Promise<boolean> {
  const session = this.data.sessions[this.data.did]
  service ??= session.__service ?? "https://bsky.social"
  if (!this.createAgent(service)) return false
  if (this.agent == null) return false

  // 自動ログイン
  if (identifier == null || password == null) {
    if (session == null) return false

    let refreshJwt = undefined
    let accessJwt = undefined
    try {
      refreshJwt = jwtDecode(session.refreshJwt)
      accessJwt = jwtDecode(session.accessJwt)
    } catch (error) {
      throw "jwtDecodeFailed"
    }
    if (refreshJwt.exp == null || accessJwt.exp == null) return false

    // 開発用
    const refreshDate = new Date()
    const accessDate = new Date()
    refreshDate.setTime(refreshJwt.exp * 1000)
    accessDate.setTime(accessJwt.exp * 1000)
    console.log(`[klearsky] refreshJwt expired: ${refreshDate.toLocaleString()}`)
    console.log(`[klearsky] accessJwt expired: ${accessDate.toLocaleString()}`)

    const now = Date.now() / 1000 + 60 * 5
    if (now >= refreshJwt.exp) {
      console.warn("[klearsky] refreshJwt was expired.")
      throw { error: "sessionExpired" }
    }
    if (now >= accessJwt.exp) {
      console.warn("[klearsky] accessJwt was expired.")
      await this.refreshSession()
    }
    await this.resumeSession(session).catch(() => {
      throw { error: "sessionExpired" }
    })

  // 新規ログイン
  } else {
    const optinos: AtpAgentLoginOpts = {
      identifier,
      password,
    }
    try {
      const response: ComAtprotoServerCreateSession.Response =
        await (this.agent as BskyAgent).login(optinos)
      console.log("[klearsky/login]", response)
    } catch (error) {
      console.error("[klearsky/login]", error)
      return false
    }
  }

  // ここで persistSession が入る

  Util.saveStorage("atp", this.data)
  return true
}

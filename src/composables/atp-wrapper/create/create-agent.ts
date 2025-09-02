import { AtpAgent } from "@atproto/api"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

export default function (
  this: TIAtpWrapper,
  service: string,
  pdsUrl?: string
): boolean {
  this.agent = new AtpAgent({
    service: pdsUrl ?? service,
    persistSession: (event, session) => {
      console.log("[klearsky/persistSession]", `event === ${event}`)
      if (session == null) {
        console.warn("[klearsky/persistSession]", "session == null")
        return
      }

      // JWT強制削除 - ログインバージョンを設定
      (session as TTSession).__loggedinVersion = CONSTS.LOGGEDIN_VERSION

      this.resetSession(session, service)
    },
    fetch: async (url, init) => {
      const headers = new Headers(init?.headers ?? (url as Request).headers)

      // URLから自動判定して atproto-proxy ヘッダーを付与
      const urlString = (url as URL).href ?? (url as Request).url
      if (urlString?.includes("/xrpc/app.bsky.") && this.proxies.appview) {
        headers.set("atproto-proxy", this.proxies.appview)
      } else if (urlString?.includes("/xrpc/chat.bsky.") && this.proxies.chat) {
        headers.set("atproto-proxy", this.proxies.chat)
      }

      return Util.fetchWithTimeout(url, { ...init, headers })
    },
  })
  return this.agent != null
}

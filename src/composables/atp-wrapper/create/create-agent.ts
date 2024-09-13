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
      ;(session as TTSession).__loggedinVersion = CONSTS.LOGGEDIN_VERSION

      this.resetSession(session, service)
    },
    fetch: Util.fetchWithTimeout,
  })
  return this.agent != null
}

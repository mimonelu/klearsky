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

      // セッション情報を直接設定
      this.session = session as TTSession
      this.data.did = this.session.did
    },
    fetch: Util.fetchWithTimeout,
  })
  return this.agent != null
}

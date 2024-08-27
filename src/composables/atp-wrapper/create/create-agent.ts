import { AtpAgent } from "@atproto/api"

export default function (this: TIAtpWrapper, service: string, pdsUrl?: string): boolean {
  this.agent = new AtpAgent({
    service: pdsUrl ?? service,
    persistSession: (event, session) => {
      console.log("[klearsky/persistSession]", `event === ${event}`)
      if (session == null) {
        console.warn("[klearsky/persistSession]", "session == null")
        return
      }

      // JWT強制削除 - 最終ログイン日時を設定
      ;(session as TTSession).__lastLoggedinAt = new Date().toISOString()

      this.resetSession(session, service)
    },
  })
  return this.agent != null
}

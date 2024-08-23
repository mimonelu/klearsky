import type { AtpSessionData, AtpSessionEvent } from "@atproto/api"
import { AtpAgent } from "@atproto/api"

export default function (this: TIAtpWrapper, service: string): boolean {
  this.agent = new AtpAgent({
    service,
    persistSession: (event: AtpSessionEvent, session?: AtpSessionData | TTSession) => {
      console.log("[klearsky/persistSession]", `event === ${event}`)
      if (session == null) {
        console.warn("[klearsky/persistSession]", "session == null")
        return
      }
      this.resetSession(session, service)
    },
  })
  return this.agent != null
}

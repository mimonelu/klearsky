import { BskyAgent } from "@atproto/api"
import type { AtpSessionData, AtpSessionEvent } from "@atproto/api"

export default function (this: TIAtpWrapper, service: string): boolean {
  this.agent = new BskyAgent({
    service,
    persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
      switch (event) {
        case "create":
        case "update": {
          this.data.did = session?.did ?? ""
          this.data.sessions[this.data.did] = session as TTSession
          this.data.sessions[this.data.did].__service = service
          this.session = session
          this.caches = {}
          this.lastFetchNotificationsDate = undefined
          break
        }
        case "create-failed":
        case "expired": {
          // this.logout()
          break
        }
      }
    },
  })
  return this.agent != null
}

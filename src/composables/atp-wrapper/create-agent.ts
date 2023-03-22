import { AtpAgent } from "@atproto/api"
import type { AtpSessionData, AtpSessionEvent } from "@atproto/api"

export default function (this: TIAtpWrapper): boolean {
  this.agent = new AtpAgent({
    service: this.service as string,
    persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
      switch (event) {
        case "create": {
          this.session = session ?? null
          break
        }
        case "create-failed": {
          this.logout()
          break
        }
        case "update": {
          this.session = session ?? null
          break
        }
        case "expired": {
          this.logout()
          break
        }
      }
    },
  })
  return this.agent != null
}

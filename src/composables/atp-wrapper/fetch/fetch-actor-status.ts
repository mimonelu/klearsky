import type { AppBskyActorStatus } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<Error | AppBskyActorStatus.Record> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const rkey = Util.getRkey(`at://${did}/app.bsky.actor.status/self`)
  const response: Error | (TTCidUri & { value: AppBskyActorStatus.Record }) =
    await this.agent.app.bsky.actor.status.get({
      repo: did,
      rkey,
    })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/fetchActorStatus]", response)
  if (response instanceof Error) {
    return response
  }
  return response.value
}

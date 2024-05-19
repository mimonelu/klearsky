import type { BskyAgent } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  repo: string,
  uri: string
): Promise<Error | void> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const headers = { "atproto-proxy": "did:web:api.bsky.chat#bsky_chat" }
  const rkey = Util.getRkey(uri)
  const response = await (this.agent as BskyAgent).api.chat.bsky.actor.declaration
    .delete({
      repo,
      rkey
    }, headers)
      .then((value: void) => value)
      .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.actor.declaration.delete]", response)
  if (response instanceof Error) {
    return response
  }
  return response
}

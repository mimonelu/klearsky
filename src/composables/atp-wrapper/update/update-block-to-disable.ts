import type { AtpAgent } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<undefined | Error> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const rkey = Util.getRkey(uri)
  const query = {
    repo: this.session?.did as string,
    rkey,
  }
  const response: Error | void =
    await (this.agent as AtpAgent).app.bsky.graph.block.delete(query)
      .catch((error) => error)
  if (response instanceof Error) {
    return response
  }
}

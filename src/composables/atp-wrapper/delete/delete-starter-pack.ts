import type { BskyAgent, ComAtprotoRepoDeleteRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<undefined | Error> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: Omit<ComAtprotoRepoDeleteRecord.InputSchema, "collection"> = {
    repo: this.session?.did as string,
    rkey: Util.getRkey(uri),
  }
  const response: undefined | Error =
    await (this.agent as BskyAgent).app.bsky.graph.starterpack.delete(query)
      .catch((error: any) => error)
  console.log("[klearsky/deleteStarterPack]", response)
  if (response instanceof Error) {
    return response
  }
}

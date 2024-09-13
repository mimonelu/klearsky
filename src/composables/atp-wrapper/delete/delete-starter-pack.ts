import type { ComAtprotoRepoDeleteRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: Omit<ComAtprotoRepoDeleteRecord.InputSchema, "collection"> = {
    repo: this.session?.did as string,
    rkey: Util.getRkey(uri),
  }
  const response: Error | undefined =
    await this.agent.app.bsky.graph.starterpack.delete(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/deleteStarterPack]", response)
  if (response instanceof Error) {
    return response
  }
}

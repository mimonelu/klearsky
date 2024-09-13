import type { ComAtprotoRepoCreateRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  starterPack: TIStarterPack
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: ComAtprotoRepoCreateRecord.InputSchema = {
    ...starterPack,
    repo: this.session?.did as string,
    collection: "app.bsky.graph.starterpack",
  }
  const response: Error | ComAtprotoRepoCreateRecord.Response =
    await this.agent.com.atproto.repo.createRecord(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/createStarterPack]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data as TTCidUri
}

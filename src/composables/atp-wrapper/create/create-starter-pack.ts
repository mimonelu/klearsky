import type { AtpAgent, ComAtprotoRepoCreateRecord } from "@atproto/api"
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
  const response: ComAtprotoRepoCreateRecord.Response | Error =
    await (this.agent as AtpAgent).com.atproto.repo.createRecord(query)
      .then((value: ComAtprotoRepoCreateRecord.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/createStarterPack]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data as TTCidUri
}

import type { AtpAgent, ComAtprotoRepoDeleteRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  userUri: string,
): Promise<true | Error> {
  if (this.agent == null) return Error("noAgentError")
  if (this.session == null) return Error("noSessionError")
  const rkey = Util.getRkey(userUri)
  const query: ComAtprotoRepoDeleteRecord.InputSchema = {
    repo: this.session.did,
    collection: "app.bsky.graph.listitem",
    rkey,
  }
  const response: Error | ComAtprotoRepoDeleteRecord.Response =
    await (this.agent as AtpAgent).com.atproto.repo.deleteRecord(query)
      .then((value: ComAtprotoRepoDeleteRecord.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/deleteRecord]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
  return true
}

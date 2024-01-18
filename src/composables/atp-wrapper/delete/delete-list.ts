import type { BskyAgent, ComAtprotoRepoDeleteRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<true | Error> {
  if (this.agent == null) return Error("noAgentError")
  if (this.session == null) return Error("noSessionError")
  const rkey = Util.getRkey(listUri)
  const query: ComAtprotoRepoDeleteRecord.InputSchema = {
    repo: this.session.did,
    collection: "app.bsky.graph.list",
    rkey,
  }
  const response: undefined | Error =
    await (this.agent as BskyAgent).com.atproto.repo.deleteRecord(query)
      .catch((error: any) => error)
  console.log("[klearsky/deleteRecord]", response)
  if (response instanceof Error) return response
  return true
}

import type { ComAtprotoRepoDeleteRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const rkey = Util.getRkey(listUri)
  const query: ComAtprotoRepoDeleteRecord.InputSchema = {
    repo: this.session.did,
    collection: "app.bsky.graph.list",
    rkey,
  }
  const response: Error | undefined =
    await this.agent.com.atproto.repo.deleteRecord(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/deleteRecord]", response)
  if (response instanceof Error) {
    return response
  }
}

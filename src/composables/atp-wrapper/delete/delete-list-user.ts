import type { BskyAgent, ComAtprotoRepoDeleteRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  userUri: string,
): Promise<true | Error> {
  if (this.agent == null) return Error("No Agent")
  if (this.session == null) return Error("No Session")
  const rkey = Util.getRkey(userUri)
  const query: ComAtprotoRepoDeleteRecord.InputSchema = {
    repo: this.session.did,
    collection: "app.bsky.graph.listitem",
    rkey,
  }
  const response: ComAtprotoRepoDeleteRecord.Response =
    await (this.agent as BskyAgent).com.atproto.repo.deleteRecord(query)
      .then((value: ComAtprotoRepoDeleteRecord.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/deleteRecord]", response)
  if (!response.success) return Error("Failed")
  return true
}

import type { BskyAgent, ComAtprotoRepoDeleteRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  postUri: string
): Promise<boolean | Error> {
  if (this.agent == null) return Error("No Agent")
  if (this.session == null) return Error("No Session")
  const query: ComAtprotoRepoDeleteRecord.InputSchema = {
    repo: this.session.did,
    collection: "app.bsky.feed.threadgate",
    rkey: Util.getRkey(postUri),
  }
  const response: undefined | Error =
    await (this.agent as BskyAgent).app.bsky.feed.threadgate.delete(query)
      .catch((error: any) => error)
  console.log("[klearsky/deleteThreadgate]", response)
  if (response instanceof Error) return response
  return true
}

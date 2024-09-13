import type { ComAtprotoRepoDeleteRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  postUri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ComAtprotoRepoDeleteRecord.InputSchema = {
    repo: this.session.did,
    collection: "app.bsky.feed.threadgate",
    rkey: Util.getRkey(postUri),
  }
  const response: Error | undefined =
    await this.agent.app.bsky.feed.threadgate.delete(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/deleteThreadgate]", response)
  if (response instanceof Error) {
    return response
  }
}

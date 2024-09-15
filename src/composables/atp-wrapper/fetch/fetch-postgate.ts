import type { AppBskyFeedPostgate, ComAtprotoRepoGetRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  post: string
): Promise<Error | {
  uri: string
  cid: string
  value: TIPostgate
}> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: Omit<ComAtprotoRepoGetRecord.QueryParams, "collection"> = {
    repo: this.session.did,
    rkey: Util.getRkey(post),
  }
  const response: Error | {
    uri: string
    cid: string
    value: TIPostgate
  } =
    await this.agent.app.bsky.feed.postgate.get(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/fetchPostgate]", response)
  if (response instanceof Error) {
    return response
  }
  return response
}

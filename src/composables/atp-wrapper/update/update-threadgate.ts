import type { AppBskyFeedThreadgate, ComAtprotoRepoCreateRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  postUri: string,
  allowMention: boolean,
  allowFollowing: boolean,
  listUris?: Array<string>
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ComAtprotoRepoCreateRecord.InputSchema = {
    repo: this.session.did,
    collection: "app.bsky.feed.threadgate",
    rkey: Util.getRkey(postUri),
    record: {},
  }
  const allow: Array<{ $type: string, list?: string }> = []
  if (allowMention) {
    allow.push({ $type: "app.bsky.feed.threadgate#mentionRule" })
  }
  if (allowFollowing) {
    allow.push({ $type: "app.bsky.feed.threadgate#followingRule" })
  }
  if (listUris != null) {
    listUris.forEach((list: string) => {
      allow.push({
        $type: "app.bsky.feed.threadgate#listRule",
        list,
      })
    })
  }
  const record: AppBskyFeedThreadgate.Record = {
    post: postUri,
    allow,
    createdAt: new Date().toISOString(),
  }
  const response: Error | TTCidUri =
    await this.agent.app.bsky.feed.threadgate.create(query, record)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/updateThreadgate]", response)
  if (response instanceof Error) {
    return response
  }
  return response
}

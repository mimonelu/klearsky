import type { AppBskyFeedPostgate } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  post: string,
  allow: boolean,
  detachedEmbeddingUris?: Array<string>,
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  if (detachedEmbeddingUris == null) {
    detachedEmbeddingUris = []
  }
  const embeddingRules: any = []
  if (!allow) {
    embeddingRules.push({ $type: "app.bsky.feed.postgate#disableRule" })
    if (!detachedEmbeddingUris.includes(post)) {
      detachedEmbeddingUris.push(post)
    }
  }
  const record: AppBskyFeedPostgate.Record = {
    createdAt: new Date().toISOString(),
    post,
    detachedEmbeddingUris,
    embeddingRules,
  }
  const response: Error | TTCidUri =
    await this.updateRecord(
      this.session.did,
      "app.bsky.feed.postgate",
      post,
      record
    )
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/updatePostgate]", response)
  if (response instanceof Error) {
    return response
  }
  return response
}

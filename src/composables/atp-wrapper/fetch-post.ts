import { AtUri } from "@atproto/uri"
import type { AppBskyFeedPost, BskyAgent, ComAtprotoRepoGetRecord } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  handle?: string,
): Promise<null | TTPost> {
  if (this.agent == null) return null
  if (this.session == null) return null
  if (this.caches[uri] != null) return this.caches[uri] as TTPost

  const aturi = new AtUri(uri)
  const query: ComAtprotoRepoGetRecord.QueryParams = {
    repo: handle ?? this.session.handle,
    collection: "app.bsky.feed.post",
    rkey: aturi.rkey,
  }
  const response: {
    uri: string;
    cid: string;
    value: AppBskyFeedPost.Record;
  } = await (this.agent as BskyAgent).app.bsky.feed.post.get(query)
  console.log("[klearsky/getPost]", response)
  const post = response.value as unknown as TTPost

  // TODO:
  AtpUtil.coherentResponses([post])
  AtpUtil.feed2html([post])

  this.caches[uri] = post
  return post
}

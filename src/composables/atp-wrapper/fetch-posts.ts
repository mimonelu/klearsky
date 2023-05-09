import type { BskyAgent, AppBskyFeedGetPosts } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  uris: Array<string>
): Promise<null | Array<TTPost>> {
  if (this.agent == null) return null
  if (this.session == null) return null
  if (uris.length === 0) return null

  const query: AppBskyFeedGetPosts.QueryParams = { uris }
  const response: AppBskyFeedGetPosts.Response =
    await (this.agent as BskyAgent).getPosts(query)
  console.log("[klearsky/getPosts]", response)
  if (!response.success) return null

  // TODO:
  AtpUtil.coherentResponses(response.data.posts)

  return response.data.posts as Array<TTPost>
}

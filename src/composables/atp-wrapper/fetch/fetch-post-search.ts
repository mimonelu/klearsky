import type { AppBskyFeedSearchPosts, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  currentPosts: Array<TTPost>,
  q: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | { cursor?: string, hitsTotal?: number }> {
  if (this.agent == null) return Error("No Agent")
  const query: AppBskyFeedSearchPosts.QueryParams = { q }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyFeedSearchPosts.Response =
    await (this.agent as BskyAgent).app.bsky.feed.searchPosts(query)
      .then((value: AppBskyFeedSearchPosts.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/fetchPostSearch]", response)
  if (!response.success) return Error("Failed")
  const newPosts: Array<TTPost> = (response.data.posts as Array<TTPost>)
    .filter((post: TTPost) => {
      return currentPosts.every((currentPost: TTPost) => {
        return currentPost.cid !== post.cid
      })
    })

  // TODO:
  AtpUtil.coherentResponses(newPosts)

  currentPosts.splice(0, currentPosts.length, ...newPosts)

  return {
    cursor: response.data.cursor,
    hitsTotal: response.data.hitsTotal,
  }
}

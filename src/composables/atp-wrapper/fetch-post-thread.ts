import type { AppBskyFeedGetPostThread } from "@atproto/api"
import {
  text2htmlAtFeeds,
  traverseJson,
} from "@/composables/atp-wrapper/services"

export default async function (
  this: AbstractAtpWrapper,
  uri: string,
  depth?: number
): Promise<null | Array<Feed>> {
  if (this.agent == null) return null
  if (this.session == null) return null
  const query: AppBskyFeedGetPostThread.QueryParams = { uri }
  if (depth != null) query.depth = depth
  const response: AppBskyFeedGetPostThread.Response =
    await this.agent.api.app.bsky.feed.getPostThread(query)
  console.log("[klearsky/getPostThread]", response)
  if (!response.success) return null

  // TODO:
  const replies: Array<Post> = []
  traverseJson(response.data.thread.replies, (key: string, value: any) => {
    if (key === "post") replies.push(value)
  })
  const posts: Array<any> = [response.data.thread.post, ...replies]
  text2htmlAtFeeds(posts)
  posts.sort((a: any, b: any) => {
    const aIndexedAt = new Date(a.indexedAt)
    const bIndexedAt = new Date(b.indexedAt)
    return aIndexedAt > bIndexedAt ? 1 : aIndexedAt < bIndexedAt ? -1 : 0
  })
  return posts.map((post: Post) => ({ post }))
}

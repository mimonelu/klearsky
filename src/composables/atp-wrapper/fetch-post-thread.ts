import type { AppBskyFeedGetPostThread } from "@atproto/api"
import {
  sortFeeds,
  text2htmlAtFeeds,
  traverseJson,
} from "@/composables/atp-wrapper/services"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  depth?: number
): Promise<null | Array<TTFeed>> {
  if (this.agent == null) return null
  const query: AppBskyFeedGetPostThread.QueryParams = { uri }
  if (depth != null) query.depth = depth
  const response: AppBskyFeedGetPostThread.Response =
    await this.agent.api.app.bsky.feed.getPostThread(query)
  console.log("[klearsky/fetchPostThread]", response)
  if (!response.success) return null

  // TODO:
  const posts: Array<TTPost> = []
  traverseJson(response.data.thread, (key: string, value: any) => {
    if (key === "post") posts.push(value)
  })
  const feeds: Array<TTFeed> = posts.map((post: TTPost): TTFeed => ({ post }))
  text2htmlAtFeeds(feeds)
  sortFeeds(feeds)
  feeds.reverse()

  return feeds
}

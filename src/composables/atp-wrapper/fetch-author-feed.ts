import type { AppBskyFeedGetAuthorFeed } from "@atproto/api"
import {
  injectReason,
  mergeFeeds,
  sortFeeds,
  text2htmlAtFeeds,
} from "@/composables/atp-wrapper/services"

export default async function (
  this: AbstractAtpWrapper,
  oldFeeds: Array<Feed>,
  author: string,
  limit?: number,
  cursor?: string
): Promise<null | { feeds: Array<Feed>; cursor?: string }> {
  if (this.agent == null) return null
  if (this.session == null) return null
  const query: AppBskyFeedGetAuthorFeed.QueryParams = { author }
  if (limit != null) query.limit = limit
  if (cursor != null) query.before = cursor
  const response: AppBskyFeedGetAuthorFeed.Response =
    await this.agent.api.app.bsky.feed.getAuthorFeed(query)
  console.log("[klearsky/fetchAuthorFeed]", response)
  if (!response.success) return null

  // TODO:
  injectReason(response.data.feed as Array<Feed>)
  text2htmlAtFeeds(response.data.feed as Array<Feed>)
  const newFeeds = mergeFeeds(oldFeeds, response.data.feed as Array<Feed>)
  sortFeeds(newFeeds)

  return {
    feeds: newFeeds,
    cursor: response.data.cursor,
  }
}

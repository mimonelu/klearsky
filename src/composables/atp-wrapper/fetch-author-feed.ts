import type { AppBskyFeedGetAuthorFeed, BskyAgent } from "@atproto/api"
import {
  extractEmbeds,
  injectReason,
  mergeFeeds,
  sortFeeds,
  text2htmlAtFeeds,
} from "@/composables/atp-wrapper/services"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  author: string,
  limit?: number,
  cursor?: string
): Promise<null | { feeds: Array<TTFeed>; cursor?: string }> {
  if (this.agent == null) return null
  const query: AppBskyFeedGetAuthorFeed.QueryParams = { actor: author }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyFeedGetAuthorFeed.Response =
    await (this.agent as BskyAgent).getAuthorFeed(query)
  console.log("[klearsky/getAuthorFeed]", response)
  if (!response.success) return null

  // TODO:
  injectReason(response.data.feed as Array<TTFeed>)
  extractEmbeds(response.data.feed as Array<TTFeed>)
  text2htmlAtFeeds(response.data.feed as Array<TTFeed>)
  const newFeeds = mergeFeeds(oldFeeds, response.data.feed as Array<TTFeed>)
  sortFeeds(newFeeds)

  return {
    feeds: newFeeds,
    cursor: response.data.cursor,
  }
}

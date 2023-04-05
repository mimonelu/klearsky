import type { AppBskyFeedGetAuthorFeed, BskyAgent } from "@atproto/api"
import {
  coherentResponses,
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
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: AppBskyFeedGetAuthorFeed.QueryParams = { actor: author }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyFeedGetAuthorFeed.Response =
    await (this.agent as BskyAgent).getAuthorFeed(query)
  console.log("[klearsky/getAuthorFeed]", response)
  if (!response.success) return

  // TODO:
  coherentResponses(response.data.feed as Array<TTFeed>)
  text2htmlAtFeeds(response.data.feed as Array<TTFeed>)
  mergeFeeds(oldFeeds, response.data.feed as Array<TTFeed>)
  sortFeeds(oldFeeds)

  return response.data.cursor
}

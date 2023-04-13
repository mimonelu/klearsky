import type { AppBskyFeedGetAuthorFeed, BskyAgent } from "@atproto/api"
import Util from "@/composables/atp-wrapper/util"

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
  Util.coherentResponses(response.data.feed as Array<TTFeed>)
  Util.feed2html(response.data.feed as Array<TTFeed>)
  Util.mergeFeeds(oldFeeds, response.data.feed as Array<TTFeed>)
  Util.sortFeeds(oldFeeds)

  return response.data.cursor
}

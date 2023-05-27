import type { AppBskyFeedGetFeed, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  feed: string,
  limit?: number,
  cursor?: string
): Promise<undefined | false | string> {
  if (this.agent == null) return
  const query: AppBskyFeedGetFeed.QueryParams = { feed }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyFeedGetFeed.Response =
    await (this.agent as BskyAgent).app.bsky.feed.getFeed(query)
      .then((value: AppBskyFeedGetFeed.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getFeed]", response)
  if (!response.success) return false

  // TODO:
  AtpUtil.coherentResponses(response.data.feed)
  AtpUtil.detectLanguages(response.data.feed)
  AtpUtil.mergeFeeds(oldFeeds, response.data.feed as Array<TTFeed>)
  AtpUtil.sortFeeds(oldFeeds)

  return response.data.cursor
}

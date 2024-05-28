import type { AppBskyFeedGetAuthorFeed, BskyAgent } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  author: string,
  limit?: number,
  cursor?: string,
  filter?: string,
  direction?: TTDirection
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: AppBskyFeedGetAuthorFeed.QueryParams = { actor: author }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  if (filter != null) query.filter = filter
  let responseTemp: any = undefined
  await (this.agent as BskyAgent)
    .getAuthorFeed(query)
    .catch(() => {
      // if (error.error === "BlockedActor") ブロックしている
    })
    .then((value: any) => {
      responseTemp = value
    })
  console.log("[klearsky/getAuthorFeed]", responseTemp)
  if (responseTemp == null) return
  const response: AppBskyFeedGetAuthorFeed.Response = responseTemp
  if (!response.success) return

  // TODO:
  Util.sanitizePostsOrFeeds(response.data.feed)
  const isFirstFetch = oldFeeds.length === 0
  const isAllNew = Util.mergeFeeds(
    oldFeeds,
    response.data.feed as Array<TTFeed>,
    cursor == null,
    direction === "middle" ? cursor : undefined
  )
  if (!isFirstFetch && isAllNew && (cursor == null || direction === "middle")) {
    const initialFeed = response.data.feed[0]
    if (initialFeed != null) initialFeed.__cursor = response.data.cursor
  }
  // Util.sortFeeds(oldFeeds)

  if (direction !== "old" && !isFirstFetch) return

  return response.data.cursor
}

import type { AppBskyFeedGetTimeline, BskyAgent } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  replyFolding?: Array<number>,
  repostFolding?: Array<number>,
  limit?: number,
  cursor?: string,
  direction?: TTDirection
): Promise<undefined | false | string> {
  if (this.agent == null) return
  const query: AppBskyFeedGetTimeline.QueryParams = {
    // TODO: 要調査
    algorithm: "reverse-chronological",
  }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyFeedGetTimeline.Response =
    await (this.agent as BskyAgent).getTimeline(query)
      .then((value: AppBskyFeedGetTimeline.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getTimeline]", response)
  if (!response.success) return false

  // 折り畳みプロパティをインジェクト
  Util.injectFoldingToFeeds(
    response.data.feed as Array<TTFeed>,
    this.session?.did,
    replyFolding,
    repostFolding
  )

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

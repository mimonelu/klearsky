import type { AppBskyFeedGetListFeed } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  currentFeeds: Array<TTFeed>,
  list: string,
  replyFolding?: Array<number>,
  repostFolding?: Array<number>,
  limit?: number,
  cursor?: string,
  direction?: TTDirection,
  checkIdentity?: (params: any) => boolean
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedGetListFeed.QueryParams = { list }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | AppBskyFeedGetListFeed.Response =
    await this.agent.app.bsky.feed.getListFeed(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getListFeed]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  // 現在のフィードと異なるフィードかどうかの判定
  if (checkIdentity != null && !checkIdentity(list)) {
    return
  }

  // 折り畳みプロパティをインジェクト
  Util.injectFoldingToFeeds(
    response.data.feed as Array<TTFeed>,
    this.session?.did,
    replyFolding,
    repostFolding
  )

  // TODO:
  Util.sanitizePostsOrFeeds(response.data.feed)
  const isFirstFetch = currentFeeds.length === 0
  const isAllNew = Util.mergeFeeds(
    currentFeeds,
    response.data.feed as Array<TTFeed>,
    cursor == null,
    direction === "middle" ? cursor : undefined
  )
  if (!isFirstFetch && isAllNew && (cursor == null || direction === "middle")) {
    const initialFeed = response.data.feed[0]
    if (initialFeed != null) {
      initialFeed.__cursor = response.data.cursor
    }
  }

  if (direction !== "old" && !isFirstFetch) {
    return
  }

  return response.data.cursor
}

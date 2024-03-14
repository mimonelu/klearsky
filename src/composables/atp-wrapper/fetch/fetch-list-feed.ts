import type { AppBskyFeedGetListFeed, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  currentFeeds: Array<TTFeed>,
  list: string,
  limit?: number,
  cursor?: string,
  direction?: TTDirection,
  checkIdentity?: (params: any) => boolean
): Promise<Error | undefined | string> {
  if (this.agent == null) return Error("noAgentError")

  const query: AppBskyFeedGetListFeed.QueryParams = { list }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor

  const response: Error | AppBskyFeedGetListFeed.Response =
    await (this.agent as BskyAgent).app.bsky.feed.getListFeed(query)
      .then((value: AppBskyFeedGetListFeed.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getListFeed]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")

  // 現在のフィードと異なるフィードかどうかの判定
  if (checkIdentity != null && !checkIdentity(list)) return

  // TODO:
  AtpUtil.coherentResponses(response.data.feed)
  const isFirstFetch = currentFeeds.length === 0
  const isAllNew = AtpUtil.mergeFeeds(
    currentFeeds,
    response.data.feed as Array<TTFeed>,
    cursor == null,
    direction === "middle" ? cursor : undefined
  )
  if (!isFirstFetch && isAllNew && (cursor == null || direction === "middle")) {
    const initialFeed = response.data.feed[0]
    if (initialFeed != null) initialFeed.__cursor = response.data.cursor
  }

  if (direction !== "old" && !isFirstFetch) return

  return response.data.cursor
}

import type { AppBskyFeedGetListFeed, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  currentFeeds: Array<TTFeed>,
  list: string,
  limit?: number,
  cursor?: string,
  middle?: boolean
): Promise<Error | undefined | string> {
  if (this.agent == null) return Error("No agent")

  const query: AppBskyFeedGetListFeed.QueryParams = { list }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor

  const response: Error | AppBskyFeedGetListFeed.Response =
    await (this.agent as BskyAgent).app.bsky.feed.getListFeed(query)
      .then((value: AppBskyFeedGetListFeed.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getListFeed]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("Failed")

  // TODO:
  AtpUtil.coherentResponses(response.data.feed)
  const isNotFirstFetch = currentFeeds.length > 0
  const isAllNew = AtpUtil.mergeFeeds(
    currentFeeds,
    response.data.feed as Array<TTFeed>,
    cursor == null,
    middle ? cursor : undefined
  )
  if (isNotFirstFetch && isAllNew && (cursor == null || middle)) {
    const initialFeed = response.data.feed[0]
    if (initialFeed != null) initialFeed.__cursor = response.data.cursor
  }

  return response.data.cursor
}

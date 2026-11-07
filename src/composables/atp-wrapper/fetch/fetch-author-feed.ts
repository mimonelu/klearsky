import type { AppBskyFeedGetAuthorFeed } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  author: string,
  limit?: number,
  cursor?: string,
  filter?: string,
  direction?: TTDirection
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedGetAuthorFeed.QueryParams = { actor: author }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  if (filter != null) {
    query.filter = filter
  }
  const response: Error | AppBskyFeedGetAuthorFeed.Response =
    await this.agent.getAuthorFeed(query)
      .then((value) => value)
      .catch((error) => error)
  $log("getAuthorFeed", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  // TODO:
  Util.sanitizePostsOrFeeds(response.data.feed)
  const isFirstFetch = oldFeeds.length === 0
  Util.mergeFeeds(
    oldFeeds,
    response.data.feed as Array<TTFeed>,
    cursor,
    direction,
    response.data.cursor
  )
  // Util.sortFeeds(oldFeeds)

  if (direction !== "old" && !isFirstFetch) {
    return
  }

  return response.data.cursor
}

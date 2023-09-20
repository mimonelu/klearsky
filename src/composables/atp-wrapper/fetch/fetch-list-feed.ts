import type { AppBskyFeedGetListFeed, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentFeeds: Array<TTFeed>,
  list: string,
  limit?: number,
  cursor?: string
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

  ;(response.data.feed as Array<TTFeed>).forEach((newFeed: TTFeed) => {
    if (currentFeeds.every((currentFeed: TTFeed) => {
      return newFeed.cid !== currentFeed.cid
    })) currentFeeds.push(newFeed)
  })

  return response.data.cursor
}

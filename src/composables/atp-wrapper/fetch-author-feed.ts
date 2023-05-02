import type { AppBskyFeedGetAuthorFeed, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

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
  AtpUtil.coherentResponses(response.data.feed as Array<TTFeed>)
  AtpUtil.mergeFeeds(oldFeeds, response.data.feed as Array<TTFeed>)
  AtpUtil.sortFeeds(oldFeeds)

  return response.data.cursor
}

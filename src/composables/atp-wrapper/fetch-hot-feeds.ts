import type { AppBskyUnspeccedGetPopular, BskyAgent } from "@atproto/api"
import Util from "@/composables/atp-wrapper/util"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: AppBskyUnspeccedGetPopular.QueryParams = {}
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyUnspeccedGetPopular.Response =
    await (this.agent as BskyAgent).api.app.bsky.unspecced.getPopular(query)
  console.log("[klearsky/getPopular]", response)
  if (!response.success) return

  // TODO:
  Util.coherentResponses(response.data.feed as Array<TTFeed>)
  Util.text2htmlAtFeeds(response.data.feed as Array<TTFeed>)
  Util.mergeFeeds(oldFeeds, response.data.feed as Array<TTFeed>)
  Util.sortFeeds(oldFeeds)

  return response.data.cursor
}

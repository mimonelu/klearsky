import type { AppBskyUnspeccedGetPopular, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  limit?: number,
  cursor?: string
): Promise<undefined | false | string> {
  if (this.agent == null) return
  const query: AppBskyUnspeccedGetPopular.QueryParams = {}
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyUnspeccedGetPopular.Response =
    await (this.agent as BskyAgent).api.app.bsky.unspecced.getPopular(query)
      .then((value: AppBskyUnspeccedGetPopular.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPopular]", response)
  if (!response.success) return false

  // TODO:
  AtpUtil.coherentResponses(response.data.feed)
  AtpUtil.mergeFeeds(oldFeeds, response.data.feed as Array<TTFeed>)
  // AtpUtil.sortFeeds(oldFeeds)

  return response.data.cursor
}

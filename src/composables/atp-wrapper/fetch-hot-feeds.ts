import type { AppBskyUnspeccedGetPopular, BskyAgent } from "@atproto/api"
import {
  extractEmbeds,
  injectReason,
  mergeFeeds,
  sortFeeds,
  text2htmlAtFeeds,
} from "@/composables/atp-wrapper/services"

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
  injectReason(response.data.feed as Array<TTFeed>)
  extractEmbeds(response.data.feed as Array<TTFeed>)
  text2htmlAtFeeds(response.data.feed as Array<TTFeed>)
  mergeFeeds(oldFeeds, response.data.feed as Array<TTFeed>)
  sortFeeds(oldFeeds)

  return response.data.cursor
}

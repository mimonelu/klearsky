import type { AppBskyFeedGetTimeline, BskyAgent } from "@atproto/api"
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
): Promise<null | {
  feeds: Array<TTFeed>
  cursor?: string
}> {
  if (this.agent == null) return null
  const query: AppBskyFeedGetTimeline.QueryParams = {
    // TODO: 要調査
    // FYI: https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/app-view/api/app/bsky/util/feed.ts#L72
    algorithm: "reverse-chronological",
  }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyFeedGetTimeline.Response =
    await (this.agent as BskyAgent).getTimeline(query)
  console.log("[klearsky/getTimeline]", response)
  if (!response.success) return null

  // TODO:
  injectReason(response.data.feed as Array<TTFeed>)
  extractEmbeds(response.data.feed as Array<TTFeed>)
  text2htmlAtFeeds(response.data.feed as Array<TTFeed>)
  const newFeeds = mergeFeeds(oldFeeds, response.data.feed as Array<TTFeed>)
  sortFeeds(newFeeds)

  return {
    feeds: newFeeds,
    cursor: response.data.cursor,
  }
}

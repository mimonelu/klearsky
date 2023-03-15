import type { AppBskyFeedGetTimeline } from "@atproto/api"
import {
  injectReason,
  mergeFeeds,
  sortFeeds,
  text2htmlAtFeeds
} from "@/composables/atp-wrapper/services"

export default async function (this: AbstractAtpWrapper, oldFeeds: Array<Feed>, limit?: number, cursor?: string): Promise<null | { feeds: Array<Feed>; cursor?: string }> {
  if (this.agent == null) return null
  if (this.session == null) return null
  const query: AppBskyFeedGetTimeline.QueryParams = {
    // algorithm: "", // TODO: 要調査
  }
  if (limit != null) query.limit = limit
  if (cursor != null) query.before = cursor
  try {
    const response: AppBskyFeedGetTimeline.Response =
      await this.agent.api.app.bsky.feed.getTimeline(query)
    console.log("[klearsky/fetchTimeline]", response)
    if (!response.success) return null

    // TODO:
    injectReason(response.data.feed as Array<Feed>)
    text2htmlAtFeeds(response.data.feed as Array<Feed>)
    const newFeeds = mergeFeeds(oldFeeds, response.data.feed as Array<Feed>)
    sortFeeds(newFeeds)
    return {
      feeds: newFeeds,
      cursor: response.data.cursor,
    }
  } catch (error: any) {
    console.error("[klearsky/fetchTimeline]", error)
    return null
  }
}

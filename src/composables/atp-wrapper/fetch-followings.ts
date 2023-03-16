import type { AppBskyGraphGetFollows } from "@atproto/api"

export default async function (
  this: AbstractAtpWrapper,
  handle: string,
  limit?: number,
  before?: string
): Promise<null | {
  cursor?: string
  followings: Array<Following>
}> {
  if (this.agent == null) return null
  if (this.session == null) return null
  const query: AppBskyGraphGetFollows.QueryParams = { user: handle }
  if (limit != null) query.limit = limit
  if (before != null) query.before = before
  try {
    const response: AppBskyGraphGetFollows.Response =
      await this.agent.api.app.bsky.graph.getFollows(query)
    console.log("[klearsky/fetchFollowings]", response)
    if (!response.success) return null
    return {
      cursor: response.data.cursor,
      followings: response.data.follows as Array<Following>,
    }
  } catch (error: any) {
    console.error("[klearsky/fetchFollowings]", error)
    return null
  }
}

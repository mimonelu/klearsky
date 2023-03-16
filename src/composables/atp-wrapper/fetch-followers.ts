import type { AppBskyGraphGetFollowers } from "@atproto/api"

export default async function (
  this: AbstractAtpWrapper,
  handle: string,
  limit?: number,
  before?: string
): Promise<null | {
  cursor?: string
  followers: Array<Following>
}> {
  if (this.agent == null) return null
  if (this.session == null) return null
  const query: AppBskyGraphGetFollowers.QueryParams = { user: handle }
  if (limit != null) query.limit = limit
  if (before != null) query.before = before
  try {
    const response: AppBskyGraphGetFollowers.Response =
      await this.agent.api.app.bsky.graph.getFollowers(query)
    console.log("[klearsky/fetchFollowers]", response)
    if (!response.success) return null
    return {
      cursor: response.data.cursor,
      followers: response.data.followers as Array<Following>,
    }
  } catch (error: any) {
    console.error("[klearsky/fetchFollowers]", error)
    return null
  }
}

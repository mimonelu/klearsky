import type {
  AppBskyGraphGetFollowers,
  AppBskyGraphGetFollows
} from "@atproto/api"

export async function fetchFollowings (this: AbstractAtpWrapper, handle: string, limit?: number, before?: string): Promise<null | {
  cursor?: string;
  followings: Array<Following>;
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

export async function fetchFollowers (this: AbstractAtpWrapper, handle: string, limit?: number, before?: string): Promise<null | {
  cursor?: string;
  followers: Array<Following>;
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

import type { AppBskyGraphGetFollowers } from "@atproto/api"

export default async function (
  this: AbstractAtpWrapper,
  users: Array<Follower>,
  handle: string,
  limit?: number,
  before?: string
): Promise<undefined | string> {
  if (this.agent == null) return undefined
  if (this.session == null) return undefined
  const query: AppBskyGraphGetFollowers.QueryParams = { user: handle }
  if (limit != null) query.limit = limit
  if (before != null) query.before = before
  const response: AppBskyGraphGetFollowers.Response =
    await this.agent.api.app.bsky.graph.getFollowers(query)
  console.log("[klearsky/fetchFollowers]", response)
  if (!response.success) return undefined

  ;(response.data.followers as Array<Follower>).forEach((follower: Follower) => {
    if (!users.some((user: Follower) => user.did === follower.did)) users.push(follower)
  })

  return response.data.cursor
}

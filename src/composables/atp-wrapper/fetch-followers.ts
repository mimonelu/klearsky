import type { AppBskyGraphGetFollowers } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  handle: string,
  limit?: number,
  before?: string
): Promise<undefined | string> {
  if (this.agent == null) return undefined
  const query: AppBskyGraphGetFollowers.QueryParams = { user: handle }
  if (limit != null) query.limit = limit
  if (before != null) query.before = before
  const response: AppBskyGraphGetFollowers.Response =
    await this.agent.api.app.bsky.graph.getFollowers(query)
  console.log("[klearsky/fetchFollowers]", response)
  if (!response.success) return undefined
  ;(response.data.followers as Array<TTUser>).forEach(
    (follower: TTUser) => {
      if (!users.some((user: TTUser) => user.did === follower.did))
        users.push(follower)
    }
  )

  return response.data.cursor
}

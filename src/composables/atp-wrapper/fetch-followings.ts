import type { AppBskyGraphGetFollows } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  handle: string,
  limit?: number,
  before?: string
): Promise<undefined | string> {
  if (this.agent == null) return undefined
  const query: AppBskyGraphGetFollows.QueryParams = { user: handle }
  if (limit != null) query.limit = limit
  if (before != null) query.before = before
  const response: AppBskyGraphGetFollows.Response =
    await this.agent.api.app.bsky.graph.getFollows(query)
  console.log("[klearsky/fetchFollowings]", response)
  if (!response.success) return undefined
  ;(response.data.follows as Array<TTUser>).forEach(
    (following: TTUser) => {
      if (!users.some((user: TTUser) => user.did === following.did))
        users.push(following)
    }
  )

  return response.data.cursor
}

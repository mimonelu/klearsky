import type { AppBskyGraphGetFollows, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  handle: string,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return undefined
  const query: AppBskyGraphGetFollows.QueryParams = { actor: handle }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyGraphGetFollows.Response =
    await (this.agent as BskyAgent).getFollows(query)
  console.log("[klearsky/getFollows]", response)
  if (!response.success) return undefined

  ;(response.data.follows as Array<TTUser>).forEach(
    (following: TTUser) => {
      if (!users.some((user: TTUser) => user.did === following.did))
        users.push(following)
    }
  )

  return response.data.cursor
}

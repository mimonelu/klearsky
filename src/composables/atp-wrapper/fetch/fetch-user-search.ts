import type { AppBskyActorSearchActors, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  q: string,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: AppBskyActorSearchActors.QueryParams = {}
  if (q != null) query.q = q
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyActorSearchActors.Response =
    await (this.agent as BskyAgent).searchActors(query)
  console.log("[klearsky/searchActors]", response)
  if (!response.success) return

  // ブロックユーザーをフィルタリング
  response.data.actors = (response.data.actors as Array<TTUser>).filter((user: TTUser) => {
    return !user.viewer?.blocking && !user.viewer?.blockedBy
  })

  const newUsers: Array<TTUser> = []
  ;(response.data.actors as Array<TTUser>).forEach((target: TTUser) => {
    if (!users.some((user: TTUser) => user.did === target.did))
      newUsers.push(target)
  })
  if (cursor == null) users.unshift(...newUsers)
  else users.push(...newUsers)

  return response.data.cursor
}

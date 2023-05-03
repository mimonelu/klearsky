import type { BskyAgent, AppBskyGraphGetBlocks } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: AppBskyGraphGetBlocks.QueryParams = {
    limit,
    cursor,
  }
  const response: AppBskyGraphGetBlocks.Response = await (
    this.agent as BskyAgent
  ).app.bsky.graph.getBlocks(query)
  console.log("[klearsky/getBlocks]", response)
  if (!response.success) return

  const newUsers: Array<TTUser> = []
  ;(response.data.blocks as Array<any>).forEach((newUser: TTUser) => {
    if (!users.some((user: TTUser) => user.did === newUser.did))
      newUsers.push(newUser)
  })
  if (cursor == null) users.unshift(...newUsers)
  else users.push(...newUsers)

  users.sort((a: TTUser, b: TTUser) => {
    const aDate = new Date((a as any).indexedAt)
    const bDate = new Date((b as any).indexedAt)
    return aDate < bDate ? 1 : aDate > bDate ? - 1 : 0
  })

  return response.data.cursor
}

import type { AppBskyFeedGetLikes, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  uri: string,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: AppBskyFeedGetLikes.QueryParams = {
    uri,
    limit,
    cursor,
  }
  const response: AppBskyFeedGetLikes.Response = await (
    this.agent as AtpAgent
  ).getLikes(query)
  console.log("[klearsky/getLikes]", response)
  if (!response.success) return

  // ブロックユーザーをフィルタリング
  response.data.likes = (response.data.likes as Array<any>).filter((like: any) => {
    return !(like.actor as TTUser).viewer?.blocking && !(like.actor as TTUser).viewer?.blockedBy
  })

  const newUsers: Array<TTUser> = []
  ;(response.data.likes as Array<any>).forEach((like: any) => {
    const target = like.actor as TTUser
    if (!users.some((user: TTUser) => user.did === target.did))
      newUsers.push(target)
  })
  if (cursor == null) users.unshift(...newUsers)
  else users.push(...newUsers)

  return response.data.cursor
}

import type { AppBskyFeedGetLikes } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  uri: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedGetLikes.QueryParams = {
    uri,
    limit,
    cursor,
  }
  const response: Error | AppBskyFeedGetLikes.Response =
    await this.agent.getLikes(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getLikes]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  // ブロックユーザーをフィルタリング
  response.data.likes = (response.data.likes as Array<any>)
    .filter((like: any) => {
      return (
        !(like.actor as TTUser).viewer?.blocking &&
        !(like.actor as TTUser).viewer?.blockedBy
      )
    })

  const newUsers: Array<TTUser> = []
  ;(response.data.likes as Array<any>)
    .forEach((like: any) => {
      const target = like.actor as TTUser
      if (!users.some((user: TTUser) => user.did === target.did)) {
        newUsers.push(target)
      }
    })
  if (cursor == null) {
    users.unshift(...newUsers)
  } else {
    users.push(...newUsers)
  }

  return response.data.cursor
}

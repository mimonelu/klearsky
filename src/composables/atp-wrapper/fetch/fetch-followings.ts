import type { AppBskyGraphGetFollows } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  handle: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetFollows.QueryParams = { actor: handle }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | AppBskyGraphGetFollows.Response =
    await this.agent.getFollows(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getFollows]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  // ブロックユーザーをフィルタリング
  response.data.follows = (response.data.follows as Array<TTUser>)
    .filter((follow: TTUser) => {
      return !follow.viewer?.blocking && !follow.viewer?.blockedBy
    })

  ;(response.data.follows as Array<TTUser>)
    .forEach((following: TTUser) => {
      if (!users.some((user: TTUser) => user.did === following.did)) {
        users.push(following)
      }
    })

  return response.data.cursor
}

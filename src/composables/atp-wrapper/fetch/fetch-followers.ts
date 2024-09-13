import type { AppBskyGraphGetFollowers } from "@atproto/api"

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
  const query: AppBskyGraphGetFollowers.QueryParams = { actor: handle }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | AppBskyGraphGetFollowers.Response =
    await this.agent.getFollowers(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getFollowers]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  // ブロックユーザーをフィルタリング
  response.data.followers = (response.data.followers as Array<TTUser>)
    .filter((follow: TTUser) => {
      return !follow.viewer?.blocking && !follow.viewer?.blockedBy
    })

  ;(response.data.followers as Array<TTUser>)
    .forEach((follower: TTUser) => {
      if (!users.some((user: TTUser) => user.did === follower.did)) {
        users.push(follower)
      }
    })

  return response.data.cursor
}

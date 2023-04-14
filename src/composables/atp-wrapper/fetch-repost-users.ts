import type { BskyAgent, AppBskyFeedGetRepostedBy } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  uri: string,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: AppBskyFeedGetRepostedBy.QueryParams = {
    uri,
    limit,
    cursor,
  }
  const response: AppBskyFeedGetRepostedBy.Response =
    await (this.agent as BskyAgent).getRepostedBy(query)
  console.log("[klearsky/getRepostedBy]", response)
  if (!response.success) return

  const newUsers: Array<TTUser> = []
  ;(response.data.repostedBy as Array<TTUser>).forEach((target: TTUser) => {
    if (!users.some((user: TTUser) => user.did === target.did))
      newUsers.push(target)
  })
  if (cursor == null) users.unshift(...newUsers)
  else users.push(...newUsers)

  return response.data.cursor
}

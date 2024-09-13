import type { AppBskyGraphGetMutes } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetMutes.QueryParams = {
    limit,
    cursor,
  }
  const response: AppBskyGraphGetMutes.Response =
    await this.agent.app.bsky.graph.getMutes(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getMutes]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  const newUsers: Array<TTUser> = []
  ;(response.data.mutes as Array<any>)
    .forEach((newUser: TTUser) => {
      if (!users.some((user: TTUser) => user.did === newUser.did)) {
        newUsers.push(newUser)
      }
    })
  if (cursor == null) {
    users.unshift(...newUsers)
  } else {
    users.push(...newUsers)
  }

  /* TODO: 不要であれば削除すること
  users.sort((a: TTUser, b: TTUser) => {
    const aDate = new Date((a as any).indexedAt)
    const bDate = new Date((b as any).indexedAt)
    return aDate < bDate ? 1 : aDate > bDate ? - 1 : 0
  })
  */

  return response.data?.cursor
}

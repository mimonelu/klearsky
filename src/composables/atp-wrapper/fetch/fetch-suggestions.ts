import type { AppBskyActorGetSuggestions } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  dataRef: Array<TTUser>,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyActorGetSuggestions.QueryParams = {
    limit,
    cursor,
  }
  const response: Error | AppBskyActorGetSuggestions.Response =
    await this.agent.getSuggestions(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getSuggestions]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  // ブロックユーザーをフィルタリング
  response.data.actors = (response.data.actors as Array<TTUser>)
    .filter((user: TTUser) => {
      return !user.viewer?.blocking && !user.viewer?.blockedBy
    })

  const newUsers: Array<TTUser> = (response.data.actors as Array<TTUser>)
    .filter((target: TTUser) => {
      return dataRef.every((user: TTUser) => user.did !== target.did)
    })
  if (cursor == null) {
    dataRef.unshift(...newUsers)
  } else {
    dataRef.push(...newUsers)
  }

  return response.data.cursor
}

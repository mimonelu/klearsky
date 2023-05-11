import type { AppBskyActorGetSuggestions, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  dataRef: Array<TTUser>,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: AppBskyActorGetSuggestions.QueryParams = {
    limit,
    cursor,
  }
  const response: AppBskyActorGetSuggestions.Response =
    await (this.agent as BskyAgent).getSuggestions(query)
  console.log("[klearsky/getSuggestions]", response)
  if (!response.success) return

  const newUsers: Array<TTUser> = (response.data.actors as Array<TTUser>)
    .filter((target: TTUser) => {
      return dataRef.every((user: TTUser) => user.did !== target.did)
    })
  if (cursor == null) dataRef.unshift(...newUsers)
  else dataRef.push(...newUsers)

  return response.data.cursor
}

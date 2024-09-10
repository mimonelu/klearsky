import type { AppBskyGraphGetListMutes, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  lists: Array<TTList>,
  limit?: number,
  cursor?: string
): Promise<undefined | string | Error> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetListMutes.QueryParams = {}
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor

  const response: AppBskyGraphGetListMutes.Response | Error =
    await (this.agent as AtpAgent).app.bsky.graph.getListMutes(query)
      .then((value: AppBskyGraphGetListMutes.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getListMutes]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")

  const newLists: Array<TTList> = (response.data.lists as Array<TTList>)
    .filter((list: TTList) => !lists
      .some((current: TTList) => list.uri === current.uri))
  if (cursor == null) lists.unshift(...newLists)
  else lists.push(...newLists)

  return newLists.length < (limit ?? 1) ? undefined : response.data.cursor
}

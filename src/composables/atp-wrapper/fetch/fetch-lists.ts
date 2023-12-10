import type { AppBskyGraphGetLists, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentLists: Array<TTList>,
  actor: string,
  limit?: number,
  cursor?: string
): Promise<undefined | string | Error> {
  if (this.agent == null) return Error("No Agent")
  const query: AppBskyGraphGetLists.QueryParams = { actor }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor

  const response: AppBskyGraphGetLists.Response =
    await (this.agent as BskyAgent).app.bsky.graph.getLists(query)
      .then((value: AppBskyGraphGetLists.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getLists]", response)
  if (!response.success) return Error("Failed")

  const newLists: Array<TTList> = response.data.lists
    .filter((list: TTList) => !currentLists
      .some((current: TTList) => list.uri === current.uri))
  if (cursor == null) currentLists.unshift(...newLists)
  else currentLists.push(...newLists)

  return response.data.cursor
}

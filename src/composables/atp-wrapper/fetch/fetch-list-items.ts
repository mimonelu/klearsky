import type { AppBskyGraphGetList, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentListItems: Array<TTListItem>,
  list: string,
  limit?: number,
  cursor?: string
): Promise<undefined | string | Error> {
  if (this.agent == null) return Error("No Agent")
  const query: AppBskyGraphGetList.QueryParams = { list }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor

  const response: AppBskyGraphGetList.Response =
    await (this.agent as BskyAgent).app.bsky.graph.getList(query)
      .then((value: AppBskyGraphGetList.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getList(fetchListItems)]", response)
  if (!response.success) return Error("Failed")

  const newListItems: Array<TTListItem> =
    (response.data.items as unknown as Array<TTListItem>)
      .filter((listItem: TTListItem) => !currentListItems
        .some((current: TTListItem) => listItem.uri === current.uri))
  if (cursor == null) currentListItems.unshift(...newListItems)
  else currentListItems.push(...newListItems)

  return newListItems.length < (limit ?? 1) ? undefined : response.data.cursor
}

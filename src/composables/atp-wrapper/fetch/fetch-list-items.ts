import type { AppBskyGraphGetList } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentListItems: Array<TTListItem>,
  list: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetList.QueryParams = { list }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | AppBskyGraphGetList.Response =
    await this.agent.app.bsky.graph.getList(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getList(fetchListItems)]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  const newListItems: Array<TTListItem> =
    (response.data.items as unknown as Array<TTListItem>)
      .filter((listItem: TTListItem) => {
        return !currentListItems.some((current: TTListItem) => {
          return listItem.uri === current.uri
        })
      })
  if (cursor == null) {
    currentListItems.unshift(...newListItems)
  } else {
    currentListItems.push(...newListItems)
  }

  return newListItems.length < (limit ?? 1) ? undefined : response.data.cursor
}

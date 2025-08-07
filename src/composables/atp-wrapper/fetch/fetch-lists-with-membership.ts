import type { AppBskyGraphGetListsWithMembership } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  actor: string,
  limit?: number,
  cursor?: string
): Promise<Error | {
  cursor?: string
  lists: TTList[]
}> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetListsWithMembership.QueryParams = { actor }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | AppBskyGraphGetListsWithMembership.Response =
    await this.agent.app.bsky.graph.getListsWithMembership(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getListsWithMembership]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success || response.data == null) {
    return Error("apiError")
  }
  return {
    cursor: response.data.cursor,
    lists: response.data.listsWithMembership?.map((listWithMembership) => {
      return listWithMembership.list
    }) as TTList[] ?? [],
  }
}

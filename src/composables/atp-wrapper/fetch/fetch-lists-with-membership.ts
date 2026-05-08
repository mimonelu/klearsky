import type { AppBskyGraphGetListsWithMembership } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  actor: string,
  limit?: number,
  cursor?: string
): TIFetchListsWithMembershipResponse {
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

  // NOTE: 指定不要。いずれにせよリファレンスリストは返らない
  // query.purposes = ["curatelist", "modlist", "referencelist"]

  const response: Error | AppBskyGraphGetListsWithMembership.Response =
    await this.agent.app.bsky.graph.getListsWithMembership(query)
      .then((value) => value)
      .catch((error) => error)
  $log("getListsWithMembership", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success || response.data == null) {
    return Error("apiError")
  }
  return {
    cursor: response.data.cursor,
    lists: response.data.listsWithMembership?.
      map((listWithMembership) => {
        return listWithMembership.list
      }) as TTList[] ?? [],
    actors: response.data.listsWithMembership?.
      filter((listWithMembership) => {
        return listWithMembership.listItem != null
      }).
      map((listWithMembership) => {
        return {
          listUri: listWithMembership.list.uri,
          listItemUri: listWithMembership.listItem!.uri,
        }
      }) ?? [],
  }
}

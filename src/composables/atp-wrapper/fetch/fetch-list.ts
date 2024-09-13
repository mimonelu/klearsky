import type { AppBskyGraphGetList } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  list: string
): Promise<Error | TTList> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetList.QueryParams = {
    list,
    limit: 1,
  }
  const response: Error | AppBskyGraphGetList.Response =
    await this.agent.app.bsky.graph.getList(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getList(fetchList)]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.list as TTList
}

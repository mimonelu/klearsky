import type { AppBskyGraphGetList, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  list: string
): Promise<TTList | Error> {
  if (this.agent == null) return Error("noAgentError")
  const query: AppBskyGraphGetList.QueryParams = {
    list,
    limit: 1,
  }
  const response: Error | AppBskyGraphGetList.Response =
    await (this.agent as BskyAgent).app.bsky.graph.getList(query)
      .then((value: AppBskyGraphGetList.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getList(fetchList)]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
  return response.data.list
}

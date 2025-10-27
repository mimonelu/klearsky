import type { AppBskyUnspeccedGetTrendingTopics } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  viewer?: string,
  limit?: number
): Promise<Error | AppBskyUnspeccedGetTrendingTopics.OutputSchema> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyUnspeccedGetTrendingTopics.QueryParams = {}
  if (viewer != null) {
    query.viewer = viewer
  }
  if (limit != null) {
    query.limit = limit
  }
  const response: Error | AppBskyUnspeccedGetTrendingTopics.Response =
    await this.agent.app.bsky.unspecced.getTrendingTopics(query)
      .then((value) => value)
      .catch((error) => error)
  $log("getTrendingTopics", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success || response.data == null) {
    return Error("apiError")
  }
  return response.data
}

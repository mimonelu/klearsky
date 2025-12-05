import type { AppBskyGraphGetRelationships } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  actor: string,
  others?: string[]
): Promise<Error | AppBskyGraphGetRelationships.OutputSchema["relationships"]> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetRelationships.QueryParams = { actor }
  if (others != null) {
    query.others = others
  }
  const response: Error | AppBskyGraphGetRelationships.Response =
    await this.agent.app.bsky.graph.getRelationships(query)
      .then((value) => value)
      .catch((error) => error)
  $log("getRelationships", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.relationships
}

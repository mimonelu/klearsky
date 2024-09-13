import type { AppBskyActorSearchActorsTypeahead } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  q?: string,
  limit?: number
): Promise<Error | Array<TTUser>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyActorSearchActorsTypeahead.QueryParams = {}
  if (q != null) {
    query.q = q
  }
  if (limit != null) {
    query.limit = limit
  }
  const response: AppBskyActorSearchActorsTypeahead.Response =
    await this.agent.searchActorsTypeahead(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/searchActorsTypeahead]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.actors as Array<TTUser>
}

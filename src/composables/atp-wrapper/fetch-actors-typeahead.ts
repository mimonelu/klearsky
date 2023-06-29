import type { AppBskyActorSearchActorsTypeahead, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  term?: string,
  limit?: number
): Promise<Error | Array<TTUser>> {
  if (this.agent == null) return Error("No agent")
  const query: AppBskyActorSearchActorsTypeahead.QueryParams = {}
  if (term != null) query.term = term
  if (limit != null) query.limit = limit
  const response: AppBskyActorSearchActorsTypeahead.Response =
    await (this.agent as BskyAgent).searchActorsTypeahead(query)
      .then((value: AppBskyActorSearchActorsTypeahead.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/searchActorsTypeahead]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("Failed")
  return response.data.actors as Array<TTUser>
}

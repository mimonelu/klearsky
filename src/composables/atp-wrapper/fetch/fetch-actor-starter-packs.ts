import type { AppBskyGraphGetActorStarterPacks } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentStarterPacks: Array<TIStarterPack>,
  actor: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetActorStarterPacks.QueryParams = { actor }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | AppBskyGraphGetActorStarterPacks.Response =
    await this.agent.app.bsky.graph.getActorStarterPacks(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getActorStarterPacks]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  const newStarterPacks = response.data.starterPacks.filter((starterPack) => {
    return !currentStarterPacks.some((currentStarterPack) => {
      return currentStarterPack.uri === starterPack.uri
    })
  }) as unknown as Array<TIStarterPack>
  if (cursor == null) {
    currentStarterPacks.unshift(...newStarterPacks)
  } else {
    currentStarterPacks.push(...newStarterPacks)
  }
  return response.data.cursor
}

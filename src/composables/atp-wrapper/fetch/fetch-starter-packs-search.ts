import type { AppBskyGraphSearchStarterPacksV2 } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentStarterPacks: Array<TIStarterPack>,
  q: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphSearchStarterPacksV2.QueryParams = { q }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | AppBskyGraphSearchStarterPacksV2.Response =
    await this.agent.app.bsky.graph.searchStarterPacksV2(query)
      .then((value: any) => value)
      .catch((error: any) => error)
  $log("searchStarterPacksV2", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success || response.data?.starterPacks == null) {
    return Error("apiError")
  }
  const newStarterPacks: Array<TIStarterPack> =
    (response.data.starterPacks as unknown as Array<TIStarterPack>)
      .filter((starterPack) => {
        return currentStarterPacks.every((currentstarterPack) => {
          return currentstarterPack.uri !== starterPack.uri
        })
      })
  if (cursor == null) {
    currentStarterPacks.unshift(...newStarterPacks)
  } else {
    currentStarterPacks.push(...newStarterPacks)
  }
  return response.data.cursor
}

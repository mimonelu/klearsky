import type { AppBskyGraphGetStarterPacks } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uris: Array<string>
): Promise<Error | Array<TIStarterPack>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetStarterPacks.QueryParams = { uris }
  const response: Error | AppBskyGraphGetStarterPacks.Response =
    await this.agent.app.bsky.graph.getStarterPacks(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getStarterPacks]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success || response.data?.starterPacks == null) {
    return Error("apiError")
  }
  return response.data.starterPacks as unknown as Array<TIStarterPack>
}

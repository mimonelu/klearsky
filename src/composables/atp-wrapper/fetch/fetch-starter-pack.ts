import type { AppBskyGraphGetStarterPack } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | TIStarterPack> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetStarterPack.QueryParams = {
    starterPack: uri,
  }
  const response: Error | AppBskyGraphGetStarterPack.Response =
    await this.agent.app.bsky.graph.getStarterPack(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getStarterPack]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success || response.data?.starterPack == null) {
    return Error("apiError")
  }
  return response.data.starterPack as unknown as TIStarterPack
}

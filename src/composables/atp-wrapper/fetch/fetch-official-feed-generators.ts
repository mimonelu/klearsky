import type { AppBskyFeedDescribeFeedGenerator, AtpAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | Array<TTFeedGenerator>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyFeedDescribeFeedGenerator.Response =
    await (this.agent as AtpAgent).app.bsky.feed.describeFeedGenerator()
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/describeFeedGenerator]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return (response.data?.feeds as Array<TTFeedGenerator>) ?? []
}

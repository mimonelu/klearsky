import type { AppBskyFeedGetFeedGenerator } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  feed: string
): Promise<Error | TTFeedGenerator> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedGetFeedGenerator.QueryParams = { feed }
  const response: AppBskyFeedGetFeedGenerator.Response =
    await this.agent.app.bsky.feed.getFeedGenerator(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getFeedGenerator]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.view as TTFeedGenerator
}

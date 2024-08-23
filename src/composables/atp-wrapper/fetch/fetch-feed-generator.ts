import type { AppBskyFeedGetFeedGenerator, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  feed: string
): Promise<Error | TTFeedGenerator> {
  if (this.agent == null) return Error("noAgentError")
  const query: AppBskyFeedGetFeedGenerator.QueryParams = { feed }
  const response: AppBskyFeedGetFeedGenerator.Response =
    await (this.agent as AtpAgent).app.bsky.feed.getFeedGenerator(query)
      .then((value: AppBskyFeedGetFeedGenerator.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getFeedGenerator]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
  return response.data.view as TTFeedGenerator
}

import type { AppBskyFeedGetTimeline } from "@atproto/api"

export default async function (
  this: TIAtpWrapper
): Promise<Error | Array<TTFeed>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedGetTimeline.QueryParams = {
    // TODO: 要調査
    algorithm: "reverse-chronological",

    limit: 1,
    cursor: undefined,
  }
  const response: Error | AppBskyFeedGetTimeline.Response =
    await this.agent.getTimeline(query)
      .then((value) => value)
      .catch((error) => error)
  if (response instanceof Error) {
    console.log("[klearsky/getTimeline]", response)
    return response
  }
  if (!response.success) {
    console.log("[klearsky/getTimeline]", response)
    return Error("apiError")
  }
  return response.data.feed as Array<TTFeed>
}

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
  let response: Error | AppBskyFeedGetTimeline.Response =
    await this.agent.getTimeline(query)
      .then((value) => value)
      .catch((error) => error)
  if (response instanceof Error) {
    $log("getTimeline", response)
    return response
  }
  if (!response.success) {
    $log("getTimeline", response)
    return Error("apiError")
  }
  const feed = response.data.feed as Array<TTFeed>

  // @ts-ignore
  response = null

  return feed
}

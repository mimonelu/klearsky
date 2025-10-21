import type { AppBskyFeedSendInteractions } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  interactions: TTFeedInteraction[],
  feedGeneratorDid: string
): Promise<Error | true> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const data: AppBskyFeedSendInteractions.InputSchema = { interactions }
  const response: AppBskyFeedSendInteractions.Response | Error =
    await this.agent.app.bsky.feed.sendInteractions(data, {
      headers: {
        "atproto-proxy": `${feedGeneratorDid}#bsky_fg`,
      },
    })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/sendInteractions]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return true
}

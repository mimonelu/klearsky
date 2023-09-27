import type { AppBskyFeedDescribeFeedGenerator, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<undefined | false | Array<TTFeedGenerator>> {
  if (this.agent == null) return
  const response: AppBskyFeedDescribeFeedGenerator.Response =
    await (this.agent as BskyAgent).app.bsky.feed.describeFeedGenerator()
      .then((value: AppBskyFeedDescribeFeedGenerator.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/describeFeedGenerator]", response)
  if (!response.success) return false
  return response.data.feeds as Array<TTFeedGenerator>
}

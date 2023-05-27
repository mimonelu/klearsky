import type { AppBskyUnspeccedGetPopularFeedGenerators, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<undefined | false | Array<TTFeedGenerator>> {
  if (this.agent == null) return
  const response: AppBskyUnspeccedGetPopularFeedGenerators.Response =
    await (this.agent as BskyAgent).app.bsky.unspecced.getPopularFeedGenerators()
      .then((value: AppBskyUnspeccedGetPopularFeedGenerators.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPopularFeedGenerators]", response)
  if (!response.success) return false
  return response.data.feeds as Array<TTFeedGenerator>
}

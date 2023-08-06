import type { AppBskyUnspeccedGetPopularFeedGenerators, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentValues: Array<TTFeedGenerator>,
  limit?: number,
  cursor?: string,
): Promise<Error | undefined | string> {
  if (this.agent == null) return Error("No agent")

  const query: AppBskyUnspeccedGetPopularFeedGenerators.QueryParams = {}
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor

  const response: Error | AppBskyUnspeccedGetPopularFeedGenerators.Response =
    await (this.agent as BskyAgent).app.bsky.unspecced.getPopularFeedGenerators(query)
      .then((value: AppBskyUnspeccedGetPopularFeedGenerators.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPopularFeedGenerators]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("Failed")

  ;(response.data.feeds as Array<TTFeedGenerator>).forEach((newGenerator: TTFeedGenerator) => {
    if (currentValues.every((currentGenerator: TTFeedGenerator) => {
      return newGenerator.cid !== currentGenerator.cid
    })) currentValues.push(newGenerator)
  })

  return response.data.cursor
}

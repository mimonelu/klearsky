import type { AppBskyUnspeccedGetPopularFeedGenerators } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentValues: Array<TTFeedGenerator>,
  limit?: number,
  cursor?: string,
  term?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyUnspeccedGetPopularFeedGenerators.QueryParams = {}
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  if (term != null) {
    query.query = term
  }
  const response: Error | AppBskyUnspeccedGetPopularFeedGenerators.Response =
    await this.agent.app.bsky.unspecced.getPopularFeedGenerators(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getPopularFeedGenerators]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  ;(response.data.feeds as Array<TTFeedGenerator>)
    .forEach((newGenerator: TTFeedGenerator) => {
      if (currentValues.every((currentGenerator: TTFeedGenerator) => {
        return newGenerator.uri !== currentGenerator.uri
      })) {
        currentValues.push(newGenerator)
      }
    })

  return response.data.cursor
}

import type { AppBskyFeedGetActorFeeds } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  generators: Array<TTFeedGenerator>,
  author: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedGetActorFeeds.QueryParams = { actor: author }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | AppBskyFeedGetActorFeeds.Response =
    await this.agent.app.bsky.feed.getActorFeeds(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getActorFeeds]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  const newGenerators = (response.data.feeds as Array<TTFeedGenerator>)
    .filter((feed: TTFeedGenerator) => {
      return !generators.some((generator: TTFeedGenerator) => {
        return generator.uri === feed.uri
      })
    })
  if (cursor == null) {
    generators.unshift(...newGenerators)
  } else {
    generators.push(...newGenerators)
  }

  return response.data.cursor
}

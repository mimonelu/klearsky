import type { AppBskyFeedGetFeedGenerators, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  feeds: Array<string>
): Promise<Error | Array<TTFeedGenerator>> {
  if (this.agent == null) return Error("No agent")
  const query: AppBskyFeedGetFeedGenerators.QueryParams = { feeds }
  const response: AppBskyFeedGetFeedGenerators.Response =
    await (this.agent as BskyAgent).app.bsky.feed.getFeedGenerators(query)
      .then((value: AppBskyFeedGetFeedGenerators.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getFeedGenerators]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("Failed")

  // ジェネレーターのソート
  const generators: Array<TTFeedGenerator> = []
  feeds.forEach((uri: string) => {
    const currentGenerator = (response.data.feeds as Array<TTFeedGenerator>)
      .find((generator: TTFeedGenerator) => generator.uri === uri)
    if (currentGenerator != null) generators.push(currentGenerator)
  })

  return generators
}

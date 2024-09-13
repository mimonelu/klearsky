import type { AppBskyFeedGetFeedGenerators } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  feeds: Array<string>
): Promise<Error | Array<TTFeedGenerator>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedGetFeedGenerators.QueryParams = { feeds }
  const response: AppBskyFeedGetFeedGenerators.Response =
    await this.agent.app.bsky.feed.getFeedGenerators(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getFeedGenerators]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  // ジェネレーターのソート
  const generators: Array<TTFeedGenerator> = []
  feeds.forEach((uri: string) => {
    const currentGenerator = (response.data.feeds as Array<TTFeedGenerator>)
      .find((generator: TTFeedGenerator) => {
        return generator.uri === uri
      })
    if (currentGenerator != null) {
      generators.push(currentGenerator)
    }

    // TODO: カスタムフィードのURIではない場合（リストフィードなど）は空の TTFeedGenerator を作成
    //       リスト対応後に再実装すること
    else {
      generators.push({
        avatar: "",
        cid: "",
        creator: {
          avatar: undefined,
          description: undefined,
          did: "",
          displayName: "",
          handle: "",
          labels: undefined,
          viewer: {
            muted: false,
          },
        },
        description: uri,
        did: "",
        displayName: "(Unknown feed)",
        indexedAt: new Date().toISOString(),
        likeCount: 0,
        uri,
        viewer: {},
      })
    }
  })

  return generators
}

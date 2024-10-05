import type { ComAtprotoRepoListRecords } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentFeeds: Array<TTFeed>,
  repo: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: ComAtprotoRepoListRecords.QueryParams = {
    collection: "app.bsky.feed.like",
    repo,
  }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: ComAtprotoRepoListRecords.Response =
    await this.agent.api.com.atproto.repo.listRecords(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/listRecords/like]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  const uris: Array<string> = response.data.records
    .map((record: any) => {
      return record.value.subject.uri
    })
  const posts: Error | Array<TTPost> = await this.fetchPosts(uris)
  if (posts instanceof Error) {
    return
  }
  if (posts != null) {
    const newFeeds: Array<TTFeed> = posts
      .filter((post: TTPost) => {
        return currentFeeds.every((oldFeed: TTFeed) => {
          return oldFeed.__id !== post.uri
        })
      })
      .map((post: TTPost) => {
        // ソート用プロパティ `__createdAt` の作成
        const record = response.data.records.find((record: any) => {
          return (record.value as any).subject.uri === post.uri
        })
        const createdAt = record != null
          ? (record.value as any).createdAt
          : post.indexedAt

        return {
          __id: post.uri,
          __createdAt: createdAt,
          post,
        }
      })
    currentFeeds.push(...newFeeds)
  }

  currentFeeds.sort((a: TTFeed, b: TTFeed) => {
    const aCreatedAt = new Date(a.__createdAt as string)
    const bCreatedAt = new Date(b.__createdAt as string)
    return aCreatedAt < bCreatedAt ? 1 : aCreatedAt > bCreatedAt ? -1 : 0
  })

  return response.data.cursor
}

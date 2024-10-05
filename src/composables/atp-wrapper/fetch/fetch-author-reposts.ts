export default async function (
  this: TIAtpWrapper,
  currentFeeds: Array<TTFeed>,
  repo: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  const response = await this.fetchRecords(
    repo,
    "app.bsky.feed.repost",
    limit,
    cursor
  )
  if (response instanceof Error) {
    return response
  }
  if (response.records == null) {
    return
  }

  const uris: Array<string> = response.records
    .map((record: TICommonRecord) => {
      return record.value.subject.uri
    })
  const posts: Error | Array<TTPost> = await this.fetchPosts(uris)
  if (posts instanceof Error) {
    return posts
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
        const record = response.records.find((record: TICommonRecord) => {
          return record.value.subject.uri === post.uri
        })
        const createdAt = record != null
          ? record.value.createdAt
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

  return response.cursor
}

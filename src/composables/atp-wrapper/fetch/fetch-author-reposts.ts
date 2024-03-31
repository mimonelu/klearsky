export default async function (
  this: TIAtpWrapper,
  currentFeeds: Array<TTFeed>,
  repo: string,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  const query: Record<string, string> = {
    collection: "app.bsky.feed.repost",
    repo,
  }
  if (limit != null) query.limit = limit.toString()
  if (cursor != null) query.cursor = cursor

  // TODO: PDS分割に伴う暫定処置
  const response = await this.fetchWithoutAgent("com.atproto.repo.listRecords", repo, query)

  if (response instanceof Error) return
  if (response == null) return
  const data = await response.json()
  if (data?.records == null) return
  const uris: Array<string> = data.records.map((record: any) => {
    return record.value.subject.uri
  })
  const posts: undefined | false | Array<TTPost> = await this.fetchPosts(uris)
  if (posts === false) return
  if (posts != null) {
    const newFeeds: Array<TTFeed> = posts
      .filter((post: TTPost) => {
        return currentFeeds.every((oldFeed: TTFeed) => {
          return oldFeed.__id !== post.cid
        })
      })
      .map((post: TTPost) => {
        // ソート用プロパティ `__createdAt` の作成
        const record = data.records.find((record: any) => {
          return (record.value as any).subject.cid === post.cid
        })
        const createdAt = record != null
          ? (record.value as any).createdAt
          : post.indexedAt

        return {
          __id: post.cid,
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

  return data.cursor
}

import type { BskyAgent, ComAtprotoRepoListRecords } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentFeeds: Array<TTFeed>,
  repo: string,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: ComAtprotoRepoListRecords.QueryParams = {
    collection: "app.bsky.feed.like",
    repo,
  }
  if (limit != null) query.limit = limit
  if (cursor != null) query.rkeyEnd = cursor
  const response: ComAtprotoRepoListRecords.Response =
    await (this.agent as BskyAgent).api.com.atproto.repo.listRecords(query)
  console.log("[klearsky/listRecords/like]", response)
  if (!response.success) return

  const uris: Array<string> = response.data.records.map((record: any) => {
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
        const record = response.data.records.find((record: any) => {
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

  return response.data.cursor
}

import type { BskyAgent, ComAtprotoRepoListRecords } from "@atproto/api"

let id = 0

export default async function (
  this: TIAtpWrapper,
  currentAuthorReposts: Array<TTFeed>,
  repo: string,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: ComAtprotoRepoListRecords.QueryParams = {
    collection: "app.bsky.feed.repost",
    repo,
  }
  if (limit != null) query.limit = limit
  if (cursor != null) query.rkeyEnd = cursor
  const response: ComAtprotoRepoListRecords.Response = await (
    this.agent as BskyAgent
  ).api.com.atproto.repo.listRecords(query)
  console.log("[klearsky/listRecords/repost]", response)
  if (!response.success) return

  const tasks: Array<Promise<null | TTPost>> = (
    response.data.records as Array<TTRecord>
  ).map(async (record: TTRecord) => {
    try {
      const responses: null | Array<TTPost> = await this.fetchPostThread(
        record.value.subject.uri,
        0
      )
      if (responses == null || responses.length === 0) return null
      responses[0].__createdAt = record.value.createdAt
      return responses[0]
    } catch (error) {
      console.error(error)
    }
    return null
  })

  const responses = await Promise.all(tasks)

  responses.forEach((post: null | TTPost) => {
    if (post == null) return
    const existingIndex = currentAuthorReposts.findIndex(
      (currentFeed: TTFeed) => currentFeed.post.cid === post.cid
    )
    if (existingIndex === -1) currentAuthorReposts.push({
      __id: `authorRepost-${id ++}`,
      post,
    })
    else currentAuthorReposts[existingIndex].post = post
  })

  currentAuthorReposts.sort((a: TTFeed, b: TTFeed) => {
    const aCreatedAt = new Date(a.post.__createdAt)
    const bCreatedAt = new Date(b.post.__createdAt)
    return aCreatedAt < bCreatedAt ? 1 : aCreatedAt > bCreatedAt ? -1 : 0
  })

  return response.data.cursor
}

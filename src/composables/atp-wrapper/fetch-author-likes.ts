import type { BskyAgent, ComAtprotoRepoListRecords } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentAuthorLikes: Array<TTFeed>,
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
  const response: ComAtprotoRepoListRecords.Response = await (
    this.agent as BskyAgent
  ).api.com.atproto.repo.listRecords(query)
  console.log("[klearsky/listRecords/like]", response)
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
    const existingIndex = currentAuthorLikes.findIndex(
      (currentFeed: TTFeed) => currentFeed.post.cid === post.cid
    )
    if (existingIndex === -1) currentAuthorLikes.push({ post })
    else currentAuthorLikes[existingIndex].post = post
  })

  currentAuthorLikes.sort((a: TTFeed, b: TTFeed) => {
    const aCreatedAt = new Date(a.post.__createdAt)
    const bCreatedAt = new Date(b.post.__createdAt)
    return aCreatedAt < bCreatedAt ? 1 : aCreatedAt > bCreatedAt ? -1 : 0
  })

  return response.data.cursor
}

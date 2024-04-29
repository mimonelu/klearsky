import AtpUtil from "@/composables/atp-wrapper/atp-util"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  oldPosts: Array<TTPost>,
  direction: "new" | "old",
  author: TTUser,
  limit?: number
): Promise<Error | undefined | string> {
  const query: Record<string, string> = {
    collection: "app.bsky.feed.post",
    repo: author.did,
    reverse: direction === "new" ? "true" : "false",
  }
  if (limit != null) query.limit = limit.toString()
  const rkey: undefined | string = oldPosts.length > 0
    ? direction === "new"
      ? Util.getRkey(oldPosts[0].uri)
      : Util.getRkey((oldPosts.at(- 1) as TTPost).uri)
    : undefined
  if (rkey != null) {
    query.cursor = rkey
  }

  // TODO: PDS分割に伴う暫定処置
  const response = await this.fetchWithoutAgent("com.atproto.repo.listRecords", author.did, query)

  if (response instanceof Error) return response
  const data = await response.json()
  if (data?.records == null) return
  ;(data.records as TTRecord[]).forEach((record: TTRecord) => {
    if (oldPosts.some((oldPost: TTPost) => oldPost.uri === record.uri)) return
    // @ts-ignore
    const feeds: TTFeed[] = [{
      post: {
        __id: oldPosts.length.toString(),
        __custom: {},
        author,
        uri: record.uri,
        cid: record.cid,
        record: {
          $type: record.value.$type,
          createdAt: record.value.createdAt,
          text: record.value.text as string,
        },
        replyCount: 0,
        repostCount: 0,
        likeCount: 0,
        indexedAt: record.value.createdAt,
        viewer: {},
      },
    }]
    if (record.value.embed != null) feeds[0].post.record.embed = record.value.embed as any
    if (record.value.facets != null) feeds[0].post.record.facets = record.value.facets
    if (record.value.langs != null) feeds[0].post.record.langs = record.value.langs
    if (record.value.reply != null) feeds[0].post.record.reply = record.value.reply
    AtpUtil.coherentResponses(feeds)
    if (direction === "new") oldPosts.unshift(feeds[0].post)
    else oldPosts.push(feeds[0].post)
  })
  return data.cursor
}

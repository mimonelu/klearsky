import type { BskyAgent, ComAtprotoRepoListRecords } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  oldPosts: Array<TTPost>,
  direction: "new" | "old",
  author: TTUser,
  limit?: number
): Promise<Error | undefined | string> {
  if (this.agent == null) return Error("No agent")
  const query: ComAtprotoRepoListRecords.QueryParams = {
    collection: "app.bsky.feed.post",
    repo: author.did,
    reverse: direction === "new" ? true : false,
  }
  if (limit != null) query.limit = limit
  const rkey: undefined | string = oldPosts.length > 0
    ? direction === "new"
      ? Util.getRkey(oldPosts[0].uri)
      : Util.getRkey((oldPosts.at(- 1) as TTPost).uri)
    : undefined
  if (rkey != null) {
    if (direction === "new") query.rkeyStart = rkey
    else query.rkeyEnd = rkey
  }
  const response: ComAtprotoRepoListRecords.Response =
    await (this.agent as BskyAgent).api.com.atproto.repo.listRecords(query)
      .then((value: ComAtprotoRepoListRecords.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/listRecords/authorPosts]", response)
  if (response instanceof Error) return response
  if (!response.success || response.data.records == null) return Error("Failed")
  ;(response.data.records as TTRecord[]).forEach((record: TTRecord) => {
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
  return response.data.cursor
}

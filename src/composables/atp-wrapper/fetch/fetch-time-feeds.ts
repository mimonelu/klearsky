import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  oldPosts: Array<TTPost>,
  direction: "new" | "old",
  author: TTUser,
  limit?: number
): Promise<Error | undefined | string> {
  const rkey: undefined | string = oldPosts.length > 0
    ? direction === "new"
      ? Util.getRkey(oldPosts[0].uri)
      : Util.getRkey((oldPosts.at(- 1) as TTPost).uri)
    : undefined

  const response = await this.fetchRecords(
    author.did,
    "app.bsky.feed.post",
    limit,
    rkey,
    direction === "new"
  )
  if (response instanceof Error) {
    return response
  }
  response.records.forEach((record: TICommonRecord) => {
    if (oldPosts.some((oldPost: TTPost) => oldPost.uri === record.uri)) {
      return
    }

    const feeds: TTFeed[] = [{
      __id: oldPosts.length.toString(),
      post: {
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
        quoteCount: 0,
        indexedAt: record.value.createdAt,
        viewer: {},
      },
    }]

    if (record.value.embed != null) {
      feeds[0].post.record.embed = record.value.embed as any
    }
    if (record.value.facets != null) {
      feeds[0].post.record.facets = record.value.facets
    }
    if (record.value.langs != null) {
      feeds[0].post.record.langs = record.value.langs
    }
    if (record.value.reply != null) {
      feeds[0].post.record.reply = record.value.reply
    }
    Util.sanitizePostsOrFeeds(feeds)
    if (direction === "new") {
      oldPosts.unshift(feeds[0].post)
    } else {
      oldPosts.push(feeds[0].post)
    }
  })
  return response.cursor
}

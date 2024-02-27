import type { AppBskyFeedGetTimeline, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  replyFolding?: string,
  repostFolding?: string,
  limit?: number,
  cursor?: string,
  middle?: boolean
): Promise<undefined | false | string> {
  if (this.agent == null) return
  const query: AppBskyFeedGetTimeline.QueryParams = {
    // TODO: 要調査
    algorithm: "reverse-chronological",
  }
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyFeedGetTimeline.Response =
    await (this.agent as BskyAgent).getTimeline(query)
      .then((value: AppBskyFeedGetTimeline.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getTimeline]", response)
  if (!response.success) return false
  ;(response.data.feed as Array<TTFeed>).forEach((feed: TTFeed) => {
    // リプライ
    if (feed.reply != null) {
      // リプライの折り畳み - すべて（自分自身へのリプライ・投稿ユーザー自身へのリプライは除外）
      if (replyFolding === "all") {
        if (feed.reply?.parent.author.did !== feed.post.author.did &&
            feed.reply?.parent.author.did !== this.session?.did) {
          feed.__folding = true
        }

      // リプライの折り畳み - 適度（自分自身へのリプライ・投稿ユーザー自身へのリプライ・フォロイーへのリプライは除外）
      } else if (replyFolding === "recommended") {
        if (feed.reply?.parent.author.did !== feed.post.author.did &&
            feed.reply?.parent.author.did !== this.session?.did &&
            feed.reply?.parent.author.viewer.following == null) {
          feed.__folding = true
        }
      }
    }

    // リポスト
    if (feed.reason != null) {
      // リポストの折り畳み - すべて（自分自身のリポスト・投稿ユーザー自身のリポストは除外）
      if (repostFolding === "all") {
        if (feed.reason?.by.did !== feed.post.author.did &&
            feed.post.author.did !== this.session?.did) {
          feed.__folding = true
        }

      // リポストの折り畳み - 適度（自分自身のリポスト・投稿ユーザー自身のリポスト・フォロイー以外のリポストは除外）
      } else if (repostFolding === "recommended") {
        if (feed.reason?.by.did !== feed.post.author.did &&
            feed.post.author.did !== this.session?.did &&
            feed.post.author.viewer.following != null) {
          feed.__folding = true
        }
      }
    }

    // TODO: 引用リポスト
    /*
    if (feed.post.embed?.$type === "app.bsky.embed.record#view") {
      feed.__folding = true
    }
    */
  })

  // TODO:
  AtpUtil.coherentResponses(response.data.feed)
  const isNotFirstFetch = oldFeeds.length > 0
  const isAllNew = AtpUtil.mergeFeeds(
    oldFeeds,
    response.data.feed as Array<TTFeed>,
    cursor == null,
    middle ? cursor : undefined
  )
  if (isNotFirstFetch && isAllNew && (cursor == null || middle)) {
    const initialFeed = response.data.feed[0]
    if (initialFeed != null) initialFeed.__cursor = response.data.cursor
  }
  // AtpUtil.sortFeeds(oldFeeds)

  return response.data.cursor
}

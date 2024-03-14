import type { AppBskyFeedGetTimeline, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  replyFolding?: Array<number>,
  repostFolding?: Array<number>,
  limit?: number,
  cursor?: string,
  direction?: TTDirection
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
    if (feed.reply != null && replyFolding != null) {
      // 投稿者自身へのリプライ
      if (
        replyFolding.includes(1) &&
        feed.reply?.parent.author.did === feed.post.author.did
      ) feed.__folding = true

      // あなたへのリプライ
      if (
        replyFolding.includes(2) &&
        feed.reply?.parent.author.did === this.session?.did
      ) feed.__folding = true

      // あなたをフォローしていないユーザーへのリプライ
      if (
        replyFolding.includes(3) &&
        feed.reply?.parent.author.did !== this.session?.did &&
        feed.reply?.parent.author.viewer.followedBy == null
      ) feed.__folding = true

      // あなたがフォローしていないユーザーへのリプライ
      if (
        replyFolding.includes(4) &&
        feed.reply?.parent.author.did !== this.session?.did &&
        feed.reply?.parent.author.viewer.following == null
      ) feed.__folding = true

      // あなたがフォローしているユーザーへのリプライ
      if (
        replyFolding.includes(5) &&
        feed.reply?.parent.author.viewer.following != null
      ) feed.__folding = true
    }

    // リポスト
    if (feed.reason != null && repostFolding != null) {
      // 自分自身のポストのリポスト
      if (
        repostFolding.includes(1) &&
        feed.reason?.by.did === feed.post.author.did
      ) feed.__folding = true

      // あなたのポストのリポスト
      if (
        repostFolding.includes(2) &&
        feed.post.author.did === this.session?.did
      ) feed.__folding = true

      // あなたをフォローしていないユーザーのポストのリポスト
      if (
        repostFolding.includes(3) &&
        feed.post.author.did !== this.session?.did &&
        feed.post.author.viewer.followedBy == null
      ) feed.__folding = true

      // あなたがフォローしていないユーザーのポストのリポスト
      if (
        repostFolding.includes(4) &&
        feed.post.author.did !== this.session?.did &&
        feed.post.author.viewer.following == null
      ) feed.__folding = true

      // あなたがフォローしているユーザーのポストのリポスト
      if (
        repostFolding.includes(5) &&
        feed.post.author.viewer.following != null
      ) feed.__folding = true
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
  const isFirstFetch = oldFeeds.length === 0
  const isAllNew = AtpUtil.mergeFeeds(
    oldFeeds,
    response.data.feed as Array<TTFeed>,
    cursor == null,
    direction === "middle" ? cursor : undefined
  )
  if (!isFirstFetch && isAllNew && (cursor == null || direction === "middle")) {
    const initialFeed = response.data.feed[0]
    if (initialFeed != null) initialFeed.__cursor = response.data.cursor
  }
  // AtpUtil.sortFeeds(oldFeeds)

  if (direction !== "old" && !isFirstFetch) return

  return response.data.cursor
}

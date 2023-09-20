import type { AppBskyFeedGetTimeline, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  oldFeeds: Array<TTFeed>,
  replyControl?: Array<number>,
  repostControl?: Array<number>,
  limit?: number,
  cursor?: string,
  middle?: boolean
): Promise<undefined | false | string> {
  if (this.agent == null) return
  const query: AppBskyFeedGetTimeline.QueryParams = {
    // TODO: 要調査
    // FYI: https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/app-view/api/app/bsky/util/feed.ts#L72
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
      // 自分自身へのリプライ
      if (
        replyControl?.includes(1) &&
        feed.reply?.parent.author.did === feed.post.author.did
      ) feed.__folding = true

      // あなたへのリプライ
      if (
        replyControl?.includes(2) &&
        feed.reply?.parent.author.did === this.session?.did
      ) feed.__folding = true

      // あなたをフォローしていないユーザーへのリプライ
      if (
        replyControl?.includes(3) &&
        feed.reply?.parent.author.did !== this.session?.did &&
        feed.reply?.parent.author.viewer.followedBy == null
      ) feed.__folding = true

      // あなたがフォローしていないユーザーへのリプライ
      if (
        replyControl?.includes(4) &&
        feed.reply?.parent.author.did !== this.session?.did &&
        feed.reply?.parent.author.viewer.following == null
      ) feed.__folding = true

      // あなたがフォローしているユーザーへのリプライ
      if (
        replyControl?.includes(5) &&
        feed.reply?.parent.author.viewer.following != null
      ) feed.__folding = true
    }

    // リポスト
    if (feed.reason != null) {
      // 自分自身のポストのリポスト
      if (
        repostControl?.includes(1) &&
        feed.reason?.by.did === feed.post.author.did
      ) feed.__folding = true

      // あなたのポストのリポスト
      if (
        repostControl?.includes(2) &&
        feed.post.author.did === this.session?.did
      ) feed.__folding = true

      // あなたをフォローしていないユーザーのポストのリポスト
      if (
        repostControl?.includes(3) &&
        feed.post.author.did !== this.session?.did &&
        feed.post.author.viewer.followedBy == null
      ) feed.__folding = true

      // あなたがフォローしていないユーザーのポストのリポスト
      if (
        repostControl?.includes(4) &&
        feed.post.author.did !== this.session?.did &&
        feed.post.author.viewer.following == null
      ) feed.__folding = true

      // あなたがフォローしているユーザーのポストのリポスト
      if (
        repostControl?.includes(5) &&
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

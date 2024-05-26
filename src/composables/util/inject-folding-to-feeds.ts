export default function (
  feeds: Array<TTFeed>,
  did?: string,
  replyFoldingSettings?: Array<number>,
  repostFoldingSettings?: Array<number>
) {
  feeds.forEach((feed: TTFeed) => {
    // リプライ
    if (feed.reply != null && replyFoldingSettings != null) {
      // 投稿者自身へのリプライ
      if (
        replyFoldingSettings.includes(1) &&
        feed.reply?.parent.author?.did === feed.post.author.did
      ) {
        feed.__folding = true
      }

      // あなたへのリプライ
      if (
        replyFoldingSettings.includes(2) &&
        feed.reply?.parent.author?.did === did
      ) {
        feed.__folding = true
      }

      // あなたをフォローしていないユーザーへのリプライ
      if (
        replyFoldingSettings.includes(3) &&
        feed.reply?.parent.author?.did !== did &&
        feed.reply?.parent.author?.viewer.followedBy == null
      ) {
        feed.__folding = true
      }

      // あなたがフォローしていないユーザーへのリプライ
      if (
        replyFoldingSettings.includes(4) &&
        feed.reply?.parent.author?.did !== did &&
        feed.reply?.parent.author?.viewer.following == null
      ) {
        feed.__folding = true
      }

      // あなたがフォローしているユーザーへのリプライ
      if (
        replyFoldingSettings.includes(5) &&
        feed.reply?.parent.author?.viewer.following != null
      ) {
        feed.__folding = true
      }
    }

    // リポスト
    if (feed.reason != null && repostFoldingSettings != null) {
      // 自分自身のポストのリポスト
      if (
        repostFoldingSettings.includes(1) &&
        feed.reason?.by.did === feed.post.author.did
      ) {
        feed.__folding = true
      }

      // あなたのポストのリポスト
      if (
        repostFoldingSettings.includes(2) &&
        feed.post.author.did === did
      ) {
        feed.__folding = true
      }

      // あなたをフォローしていないユーザーのポストのリポスト
      if (
        repostFoldingSettings.includes(3) &&
        feed.post.author.did !== did &&
        feed.post.author.viewer.followedBy == null
      ) {
        feed.__folding = true
      }

      // あなたがフォローしていないユーザーのポストのリポスト
      if (
        repostFoldingSettings.includes(4) &&
        feed.post.author.did !== did &&
        feed.post.author.viewer.following == null
      ) {
        feed.__folding = true
      }

      // あなたがフォローしているユーザーのポストのリポスト
      if (
        repostFoldingSettings.includes(5) &&
        feed.post.author.viewer.following != null
      ) {
        feed.__folding = true
      }
    }

    // TODO: 引用リポスト
    /*
    if (feed.post.embed?.$type === "app.bsky.embed.record#view") {
      feed.__folding = true
    }
    */
  })
}

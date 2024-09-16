export default function updatePostProps (src: TTPost, dst: TTPost) {
  if (src == null || dst == null) return

  // 返信数の更新
  // ※自身が返信したかどうかは判別不可能
  src.replyCount = dst.replyCount

  // リポスト数とリポスト情報の更新
  src.repostCount = dst.repostCount
  if (src.viewer != null && dst.viewer != null) {
    if (dst.viewer.repost == null) {
      delete src.viewer.repost
    } else {
      src.viewer.repost = dst.viewer.repost
    }
  }

  // 引用リポスト数の更新
  src.quoteCount = dst.quoteCount

  // 引用リポストの無効化フラグの更新
  if (src.viewer != null && dst.viewer != null) {
    if (dst.viewer.embeddingDisabled == null) {
      delete src.viewer.embeddingDisabled
    } else {
      src.viewer.embeddingDisabled = dst.viewer.embeddingDisabled
    }
  }

  // いいね数といいね情報の更新
  src.likeCount = dst.likeCount
  if (src.viewer != null && dst.viewer != null) {
    if (dst.viewer.like == null) {
      delete src.viewer.like
    } else {
      src.viewer.like = dst.viewer.like
    }
  }

  // 引用リポスト等の更新
  if (dst.embed == null) {
    delete src.embed
  } else  {
    src.embed = dst.embed
  }
  if (dst.record != null) {
    src.record = dst.record
  }

  // Threadgate の更新
  src.threadgate = dst.threadgate
}

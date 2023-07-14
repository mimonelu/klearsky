export default function updateReactions (src: any, dst: any) {
  if (src == null || dst == null) return

  // 返信数の更新
  // ※自身が返信したかどうかは判別不可能
  src.replyCount = dst.replyCount

  // リポスト数とリポスト情報の更新
  src.repostCount = dst.repostCount
  if (src.viewer != null && dst.viewer != null) {
    if (dst.viewer.repost == null) delete src.viewer.repost
    else src.viewer.repost = dst.viewer.repost
  }

  // いいね数といいね情報の更新
  src.likeCount = dst.likeCount
  if (src.viewer != null && dst.viewer != null) {
    if (dst.viewer.like == null) delete src.viewer.like
    else src.viewer.like = dst.viewer.like
  }
}

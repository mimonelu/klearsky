let id = 0

export default function (oldFeeds: Array<TTFeed>, targetFeeds: Array<TTFeed>) {
  targetFeeds.forEach((targetFeed: TTFeed) => {
    if (targetFeed.__id == null) targetFeed.__id = `feed-${id ++}`

    const index: number = oldFeeds.findIndex(
      (oldFeed: TTFeed) => oldFeed.post?.cid === targetFeed.post?.cid
    )

    // 新規フィード
    if (index === -1) oldFeeds.push(targetFeed)
    // 既存フィードに `post` がない場合はスキップ（おそらく該当ケースなし）
    else if (oldFeeds[index].post == null) oldFeeds[index] = targetFeed
    // 対象フィードに `post` がない場合はスキップ（おそらく該当ケースなし）
    else if (targetFeed.post == null) return
    // 対象フィードがリポストの場合はスキップ
    else if (targetFeed.reason != null) return
    // 登録日時を考慮して既存フィードを上書き
    else {
      // 既存フィードの登録日時
      const oldDate = new Date(
        oldFeeds[index].post.__reason?.indexedAt ??
          oldFeeds[index].post.indexedAt
      )

      // 対象フィードの登録日時
      const targetDate = new Date(
        targetFeed.post.__reason?.indexedAt ?? targetFeed.post.indexedAt
      )

      if (oldDate > targetDate) return
      const oldId = oldFeeds[index].__id
      const oldFolding = oldFeeds[index].__folding
      const oldReplyDisplay = oldFeeds[index].__replyDisplay
      oldFeeds[index] = targetFeed
      oldFeeds[index].__id = oldId
      oldFeeds[index].__folding = oldFolding
      oldFeeds[index].__replyDisplay = oldReplyDisplay
    }
  })
}

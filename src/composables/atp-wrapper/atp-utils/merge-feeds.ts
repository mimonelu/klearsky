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
      let oldFeed = oldFeeds[index]

      // 既存フィードの登録日時
      const oldDate = new Date(
        oldFeed.post.__reason?.indexedAt ??
          oldFeed.post.indexedAt
      )

      // 対象フィードの登録日時
      const targetDate = new Date(
        targetFeed.post.__reason?.indexedAt ?? targetFeed.post.indexedAt
      )

      if (oldDate > targetDate) return
      const oldId = oldFeed.__id
      const oldFolding = oldFeed.__folding
      const oldReplyDisplay = oldFeed.__replyDisplay

      // 自動翻訳
      const oldTranslatedTextOfPost = oldFeed.post.__translatedText
      const oldTranslatedTextOfRoot = oldFeed.reply?.root.__translatedText
      const oldTranslatedTextOfParent = oldFeed.reply?.parent.__translatedText

      oldFeeds[index] = targetFeed
      oldFeed = oldFeeds[index]

      oldFeed.__id = oldId
      oldFeed.__folding = oldFolding
      oldFeed.__replyDisplay = oldReplyDisplay

      // 自動翻訳
      oldFeed.post.__translatedText = oldTranslatedTextOfPost
      if (oldFeed.reply != null) {
        oldFeed.reply.root.__translatedText = oldTranslatedTextOfRoot
        oldFeed.reply.parent.__translatedText = oldTranslatedTextOfParent
      }
    }
  })
}

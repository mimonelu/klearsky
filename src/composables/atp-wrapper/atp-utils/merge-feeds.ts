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
        oldFeed.post.__custom.reason?.indexedAt ??
          oldFeed.post.indexedAt
      )

      // 対象フィードの登録日時
      const targetDate = new Date(
        targetFeed.post.__custom.reason?.indexedAt ?? targetFeed.post.indexedAt
      )

      if (oldDate > targetDate) return
      const oldId = oldFeed.__id
      const oldFolding = oldFeed.__folding
      const oldReplyDisplay = oldFeed.__replyDisplay

      // __custom の退避
      const oldCustomPropsOfPost = oldFeed.post.__custom
      const oldCustomPropsOfQuote1 = oldFeed.post.embed?.record?.__custom
      const oldCustomPropsOfQuote2 = oldFeed.post.embed?.record?.embed?.record?.__custom
      const oldCustomPropsOfRoot = oldFeed.reply?.root?.__custom
      const oldCustomPropsOfParent = oldFeed.reply?.parent?.__custom

      oldFeeds[index] = targetFeed
      oldFeed = oldFeeds[index]

      oldFeed.__id = oldId
      oldFeed.__folding = oldFolding
      oldFeed.__replyDisplay = oldReplyDisplay

      // __custom の復帰
      oldFeed.post.__custom = oldCustomPropsOfPost
      if (oldFeed.post.embed?.record != null && oldCustomPropsOfQuote1 != null) {
        oldFeed.post.embed.record.__custom = oldCustomPropsOfQuote1
      }
      if (oldFeed.post.embed?.record?.embed?.record != null && oldCustomPropsOfQuote2 != null) {
        oldFeed.post.embed.record.embed.record.__custom = oldCustomPropsOfQuote2
      }
      if (oldFeed.reply != null) {
        if (oldCustomPropsOfRoot != null) oldFeed.reply.root.__custom = oldCustomPropsOfRoot
        if (oldCustomPropsOfParent != null) oldFeed.reply.parent.__custom = oldCustomPropsOfParent
      }
    }
  })
}

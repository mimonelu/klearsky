let id = 0

export default function (
  oldFeeds: Array<TTFeed>,
  targetFeeds: Array<TTFeed>,
  doesUnshift?: boolean,
  middleCursor?: string
): boolean {
  const addings: Array<TTFeed> = []

  // 重複フィード（リポスト）を除去
  const map = new Map()
  targetFeeds.reverse().forEach((targetFeed: TTFeed) => {
    if (!map.has(targetFeed.post.uri)) {
      map.set(targetFeed.post.uri, targetFeed)
    }
  })

  // 抜け漏れフラグ
  let isAllNew = true

  Array.from(map.values()).reverse().forEach((targetFeed: TTFeed) => {
    // `__id` のインジェクション
    if (targetFeed.__id == null) {
      targetFeed.__id = `feed-${id ++}`
    }

    const oldIndex: number = oldFeeds.findIndex((oldFeed: TTFeed) => {
      return oldFeed.post?.uri === targetFeed.post?.uri
    })

    // 新規フィード
    if (oldIndex === - 1) {
      addings.push(targetFeed)
    }

    // 既存フィード
    else {
      isAllNew = false

      // 既存フィードに `post` がない場合はスキップ（おそらく該当ケースなし）
      if (oldFeeds[oldIndex].post == null) oldFeeds[oldIndex] = targetFeed
      // 対象フィードに `post` がない場合はスキップ（おそらく該当ケースなし）
      else if (targetFeed.post == null) return
      // 対象フィードがリポストの場合はスキップ
      else if (targetFeed.reason != null) return
      // 登録日時を考慮して既存フィードを上書き
      else {
        let oldFeed = oldFeeds[oldIndex]

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
        // 現インジェクションプロパティの退避
        const oldCursor = oldFeed.__cursor
        const oldId = oldFeed.__id
        const oldFolding = oldFeed.__folding
        const oldReplyDisplay = oldFeed.__replyDisplay
        const oldFetchLine = oldFeed.__fetchingLine

        // __custom の退避
        const oldCustomPropsOfPost = oldFeed.post.__custom
        const oldCustomPropsOfQuote1 = oldFeed.post.embed?.record?.__custom
        const oldCustomPropsOfQuote2 = oldFeed.post.embed?.record?.embed?.record?.__custom
        const oldCustomPropsOfRoot = oldFeed.reply?.root?.__custom
        const oldCustomPropsOfParent = oldFeed.reply?.parent?.__custom

        oldFeeds[oldIndex] = targetFeed
        oldFeed = oldFeeds[oldIndex]

        // 現インジェクションプロパティの復帰
        oldFeed.__cursor = oldCursor
        oldFeed.__id = oldId
        oldFeed.__folding = oldFolding
        oldFeed.__replyDisplay = oldReplyDisplay
        oldFeed.__fetchingLine = oldFetchLine

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
    }
  })

  // 新着フィード
  if (doesUnshift) {
    // 新規取得ライン
    if (oldFeeds[0] != null && addings.length !== 0) {
      oldFeeds.forEach((oldFeed) => {
        delete oldFeed.__fetchingLine
      })
      oldFeeds[0].__fetchingLine = true
    }

    oldFeeds.unshift(...addings)
  }

  // 抜け漏れフィード
  else if (middleCursor != null) {
    const index = oldFeeds.findIndex((oldFeed: TTFeed) => oldFeed.__cursor === middleCursor)
    if (index !== - 1) {
      delete oldFeeds[index].__cursor
      oldFeeds.splice(index + 1, 0, ...addings)
    }
  }

  // 過去フィード
  else {
    oldFeeds.push(...addings)
  }

  return isAllNew
}

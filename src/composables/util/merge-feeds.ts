import { toRaw } from "vue"
import inheritQuoteCustom from "@/composables/util/inherit-quote-custom"

let id = 0

export default function (
  oldFeeds: Array<TTFeed>,
  targetFeeds: Array<TTFeed>,
  cursor?: string,
  direction?: TTDirection,
  nextCursor?: string
) {
  const isFirstFetch = oldFeeds.length === 0
  const doesUnshift = cursor == null
  const middleCursor = direction === "middle" ? cursor : undefined
  const addings: Array<TTFeed> = []

  // 重複フィード（リポスト）を除去
  const map = new Map()
  targetFeeds.slice().reverse().forEach((targetFeed: TTFeed) => {
    if (!map.has(targetFeed.post.uri)) {
      map.set(targetFeed.post.uri, targetFeed)
    }
  })

  // 既存フィードの URI → インデックス
  // ループ中の `oldFeeds` の変更は同じ位置への置き換えのみで、追加はループ後のため、インデックスはずれない
  const oldIndexMap = new Map<string, number>()
  toRaw(oldFeeds).forEach((oldFeed: TTFeed, index: number) => {
    const uri = oldFeed.post?.uri
    if (uri != null && !oldIndexMap.has(uri)) {
      oldIndexMap.set(uri, index)
    }
  })

  // 抜け漏れフラグ
  let isAllNew = true

  Array.from(map.values()).reverse().forEach((targetFeed: TTFeed) => {
    // `__id` のインジェクション
    if (targetFeed.__id == null) {
      targetFeed.__id = `feed-${id ++}`
    }

    const oldIndex: number = oldIndexMap.get(targetFeed.post?.uri) ?? - 1

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
      else if (targetFeed.reason?.$type === "app.bsky.feed.defs#reasonRepost") return
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
        const oldEmbed = oldFeed.post.embed
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
        inheritQuoteCustom(oldEmbed, oldFeed.post.embed)
        if (oldFeed.reply != null) {
          if (oldCustomPropsOfRoot != null) oldFeed.reply.root.__custom = oldCustomPropsOfRoot
          if (oldCustomPropsOfParent != null) oldFeed.reply.parent.__custom = oldCustomPropsOfParent
        }
      }
    }
  })

  // 抜け漏れ取得ボタンの付け先（実際に追加したフィードの最古）
  let anchorFeed: undefined | TTFeed = addings[addings.length - 1]

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

    // 挿入位置がなければ取得分を捨てる
    if (index === - 1) return

    const middleFeed = oldFeeds[index]
    delete middleFeed.__cursor
    oldFeeds.splice(index + 1, 0, ...addings)

    // 1 件も追加されなければ、続きを取得できるよう元のフィードにボタンを残す
    // 同じカーソルが返った時は取得が進まないので残さない
    if (addings.length === 0 && nextCursor !== middleCursor) anchorFeed = middleFeed
  }

  // 過去フィード
  else {
    oldFeeds.push(...addings)
  }

  // 抜け漏れ取得ボタン
  if (
    !isFirstFetch &&
    isAllNew &&
    nextCursor != null &&
    (doesUnshift || middleCursor != null) &&
    anchorFeed != null
  ) {
    anchorFeed.__cursor = nextCursor
  }
}

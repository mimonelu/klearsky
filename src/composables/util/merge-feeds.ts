import { toRaw } from "vue"
import inheritQuoteCustom from "@/composables/util/inherit-quote-custom"

let id = 0

export default function (
  oldFeeds: Array<TTFeed>,
  targetFeeds: Array<TTFeed>,
  cursor?: string,
  direction?: TTDirection,
  nextCursor?: string,
  repostMutes?: Array<TIRepostMuteSubject>
) {
  const isFirstFetch = oldFeeds.length === 0
  const doesUnshift = cursor == null
  const middleCursor = direction === "middle" ? cursor : undefined
  const addings: Array<TTFeed> = []

  // 重複フィード（リポスト）を除去
  // 最古のフィードを残す。ただし、リポストミュートの対象で隠れないよう、対象外のフィードを優先する
  const map = new Map<string, TTFeed>()
  targetFeeds.slice().reverse().forEach((targetFeed: TTFeed) => {
    const uri = targetFeed.post.uri
    const currentFeed = map.get(uri)
    if (currentFeed == null) {
      map.set(uri, targetFeed)
    } else if (isRepostMuted(currentFeed, repostMutes) && !isRepostMuted(targetFeed, repostMutes)) {
      // 残すフィードの位置に入れ直す
      map.delete(uri)
      map.set(uri, targetFeed)
    }
  })

  // 既存フィードの URI → インデックス
  // `oldFeeds` への追加はループ後のため、インデックスはずれない
  const rawOldFeeds = toRaw(oldFeeds)
  const oldIndexMap = new Map<string, number>()
  rawOldFeeds.forEach((oldFeed: TTFeed, index: number) => {
    const uri = oldFeed.post?.uri
    if (uri != null && !oldIndexMap.has(uri)) {
      oldIndexMap.set(uri, index)
    }
  })

  const isConnected = checkConnection(rawOldFeeds, oldIndexMap, targetFeeds)

  Array.from(map.values()).reverse().forEach((targetFeed: TTFeed) => {
    const oldIndex = oldIndexMap.get(targetFeed.post.uri)

    // 新規フィード
    if (oldIndex == null) {
      // `__id` のインジェクション
      if (targetFeed.__id == null) {
        targetFeed.__id = `feed-${id ++}`
      }

      addings.push(targetFeed)
    }

    // 既存フィード
    else {
      updateFeed(oldFeeds[oldIndex], targetFeed, repostMutes)
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
    !isConnected &&
    nextCursor != null &&
    (doesUnshift || middleCursor != null) &&
    anchorFeed != null
  ) {
    anchorFeed.__cursor = nextCursor
  }
}

// 取得分が既存フィードとつながっているかを、取得分の最古から順に見て判定する
// 時系列のフィードなら、つながっている時は最古のフィードが既存フィードに含まれる
// ピン留めや再登場は時系列と関係ない位置に返るので、「1 件でも一致すればつながっている」とはみなさない
// NOTICE: 重複を除く前の取得分を渡すこと。除いた後だと、既存フィードと一致するフィードが捨てられていることがある
function checkConnection (
  rawOldFeeds: Array<TTFeed>,
  oldIndexMap: Map<string, number>,
  targetFeeds: Array<TTFeed>
): boolean {
  // 既存フィードの最古が取得分にあれば、取得分は既存フィードの末尾まで届いている
  // 既存フィードの件数が取得の上限に近い時は、取得分の最古が末尾を越えることがあるため、先に確認する
  const oldestOldFeed = rawOldFeeds[rawOldFeeds.length - 1]
  const reachesOldest = targetFeeds.some((targetFeed: TTFeed) => {
    return targetFeed.post.uri === oldestOldFeed?.post?.uri && hasSameReason(oldestOldFeed, targetFeed)
  })
  if (reachesOldest) return true

  for (let i = targetFeeds.length - 1; i >= 0; i --) {
    const oldIndex = oldIndexMap.get(targetFeeds[i].post.uri)
    if (oldIndex == null) return false
    if (hasSameReason(rawOldFeeds[oldIndex], targetFeeds[i])) return true

    // 同じポストで `reason` だけ違う場合は判定できないので、次に新しいフィードへ進む
  }
  return false
}

// リポストでなければ（`reasonPin` を含む）、ただのポストとして同じとみなす
function hasSameReason (a: TTFeed, b: TTFeed): boolean {
  const aReason = a.reason?.$type === "app.bsky.feed.defs#reasonRepost" ? a.reason : undefined
  const bReason = b.reason?.$type === "app.bsky.feed.defs#reasonRepost" ? b.reason : undefined
  if (aReason == null || bReason == null) return aReason == null && bReason == null
  return aReason.by.did === bReason.by.did && aReason.indexedAt === bReason.indexedAt
}

// 既存フィードの API のデータだけを更新する
// フィードのオブジェクトを残すので、インジェクションプロパティと `reason` は既存の値のまま
// `reason` は取得の経路で変わるため、更新しない。ただし、リポストミュートの対象で隠れている時は対象外の値に差し替える
function updateFeed (oldFeed: TTFeed, newFeed: TTFeed, repostMutes?: Array<TIRepostMuteSubject>) {
  // 新しいデータにリアクティブプロキシを入れないよう、生のデータから引き継ぐ
  const rawOldFeed = toRaw(oldFeed)
  const replacesReason = isRepostMuted(rawOldFeed, repostMutes) && !isRepostMuted(newFeed, repostMutes)
  const newCustomReason = newFeed.post.__custom?.reason
  inheritPostCustom(rawOldFeed.post, newFeed.post)
  inheritPostCustom(rawOldFeed.reply?.root, newFeed.reply?.root)
  inheritPostCustom(rawOldFeed.reply?.parent, newFeed.reply?.parent)

  if (replacesReason) {
    newFeed.post.__custom.reason = newCustomReason
    oldFeed.reason = newFeed.reason

    // 折り畳みは `reason` で判定しているので合わせる
    oldFeed.__folding = newFeed.__folding
  }

  oldFeed.post = newFeed.post
  oldFeed.reply = newFeed.reply
  oldFeed.feedContext = newFeed.feedContext
  oldFeed.reqId = newFeed.reqId
}

// `__custom` の表示の状態を引き継ぐ。スレッドの位置だけは API 由来なので新しい値を使う
function inheritPostCustom (oldPost?: TTPost, newPost?: TTPost) {
  if (oldPost == null || newPost == null) return
  newPost.__custom = {
    ...oldPost.__custom,
    opThreadPostIndex: newPost.__custom?.opThreadPostIndex,
    opThreadPostCount: newPost.__custom?.opThreadPostCount,
  }
  inheritQuoteCustom(oldPost.embed, newPost.embed)
}

function isRepostMuted (feed: TTFeed, repostMutes?: Array<TIRepostMuteSubject>): boolean {
  if (feed.reason?.$type !== "app.bsky.feed.defs#reasonRepost") return false
  const did = feed.reason.by.did
  return repostMutes?.some((subject: TIRepostMuteSubject) => subject.did === did) ?? false
}

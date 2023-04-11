import storage from "@/composables/storage"
import text2html from "@/composables/text2html"

export function canLogin(this: TIAtpWrapper): boolean {
  return this.data.sessions[this.data.did] != null
}

export function hasLogin(this: TIAtpWrapper): boolean {
  return this.session != null
}

export function saveData(this: TIAtpWrapper) {
  storage.save("atp", this.data)
}

export function coherentResponses (responses: Array<any>) {
  // Blob な image は暫定的に削除
  // TODO: 対応すること
  /*
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (value.images != null && value.images.some((image: any) => image.image != null)) {
      const images = value.images
      delete value.images
      value.__images = images
    }
  })
  */

  // embeds[0] -> embed
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "embeds" && value[0] != null) {
      parent.embed = JSON.parse(JSON.stringify(value[0]))
      parent.embed.__comment = "❗ This 'embed' was duplicated by Klearsky."
    }
  })

  // PARENT.value.embed -> PARENT.embed
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "value" && value.embed != null && parent.embed == null) {
      parent.embed = JSON.parse(JSON.stringify(value.embed))
      parent.embed.__comment = "❗ This 'embed' was duplicated by Klearsky."
    }
  })

  // PARENT.embed.media.external -> PARENT.embed.external
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "media" && value.external != null) {
      parent.external = JSON.parse(JSON.stringify(value.external))
      parent.external.__comment = "❗ This 'external' was duplicated by Klearsky."
    }
  })

  // PARENT.embed.media.images -> PARENT.embed.images
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "media" && value.images != null && parent.images == null) {
      parent.images = JSON.parse(JSON.stringify(value.images))
      parent.images.__comment = "❗ This 'images' was duplicated by Klearsky."
    }
  })

  // PARENT.record.embed.external/images -> PARENT.embed.external/images
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "record" && parent.embed != null && value.embed != null) {
      if (value.embed.external != null && parent.embed.external == null) {
        parent.embed.external = JSON.parse(JSON.stringify(value.embed.external))
        parent.embed.external.__comment = "❗ This 'external' was duplicated by Klearsky."
      }
      if (value.embed.images != null && parent.embed.images == null) {
        parent.embed.images = JSON.parse(JSON.stringify(value.embed.images))
        parent.embed.images.__comment = "❗ This 'images' was duplicated by Klearsky."
      }
    }
  })

  // PARENT.record.record -> PARENT.record
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "record" && value.record != null) {
      parent.record = JSON.parse(JSON.stringify(value.record))
      parent.record.__comment = "❗ This 'record' was duplicated by Klearsky."
    }
  })

  // Reason
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "reason" && value != null && parent?.post != null) {
      parent.post.__reason = value
    }
  })
}

export function makeCreatedAt(): string {
  return new Date().toISOString()
}

export function mergeFeeds(
  oldFeeds: Array<TTFeed>,
  targetFeeds: Array<TTFeed>
) {
  targetFeeds.forEach((targetFeed: TTFeed) => {
    const index: number = oldFeeds.findIndex(
      (oldFeed: TTFeed) => oldFeed.post?.cid === targetFeed.post?.cid
    )

    // 新規フィード
    if (index === - 1) oldFeeds.push(targetFeed)

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
        oldFeeds[index].post.__reason?.indexedAt
        ?? oldFeeds[index].post.indexedAt
      )

      // 対象フィードの登録日時
      const targetDate = new Date(
        targetFeed.post.__reason?.indexedAt
        ?? targetFeed.post.indexedAt
      )

      if (oldDate <= targetDate) oldFeeds[index] = targetFeed
    }
  })
}

export function sortFeeds(feeds: Array<TTFeed>): Array<TTFeed> {
  return feeds.sort((a: TTFeed, b: TTFeed) => {
    const aIndexedAt = new Date(
      a.post?.__reason?.indexedAt ?? a.post?.indexedAt
    )
    const bIndexedAt = new Date(
      b.post?.__reason?.indexedAt ?? b.post?.indexedAt
    )
    return aIndexedAt < bIndexedAt ? 1 : aIndexedAt > bIndexedAt ? -1 : 0
  })
}

export function text2htmlAtFeeds(feeds: Array<any>) {
  traverseJson(feeds, (key: string, value: any, parent: any) => {
    if (key !== "text") return
    value = (value + "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    parent.__textHtml = text2html(value)
  })
}

export function traverseJson(
  json: any,
  callback: (key: string, value: any, parent: any, deep: number) => void,
  deep = 0
) {
  for (const key in json) {
    callback(key, json[key], json, deep)
    if (json[key] instanceof Object) {
      traverseJson(json[key], callback, deep + 1)
    }
  }
}

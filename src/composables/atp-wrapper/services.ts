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

export function injectReason(feeds: Array<TTFeed>) {
  feeds.forEach((feed: TTFeed) => {
    if (feed.reason == null) return
    feed.post.__reason = feed.reason
  })
}

export function makeCreatedAt(): string {
  return new Date().toISOString()
}

export function mergeFeeds(
  oldFeeds: null | Array<TTFeed>,
  targetFeeds: Array<TTFeed>
): Array<TTFeed> {
  const results: Array<TTFeed> = oldFeeds != null ? [...oldFeeds] : []
  targetFeeds.forEach((targetFeed: TTFeed) => {
    const index: number = results.findIndex(
      (oldFeed: TTFeed) => oldFeed.post?.cid === targetFeed.post?.cid
    )
    if (index === - 1) results.push(targetFeed)
    else if (results[index].post == null) results[index] = targetFeed
    else if (targetFeed.post == null) return
    else {
      const oldDate = new Date(
        results[index].post.__reason?.indexedAt
        ?? results[index].post.indexedAt
      )
      const targetDate = new Date(
        targetFeed.post.__reason?.indexedAt
        ?? targetFeed.post.indexedAt
      )
      if (oldDate <= targetDate) results[index] = targetFeed
    }
  })
  return results
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

export function text2htmlAtFeeds(feeds: Array<TTFeed>) {
  traverseJson(feeds, (key: string, value: any, parent: any) => {
    if (key !== "text") return
    value = (value + "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    parent.__textHtml = text2html(value)
  })
}

export function traverseJson(
  json: any,
  callback: (key: string, value: any, parent: any) => void
) {
  for (const key in json) {
    callback(key, json[key], json)
    if (json[key] instanceof Object) {
      traverseJson(json[key], callback)
    }
  }
}

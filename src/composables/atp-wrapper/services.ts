import storage from "@/composables/storage"
import text2html from "@/composables/text2html"

export function canLogin(this: TIAtpWrapper): boolean {
  return storage.load("handle") != null
}

export function hasLogin(this: TIAtpWrapper): boolean {
  return this.session != null
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
  const newFeeds: Array<TTFeed> = oldFeeds != null ? [...oldFeeds] : []
  targetFeeds.forEach((newFeed: TTFeed) => {
    const oldFeedIndex: number = newFeeds.findIndex(
      (oldFeed: TTFeed) => oldFeed.post?.cid === newFeed.post?.cid
    )
    if (oldFeedIndex === -1) {
      newFeeds.push(newFeed)
    } else {
      newFeeds[oldFeedIndex] = newFeed
    }
  })
  return newFeeds
}

export function saveServiceAndHandle(service: string, handle: string) {
  storage.save("service", service)
  storage.save("handle", handle)
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

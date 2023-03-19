import storage from "@/composables/storage"
import text2html from "@/composables/text2html"

export function canLogin(this: AbstractAtpWrapper): boolean {
  return storage.load("handle") != null
}

export function getFileAsUint8Array(file: File): Promise<null | Uint8Array> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (event: ProgressEvent) => {
      if (event.target == null) reject(null)
      const buffer: null | string | ArrayBuffer =
        (event.target as FileReader).result ?? null
      if (buffer == null) reject(null)
      resolve(new Uint8Array(buffer as ArrayBuffer))
    }
    fileReader.readAsArrayBuffer(file)
  })
}

export function hasLogin(this: AbstractAtpWrapper): boolean {
  return this.session != null
}

export function injectReason(feeds: Array<Feed>) {
  feeds.forEach((feed: Feed) => {
    if (feed.reason == null) return
    feed.post.__reason = feed.reason
  })
}

export function makeCreatedAt(): string {
  return new Date().toISOString()
}

export function mergeFeeds(
  oldFeeds: null | Array<Feed>,
  targetFeeds: Array<Feed>
): Array<Feed> {
  const newFeeds: Array<Feed> = oldFeeds != null ? [...oldFeeds] : []
  targetFeeds.forEach((newFeed: Feed) => {
    const oldFeedIndex: number = newFeeds.findIndex(
      (oldFeed: Feed) => oldFeed.post?.cid === newFeed.post?.cid
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

export function sortFeeds(feeds: Array<Feed>): Array<Feed> {
  return feeds.sort((a: Feed, b: Feed) => {
    const aIndexedAt = new Date(
      a.post?.__reason?.indexedAt ?? a.post?.indexedAt
    )
    const bIndexedAt = new Date(
      b.post?.__reason?.indexedAt ?? b.post?.indexedAt
    )
    return aIndexedAt < bIndexedAt ? 1 : aIndexedAt > bIndexedAt ? -1 : 0
  })
}

export function text2htmlAtFeeds(feeds: Array<Feed>) {
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

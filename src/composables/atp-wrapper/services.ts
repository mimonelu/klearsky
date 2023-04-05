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
  // Record
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "record" && value.record != null) {
      if (parent.record != null) {
        parent.__record = JSON.parse(JSON.stringify(parent.record))
        parent.__record.__comment = "❗ This '__record' was duplicated by Klearsky."
      }
      parent.record = JSON.parse(JSON.stringify(value.record))
      parent.record.__comment = "❗ This 'record' was duplicated by Klearsky."
    }
  })

  // Embed
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "embeds" && value[0] != null) {
      if (parent.embed != null) {
        parent.__embed = JSON.parse(JSON.stringify(parent.embed))
        parent.__embed.__comment = "❗ This '__embed' was duplicated by Klearsky."
      }
      parent.embed = JSON.parse(JSON.stringify(value[0]))
      parent.embed.__comment = "❗ This 'embed' was duplicated by Klearsky."
    }
  })

  // External
  traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "media" && value.external != null) {
      if (parent.external != null) {
        parent.__external = JSON.parse(JSON.stringify(parent.external))
        parent.__external.__comment = "❗ This '__external' was duplicated by Klearsky."
      }
      parent.external = JSON.parse(JSON.stringify(value.external))
      parent.external.__comment = "❗ This 'external' was duplicated by Klearsky."
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
    if (index === - 1) oldFeeds.push(targetFeed)
    else if (oldFeeds[index].post == null) oldFeeds[index] = targetFeed
    else if (targetFeed.post == null) return
    else {
      const oldDate = new Date(
        oldFeeds[index].post.__reason?.indexedAt
        ?? oldFeeds[index].post.indexedAt
      )
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
  callback: (key: string, value: any, parent: any) => void
) {
  for (const key in json) {
    callback(key, json[key], json)
    if (json[key] instanceof Object) {
      traverseJson(json[key], callback)
    }
  }
}

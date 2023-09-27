import type { AppBskyNotificationListNotifications, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  values: Array<TTNotificationGroup>,
  limit?: number,
  cursor?: string
): Promise<undefined | false | {
  cursor?: string
  newNotificationCount: number
}> {
  if (this.agent == null) return
  const query: AppBskyNotificationListNotifications.QueryParams = {}
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyNotificationListNotifications.Response =
    await (this.agent as BskyAgent).listNotifications(query)
      .then((value: AppBskyNotificationListNotifications.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/listNotifications]", response)
  if (!response.success) return false

  let newNotificationCount = 0

  const newValues: Array<TTNotificationGroup> = [...values]

  response.data.notifications.forEach(
    (notification: AppBskyNotificationListNotifications.Notification) => {
      const existence = newValues.some(
        (valueGroup: TTNotificationGroup) =>
          valueGroup.notifications.some(
            (value: TTNotification) => value.cid === notification.cid
          )
      )
      if (existence) return
      if (cursor == null) newNotificationCount ++
      const reason =
        // フィードジェネレーターへのいいねかどうか
        notification.reason === "like" && (notification.reasonSubject?.indexOf("app.bsky.feed.generator") ?? - 1) !== - 1
          ? "likeGenerator"
          : notification.reason
      const reasonSubject =
        notification.reason === "mention"
          ? notification.uri
          : notification.reason === "follow"
            ? notification.author.handle
            : notification.reasonSubject
      const newNotification = {
        avatar: notification.author.avatar,
        cid: notification.cid,
        did: notification.author.did,
        displayName: notification.author.displayName,
        handle: notification.author.handle,
        following: notification.author.viewer?.following != null,
        indexedAt: notification.indexedAt,
        reason: notification.reason,
        text: notification.reason === "follow"
          ? notification.author.description
          : (notification.record as any)?.text,
        uri: notification.uri,
        isRead: notification.isRead,
      }
      const existenceGroup = newValues.find((value: TTNotificationGroup) =>
        value.reason === reason && value.reasonSubject === reasonSubject)
      if (existenceGroup == null) newValues.push({
          id: notification.cid,
          indexedAt: new Date(notification.indexedAt),
          notifications: [newNotification],
          reason,
          reasonSubject,
          __folding: true,
        })
      else existenceGroup.notifications.push(newNotification)
    }
  )

  // ポスト詳細の取得
  const uris: Set<string> = new Set()
  newValues.forEach((group: TTNotificationGroup) => {
    if (group.post != null) return
    if (group.reason !== "like" &&
      group.reason !== "quote" &&
      group.reason !== "reply" &&
      group.reason !== "repost") return
    uris.add(group.reasonSubject as string)
  })
  const posts: undefined | false | Array<TTPost> = await this.fetchPosts(Array.from(uris))
  if (Array.isArray(posts))
    newValues.forEach((value: TTNotificationGroup) => {
      const post: undefined | TTPost =
        posts.find((post: TTPost) => value.reasonSubject === post.uri)
      if (post != null) value.post = post
    })

  // フィードジェネレーターの取得
  const generatorUris: Set<string> = new Set()
  newValues.forEach((group: TTNotificationGroup) => {
    if (group.reason === "likeGenerator")
      generatorUris.add(group.reasonSubject as string)
  })
  if (generatorUris.size > 0) {
    const generators: Error | Array<TTFeedGenerator> = await this.fetchFeedGenerators(Array.from(generatorUris))
    if (!(generators instanceof Error))
      newValues.forEach((value: TTNotificationGroup) => {
        const generator: undefined | TTFeedGenerator =
          generators.find((generator: TTFeedGenerator) => value.reasonSubject === generator.uri)
        if (generator != null) value.generator = generator
      })
  }

  values.splice(0, values.length, ...newValues)

  // 新着通知があればフォールディングを展開する（いいねとリポスト以外）
  if (cursor === undefined)
    values.forEach((value: TTNotificationGroup) => {
      if (value.reason === "repost" || value.reason === "like") return
      const hasRead = value.notifications.some((notification: TTNotification) => !notification.isRead)
      value.__folding = !hasRead
    })

  // 通知配列のソート
  values.forEach((value: TTNotificationGroup) => {
    value.notifications.sort((a: TTNotification, b: TTNotification) => {
      const aDate = new Date(a.indexedAt)
      const bDate = new Date(b.indexedAt)
      return aDate < bDate ? 1 : aDate > bDate ? - 1 : 0
    })
  })

  // 通知グループのソート
  values.forEach((group: TTNotificationGroup) => {
    group.notifications.forEach((notification: TTNotification) => {
      const date = new Date(notification.indexedAt)
      if (group.indexedAt < date) group.indexedAt = date
    })
  })
  values.sort((a: TTNotificationGroup, b: TTNotificationGroup) => {
    return a.indexedAt < b.indexedAt ? 1 : a.indexedAt > b.indexedAt ? - 1 : 0
  })

  // 最後に通知を取得した日時を保存（ updateSeenNotifications で使用）
  this.lastFetchNotificationsDate = new Date()

  return {
    cursor: response.data.cursor,
    newNotificationCount,
  }
}

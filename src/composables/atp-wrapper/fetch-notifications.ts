import type {
  AppBskyNotificationListNotifications,
  BskyAgent,
} from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  values: Array<TTNotification>,
  limit?: number,
  cursor?: string
): Promise<null | {
  cursor?: string
  newNotificationCount: number
}> {
  if (this.agent == null) return null
  const query: AppBskyNotificationListNotifications.QueryParams = {}
  if (limit != null) query.limit = limit
  if (cursor != null) query.cursor = cursor
  const response: AppBskyNotificationListNotifications.Response = await (
    this.agent as BskyAgent
  ).listNotifications(query)
  console.log("[klearsky/listNotifications]", response)
  if (!response.success) return null

  let newNotificationCount = 0

  response.data.notifications.forEach(
    (notification: AppBskyNotificationListNotifications.Notification) => {
      const existence = values.some(
        (value: TTNotification) => value.cid === notification.cid
      )
      if (existence) return
      if (cursor == null) newNotificationCount++
      values.push({
        avatar: notification.author.avatar,
        cid: notification.cid,
        displayName: notification.author.displayName,
        handle: notification.author.handle,
        indexedAt: notification.indexedAt,
        reason: notification.reason,
        reasonSubject:
          notification.reason === "mention"
            ? notification.uri
            : notification.reasonSubject,
        text: (notification.record as any)?.text,
        uri: notification.uri,
      })
    }
  )

  values.sort((a: TTNotification, b: TTNotification) => {
    const aIndexedAt = new Date(a.indexedAt)
    const bIndexedAt = new Date(b.indexedAt)
    return aIndexedAt < bIndexedAt ? 1 : aIndexedAt > bIndexedAt ? -1 : 0
  })

  // 最後に通知を取得した日時を保存（ updateSeenNotifications で使用）
  this.lastFetchNotificationsDate = new Date()

  return {
    cursor: response.data.cursor,
    newNotificationCount,
  }
}

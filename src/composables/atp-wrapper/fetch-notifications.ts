import type {
  AppBskyNotificationListNotifications,
  BskyAgent,
} from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  values: Array<TTNotificationGroup>,
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
        (valueGroup: TTNotificationGroup) =>
          valueGroup.notifications.some(
            (value: TTNotification) => value.cid === notification.cid
          )
      )
      if (existence) return
      if (cursor == null) newNotificationCount ++
      const reason = notification.reason
      const reasonSubject =
        notification.reason === "mention"
          ? notification.uri
          : notification.reason === "follow"
            ? notification.author.handle
            : notification.reasonSubject
      const newNotification = {
        avatar: notification.author.avatar,
        cid: notification.cid,
        displayName: notification.author.displayName,
        handle: notification.author.handle,
        indexedAt: notification.indexedAt,
        reason: notification.reason,
        text: notification.reason === "follow"
          ? notification.author.description
          : (notification.record as any)?.text,
        uri: notification.uri,
        isRead: notification.isRead,
      }
      const existenceGroup = values.find((value: TTNotificationGroup) =>
        value.reason === reason && value.reasonSubject === reasonSubject)
      if (existenceGroup == null) values.push({
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

  // フォールディングの設定
  if (cursor === undefined)
    values.forEach((value: TTNotificationGroup) => {
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

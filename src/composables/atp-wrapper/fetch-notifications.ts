import type { AppBskyNotificationList } from "@atproto/api"

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
  const query: AppBskyNotificationList.QueryParams = {}
  if (limit != null) query.limit = limit
  if (cursor != null) query.before = cursor
  const response: AppBskyNotificationList.Response =
    await this.agent.api.app.bsky.notification.list(query)
  console.log("[klearsky/fetchNotifications]", response)
  if (!response.success) return null

  let newNotificationCount = 0

  response.data.notifications.forEach(
    (notification: AppBskyNotificationList.Notification) => {
      const existence = values.some(
        (value: TTNotification) => value.cid === notification.cid
      )
      if (existence) return
      if (cursor == null) newNotificationCount ++
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
      })
    }
  )

  values.sort((a: TTNotification, b: TTNotification) => {
    const aIndexedAt = new Date(a.indexedAt)
    const bIndexedAt = new Date(b.indexedAt)
    return aIndexedAt < bIndexedAt ? 1 : aIndexedAt > bIndexedAt ? -1 : 0
  })

  return {
    cursor: response.data.cursor,
    newNotificationCount,
  }
}

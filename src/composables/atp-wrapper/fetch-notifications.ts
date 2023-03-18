import type { AppBskyNotificationList } from "@atproto/api"

export default async function (
  this: AbstractAtpWrapper,
  values: Array<KNotification>,
  limit?: number,
  cursor?: string
): Promise<undefined | string> {
  if (this.agent == null) return undefined
  if (this.session == null) return undefined
  const query: AppBskyNotificationList.QueryParams = {}
  if (limit != null) query.limit = limit
  if (cursor != null) query.before = cursor
  const response: AppBskyNotificationList.Response =
    await this.agent.api.app.bsky.notification.list(query)
  console.log("[klearsky/fetchNotifications]", response)
  if (!response.success) return undefined

  response.data.notifications.forEach(
    (notification: AppBskyNotificationList.Notification) => {
      const existence: undefined | KNotification = values.find(
        (value: KNotification) => {
          return value.cid === notification.cid
        }
      )
      if (existence != null) return
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

  values.sort((a: KNotification, b: KNotification) => {
    const aIndexedAt = new Date(a.indexedAt)
    const bIndexedAt = new Date(b.indexedAt)
    return aIndexedAt < bIndexedAt ? 1 : aIndexedAt > bIndexedAt ? -1 : 0
  })

  return response.data.cursor
}

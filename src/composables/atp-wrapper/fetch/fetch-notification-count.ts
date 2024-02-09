import type { AppBskyNotificationGetUnreadCount, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<null | number> {
  if (this.agent == null) return null
  const response: AppBskyNotificationGetUnreadCount.Response =
    await (this.agent as BskyAgent).countUnreadNotifications()
  // console.log("[klearsky/countUnreadNotifications]", response)
  if (!response.success) return null
  return response.data.count
}

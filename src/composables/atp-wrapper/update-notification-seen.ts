import type { AppBskyNotificationUpdateSeen, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<boolean> {
  if (this.agent == null) return false
  const seenAt = (this.lastFetchNotificationsDate ?? new Date()).toISOString()
  const response: AppBskyNotificationUpdateSeen.Response = await (
    this.agent as BskyAgent
  ).updateSeenNotifications(seenAt)
  console.log("[klearsky/updateSeenNotifications]", response)
  return response.success
}

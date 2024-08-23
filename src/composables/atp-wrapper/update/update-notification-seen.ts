import type { AppBskyNotificationUpdateSeen, AtpAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper, seenAtDate?: Date): Promise<boolean> {
  if (this.agent == null) return false
  const seenAt = (seenAtDate ?? new Date()).toISOString()
  const response: AppBskyNotificationUpdateSeen.Response =
    await (this.agent as AtpAgent).updateSeenNotifications(seenAt)
  console.log("[klearsky/updateSeenNotifications]", response)
  return response.success
}

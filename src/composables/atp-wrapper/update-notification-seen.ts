import type { AppBskyNotificationUpdateSeen } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<boolean> {
  if (this.agent == null) return false
  const response: AppBskyNotificationUpdateSeen.Response =
    await this.agent.api.app.bsky.notification.updateSeen({
      seenAt: new Date().toISOString(),
    })
  console.log("[klearsky/updateNotificationSeen]", response)
  return response.success
}

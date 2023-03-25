import type { AppBskyNotificationGetCount } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<null | number> {
  if (this.agent == null) return null
  const response: AppBskyNotificationGetCount.Response =
    await this.agent.api.app.bsky.notification.getCount()
  console.log("[klearsky/fetchNotificationCount]", response)
  if (!response.success) return null
  return response.data.count
}

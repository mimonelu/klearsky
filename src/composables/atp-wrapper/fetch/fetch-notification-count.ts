import type { AppBskyNotificationGetUnreadCount } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | number> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyNotificationGetUnreadCount.Response =
    await this.agent.countUnreadNotifications()
      .then((value) => value)
      .catch((error) => error)
  if (response instanceof Error) {
    console.warn("[klearsky/countUnreadNotifications]", response)
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data?.count ?? 0
}

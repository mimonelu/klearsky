import type { AppBskyNotificationGetUnreadCount, AtpAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | number> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyNotificationGetUnreadCount.Response =
    await (this.agent as AtpAgent).countUnreadNotifications()
      .then((value) => value)
      .catch((error) => error)
  // console.log("[klearsky/countUnreadNotifications]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data?.count ?? 0
}

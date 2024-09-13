import type { AppBskyNotificationUpdateSeen } from "@atproto/api"

export default async function (this: TIAtpWrapper, seenAtDate?: Date): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const seenAt = (seenAtDate ?? new Date()).toISOString()
  const response: Error | AppBskyNotificationUpdateSeen.Response =
    await this.agent.updateSeenNotifications(seenAt)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/updateSeenNotifications]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}

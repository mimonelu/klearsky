import type { AppBskyNotificationListActivitySubscriptions } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  cursor?: string
): Promise<TTActivitySubscriptionList | Error> {
  if (!this.agent) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyNotificationListActivitySubscriptions.Response =
    await this.agent.app.bsky.notification.listActivitySubscriptions({
      cursor
    })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/fetchActivitySubscriptions]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return {
    subscriptions: response.data.subscriptions as Array<TTUser>,
    cursor: response.data.cursor
  }
}

import type { AppBskyNotificationPutActivitySubscription } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  subject: string,
  post: boolean,
  reply: boolean,
): Promise<TTActivitySubscription | Error> {
  if (!this.agent) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyNotificationPutActivitySubscription.Response =
    await this.agent.app.bsky.notification.putActivitySubscription({
      subject,
      activitySubscription: {
        post,
        reply,
      }
    })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/createActivitySubscription]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return {
    subject,
    createdAt: new Date().toISOString(),
    activitySubscription: {
      $type: "app.bsky.notification.activitySubscription"
    }
  }
}

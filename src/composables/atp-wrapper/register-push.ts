import type { AppBskyNotificationRegisterPush, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | boolean> {
  if (this.agent == null) return Error("No agent")
  const query: AppBskyNotificationRegisterPush.InputSchema = {
    serviceDid: this.session?.did as string,
    token: this.session?.accessJwt as string,
    platform: "ios",
    appId: "6444370199",
  }
  const response: Error | AppBskyNotificationRegisterPush.Response =
    await (this.agent as BskyAgent).app.bsky.notification.registerPush(query)
      .then((value: AppBskyNotificationRegisterPush.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/registerPush]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("Failed")
  return response.success
}

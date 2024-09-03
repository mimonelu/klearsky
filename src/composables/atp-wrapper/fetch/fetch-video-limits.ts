import type { AtpAgent, AppBskyVideoGetUploadLimits } from "@atproto/api"

export default async function (
  this: TIAtpWrapper
): Promise<Error | AppBskyVideoGetUploadLimits.OutputSchema> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyVideoGetUploadLimits.Response =
    await (this.agent as AtpAgent).app.bsky.video.getUploadLimits()
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getUploadLimits]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data
}

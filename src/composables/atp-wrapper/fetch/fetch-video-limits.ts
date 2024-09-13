import { AtpAgent as AtpAgentClass } from "@atproto/api"
import type { AppBskyVideoGetUploadLimits } from "@atproto/api"

export default async function (
  this: TIAtpWrapper
): Promise<Error | TIVideoLimits> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const token = await this.fetchServiceAuth(
    "did:web:video.bsky.app",
    "app.bsky.video.getUploadLimits"
  )
  if (token instanceof Error) {
    return token
  }
  const videoAgent = new AtpAgentClass({
    service: "https://video.bsky.app",
  })
  const response: Error | AppBskyVideoGetUploadLimits.Response =
    await videoAgent.app.bsky.video.getUploadLimits({}, {
      headers: { Authorization: `Bearer ${token}` },
    })
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

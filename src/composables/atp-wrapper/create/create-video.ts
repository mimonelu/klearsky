import type { AtpAgent, AppBskyVideoUploadVideo } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  file: File
): Promise<Error | AppBskyVideoUploadVideo.OutputSchema> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyVideoUploadVideo.InputSchema = file
  const response: AppBskyVideoUploadVideo.Response | Error =
    await (this.agent as AtpAgent).app.bsky.video.uploadVideo(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/createVideo]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data
}

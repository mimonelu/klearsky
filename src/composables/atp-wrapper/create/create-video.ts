import type { AppBskyVideoUploadVideo, BlobRef } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  file: File
): Promise<Error | BlobRef> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }

  // 動画アップロード用トークンの取得
  const pdsUrl = this.agent.serviceUrl?.hostname
    ?? (this.session.__pdsUrl ? Util.safeUrl(this.session.__pdsUrl)?.hostname : null)
    ?? "bsky.social"
  const token = await this.fetchServiceAuth(
    `did:web:${pdsUrl}`,
    "com.atproto.repo.uploadBlob",
    (Date.now() / 1000) + (60 * 5), // 5分
  )
  if (token instanceof Error) {
    return token
  }

  // 動画アップロード
  const urlOfUploadVideo = new URL("https://video.bsky.app/xrpc/app.bsky.video.uploadVideo")
  urlOfUploadVideo.searchParams.append("did", this.session.did)
  urlOfUploadVideo.searchParams.append("name", file.name)
  const responseOfUploadVideo: Error | Response =
    await Util.fetchWithTimeout(urlOfUploadVideo, {
      method: "POST",
      body: file,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
      },
    })
      .then((value) => value)
      .catch((error) => error)
  if (responseOfUploadVideo instanceof Error) {
    $warn("createVideo", responseOfUploadVideo)
    return responseOfUploadVideo
  }
  if (!(responseOfUploadVideo?.ok)) {
    $warn("createVideo", responseOfUploadVideo)
    return Error("apiError")
  }
  const jsonOfUploadVideo = await responseOfUploadVideo.json()
    .then((value) => value)
    .catch((error) => error)
  $log("createVideo", jsonOfUploadVideo)
  if (jsonOfUploadVideo instanceof Error) {
    return jsonOfUploadVideo
  }
  if (jsonOfUploadVideo?.jobId == null) {
    return Error("apiError")
  }
  const jobId = jsonOfUploadVideo.jobId

  // サーバサイド処理の待機
  const urlOfGetJobStatus = new URL("https://video.bsky.app/xrpc/app.bsky.video.getJobStatus")
  urlOfGetJobStatus.searchParams.append("did", this.session?.did ?? "")
  urlOfGetJobStatus.searchParams.append("jobId", jobId)
  for (let i = 0; i < 100; i ++) {
    await Util.wait(3000)
    const response: Error | Response =
      await Util.fetchWithTimeout(urlOfGetJobStatus, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((value) => value)
        .catch((error) => error)
    if (response instanceof Error) {
      $warn("getJobStatus", response)
      return response
    }
    if (!(response?.ok)) {
      $warn("getJobStatus", response)
      return Error("apiError")
    }
    const json: Error | AppBskyVideoUploadVideo.OutputSchema = await response.json()
      .then((value) => value)
      .catch((error) => error)
    $log("getJobStatus", json)
    if (json instanceof Error) {
      return json
    }
    if (json?.jobStatus == null) {
      return Error("apiError")
    }
    if (
      json.jobStatus.state === "JOB_STATE_COMPLETED" &&
      json.jobStatus.blob != null
    ) {
      return json.jobStatus.blob
    }
    if (json.jobStatus.state === "JOB_STATE_FAILED") {
      return Error(json.jobStatus.error ?? "apiError")
    }
  }

  return Error("apiError")
}

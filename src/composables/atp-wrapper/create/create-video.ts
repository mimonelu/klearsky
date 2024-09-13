import type { BlobRef } from "@atproto/api"
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
  const pdsUrl = this.agent.serviceUrl.hostname ?? "bsky.social"
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
    console.warn("[klearsky/createVideo]", responseOfUploadVideo)
    return responseOfUploadVideo
  }
  if (!(responseOfUploadVideo?.ok)) {
    console.warn("[klearsky/createVideo]", responseOfUploadVideo)
    return Error("apiError")
  }
  const jsonOfUploadVideo = await responseOfUploadVideo.json()
    .then((value) => value)
    .catch((error) => error)
  console.log("[klearsky/createVideo]", jsonOfUploadVideo)
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
      console.warn("[klearsky/getJobStatus]", response)
      return response
    }
    if (!(response?.ok)) {
      console.warn("[klearsky/getJobStatus]", response)
      return Error("apiError")
    }
    const json = await response.json()
      .then((value) => value)
      .catch((error) => error)
    console.log("[klearsky/getJobStatus]", json)
    if (json instanceof Error) {
      return json
    }
    if (json?.jobStatus == null) {
      return Error("apiError")
    }
    if (json.jobStatus.state === "JOB_STATE_COMPLETED") {
      return json.jobStatus.blob
    }
    if (json.jobStatus.state === "JOB_STATE_FAILED") {
      return Error(json.jobStatus.error ?? "apiError")
    }
  }

  return Error("apiError")

  /*
  // APIライブラリを用いたアップロード
  // TODO: 後で消す、もしくはこちらで代替すること
  const videoAgent = new AtpAgentClass({
    service: "https://video.bsky.app",
  })
  const query: AppBskyVideoUploadVideo.InputSchema = file
  const response: Error | AppBskyVideoUploadVideo.Response =
    await videoAgent.app.bsky.video.uploadVideo(query, {
      headers: { Authorization: `Bearer ${token}` },
    })
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
  */
}

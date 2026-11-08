import type { AppBskyVideoGetJobStatus, BlobRef } from "@atproto/api"
import Util from "@/composables/util"
import { $t } from "@/plugins/i18n"

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
  const fileName = file.name || `video.${file.type.split("/")[1] || "mp4"}`
  urlOfUploadVideo.searchParams.append("name", fileName)
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
    return makeError(responseOfUploadVideo.message, "uploadVideo")
  }

  // NOTICE: 失敗時も本文に理由が入るため、ステータスに関係なく本文を読む
  const jsonOfUploadVideo = await responseOfUploadVideo.json()
    .then((value) => value)
    .catch((error) => error)
  $log("createVideo", jsonOfUploadVideo)
  if (!responseOfUploadVideo.ok || jsonOfUploadVideo?.jobId == null) {
    $warn("createVideo", responseOfUploadVideo)
    return makeError(getReason(jsonOfUploadVideo), "uploadVideo", responseOfUploadVideo.status)
  }
  const jobId = jsonOfUploadVideo.jobId

  // サーバサイド処理の待機
  const urlOfGetJobStatus = new URL("https://video.bsky.app/xrpc/app.bsky.video.getJobStatus")
  urlOfGetJobStatus.searchParams.append("did", this.session?.did ?? "")
  urlOfGetJobStatus.searchParams.append("jobId", jobId)
  let lastState: undefined | string
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
      return makeError(response.message, "getJobStatus")
    }

    // NOTICE: 失敗時も本文に理由が入るため、ステータスに関係なく本文を読む
    const json: Error | AppBskyVideoGetJobStatus.OutputSchema = await response.json()
      .then((value) => value)
      .catch((error) => error)
    $log("getJobStatus", json)
    if (!response.ok || json instanceof Error || json?.jobStatus == null) {
      $warn("getJobStatus", response)
      return makeError(getReason(json), "getJobStatus", response.status)
    }
    lastState = json.jobStatus.state
    if (
      json.jobStatus.state === "JOB_STATE_COMPLETED" &&
      json.jobStatus.blob != null
    ) {
      return json.jobStatus.blob
    }
    if (json.jobStatus.state === "JOB_STATE_FAILED") {
      return makeError(
        getReason(json),
        "getJobStatus",
        json.jobStatus.failureCode ?? json.jobStatus.state
      )
    }
  }

  return makeError(undefined, "getJobStatus", "timeout", lastState)
}

// 動画サービスの本文から失敗の理由を取り出す
// NOTICE: 本文の形式が統一されていないため、最上位と `jobStatus` の下の両方を読む
function getReason (body: any): undefined | string {
  if (body instanceof Error) {
    return body.message
  }
  for (const source of [body, body?.jobStatus]) {
    const reason = [source?.error, source?.message]
      .filter((value) => typeof value === "string" && value !== "")
      .join(": ")
    if (reason !== "") {
      return reason
    }
  }
  return undefined
}

// 理由に、原因を切り分けるための処理名と詳細を添えて Error にする
function makeError (
  reason: undefined | string,
  ...details: Array<undefined | number | string>
): Error {
  const detail = details
    .filter((value) => value != null && value !== "")
    .join(" ")
  return Error(`${reason || $t("apiError")} (${detail})`)
}

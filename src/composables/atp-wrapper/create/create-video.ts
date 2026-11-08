import type { AppBskyVideoDefs, AppBskyVideoGetJobStatus, BlobRef } from "@atproto/api"
import Util from "@/composables/util"
import { $t } from "@/plugins/i18n"

// 動画アップロード用トークンの有効期間（公式ドキュメントの推奨値）
// NOTICE: 動画サービスは処理の後にこのトークンで PDS へ動画を保存するため、
//         アップロードと処理が終わるまで切れない長さにする
const TOKEN_LIFETIME = 30 * 60 * 1000

// トークンが切れた後、処理の失敗が返るまで待つ猶予
const DEADLINE_MARGIN = 60 * 1000

// 処理状況を確認する間隔
const POLLING_INTERVAL = 3000

// 処理状況の取得に失敗した時の再試行の間隔と上限（公式アプリと同じ）
const RETRY_INTERVAL = 5000
const MAX_FAILURE_COUNT = 50

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
  const exp = Math.floor((Date.now() + TOKEN_LIFETIME) / 1000)
  const token = await this.fetchServiceAuth(
    `did:web:${pdsUrl}`,
    "com.atproto.repo.uploadBlob",
    exp,
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

  // NOTICE: 本文は `JobStatus` が最上位に入る形と `jobStatus` の下に入る形がある
  const jobStatusOfUploadVideo: undefined | AppBskyVideoDefs.JobStatus =
    jsonOfUploadVideo instanceof Error
      ? undefined
      : jsonOfUploadVideo?.jobStatus ?? jsonOfUploadVideo
  if (jobStatusOfUploadVideo?.blob != null) {
    return jobStatusOfUploadVideo.blob
  }

  // NOTICE: 処理済みの動画は 409 で返るが、`jobId` を含むため、ステータスに関係なく待機に進む
  const jobId = jobStatusOfUploadVideo?.jobId
  if (!jobId) {
    $warn("createVideo", responseOfUploadVideo)
    return makeError(getReason(jsonOfUploadVideo), "uploadVideo", responseOfUploadVideo.status)
  }

  // サーバサイド処理の待機
  // NOTICE: トークンが切れると動画サービスは PDS に保存できず、以降に完了しないため、
  //         トークンの有効期限に、失敗が返るまでの猶予を加えた時刻まで待つ
  const urlOfGetJobStatus = new URL("https://video.bsky.app/xrpc/app.bsky.video.getJobStatus")
  urlOfGetJobStatus.searchParams.append("jobId", jobId)
  const deadline = exp * 1000 + DEADLINE_MARGIN
  let lastState: undefined | string
  let failureCount = 0
  while (Date.now() < deadline) {
    await Util.wait(failureCount === 0 ? POLLING_INTERVAL : RETRY_INTERVAL)
    const jobStatus = await fetchJobStatus(urlOfGetJobStatus)

    // NOTICE: 一時的な障害に備え、取得の失敗は再試行する
    if (jobStatus instanceof Error) {
      failureCount ++
      if (failureCount < MAX_FAILURE_COUNT) {
        continue
      }
      return jobStatus
    }
    failureCount = 0
    lastState = jobStatus.state
    if (jobStatus.state === "JOB_STATE_COMPLETED") {
      if (jobStatus.blob != null) {
        return jobStatus.blob
      }
      return makeError(getReason(jobStatus), "getJobStatus", jobStatus.state, "without blob")
    }
    if (jobStatus.state === "JOB_STATE_FAILED") {
      return makeError(
        getReason(jobStatus),
        "getJobStatus",
        jobStatus.failureCode ?? jobStatus.state
      )
    }
  }

  return makeError(undefined, "getJobStatus", "timeout", lastState)
}

// 処理状況を取得する
// NOTICE: 公式アプリ・公式ドキュメントと同じく、トークンなしで呼ぶ
async function fetchJobStatus (url: URL): Promise<Error | AppBskyVideoDefs.JobStatus> {
  const response: Error | Response =
    await Util.fetchWithTimeout(url, { method: "GET" })
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
  return json.jobStatus
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

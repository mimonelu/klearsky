import { state } from "@/composables/main-state"
import Util from "@/composables/util"

/**
 * refreshJwtを使って新しいaccessJwtとrefreshJwtを取得
 *
 * 役割:
 * 1. refreshJwtをAuthorizationヘッダーに設定してrefreshSession APIを呼び出し
 * 2. サーバーから新しいaccessJwt・refreshJwtを取得
 * 3. セッション情報を更新してローカルストレージに保存
 *
 * 使用場面:
 * - update-jwt.tsからのみ呼び出される（accessJwt失効時）
 * - 長時間利用時の自動トークン更新
 * - MainView.vueの定期実行 → update-jwt.ts → refresh-session.ts の経路
 */
export default async function (this: TIAtpWrapper): Promise<Error | undefined> {
  // MySessionからセッション取得（フォールバックとして従来のthis.dataも参照）
  const session = state.mySession?.current ?? this.data.sessions[this.data.did]
  if (session == null) {
    return Error("noSessionError")
  }
  if (session.__service == null) {
    return Error("noSessionError")
  }
  if (session.refreshJwt == null) {
    return Error("noRefreshJwtError")
  }

  // サービスURLからホスト名を取得
  const serviceUrl: undefined | URL = Util.safeUrl(session.__service)
  if (serviceUrl == null) {
    $warn("refreshSession", "Invalid service URL", session.__service)
    return Error("refreshSessionError")
  }

  // 手動でrefreshSession APIを呼び出し
  // NOTE: @atproto/api の agent.com.atproto.server.refreshSession() は使用しない
  // 理由: agentが内部的にaccessJwtを使用しており、refreshJwtが適切に送信されない
  // そのため手動でrefreshJwtをAuthorizationヘッダーに設定してAPIを呼び出す
  const url = `https://${serviceUrl.hostname}/xrpc/com.atproto.server.refreshSession`
  const request: RequestInit = {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${session.refreshJwt}`,
      "Content-Type": "application/json"
    },
  }

  const response: Error | Response =
    await Util.fetchWithTimeout(url, request)
      .then((value) => value)
      .catch((error) => error)

  $log("refreshSession", "Response", response)

  if (response instanceof Error) {
    $error("refreshSession", "Network error", response)
    return Error("refreshSessionError")
  }

  if (!response.ok) {
    $error("refreshSession", "HTTP error", response.status, response.statusText)
    return Error("refreshSessionError")
  }

  const json: Error | TTSession = await response.json()
    .then((value) => value)
    .catch((error) => error)

  if (json instanceof Error) {
    $error("refreshSession", "JSON parse error", json)
    return Error("refreshSessionError")
  }

  if (json?.did == null) {
    $error("refreshSession", "Invalid response data", json)
    return Error("refreshSessionError")
  }

  // MySessionでセッション管理
  state.mySession?.updateSession(json, "password", session.__service)

  $log("refreshSession", "Session refreshed successfully")
}

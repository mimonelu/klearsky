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
  const session = this.data.sessions[this.data.did]
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
    console.warn("[klearsky/refreshSession] Invalid service URL:", session.__service)
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

  console.log("[klearsky/refreshSession] Response:", response)

  if (response instanceof Error) {
    console.error("[klearsky/refreshSession] Network error:", response)
    return Error("refreshSessionError")
  }

  if (!response.ok) {
    console.error("[klearsky/refreshSession] HTTP error:", response.status, response.statusText)
    return Error("refreshSessionError")
  }

  const json: Error | any = await response.json()
    .then((value) => value)
    .catch((error) => error)

  if (json instanceof Error) {
    console.error("[klearsky/refreshSession] JSON parse error:", json)
    return Error("refreshSessionError")
  }

  if (json?.did == null) {
    console.error("[klearsky/refreshSession] Invalid response data:", json)
    return Error("refreshSessionError")
  }

  // セッション情報を更新
  this.data.did = json.did
  const responseOfResetSession = this.resetSession(json)
  if (responseOfResetSession instanceof Error) {
    console.error("[klearsky/refreshSession] Reset session error:", responseOfResetSession)
    return responseOfResetSession
  }

  Util.saveStorage("atp", this.data)
  console.log("[klearsky/refreshSession] Session refreshed successfully")
}

import { state } from "@/composables/main-state"
import CONSTS from "@/consts/consts.json"

// atproto-proxy ヘッダーを付与するための fetch wrapper
export default function (this: TIAtpWrapper, input: URL | RequestInfo, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers ?? (input as Request).headers)
  const urlString = (input as URL).href ?? (input as Request).url

  // app.bsky
  // OAuth経由の場合はプロキシヘッダーをスキップ
  if (
    state.mySession?.authType !== "oauth" &&
    this.proxies.appBsky &&
    urlString?.includes("/xrpc/app.bsky.")
  ) {
    // フィードインタラクションはスルー
    if (
      urlString?.includes("sendInteractions") &&
      headers.has("atproto-proxy")
    ) { /**/ }

    // Preferences API は公式AppViewとする
    else if (
      urlString?.includes("Preferences") &&
      this.proxies.appBsky !== "" &&
      this.proxies.appBsky !== CONSTS.OFFICIAL_ATPROTO_PROXY_APP_BSKY
    ) {
      headers.set("atproto-proxy", CONSTS.OFFICIAL_ATPROTO_PROXY_APP_BSKY)

    // その他
    } else {
      headers.set("atproto-proxy", this.proxies.appBsky)
    }
  }

  // app.chat
  else if (
    this.proxies.chatBsky &&
    urlString?.includes("/xrpc/chat.bsky.")
  ) {
    headers.set("atproto-proxy", this.proxies.chatBsky)
  }

  return fetch(input, { ...init, headers })
}

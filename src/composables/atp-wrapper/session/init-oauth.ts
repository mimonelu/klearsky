import type { ComAtprotoServerGetSession } from "@atproto/api"
import {
  BrowserOAuthClient,
  TokenInvalidError,
  TokenRefreshError,
  TokenRevokedError,
  type OAuthSession,
} from "@atproto/oauth-client-browser"
import { type OAuthClientMetadataInput } from "@atproto/oauth-types"
import { LOGGEDIN_VERSION } from "@/consts/consts.json"

function createOAuthClientMetadata (): Readonly<OAuthClientMetadataInput> {
  const isLocalDev = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  const isStaging = location.hostname === "staging.klearsky.pages.dev"
  const scope = "atproto transition:email transition:generic transition:chat.bsky"
  const commonProps: Readonly<Omit<OAuthClientMetadataInput, "redirect_uris">> = {
    client_name: "Klearsky",
    scope,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    application_type: "web",
    dpop_bound_access_tokens: true,
  }
  if (isLocalDev) {
    const redirectUri = `http://127.0.0.1:${location.port}/`
    const clientId = `http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`
    return {
      client_id: clientId,
      redirect_uris: [redirectUri],
      ...commonProps,
    }
  } else {
    const baseUrl = location.origin
    const metadataFile = isStaging ? "client-metadata-staging.json" : "client-metadata.json"
    return {
      client_id: `${baseUrl}/${metadataFile}`,
      client_uri: baseUrl,
      redirect_uris: [`${baseUrl}/`],
      ...commonProps,
    }
  }
}

/**
 * BrowserOAuthClient によるセッション削除（トークン更新の失敗や失効）を監視
 *
 * 削除イベントは他タブからも届き、削除後の API 呼び出しのたびにも発行されるため、通知は一度だけ行う
 */
function watchSessionDeleted (
  oauthClient: BrowserOAuthClient,
  did: string,
  onSessionExpired: () => void
) {
  let handled = false
  oauthClient.addEventListener("deleted", (event) => {
    if (handled || event.detail.sub !== did) {
      return
    }
    handled = true

    // 自タブでのログアウト（revoke）は除外する
    // 他タブからのイベントは cause の型が失われるため、他タブでのログアウトは再ログインを促す対象になる
    if (event.detail.cause instanceof TokenRevokedError) {
      return
    }

    $warn("initOAuth: session deleted", event.detail.cause)
    onSessionExpired()
  })
}

/**
 * セッションが失われたことを示すエラーか（BrowserOAuthClient はこれらのエラーでセッションをストアから削除する）
 *
 * ネットワークエラー等はセッションが残っているため含めない
 */
function isSessionLostError (error: unknown): boolean {
  return error instanceof TokenRefreshError ||
    error instanceof TokenRevokedError ||
    error instanceof TokenInvalidError
}

/**
 * OAuth クライアントを初期化し、セッションを取得する
 *
 * セッションが失われている場合（他タブでのログアウト等）は Error を返す
 * ネットワークエラー等で復元できなかった場合は undefined を返す
 */
export default async function (
  this: TIAtpWrapper,
  targetDid?: string,
  onSessionExpired?: () => void
): Promise<Error | TTSession | undefined> {
  // OAuthコールバックパラメータを取得
  const callbackParams = new URLSearchParams(location.search).has("code")
    ? new URLSearchParams(location.search)
    : null

  this.oauthClient = new BrowserOAuthClient({
    handleResolver: "https://bsky.social",
    responseMode: "query",
    clientMetadata: createOAuthClientMetadata(),
    fetch: this.fetchWrapper.bind(this),
  })

  let session: OAuthSession | null

  // OAuthコールバック（新規ログイン）の場合
  if (callbackParams) {
    const result = await this.oauthClient.initCallback(callbackParams)
    session = result?.session ?? null
  }

  // 特定のDIDを指定した場合はそのセッションを復元
  else if (targetDid) {
    try {
      session = await this.oauthClient.restore(targetDid)
    } catch (error) {
      $warn("initOAuth: restore failed", error)
      return isSessionLostError(error) ? Error("noSessionError") : undefined
    }
  }

  // DID指定なしの場合は最後のセッションを復元（initRestoreでコールバック処理をスキップ）
  else {
    try {
      const result = await this.oauthClient.initRestore()
      session = result?.session ?? null
    } catch (error) {
      $warn("initOAuth: initRestore failed", error)
      return isSessionLostError(error) ? Error("noSessionError") : undefined
    }
  }

  if (session != null) {
    $log("OAuth 🔑", session.did)
    this.createAgentWithOAuth(session)
    if (onSessionExpired != null) {
      watchSessionDeleted(this.oauthClient, session.did, onSessionExpired)
    }

    // 各種セッション情報の取得
    let handle = ""
    let email: string | undefined
    let emailConfirmed: boolean | undefined
    let emailAuthFactor: boolean | undefined
    const sessionResponse: Error | ComAtprotoServerGetSession.Response =
      await this.agent!.com.atproto.server.getSession()
        .then((response) => response)
        .catch((error) => error)
    $log("getSession", sessionResponse)
    if (!(sessionResponse instanceof Error)) {
      handle = sessionResponse.data.handle
      email = sessionResponse.data.email
      emailConfirmed = sessionResponse.data.emailConfirmed
      emailAuthFactor = sessionResponse.data.emailAuthFactor
    }

    return {
      active: true,
      did: session.did,
      handle,
      email,
      emailConfirmed,
      emailAuthFactor,
      __authType: "oauth",
      __loggedinVersion: LOGGEDIN_VERSION,
      __service: "https://bsky.social",
    }
  }
  return
}

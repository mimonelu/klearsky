import type { ComAtprotoServerRefreshSession } from "@atproto/api"
import { jwtDecode, type JwtPayload } from "jwt-decode"
import { state } from "@/composables/main-state"

/**
 * JWT（アクセス・リフレッシュトークン）の有効期限をチェックし、必要に応じて更新
 *
 * 役割:
 * 1. エージェントが保持する accessJwt と refreshJwt の有効期限をチェック（5分前バッファ付き）
 * 2. accessJwt が期限切れの場合、エージェント（ CredentialSession ）にトークンを更新させる
 * 3. refreshJwt が期限切れの場合、エラーを返す（再ログインが必要）
 *
 * 更新後のトークンは persistSession 経由で MySession に保存され、他タブへ共有される
 * エージェントは期限切れのレスポンスを受けてから自動更新するが、
 * 一部のリクエスト（ストリームを body に持つもの）は再送されないため事前に更新している
 *
 * 使用場面:
 * - 定期的なセッション維持（useMainViewAuth.ts から定期実行）
 */
export default async function (this: TIAtpWrapper): Promise<Error | undefined> {
  // OAuth認証の場合はライブラリが自動的にトークンを更新するためスキップ
  if (state.mySession?.authType === "oauth") {
    return
  }

  if (this.agent == null) {
    return Error("noAgentError")
  }
  const session = this.agent.session
  if (session == null) {
    return Error("noSessionError")
  }
  let refreshJwt: JwtPayload
  let accessJwt: JwtPayload
  try {
    refreshJwt = jwtDecode(session.refreshJwt)
    accessJwt = jwtDecode(session.accessJwt)
  } catch (error) {
    return Error("jwtDecodeError")
  }
  if (
    refreshJwt.exp == null ||
    accessJwt.exp == null
  ) {
    return Error("invalidJwtError")
  }

  const now = Date.now() / 1000 + 60 * 5
  if (now >= refreshJwt.exp) {
    // 開発用
    const refreshDate = new Date()
    refreshDate.setTime(refreshJwt.exp * 1000)
    $warn("updateJwt", `refreshJwt was expired at ${refreshDate.toLocaleString()}.`)

    return Error("refreshJwtExpired")
  }
  if (now >= accessJwt.exp) {
    // 開発用
    const accessDate = new Date()
    accessDate.setTime(accessJwt.exp * 1000)
    $warn("updateJwt", `accessJwt was expired at ${accessDate.toLocaleString()}.`)

    const response: Error | ComAtprotoServerRefreshSession.Response =
      await this.agent.sessionManager.refreshSession()
        .then((value) => value)
        .catch((error) => error)
    if (response instanceof Error) {
      $warn("updateJwt", response)
      return Error("refreshSessionError")
    }
  }
}

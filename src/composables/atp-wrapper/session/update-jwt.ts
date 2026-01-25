import { jwtDecode } from "jwt-decode"
import { state } from "@/composables/main-state"

/**
 * JWT（アクセス・リフレッシュトークン）の有効期限をチェックし、必要に応じて更新
 *
 * 役割:
 * 1. accessJwtとrefreshJwtの有効期限をチェック（5分前バッファ付き）
 * 2. accessJwtが期限切れの場合、refreshSessionを呼び出してトークン更新
 * 3. refreshJwtが期限切れの場合、エラーを返す（再ログインが必要）
 *
 * 使用場面:
 * - API呼び出し前のトークン有効性確認
 * - 定期的なセッション維持（MainView.vueから定期実行）
 * - 自動ログイン時のトークン検証
 */
export default async function (
  this: TIAtpWrapper,
  onRefreshSession?: () => void
): Promise<Error | undefined> {
  // OAuth認証の場合はライブラリが自動的にトークンを更新するためスキップ
  if (state.mySession?.authType === "oauth") {
    return
  }

  const session = this.data.sessions[this.data.did]
  if (session == null) {
    return Error("noSessionError")
  }
  if (session.refreshJwt == null ||
      session.accessJwt == null
  ) {
    return Error("noJwtError")
  }
  let refreshJwt = undefined
  let accessJwt = undefined
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

    const response = await this.refreshSession()
    if (response instanceof Error) {
      return response
    }

    // TODO: Error でなければ onRefreshSession を実行するように修正
    if (onRefreshSession != null) {
      onRefreshSession()
    }
  }
}

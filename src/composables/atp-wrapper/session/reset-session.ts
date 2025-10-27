import { LOGGEDIN_VERSION } from "@/consts/consts.json"

/**
 * セッションデータの統合・更新を行う
 *
 * 役割:
 * 1. 新しいセッション情報と既存セッション情報をマージ
 * 2. サービスURLやPDS URLの更新
 * 3. JWT強制削除機能（アプリバージョンアップ時など）
 *
 * 使用場面:
 * - ログイン成功後のセッション情報更新
 * - refreshSession成功後のセッション情報更新
 * - セッション復元後のデータ同期
 */
export default function (
  this: TIAtpWrapper,
  newSession: TTSession,
  service?: string
): Error | undefined {
  this.data.did = newSession.did
  const currentSession = this.data.sessions[this.data.did] ?? {}

  // セッションデータの更新
  currentSession.active = newSession.active ?? currentSession.active ?? true
  currentSession.accessJwt = newSession.accessJwt ?? currentSession.accessJwt
  currentSession.refreshJwt = newSession.refreshJwt ?? currentSession.refreshJwt
  currentSession.did = newSession.did ?? currentSession.did
  currentSession.handle = newSession.handle ?? currentSession.handle
  currentSession.email = newSession.email ?? currentSession.email
  currentSession.emailAuthFactor = newSession.emailAuthFactor ?? currentSession.emailAuthFactor
  currentSession.emailConfirmed = newSession.emailConfirmed ?? currentSession.emailConfirmed
  currentSession.status = newSession.status ?? currentSession.status

  // セッションデータの更新 - サービスアドレスの更新
  currentSession.__service = service ?? newSession.__service ?? currentSession.__service ?? ""

  // セッションデータの更新 - PDS URLの更新
  currentSession.__pdsUrl = newSession.didDoc?.service?.[0]?.serviceEndpoint ?? currentSession.__pdsUrl

  // JWT強制削除
  currentSession.__loggedinVersion = newSession.__loggedinVersion ?? currentSession.__loggedinVersion
  if (currentSession.__loggedinVersion == null) {
    delete currentSession.accessJwt
    delete currentSession.refreshJwt
    const error = Error("jwtUpdateError")
    console.log("[klearsky/resetSession]", error)
    return error
  } else if (LOGGEDIN_VERSION) {
    if (currentSession.__loggedinVersion < LOGGEDIN_VERSION) {
      delete currentSession.accessJwt
      delete currentSession.refreshJwt
      const error = Error("jwtUpdateError")
      console.log("[klearsky/resetSession]", error)
      return error
    }
  }

  this.data.sessions[this.data.did] = this.session = currentSession
  $log("[klearsky/resetSession]")
}
